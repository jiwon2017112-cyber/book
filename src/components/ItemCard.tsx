import React from 'react';
import { BookMarked, Armchair, CalendarPlus, MapPin, Tag, Hash, Clock, CheckCircle2, Ban } from 'lucide-react';
import { LibraryItem } from '../types';

interface ItemCardProps {
  item: LibraryItem;
  onReserve: (item: LibraryItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onReserve }) => {
  const isSeat = item.category === '좌석' || item.id.startsWith('S');
  const isAvailable = item.status === '이용가능';

  // Category styling
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case '좌석':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '기술':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '인문':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '역사':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '경제/경영':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case '심리':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '자기계발':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case '철학':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case '과학':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case '문학':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isAvailable
          ? 'border-slate-200/90 hover:border-blue-300'
          : 'border-slate-200 bg-slate-50/50 opacity-95'
      }`}
    >
      {/* Top Header & Visual Badge */}
      <div className="p-5 pb-3">
        {/* Category & Status Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${getCategoryBadgeClass(
                item.category
              )}`}
            >
              {isSeat ? <Armchair className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
              {item.category}
            </span>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-0.5">
              <Hash className="w-2.5 h-2.5" />
              {item.id}
            </span>
          </div>

          {/* Status Badge */}
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>이용가능</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{item.status}</span>
            </span>
          )}
        </div>

        {/* Title & Author */}
        <div className="mb-2.5">
          <h3
            className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug"
            title={item.title}
          >
            {item.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">
            {isSeat ? (
              <span className="text-slate-400">열람실 지정 좌석</span>
            ) : (
              <span>저자: {item.author || '미상'}</span>
            )}
          </p>
        </div>

        {/* Description or details */}
        {item.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        )}

        {/* Meta Specs (Location, Call number, Features) */}
        <div className="space-y-1.5 py-2 border-t border-slate-100 text-xs text-slate-500">
          {item.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.callNumber && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <BookMarked className="w-3.5 h-3.5 shrink-0" />
              <span>청구기호: <strong className="font-mono text-slate-600">{item.callNumber}</strong></span>
            </div>
          )}
          {isSeat && item.seatType && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Armchair className="w-3.5 h-3.5 shrink-0" />
              <span>좌석 유형: <span className="font-semibold text-slate-700">{item.seatType}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="p-4 pt-2 bg-slate-50/60 border-t border-slate-100">
        {isAvailable ? (
          <button
            onClick={() => onReserve(item)}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{isSeat ? '좌석 예약하기' : '도서 대출 예약'}</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-slate-200 text-slate-400 rounded-xl text-xs sm:text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4 text-slate-400" />
            <span>현재 {item.status} (예약 불가)</span>
          </button>
        )}
      </div>
    </div>
  );
};
