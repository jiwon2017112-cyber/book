import React from 'react';
import { Search, X, Filter, LayoutGrid, MapPin, Check } from 'lucide-react';
import { CategoryFilter, StatusFilter, ViewMode } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilteredCount: number;
  availableCategories?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  availableCategories,
}) => {
  const categoryList = availableCategories && availableCategories.length > 0
    ? availableCategories
    : ['전체', '도서', '좌석', '기술', '인문', '역사', '경제/경영', '심리', '자기계발', '철학', '과학'];
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Top Row: Search Input & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="도서명, 저자, 좌석 번호(예: A01), 관리번호(B001) 검색..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status & View Mode */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Available only toggle */}
          <button
            onClick={() => onStatusFilterChange(statusFilter === 'available' ? 'all' : 'available')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              statusFilter === 'available'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-1 ring-emerald-400/30'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                statusFilter === 'available'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {statusFilter === 'available' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>이용가능만 보기</span>
          </button>

          {/* View Mode Switcher (shows seat layout button if category is 좌석 or 전체) */}
          {(selectedCategory === '좌석' || selectedCategory === '전체') && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="카드 그리드 뷰"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('seatMap')}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'seatMap'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="열람실 좌석 배치도"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden xs:inline text-[11px] font-semibold">좌석배치도</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
        <span className="text-xs font-medium text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>분류:</span>
        </span>
        {categoryList.map((catName) => {
          const isSelected = selectedCategory === catName;
          return (
            <button
              key={catName}
              onClick={() => onSelectCategory(catName)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25 ring-2 ring-blue-600/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {catName}
            </button>
          );
        })}

        <span className="ml-auto text-xs font-medium text-slate-400 shrink-0 pl-2">
          총 <strong className="text-slate-700 font-bold">{totalFilteredCount}</strong>개 항목
        </span>
      </div>
    </div>
  );
};
