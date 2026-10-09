import React from 'react';
import { BookOpen, Calendar, HelpCircle, Code2, Settings, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  onOpenMyReservations: () => void;
  onOpenSheetGuide: () => void;
  onOpenStandaloneExport: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeReservationsCount: number;
  apiSource: 'api' | 'fallback';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMyReservations,
  onOpenSheetGuide,
  onOpenStandaloneExport,
  onOpenSettings,
  onRefresh,
  isRefreshing,
  activeReservationsCount,
  apiSource,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  스마트 도서관 · 열람실
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  GAS 실시간 연동
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                도서 대출 & 열람실 좌석 통합 원스톱 예약 시스템
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* GAS Status indicator */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                apiSource === 'api'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                apiSource === 'api'
                  ? 'Google Apps Script API와 정상 연결됨'
                  : '구글 시트 연동 대기 / 로컬 캐시 활성화'
              }
            >
              {apiSource === 'api' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{apiSource === 'api' ? 'GAS 실시간 연결' : '로컬/시트 대기모드'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="데이터 새로고침"
              title="데이터 새로고침"
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* My Reservations Button */}
            <button
              onClick={onOpenMyReservations}
              className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 rounded-lg transition-all"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="hidden xs:inline">내 예약 내역</span>
              <span className="xs:hidden">내 예약</span>
              {activeReservationsCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-white bg-blue-600 rounded-full shadow-xs">
                  {activeReservationsCount}
                </span>
              )}
            </button>

            {/* Sheet Guide Button */}
            <button
              onClick={onOpenSheetGuide}
              title="구글 시트 연동 안내 및 컬럼 구성"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>시트 연동 안내</span>
            </button>

            {/* Standalone HTML Copy/Download Modal Button */}
            <button
              onClick={onOpenStandaloneExport}
              title="단일 index.html 파일 다운로드 및 소스코드 복사"
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">단일 HTML 코드</span>
              <span className="sm:hidden">HTML</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="API 엔드포인트 설정"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
