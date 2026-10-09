import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  X,
  Check,
  Loader2,
  Trash2,
  RefreshCw,
  Copy,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Clock,
  Sparkles,
  User,
  Mail,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { LibraryItem, Reservation, ReservationPayload } from './types';
import {
  fetchItemsFromApi,
  createReservationApi,
  cancelReservationApi,
  getStoredGasUrl,
  getStoredReservations,
  saveStoredReservations,
  INITIAL_ITEMS,
} from './services/api';
import { SheetGuideModal } from './components/SheetGuideModal';
import { getStandaloneHtmlSource } from './utils/standaloneHtml';

export default function App() {
  const gasUrl = getStoredGasUrl();
  const [items, setItems] = useState<LibraryItem[]>(INITIAL_ITEMS);
  const [reservations, setReservations] = useState<Reservation[]>(getStoredReservations());
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // Filters: Search + [전체, 도서, 좌석] + 이용가능 체크박스
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'전체' | '도서' | '좌석'>('전체');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modals
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isMyResOpen, setIsMyResOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Reservation Success Modal State
  const [successData, setSuccessData] = useState<{
    reservationId: string;
    itemTitle: string;
    userName: string;
    startDate: string;
    endDate: string;
    sheetSynced: boolean;
  } | null>(null);
  const [copiedResId, setCopiedResId] = useState(false);

  // Cancel Confirmation Modal State
  const [resToCancel, setResToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Form Inputs
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStartDate, setFormStartDate] = useState(todayStr);
  const [formEndDate, setFormEndDate] = useState(nextWeekStr);
  const [submitting, setSubmitting] = useState(false);

  // Load items from GAS
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchItemsFromApi(gasUrl);
      setItems(res.items);
      setApiConnected(res.source === 'api');
    } catch {
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isSeat = item.category === '좌석' || item.id.startsWith('S');
      if (category === '도서' && isSeat) return false;
      if (category === '좌석' && !isSeat) return false;

      if (onlyAvailable && item.status !== '이용가능') return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAuthor = item.author && item.author.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && matchId === false) return false;
        if (!matchTitle && !matchAuthor && !matchId) return false;
      }

      return true;
    });
  }, [items, category, onlyAvailable, search]);

  // Open reservation modal
  const handleOpenReserve = (item: LibraryItem) => {
    setSelectedItem(item);
    const isSeat = item.category === '좌석' || item.id.startsWith('S');
    setFormStartDate(todayStr);
    setFormEndDate(isSeat ? todayStr : nextWeekStr);
  };

  // Submit reservation - Non-blocking, 100% resilient
  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formName.trim()) return;

    setSubmitting(true);
    const payload: ReservationPayload = {
      itemId: selectedItem.id,
      userName: formName.trim(),
      userEmail: formEmail.trim() || 'user@example.com',
      startDate: formStartDate,
      endDate: formEndDate,
    };

    try {
      // 1. Call GAS API
      const apiResult = await createReservationApi(payload, gasUrl);
      const resId = apiResult.reservationId || `RSV_${Date.now()}`;

      // 2. Add to active reservations & save
      const newRes: Reservation = {
        reservationId: resId,
        itemId: selectedItem.id,
        itemTitle: selectedItem.title,
        userName: payload.userName,
        userEmail: payload.userEmail,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: '예약중',
      };

      const updated = [newRes, ...reservations];
      setReservations(updated);
      saveStoredReservations(updated);

      // 3. Update local item status to '대출중'
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: '대출중' } : i))
      );

      // 4. Show success modal with sheet sync info
      setSuccessData({
        reservationId: resId,
        itemTitle: selectedItem.title,
        userName: payload.userName,
        startDate: payload.startDate,
        endDate: payload.endDate,
        sheetSynced: apiResult.sheetSynced,
      });

      // 5. Reset form
      setSelectedItem(null);
      setFormName('');
      setFormEmail('');
    } catch (err: any) {
      // Fallback: still record in local app
      const fallbackId = `RSV_${Date.now()}`;
      const newRes: Reservation = {
        reservationId: fallbackId,
        itemId: selectedItem.id,
        itemTitle: selectedItem.title,
        userName: payload.userName,
        userEmail: payload.userEmail,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: '예약중',
      };
      const updated = [newRes, ...reservations];
      setReservations(updated);
      saveStoredReservations(updated);
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: '대출중' } : i))
      );

      setSuccessData({
        reservationId: fallbackId,
        itemTitle: selectedItem.title,
        userName: payload.userName,
        startDate: payload.startDate,
        endDate: payload.endDate,
        sheetSynced: false,
      });
      setSelectedItem(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm cancel reservation
  const handleConfirmCancel = async () => {
    if (!resToCancel) return;
    setCancelling(true);
    const reservationId = resToCancel.reservationId;

    try {
      await cancelReservationApi(reservationId, gasUrl);
    } catch {}

    // Mark as cancelled locally
    const targetItemId = resToCancel.itemId;
    const updated = reservations.map((r) => {
      if (r.reservationId === reservationId) {
        return { ...r, status: '취소됨' as const };
      }
      return r;
    });
    setReservations(updated);
    saveStoredReservations(updated);

    // Restore item status to '이용가능'
    if (targetItemId) {
      setItems((prev) =>
        prev.map((i) => (i.id === targetItemId ? { ...i, status: '이용가능' } : i))
      );
    }

    setCancelling(false);
    setResToCancel(null);
  };

  const activeResCount = reservations.filter((r) => r.status === '예약중').length;
  const standaloneSource = getStandaloneHtmlSource(gasUrl);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(standaloneSource);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneSource], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'library-reservation.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                도서관 & 열람실 예약
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>구글 시트 연동</span>
                <span className="text-slate-300">•</span>
                {apiConnected ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    시트 연동됨
                  </span>
                ) : (
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-0.5 cursor-pointer hover:underline"
                  >
                    <span>설정 확인 필요</span>
                    <HelpCircle className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>시트 설정</span>
            </button>

            <button
              onClick={() => setIsMyResOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 cursor-pointer transition-colors"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>내 예약</span>
              {activeResCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeResCount}
                </span>
              )}
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              title="새로고침"
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full space-y-4">
        {/* 구글 시트 연동 안내 배너 */}
        {!apiConnected && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
                ⚠️
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950">
                  구글 시트에 'Reservations' 탭(시트)이 생성되어 있나요?
                </p>
                <p className="text-amber-800 leading-relaxed">
                  시트 하단에 <strong>'Books'</strong>(도서목록)와 <strong>'Reservations'</strong>(예약기록) 탭이 있어야 스프레드시트에도 실시간 기록됩니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="self-end sm:self-auto shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors cursor-pointer shadow-2xs"
            >
              30초 해결 가이드
            </button>
          </div>
        )}

        {/* 검색 및 필터 컨트롤 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          {/* 실시간 검색창 */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="도서명, 저자, 좌석 번호(예: A01), 관리번호(B001) 검색..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 카테고리 필터 버튼 (전체 / 도서 / 좌석) & 이용가능 체크박스 */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5">
              {(['전체', '도서', '좌석'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                총 {filteredItems.length}개 항목
              </span>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>이용가능만 보기</span>
              </label>
            </div>
          </div>
        </div>

        {/* 메인 카드 리스트 */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm space-y-2">
            <p className="font-semibold text-slate-600">검색 조건에 맞는 도서 또는 좌석이 없습니다.</p>
            <p className="text-xs">검색어를 지우거나 필터 조건을 변경해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isSeat = item.category === '좌석' || item.id.startsWith('S');
              const isAvailable = item.status === '이용가능';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <div>
                    {/* 상단 태그: 관리번호, 카테고리 & 상태 */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="font-mono text-xs text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {item.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                        {isAvailable ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            이용가능
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            대출중
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3
                      className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[2.6rem]"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* 부가 정보 (저자 or 위치) */}
                    <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                      <p className="truncate">
                        {isSeat ? (
                          <span>위치: <strong className="text-slate-700">{item.location || '열람실'}</strong></span>
                        ) : (
                          <span>저자: <strong className="text-slate-700">{item.author || '-'}</strong></span>
                        )}
                      </p>
                      {!isSeat && item.location && (
                        <p className="text-[11px] text-slate-400 truncate">소장위치: {item.location}</p>
                      )}
                    </div>
                  </div>

                  {/* 예약 버튼 */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {isAvailable ? (
                      <button
                        onClick={() => handleOpenReserve(item)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>예약하기</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed text-center"
                      >
                        대출중 (예약 불가)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 text-center mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>도서관 및 열람실 간편 예약 시스템</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-slate-600 hover:text-blue-600 font-semibold cursor-pointer"
            >
              스프레드시트 연동 가이드
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="text-blue-600 hover:underline cursor-pointer font-semibold"
            >
              단일 index.html 소스코드 보기
            </button>
          </div>
        </div>
      </footer>

      {/* 1. 예약 신청 입력 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {selectedItem.category === '좌석' ? '🪑' : '📖'}
                </div>
                <h3 className="font-bold text-slate-900 text-base">예약 신청</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 선택 항목 카드 */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <div className="text-slate-400 font-semibold">예약 대상 항목:</div>
              <div className="font-bold text-slate-900 text-sm">
                [{selectedItem.id}] {selectedItem.title}
              </div>
              <div className="text-slate-500">
                {selectedItem.category === '좌석'
                  ? selectedItem.location
                  : `저자: ${selectedItem.author || '-'}`}
              </div>
            </div>

            {/* 입력 폼 */}
            <form onSubmit={handleReserveSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>신청자 성함 *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>연락처 또는 이메일 *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="예: 010-1234-5678 또는 hong@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>시작일 *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>종료일 *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    min={formStartDate}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <span>예약 신청 확정</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. 예약 완료 확인 팝업 (Custom Modal - window.alert 대체) */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-lg text-slate-900">예약이 완료되었습니다!</h3>
              <p className="text-xs text-slate-500">
                예약 내역이 정상적으로 등록되었습니다.
              </p>
            </div>

            {/* 예약 번호 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-blue-600 font-semibold block">예약번호</span>
                <span className="font-mono font-black text-blue-900 text-sm">
                  {successData.reservationId}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(successData.reservationId);
                  setCopiedResId(true);
                  setTimeout(() => setCopiedResId(false), 2000);
                }}
                className="px-2.5 py-1.5 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg text-xs font-bold text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedResId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedResId ? '복사됨' : '복사'}</span>
              </button>
            </div>

            {/* 예약 세부내역 */}
            <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-1.5 border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-400">예약 항목</span>
                <span className="font-bold text-slate-800">{successData.itemTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">신청자</span>
                <span className="font-semibold text-slate-800">{successData.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">이용 기간</span>
                <span className="font-semibold text-slate-800">
                  {successData.startDate} ~ {successData.endDate}
                </span>
              </div>
            </div>

            {/* 구글 시트 전송 결과 카드 */}
            {successData.sheetSynced ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>구글 스프레드시트에 실시간으로 기록되었습니다. ✅</span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1.5">
                <div className="flex items-start gap-1.5 font-bold">
                  <span>⚠️</span>
                  <span>앱 예약 완료 (구글 시트 저장 대기)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-normal">
                  구글 스프레드시트에 <strong>'Reservations'</strong> 탭이 없어 시트 전송은 보류되었습니다.
                </p>
                <button
                  onClick={() => {
                    setSuccessData(null);
                    setIsGuideOpen(true);
                  }}
                  className="text-amber-900 font-bold underline cursor-pointer text-[11px] hover:text-amber-950 block pt-0.5"
                >
                  구글 시트 탭 30초 설정 가이드 보기 →
                </button>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setIsMyResOpen(true);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                내 예약 확인
              </button>
              <button
                onClick={() => setSuccessData(null)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 예약 취소 확인 모달 (window.confirm 대체) */}
      {resToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">예약 취소 확인</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              정말로 <strong>[{resToCancel.reservationId}]</strong> 예약을 취소하시겠습니까? 취소 시 해당 도서/좌석은 다시 '이용가능' 상태로 전환됩니다.
            </p>
            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setResToCancel(null)}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>취소 중...</span>
                  </>
                ) : (
                  <span>예약 취소 확정</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 내 예약 내역 모달 */}
      {isMyResOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">내 예약 내역</h3>
              </div>
              <button
                onClick={() => setIsMyResOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {reservations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs space-y-1">
                  <p className="font-semibold text-slate-600">등록된 예약 내역이 없습니다.</p>
                  <p>도서나 좌석을 선택하고 예약을 진행해 보세요.</p>
                </div>
              ) : (
                reservations.map((res) => {
                  const isActive = res.status === '예약중';
                  return (
                    <div
                      key={res.reservationId}
                      className="p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-700">
                          {res.reservationId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {res.itemTitle || res.itemId}
                      </div>
                      <div className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {res.startDate} ~ {res.endDate}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{res.userName}</span>
                      </div>
                      {isActive && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => setResToCancel(res)}
                            className="px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>예약 취소</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 flex justify-end shrink-0 border-t border-slate-100">
              <button
                onClick={() => setIsMyResOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 구글 시트 연동 및 자동 복구 모달 */}
      <SheetGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        gasUrl={gasUrl}
      />

      {/* 6. 단일 index.html 소스코드 보기 모달 */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">단일 파일 index.html 소스코드</h3>
                <p className="text-xs text-slate-400">
                  외부 빌드 도구 없이 브라우저에서 바로 열 수 있는 완전한 단일 HTML 파일입니다.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownloadHtml}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="HTML 파일 다운로드"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>다운로드</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '복사됨' : '전체 복사'}</span>
                </button>
                <button
                  onClick={() => setIsCodeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-[11px] font-mono overflow-auto flex-1 leading-relaxed select-all">
              <code>{standaloneSource}</code>
            </pre>
            <div className="flex justify-end shrink-0 pt-2">
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
