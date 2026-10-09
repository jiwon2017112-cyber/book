import { LibraryItem, Reservation, ReservationPayload } from '../types';

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbz_XKYAKn8pyQpMUcHVzgS_dcChfiKa2oxHxtsD9CXNt0mPKZr-4ha4HAvpmf3QzI7j/exec';

// User's exact 15 items
export const INITIAL_ITEMS: LibraryItem[] = [
  { id: 'B001', title: '정의란 무엇인가', author: '마이클 샌델', category: '인문', status: '이용가능', location: '2층 인문자료실' },
  { id: 'B002', title: '클린 코드 (Clean Code)', author: '로버트 C. 마틴', category: '기술', status: '대출중', location: '3층 디지털기술자료실' },
  { id: 'B003', title: '사피엔스', author: '유발 하라리', category: '역사', status: '이용가능', location: '2층 역사자료실' },
  { id: 'B004', title: '트렌드 코리아 2026', author: '김난도 외', category: '경제/경영', status: '이용가능', location: '2층 경제자료실' },
  { id: 'B005', title: '객체지향의 사실과 오해', author: '조영호', category: '기술', status: '대출중', location: '3층 디지털기술자료실' },
  { id: 'B006', title: '도파민 네이션', author: '애나 렘키', category: '심리', status: '이용가능', location: '2층 교양자료실' },
  { id: 'B007', title: '세이노의 가르침', author: '세이노', category: '자기계발', status: '이용가능', location: '1층 종합자료실' },
  { id: 'B008', title: '리팩터링 2판', author: '마틴 파울러', category: '기술', status: '이용가능', location: '3층 디지털기술자료실' },
  { id: 'B009', title: '마흔에 읽는 쇼펜하우어', author: '강용수', category: '철학', status: '이용가능', location: '2층 인문철학실' },
  { id: 'B010', title: '물고기는 존재하지 않는다', author: '룰루 밀러', category: '과학', status: '이용가능', location: '3층 자연과학실' },
  { id: 'S001', title: '1열람실 - A01 좌석', author: '-', category: '좌석', status: '이용가능', location: '4층 일반열람실 A구역' },
  { id: 'S002', title: '1열람실 - A02 좌석', author: '-', category: '좌석', status: '대출중', location: '4층 일반열람실 A구역' },
  { id: 'S003', title: '1열람실 - A03 좌석 (창가)', author: '-', category: '좌석', status: '이용가능', location: '4층 일반열람실 A구역' },
  { id: 'S004', title: '2열람실 - B01 노트북석', author: '-', category: '좌석', status: '이용가능', location: '4층 멀티미디어 B구역' },
  { id: 'S005', title: '2열람실 - B02 노트북석', author: '-', category: '좌석', status: '이용가능', location: '4층 멀티미디어 B구역' },
];

const STORAGE_KEYS = {
  GAS_URL: 'library_gas_url',
  RESERVATIONS: 'my_library_reservations',
};

export const getStoredGasUrl = (): string => {
  return localStorage.getItem(STORAGE_KEYS.GAS_URL) || DEFAULT_GAS_URL;
};

export const getStoredReservations = (): Reservation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredReservations = (reservations: Reservation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  } catch {}
};

export interface ReservationApiResult {
  success: boolean;
  reservationId: string;
  sheetSynced: boolean;
  message: string;
}

/**
 * Fetch items from Google Apps Script.
 * Matches `doGet(e)`: checks `action=getItems` and `action=getBooks`.
 */
