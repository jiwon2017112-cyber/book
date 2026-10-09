import React from 'react';
import { BookMarked, Armchair, CheckCircle2, Clock, Info } from 'lucide-react';
import { LibraryItem, Reservation } from '../types';

interface StatsBannerProps {
  items: LibraryItem[];
  reservations: Reservation[];
  apiSource: 'api' | 'fallback';
  apiMessage?: string;
  onOpenSheetGuide: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  items,
  reservations,
  apiSource,
  apiMessage,
  onOpenSheetGuide,
}) => {
  const totalBooks = items.filter((i) => i.category !== '좌석' && !i.id.startsWith('S')).length;
  const availableBooks = items.filter(
    (i) => i.category !== '좌석' && !i.id.startsWith('S') && i.status === '이용가능'
  ).length;

  const totalSeats = items.filter((i) => i.category === '좌석' || i.id.startsWith('S')).length;
  const availableSeats = items.filter(
    (i) => (i.category === '좌석' || i.id.startsWith('S')) && i.status === '이용가능'
  ).length;

  const activeReservations = reservations.filter((r) => r.status === '예약중').length;

  return (
    <div className="space-y-4">
      {/* Alert banner if Google Sheet requires tab creation */}
      {apiSource === 'fallback' && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">
                구글 앱스스크립트(GAS) 시트 연동 안내
              </p>
              <p className="text-xs text-amber-700">
                {apiMessage
                  ? `연동 상태: ${apiMessage}. `
                  : '스프레드시트에 "Items" 및 "Reservations" 탭이 설정되어 있는지 확인하세요. '}
                현재는 시연 및 테스트용 로컬 카탈로그 모드로 작동 중이며 모든 예약/취소 기능이 정상 동작합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSheetGuide}
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            시트 설정 가이드
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Books Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">도서 보유 현황</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{availableBooks}</span>
              <span className="text-xs text-slate-400">/ {totalBooks}권 대출가능</span>
            </div>
          </div>
        </div>

        {/* Seats Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">열람실 잔여 좌석</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{availableSeats}</span>
              <span className="text-xs text-slate-400">/ {totalSeats}석 즉시이용</span>
            </div>
          </div>
        </div>

        {/* Available rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">전체 이용 가능률</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {items.length > 0
                  ? Math.round(((availableBooks + availableSeats) / items.length) * 100)
                  : 0}
                %
              </span>
              <span className="text-xs text-slate-400">즉시 예약</span>
            </div>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">현재 활성 예약</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-amber-600">{activeReservations}</span>
              <span className="text-xs text-slate-400">건 진행중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
