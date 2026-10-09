import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, ExternalLink, Sparkles } from 'lucide-react';
import { getStandaloneHtmlSource } from '../utils/standaloneHtml';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const code = getStandaloneHtmlSource(gasUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">단일 파일 index.html (Tailwind CDN + JS)</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  완전 자립형
                </span>
              </div>
              <p className="text-xs text-slate-300">
                별도의 빌드 도구 없이 브라우저에서 더블 클릭만으로 즉시 구동되는 완전한 소스코드입니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '복사 완료!' : '전체 복사'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>다운로드 (.html)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>HTML5 + Tailwind CDN + 순수 자바스크립트</span>
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">모달 창, 실시간 검색/필터, GAS fetch API 내장</span>
          </div>
          <a
            href="/standalone.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 underline"
          >
            <span>새 탭에서 직접 열어보기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Code Viewer */}
        <div className="p-4 sm:p-6 overflow-hidden flex-1 flex flex-col bg-slate-950">
          <pre className="flex-1 overflow-auto text-[11px] sm:text-xs font-mono text-slate-200 p-4 bg-slate-900 rounded-2xl border border-slate-800 leading-relaxed select-all">
            <code>{code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>총 약 {code.split('\n').length}줄의 단일 정적 웹 애플리케이션</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              {copied ? '복사되었습니다' : '클립보드에 복사'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
