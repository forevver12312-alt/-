import React, { useState } from 'react';
import {
  Compass,
  HeartHandshake,
  ShieldPlus,
  BookOpen,
  Moon,
  Coins,
  Utensils,
  CloudRain,
  Users,
  Sparkles,
} from 'lucide-react';
import { OTHER_DUA_CATEGORIES } from '../data/adhkarData';
import { DhikrCard } from './DhikrCard';
import { DhikrItem, DuaCategory } from '../types';

interface CategoriesViewProps {
  fontSize: number;
  soundEnabled: boolean;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (item: DhikrItem) => void;
  selectedCategoryId?: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  fontSize,
  soundEnabled,
  bookmarkedIds,
  onToggleBookmark,
  selectedCategoryId,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    selectedCategoryId || 'istikhara'
  );

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4" />;
      case 'ShieldPlus':
        return <ShieldPlus className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Moon':
        return <Moon className="w-4 h-4" />;
      case 'Coins':
        return <Coins className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'CloudRain':
        return <CloudRain className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const currentCategory =
    OTHER_DUA_CATEGORIES.find((c) => c.id === activeCategoryId) || OTHER_DUA_CATEGORIES[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Category Pills Slider / Filter */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-3 shadow-xs border border-emerald-100 dark:border-emerald-950/80">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 px-1">
          اختر تصنيف الأدعية والأذكار:
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {OTHER_DUA_CATEGORIES.map((cat) => {
            const isSelected = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                    : 'bg-gray-100 dark:bg-emerald-950/40 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                }`}
              >
                <span className={isSelected ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}>
                  {getCategoryIcon(cat.icon)}
                </span>
                <span>{cat.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-emerald-900/70 text-emerald-200'
                      : 'bg-gray-200 dark:bg-emerald-900/60 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Category Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-5 text-white shadow-md flex items-center justify-between border border-emerald-600/30">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
            {getCategoryIcon(currentCategory.icon)}
            <span>تصنيف الأدعية المأثورة</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-quran">{currentCategory.title}</h2>
          <p className="text-xs text-emerald-200/90 mt-1">{currentCategory.description}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentCategory.items.map((item) => (
          <DhikrCard
            key={item.id}
            item={item}
            fontSize={fontSize}
            soundEnabled={soundEnabled}
            isBookmarked={bookmarkedIds.has(item.id)}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </div>
    </div>
  );
};
