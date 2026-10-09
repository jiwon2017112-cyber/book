import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Tag, BookMarked, Armchair, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { LibraryItem, ReservationPayload } from '../types';

interface ReservationModalProps {
  item: LibraryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ReservationPayload) => Promise<boolean>;
  isSubmitting: boolean;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen || !item) return null;

  const isSeat = item.category === '좌석' || item.id.startsWith('S');

  // Today formatted YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFutureDateStr = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(isSeat ? getTodayStr() : getFutureDateStr(7));
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset or preset on open
  useEffect(() => {
    if (isOpen) {
      const today = getTodayStr();
      setStartDate(today);
      setEndDate(isSeat ? today : getFutureDateStr(7));
      setValidationError(null);
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!userName.trim()) {
      setValidationError('신청자 성함을 입력해 주세요.');
      return;
    }
    if (!userEmail.trim()) {
      setValidationError('이메일 주소를 입력해 주세요.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      setValidationError('올바른 이메일 형식을 입력해 주세요 (예: user@example.com).');
      return;
    }
    if (!startDate) {
      setValidationError('예약 시작일을 선택해 주세요.');
      return;
    }
    if (!endDate) {
      setValidationError('예약 종료일을 선택해 주세요.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setValidationError('예약 종료일은 시작일 이후여야 합니다.');
      return;
    }

    const payload: ReservationPayload = {
      itemId: item.id,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      startDate,
      endDate,
    };

    const ok = await onSubmit(payload);
    if (ok) {
      // modal closed by parent after showing confirmation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 transition-all scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5 text-white flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-2">
              {isSeat ? <Armchair className="w-3.5 h-3.5" /> : <BookMarked className="w-3.5 h-3.5" />}
              <span>{isSeat ? '열람실 좌석 예약 신청' : '도서 대출 예약 신청'}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">예약 신청서 작성</h2>
            <p className="text-xs text-slate-300 mt-1">
              구글 시트 데이터베이스에 실시간으로 예약 정보가 등록됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Item Summary Card */}
        <div className="p-6 pb-2">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              {isSeat ? <Armchair className="w-6 h-6" /> : <BookMarked className="w-6 h-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {item.id}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate" title={item.title}>
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSeat ? item.location : `저자: ${item.author || '미상'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* User Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              신청자 성함 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="홍길동"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* User Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              이메일 주소 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="hong@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">예약 확정 및 반납 안내 메일이 발송됩니다.</p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                예약 시작일 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                예약 종료일 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Policy Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 space-y-1">
            <p className="font-semibold text-blue-950">📋 이용 안내 규정</p>
            <p>
              {isSeat
                ? '• 열람실 좌석은 당일 이용을 원칙으로 하며 30분 이상 미착석 시 자동 반납 처리될 수 있습니다.'
                : '• 일반 도서 대출 기본 기간은 7일이며 최대 14일까지 지정 가능합니다.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>예약 처리 중...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>예약 신청 확정</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
