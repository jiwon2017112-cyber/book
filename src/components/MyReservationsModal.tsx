import React, { useState } from 'react';
import { X, Calendar, User, Mail, Trash2, AlertCircle, CheckCircle2, Clock, Search, ShieldCheck } from 'lucide-react';
import { Reservation } from '../types';

interface MyReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onCancelReservation: (reservationId: string) => Promise<boolean>;
  isCancelling: boolean;
}

export const MyReservationsModal: React.FC<MyReservationsModalProps> = ({
  isOpen,
  onClose,
  reservations,
  onCancelReservation,
  isCancelling,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedToCancel, setSelectedToCancel] = useState<Reservation | null>(null);

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.reservationId.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      (r.itemTitle && r.itemTitle.toLowerCase().includes(q)) ||
      r.itemId.toLowerCase().includes(q)
    );
  });

  const handleConfirmCancel = async () => {
    if (!selectedToCancel) return;
    const ok = await onCancelReservation(selectedToCancel.reservationId);
    if (ok) {
      setSelectedToCancel(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">내 예약 현황 및 취소 관리</h3>
              <p className="text-xs text-slate-300">
                구글 시트에 등록된 예약 번호로 취소 처리할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="예약번호(R001), 신청자명, 이메일로 검색..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Reservation List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">예약 내역이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">도서 또는 열람실 좌석을 예약해 보세요.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isActive = item.status === '예약중';
              return (
                <div
                  key={item.reservationId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {item.reservationId}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        항목 ID: {item.itemId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>예약중</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                          <span>취소완료</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      {item.itemTitle || `항목 [${item.itemId}]`}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>신청자: <strong className="text-slate-700">{item.userName}</strong></span>
                      <span>이메일: <span className="text-slate-600">{item.userEmail}</span></span>
                      <span>기간: <span className="font-semibold text-blue-700">{item.startDate} ~ {item.endDate}</span></span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isActive && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setSelectedToCancel(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>예약 취소 신청</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>총 {reservations.length}건의 예약 기록</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Confirmation Sub-Modal */}
      {selectedToCancel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
            onClick={() => !isCancelling && setSelectedToCancel(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 z-10 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">예약을 취소하시겠습니까?</h4>
              <p className="text-xs text-slate-500 mt-1">
                예약번호 <strong className="font-mono text-slate-700">{selectedToCancel.reservationId}</strong> 의
                대출/좌석 예약이 구글 시트에서 취소 처리됩니다.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isCancelling}
                onClick={() => setSelectedToCancel(null)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                돌아가기
              </button>
              <button
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                {isCancelling ? '취소 처리중...' : '네, 취소합니다'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
