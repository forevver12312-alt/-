import React from 'react';
import { Moon, Sun, Volume2, VolumeX, Search, WifiOff, BookmarkCheck } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { getHijriDate } from '../utils/prayerTimes';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  fontSize: number;
  setFontSize: (fn: (prev: number) => number) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  nextPrayerInfo?: { arabicName: string; time: string; remainingMinutes: number };
  savedBookmarksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  setFontSize,
  onOpenSearch,
  onOpenBookmarks,
  nextPrayerInfo,
  savedBookmarksCount,
}) => {
  const hijriStr = getHijriDate(new Date());

  const formatRemaining = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h} س و ${m} د`;
    return `${m} دقيقة`;
  };

  return (
    <header
      className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white shadow-lg border-b border-emerald-700/40"
      style={{ paddingTop: 'max(0px, env(safe-area-inset-top, 0px))' }}
    >
      <div className="max-w-6xl mx-auto px-3.5 sm:px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                <span className="text-xl sm:text-2xl text-amber-300 select-none">☪</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>نُورُ الإِيمَان</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-600/50">
                  <WifiOff className="w-3 h-3 text-emerald-300" />
                  بدون إنترنت
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 font-medium">
                {hijriStr}
              </p>
            </div>
          </div>

          {/* Quick Info & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Next Prayer Quick Pill (Desktop/Tablet) */}
            {nextPrayerInfo && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-xs text-emerald-100">
                <span className="text-amber-400 font-bold">{nextPrayerInfo.arabicName}:</span>
                <span className="font-semibold">{nextPrayerInfo.time}</span>
                <span className="text-[10px] text-emerald-300/80">({formatRemaining(nextPrayerInfo.remainingMinutes)})</span>
              </div>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-emerald-100 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="بحث في القرآن والأذكار والأدعية"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">بحث</span>
            </button>

            {/* Bookmarks */}
            <button
              onClick={onOpenBookmarks}
              className="relative p-2 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-emerald-100 hover:text-white transition cursor-pointer"
              title="المحفوظات والمفضلة"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-200" />
              {savedBookmarksCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px] flex items-center justify-center">
                  {savedBookmarksCount}
                </span>
              )}
            </button>

            {/* Font Size Adjusters */}
            <div className="hidden sm:flex items-center rounded-xl bg-emerald-800/60 p-0.5 border border-emerald-700/40">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="px-2 py-1 text-xs font-bold text-emerald-200 hover:text-white transition cursor-pointer"
                title="تصغير الخط"
              >
                أ-
              </button>
              <div className="w-[1px] h-3.5 bg-emerald-700/60" />
              <button
                onClick={() => setFontSize((s) => Math.min(32, s + 2))}
                className="px-2 py-1 text-xs font-bold text-emerald-200 hover:text-white transition cursor-pointer"
                title="تكبير الخط"
              >
                أ+
              </button>
            </div>

            {/* Sound Mute/Unmute */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-emerald-200 hover:text-white transition cursor-pointer"
              title={soundEnabled ? 'كتم صوت التسبيح' : 'تشغيل صوت التسبيح'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={() => {
                setDarkMode((prev) => !prev);
              }}
              className="p-2 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-emerald-200 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              title={darkMode ? 'التبديل إلى الوضع النهاري (المضيء)' : 'التبديل إلى الوضع الليلي'}
              aria-label={darkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span className="hidden lg:inline text-[11px] text-amber-200 font-semibold">نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-emerald-100" />
                  <span className="hidden lg:inline text-[11px] text-emerald-200 font-semibold">ليلي</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
