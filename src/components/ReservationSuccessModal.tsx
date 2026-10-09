import React from 'react';
import { CheckCircle2, Calendar, User, Mail, Hash, QrCode, ArrowRight, X } from 'lucide-react';
import { LibraryItem, ReservationPayload } from '../types';

interface ReservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  item: LibraryItem | null;
  payload: ReservationPayload | null;
  onViewMyReservations: () => void;
}

export const ReservationSuccessModal: React.FC<ReservationSuccessModalProps> = ({
  isOpen,
  onClose,
  reservationId,
  item,
  payload,
  onViewMyReservations,
}) => {
  if (!isOpen || !item || !payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95">
        {/* Top green success header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs ring-4 ring-white/10">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">예약이 완료되었습니다!</h3>
          <p className="text-xs text-emerald-100 mt-1">
            구글 시트 데이터베이스에 성공적으로 저장되었습니다.
          </p>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-4">
          {/* Reservation ID Card */}
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">예약 고유 번호 (Reservation ID)</span>
            <span className="text-xl font-mono font-black text-blue-700 tracking-wider">
              {reservationId}
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">예약 항목</span>
              <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
                {item.title}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">항목 번호</span>
              <span className="font-mono font-bold text-slate-700">{item.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">신청자 성함</span>
              <span className="font-bold text-slate-900">{payload.userName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">안내 이메일</span>
              <span className="text-slate-700">{payload.userEmail}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">이용 기간</span>
              <span className="font-semibold text-blue-700">
                {payload.startDate} ~ {payload.endDate}
              </span>
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed text-center">
            입실 또는 대출 시 본 예약 번호를 제시하거나 스마트 도서관 키오스크에서 확인하실 수 있습니다.
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={onViewMyReservations}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>내 예약 목록 확인</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
