export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  category: string;
  status: '이용가능' | '대출중' | '사용중' | '예약불가';
  location?: string;
  isbn?: string;
  callNumber?: string;
  description?: string;
  floor?: string;
  seatType?: '일반석' | '노트북석' | '집중열람석' | '스터디룸';
  rating?: number;
  coverGradient?: string;
}

export interface ReservationPayload {
  itemId: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
}

export interface Reservation {
  reservationId: string;
  itemId: string;
  itemTitle?: string;
  itemCategory?: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  status: '예약중' | '이용완료' | '취소됨';
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type CategoryFilter = string;
export type StatusFilter = 'all' | 'available' | 'reserved';
export type ViewMode = 'grid' | 'seatMap';
