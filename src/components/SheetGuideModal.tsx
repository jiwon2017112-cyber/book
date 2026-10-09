import React, { useState } from 'react';
import { X, Table, FileSpreadsheet, Copy, Check, Code, ExternalLink, HelpCircle } from 'lucide-react';

interface SheetGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
}

export const SheetGuideModal: React.FC<SheetGuideModalProps> = ({ isOpen, onClose, gasUrl }) => {
  if (!isOpen) return null;

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleGasCode = `// Google Sheet ID 연동
const SPREADSHEET_ID = '1wP7OSgiNH9ZEI-hSC2kHCpMCo97v1VkQOLVq5qrV95o';

function getDb() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// 시트가 없으면 자동으로 생성해주는 헬퍼 (Cannot read properties of null 에러 원천 방지)
function getOrCreateSheet(sheetName, defaultHeaders) {
  const db = getDb();
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) {
    sheet = db.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
    }
  }
  return sheet;
}

// GET 요청 처리 (도서/좌석 목록 조회 및 예약 조회)
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getItems';
  let result = {};

  try {
    if (action === 'getItems' || action === 'getBooks') {
      const bookSheet = getOrCreateSheet('Books', ['id', 'title', 'author', 'category', 'status', 'location']);
      
      // 만약 데이터가 없으면 기본 샘플 데이터 자동 등록
      if (bookSheet.getLastRow() <= 1) {
        const initialBooks = [
          ['B001', '정의란 무엇인가', '마이클 샌델', '인문', '이용가능', '2층 인문자료실'],
          ['B002', '클린 코드 (Clean Code)', '로버트 C. 마틴', '기술', '대출중', '3층 디지털기술자료실'],
          ['B003', '사피엔스', '유발 하라리', '역사', '이용가능', '2층 역사자료실'],
          ['B004', '트렌드 코리아 2026', '김난도 외', '경제/경영', '이용가능', '2층 경제자료실'],
          ['B005', '객체지향의 사실과 오해', '조영호', '기술', '대출중', '3층 디지털기술자료실'],
          ['B006', '도파민 네이션', '애나 렘키', '심리', '이용가능', '2층 교양자료실'],
          ['B007', '세이노의 가르침', '세이노', '자기계발', '이용가능', '1층 종합자료실'],
          ['B008', '리팩터링 2판', '마틴 파울러', '기술', '이용가능', '3층 디지털기술자료실'],
          ['S001', '1열람실 - A01 좌석', '-', '좌석', '이용가능', '4층 일반열람실 A구역'],
          ['S002', '1열람실 - A02 좌석', '-', '좌석', '대출중', '4층 일반열람실 A구역'],
          ['S003', '1열람실 - A03 좌석 (창가)', '-', '좌석', '이용가능', '4층 일반열람실 A구역'],
          ['S004', '2열람실 - B01 노트북석', '-', '좌석', '이용가능', '4층 멀티미디어 B구역']
        ];
        initialBooks.forEach(function(row) { bookSheet.appendRow(row); });
      }

      result = { success: true, data: getSheetData('Books') };
    } else if (action === 'getReservations') {
      getOrCreateSheet('Reservations', ['reservation_id', 'item_id', 'user_name', 'user_email', 'start_time', 'end_time', 'status']);
      const userId = e.parameter.user_id || e.parameter.userEmail;
      const reservations = getSheetData('Reservations');
      const filtered = userId ? reservations.filter(function(r) { return r.user_id === userId || r.user_name === userId || r.user_email === userId; }) : reservations;
      result = { success: true, data: filtered };
    } else {
      result = { success: false, message: 'Invalid action parameter: ' + action };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST 요청 처리 (예약 신청 및 예약 취소)
function doPost(e) {
  let result = {};
  
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === 'createReservation') {
      result = createReservation(postData);
    } else if (action === 'cancelReservation') {
      const resId = postData.reservation_id || postData.reservationId || (postData.payload && postData.payload.reservationId);
      result = cancelReservation(resId);
    } else {
      result = { success: false, message: 'Invalid action' };
    }
  } catch (error) {
    result = { success: false, message: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 시트 데이터를 JSON 배열 객체로 변환
function getSheetData(sheetName) {
  const db = getDb();
  const sheet = db.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    let rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = rows[i][j];
    }
    data.push(rowObj);
  }
  return data;
}

// 새로운 예약 생성 (시트에 행 추가 및 도서 상태 '대출중'으로 자동 변경)
function createReservation(data) {
  const db = getDb();
  const resSheet = getOrCreateSheet('Reservations', [
    'reservation_id', 'item_id', 'user_name', 'user_email', 'start_time', 'end_time', 'status'
  ]);
  const bookSheet = getOrCreateSheet('Books', [
    'id', 'title', 'author', 'category', 'status', 'location'
  ]);

  const reservationId = 'RSV_' + new Date().getTime();
  const itemId = data.item_id || data.itemId || (data.payload && data.payload.itemId) || '';
  const userName = data.user_name || data.userName || data.user_id || (data.payload && data.payload.userName) || '이용자';
  const userEmail = data.user_email || data.userEmail || (data.payload && data.payload.userEmail) || '';
  const startTime = data.start_time || data.startDate || (data.payload && data.payload.startDate) || Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd');
  const endTime = data.end_time || data.endDate || (data.payload && data.payload.endDate) || '';

  // 1. Reservations 시트에 기록 추가
  resSheet.appendRow([reservationId, itemId, userName, userEmail, startTime, endTime, '예약중']);

  // 2. Books 시트의 해당 도서/좌석 상태를 '대출중'으로 자동 갱신
  if (itemId) {
    const bookRows = bookSheet.getDataRange().getValues();
    for (let i = 1; i < bookRows.length; i++) {
      if (String(bookRows[i][0]) === String(itemId)) {
        bookSheet.getRange(i + 1, 5).setValue('대출중');
        break;
      }
    }
  }

  return {
    success: true,
    reservation_id: reservationId,
    reservationId: reservationId,
    message: '예약이 성공적으로 등록되었습니다.'
  };
}

// 예약 취소
function cancelReservation(reservationId) {
  if (!reservationId) return { success: false, message: 'reservation_id가 필요합니다.' };
  
  const db = getDb();
  const resSheet = getOrCreateSheet('Reservations', [
    'reservation_id', 'item_id', 'user_name', 'user_email', 'start_time', 'end_time', 'status'
  ]);
  const bookSheet = getOrCreateSheet('Books', [
    'id', 'title', 'author', 'category', 'status', 'location'
  ]);

  const rows = resSheet.getDataRange().getValues();
  let found = false;
  let targetItemId = '';

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(reservationId)) {
      targetItemId = String(rows[i][1]);
      resSheet.getRange(i + 1, 7).setValue('취소됨');
      found = true;
      break;
    }
  }

  // 취소된 도서/좌석을 다시 '이용가능'으로 원복
  if (targetItemId) {
    const bookRows = bookSheet.getDataRange().getValues();
    for (let i = 1; i < bookRows.length; i++) {
      if (String(bookRows[i][0]) === String(targetItemId)) {
        bookSheet.getRange(i + 1, 5).setValue('이용가능');
        break;
      }
    }
  }

  return {
    success: true,
    message: found ? '예약이 취소되었습니다.' : '해당 예약번호를 찾지 못했지만 취소 처리되었습니다.'
  };
};`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">구글 스프레드시트 & Apps Script 연동 가이드</h3>
              <p className="text-xs text-slate-300">
                시트의 시트 탭 이름과 열(Column) 구성을 일치시키면 100% 자동 연동됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Current GAS URL */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-xs font-bold text-slate-500">현재 연결된 Web App URL:</span>
            <div className="font-mono text-xs text-blue-700 bg-white p-2 rounded-lg border border-slate-200 break-all select-all">
              {gasUrl}
            </div>
          </div>

          {/* Sheet 1: Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span>'Items' 시트 탭 (도서 및 좌석 목록)</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">탭 이름: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">Items</code> 또는 <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">Books</code></span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">A열 (id)</th>
                    <th className="p-2.5">B열 (title)</th>
                    <th className="p-2.5">C열 (author)</th>
                    <th className="p-2.5">D열 (category)</th>
                    <th className="p-2.5">E열 (status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">B001</td>
                    <td className="p-2.5 font-sans font-medium">정의란 무엇인가</td>
                    <td className="p-2.5 font-sans text-slate-600">마이클 샌델</td>
                    <td className="p-2.5 font-sans text-slate-600">인문</td>
                    <td className="p-2.5 font-sans text-emerald-600 font-bold">이용가능</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">S001</td>
                    <td className="p-2.5 font-sans font-medium">1열람실 - A01 좌석</td>
                    <td className="p-2.5 text-slate-400">-</td>
                    <td className="p-2.5 font-sans text-slate-600">좌석</td>
                    <td className="p-2.5 font-sans text-emerald-600 font-bold">이용가능</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sheet 2: Reservations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <span>'Reservations' 시트 탭 (예약 기록 DB)</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">탭 이름: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">Reservations</code></span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">A열 (reservationId)</th>
                    <th className="p-2.5">B열 (itemId)</th>
                    <th className="p-2.5">C열 (userName)</th>
                    <th className="p-2.5">D열 (userEmail)</th>
                    <th className="p-2.5">E열 (startDate)</th>
                    <th className="p-2.5">F열 (endDate)</th>
                    <th className="p-2.5">G열 (status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">R001</td>
                    <td className="p-2.5 text-slate-700">B001</td>
                    <td className="p-2.5 font-sans">홍길동</td>
                    <td className="p-2.5 text-slate-600">hong@example.com</td>
                    <td className="p-2.5">2026-10-10</td>
                    <td className="p-2.5">2026-10-17</td>
                    <td className="p-2.5 font-sans text-blue-600 font-bold">예약중</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Reference Accordion */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                <span>권장 Apps Script (.gs) 코드 전문 (오류 방지 및 CORS 대응)</span>
              </span>
              <button
                onClick={() => handleCopy(sampleGasCode, 'gasCode')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
              >
                {copiedSection === 'gasCode' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>코드 복사</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
              {sampleGasCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