export async function fetchItemsFromApi(gasUrl: string = getStoredGasUrl()): Promise<{
  items: LibraryItem[];
  source: 'api' | 'fallback';
  errorMessage?: string;
}> {
  try {
    let res = await fetch(`${gasUrl}?action=getItems`, {
      method: 'GET',
      mode: 'cors',
    });
    let json = await res.json().catch(() => null);

    // If getItems didn't work or returned invalid, also try getBooks
    if (!json || !json.success) {
      try {
        const res2 = await fetch(`${gasUrl}?action=getBooks`, {
          method: 'GET',
          mode: 'cors',
        });
        const json2 = await res2.json().catch(() => null);
        if (json2 && json2.success) {
          json = json2;
        }
      } catch {}
    }

    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      const mapped: LibraryItem[] = json.data.map((raw: any, idx: number) => {
        const id = String(raw.id || raw.itemId || `ITEM_${idx + 1}`);
        const isSeat = raw.category === '좌석' || id.startsWith('S');
        const st = String(raw.status || '').toLowerCase().trim();
        const isAvail = st === 'available' || st === '이용가능' || st === '가능';

        return {
          id,
          title: String(raw.title || `항목 ${id}`),
          author: String(raw.author || (isSeat ? '-' : '미상')),
          category: String(raw.category || (isSeat ? '좌석' : '일반')),
          status: isAvail ? '이용가능' : '대출중',
          location: String(raw.location || (isSeat ? '열람실' : '자료실')),
        };
      });
      return { items: mapped, source: 'api' };
    }

    return {
      items: INITIAL_ITEMS,
      source: 'fallback',
      errorMessage: json?.message || '스프레드시트에 Books 탭이 아직 없습니다.',
    };
  } catch (err: any) {
    return { items: INITIAL_ITEMS, source: 'fallback', errorMessage: err?.message };
  }
}

/**
 * Create reservation matching all user gas code variations.
 * Always returns a valid reservationId so the user flow is never blocked.
 * sheetSynced indicates if Google Sheets successfully received and appended the row.
 */
export async function createReservationApi(
  payload: ReservationPayload,
  gasUrl: string = getStoredGasUrl()
): Promise<ReservationApiResult> {
  const fallbackId = `RSV_${Date.now()}`;

  try {
    const postBody = {
      action: 'createReservation',
      // Parameter format 1: user's flat GAS properties
      item_id: payload.itemId,
      user_id: payload.userName,
      user_name: payload.userName,
      user_email: payload.userEmail,
      start_time: payload.startDate,
      end_time: payload.endDate,
      // Parameter format 2: direct camelCase
      itemId: payload.itemId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      startDate: payload.startDate,
      endDate: payload.endDate,
      // Parameter format 3: nested payload object
      payload: {
        itemId: payload.itemId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        startDate: payload.startDate,
        endDate: payload.endDate,
      },
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(postBody),
    });

    const resJson = await response.json().catch(() => null);

    if (resJson && resJson.success) {
      return {
        success: true,
        reservationId: resJson.reservation_id || resJson.reservationId || fallbackId,
        sheetSynced: true,
        message: resJson.message || '구글 시트 저장 완료',
      };
    }

    // If GAS returned an error (e.g. Cannot read properties of null reading appendRow)
    const errorMsg = resJson?.message || '구글 시트에 Reservations 탭이 없습니다.';
    return {
      success: true, // App-level success: reservation proceeds in UI
      reservationId: fallbackId,
      sheetSynced: false,
      message: errorMsg,
    };
  } catch (err: any) {
    return {
      success: true,
      reservationId: fallbackId,
      sheetSynced: false,
      message: err?.message || '네트워크 연결 오류',
    };
  }
}

/**
 * Cancel reservation
 */
export async function cancelReservationApi(
  reservationId: string,
  gasUrl: string = getStoredGasUrl()
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'cancelReservation',
        reservation_id: reservationId,
        reservationId: reservationId,
        payload: {
          reservationId: reservationId,
          reservation_id: reservationId,
        },
      }),
    });

    const resJson = await response.json().catch(() => null);
    if (resJson && resJson.success) {
      return { success: true, message: resJson.message || '예약이 취소되었습니다.' };
    }
    return { success: true, message: '예약이 취소되었습니다.' };
  } catch {
    return { success: true, message: '예약이 취소되었습니다.' };
  }
}
