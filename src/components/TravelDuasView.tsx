import React from 'react';
import { Plane, Compass, ShieldCheck, MapPin } from 'lucide-react';
import { TRAVEL_DUAS } from '../data/adhkarData';
import { DhikrCard } from './DhikrCard';
import { DhikrItem } from '../types';

interface TravelDuasViewProps {
  fontSize: number;
  soundEnabled: boolean;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (item: DhikrItem) => void;
}

export const TravelDuasView: React.FC<TravelDuasViewProps> = ({
  fontSize,
  soundEnabled,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  return (
    <div className="space-y-6 pb-20">
      {/* Travel Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-600/30">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-xs font-semibold text-amber-300 mb-2">
              <Plane className="w-3.5 h-3.5" />
              <span>حصن المسافر في حله وترحاله</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-quran text-white">
              أدعية السفر والركوب والتوديع
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-emerald-200/90 max-w-lg leading-relaxed">
              الأدعية النبوية المأثورة عند السفر برّاً وبحراً وجوّاً، تحفظ المسافر وماله وأهله، وتيسر رحلته بحول الله وقوته.
            </p>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
            <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* Travel Quick Tips */}
        <div className="mt-6 pt-4 border-t border-emerald-700/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>دعاء الركوب عند ابتداء المسير</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>التكبير عند الصعود والتسبيح عند النزول</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>دعاء الرجوع عند العودة للأهل</span>
          </div>
        </div>
      </div>

      {/* Travel Duas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRAVEL_DUAS.map((item) => (
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
