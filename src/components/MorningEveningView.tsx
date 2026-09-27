import React, { useState } from 'react';
import { Sunrise, Sunset, RotateCcw } from 'lucide-react';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '../data/adhkarData';
import { DhikrCard } from './DhikrCard';
import { DhikrItem } from '../types';

interface MorningEveningViewProps {
  fontSize: number;
  soundEnabled: boolean;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (item: DhikrItem) => void;
  initialSubTab?: 'morning' | 'evening';
}

export const MorningEveningView: React.FC<MorningEveningViewProps> = ({
  fontSize,
  soundEnabled,
  bookmarkedIds,
  onToggleBookmark,
  initialSubTab = 'morning',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'morning' | 'evening'>(initialSubTab);

  const activeList = activeSubTab === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;

  return (
    <div className="space-y-6 pb-20">
      {/* Sub Tab Switcher & Banner */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-3 sm:p-4 shadow-sm border border-emerald-100 dark:border-emerald-950/80">
        <div className="grid grid-cols-2 gap-2 p-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl">
          <button
            onClick={() => setActiveSubTab('morning')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
              activeSubTab === 'morning'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-700'
            }`}
          >
            <Sunrise className="w-5 h-5" />
            <span>أذكار الصباح ({MORNING_ADHKAR.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('evening')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer ${
              activeSubTab === 'evening'
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-700'
            }`}
          >
            <Sunset className="w-5 h-5" />
            <span>أذكار المساء ({EVENING_ADHKAR.length})</span>
          </button>
        </div>

        {/* Motivational Banner */}
        <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          {activeSubTab === 'morning' ? (
            <p>وقت أذكار الصباح: يبدأ من بعد صلاة الفجر إلى طلوع الشمس وحتى زوالها.</p>
          ) : (
            <p>وقت أذكار المساء: يبدأ من بعد صلاة العصر حتى غروب الشمس وما بعد العشاء.</p>
          )}
        </div>
      </div>

      {/* Dhikr Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeList.map((item) => (
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
