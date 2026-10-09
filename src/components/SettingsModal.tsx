import React, { useState } from 'react';
import { X, Settings, Link2, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DEFAULT_GAS_URL } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGasUrl: string;
  onSaveGasUrl: (newUrl: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentGasUrl,
  onSaveGasUrl,
}) => {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState(currentGasUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const urlToTest = inputUrl.trim();
      const res = await fetch(`${urlToTest}?action=getBooks`, { method: 'GET' });
      const json = await res.json().catch(() => null);

      if (json && json.success) {
        setTestResult({
          success: true,
          message: `연결 성공! (${json.data ? json.data.length : 0}개 항목 반환됨)`,
        });
      } else if (json && json.message?.includes('Invalid action parameter')) {
        // test getItems
        const res2 = await fetch(`${urlToTest}?action=getItems`, { method: 'GET' });
        const json2 = await res2.json().catch(() => null);
        if (json2 && json2.success) {
          setTestResult({
            success: true,
            message: `연결 성공 (getItems 액션): ${json2.data ? json2.data.length : 0}개 항목`,
          });
        } else {
          setTestResult({
            success: false,
            message: `GAS 스크립트 연결 확인됨: ${json2?.message || json?.message || '시트 응답 오류'}`,
          });
        }
      } else {
        setTestResult({
          success: false,
          message: `응답: ${json?.message || '데이터 형식 오류'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `연결 오류: ${err?.message || '네트워크 또는 CORS 정책 확인 필요'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveGasUrl(inputUrl.trim());
    onClose();
  };

  const handleReset = () => {
    setInputUrl(DEFAULT_GAS_URL);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95">
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">API 엔드포인트 환경 설정</h3>
              <p className="text-xs text-slate-300">Google Apps Script Web App URL 변경</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Google Apps Script Web App URL</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>기본값으로 복원</span>
              </button>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
              />
            </div>
          </div>

          {/* Test connection button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !inputUrl.trim()}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5 text-blue-600" />}
              <span>{testing ? '연결 확인 중...' : '연결 상태 테스트'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            Google Apps Script 배포 시 <strong>'다음 사용자로서 실행: 나'</strong> 및 <strong>'액세스 권한: 모든 사용자 (익명 포함)'</strong>으로 설정되어야 브라우저에서 원활히 접근할 수 있습니다.
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
