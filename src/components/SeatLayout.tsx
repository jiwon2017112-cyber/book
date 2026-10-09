import React from 'react';
import { Armchair, CheckCircle2, Ban, Laptop, Sparkles, Users } from 'lucide-react';
import { LibraryItem } from '../types';

interface SeatLayoutProps {
  items: LibraryItem[];
  onSelectSeat: (item: LibraryItem) => void;
}

export const SeatLayout: React.FC<SeatLayoutProps> = ({ items, onSelectSeat }) => {
  const seatItems = items.filter((i) => i.category === '좌석' || i.id.startsWith('S'));

  const room1Seats = seatItems.filter((s) => s.title.includes('1열람실'));
  const room2Seats = seatItems.filter((s) => s.title.includes('2열람실') || s.title.includes('노트북'));
  const otherSeats = seatItems.filter(
    (s) => !s.title.includes('1열람실') && !s.title.includes('2열람실') && !s.title.includes('노트북')
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Armchair className="w-5 h-5 text-indigo-600" />
            <span>열람실 및 스터디룸 실시간 좌석 배치도</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            원하는 좌석을 클릭하면 즉시 예약 신청 화면으로 이동합니다.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>예약가능</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>사용중</span>
          </div>
        </div>
      </div>

      {/* Grid of reading rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room 1: General Reading Room */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h4 className="font-bold text-slate-800 text-sm">제1열람실 (일반 집중열람석)</h4>
            </div>
            <span className="text-xs text-slate-500">4층 창가구역</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {room1Seats.map((seat) => {
              const isAvailable = seat.status === '이용가능';
              return (
                <button
                  key={seat.id}
                  disabled={!isAvailable}
                  onClick={() => onSelectSeat(seat)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                    isAvailable
                      ? 'bg-white hover:bg-emerald-50/50 border-emerald-200 hover:border-emerald-400 cursor-pointer shadow-xs hover:shadow-md'
                      : 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">{seat.id}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-900 truncate">
                      {seat.title.replace('1열람실 - ', '')}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {isAvailable ? '예약가능' : '사용중'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Room 2: Laptop & Collaboration Room */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h4 className="font-bold text-slate-800 text-sm">제2열람실 & 멀티미디어존</h4>
            </div>
            <span className="text-xs text-slate-500">4층 멀티미디어</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {room2Seats.map((seat) => {
              const isAvailable = seat.status === '이용가능';
              return (
                <button
                  key={seat.id}
                  disabled={!isAvailable}
                  onClick={() => onSelectSeat(seat)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                    isAvailable
                      ? 'bg-white hover:bg-indigo-50/50 border-indigo-200 hover:border-indigo-400 cursor-pointer shadow-xs hover:shadow-md'
                      : 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">{seat.id}</span>
                    <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-900 truncate">
                      {seat.title.replace('2열람실 - ', '')}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {isAvailable ? '예약가능' : '사용중'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Other Special Rooms */}
      {otherSeats.length > 0 && (
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">특수 열람석 및 그룹 스터디룸</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherSeats.map((seat) => {
              const isAvailable = seat.status === '이용가능';
              return (
                <div
                  key={seat.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-600">{seat.id}</span>
                      <span className="text-xs font-bold text-slate-900">{seat.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{seat.location}</p>
                  </div>
                  {isAvailable ? (
                    <button
                      onClick={() => onSelectSeat(seat)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      예약
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">
                      사용중
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
