/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { QuranView } from './components/QuranView';
import { TafseerView } from './components/TafseerView';
import { MorningEveningView } from './components/MorningEveningView';
import { TravelDuasView } from './components/TravelDuasView';
import { CategoriesView } from './components/CategoriesView';
import { IslamicLibraryView } from './components/IslamicLibraryView';
import { TasbeehView } from './components/TasbeehView';
import { PrayerAndQiblaView } from './components/PrayerAndQiblaView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { BookmarksView } from './components/BookmarksView';
import { MORNING_ADHKAR, EVENING_ADHKAR, TRAVEL_DUAS, OTHER_DUA_CATEGORIES } from './data/adhkarData';
import { DhikrItem } from './types';
import { POPULAR_CITIES, calculatePrayerTimes } from './utils/prayerTimes';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('quran');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nur_dark_mode');
      if (saved !== null) return saved === 'true';
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nur_sound_enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nur_font_size');
      return saved ? Number(saved) : 20;
    } catch {
      return 20;
    }
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('istikhara');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);

  // Last read Surah and Ayah
  const [lastReadSurah, setLastReadSurah] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('nur_last_read_surah');
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [lastReadAyah, setLastReadAyah] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('nur_last_read_ayah');
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('nur_bookmarks');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // Ignore
    }
    return new Set<string>();
  });

  // Dark Mode class synchronization
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('nur_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('nur_dark_mode', 'false');
      }
    } catch {
      // Ignore
    }
  }, [darkMode]);

  // Persist font size and sound
  useEffect(() => {
    try {
      localStorage.setItem('nur_font_size', fontSize.toString());
    } catch {
      // Ignore
    }
  }, [fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem('nur_sound_enabled', soundEnabled.toString());
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Persist bookmarks
  const handleToggleBookmark = (item: DhikrItem) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      try {
        localStorage.setItem('nur_bookmarks', JSON.stringify(Array.from(next)));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleSetLastRead = (surahNumber: number, ayahNumber: number) => {
    setLastReadSurah(surahNumber);
    setLastReadAyah(ayahNumber);
    try {
      localStorage.setItem('nur_last_read_surah', surahNumber.toString());
      localStorage.setItem('nur_last_read_ayah', ayahNumber.toString());
    } catch {
      // Ignore
    }
  };

  // Find all bookmarked Dhikr objects
  const bookmarkedItems = useMemo(() => {
    const allDhikrs: DhikrItem[] = [
      ...MORNING_ADHKAR,
      ...EVENING_ADHKAR,
      ...TRAVEL_DUAS,
      ...OTHER_DUA_CATEGORIES.flatMap((c) => c.items),
    ];
    return allDhikrs.filter((d) => bookmarkedIds.has(d.id));
  }, [bookmarkedIds]);

  // Selected City for global prayer sync
  const [currentCity, setCurrentCity] = useState(() => {
    try {
      const savedCity = localStorage.getItem('nur_selected_city');
      return savedCity ? JSON.parse(savedCity) : POPULAR_CITIES[0];
    } catch {
      return POPULAR_CITIES[0];
    }
  });

  // Calculate next prayer for Header
  const nextPrayerData = useMemo(() => {
    try {
      const { nextPrayer } = calculatePrayerTimes(currentCity, new Date());
      return nextPrayer;
    } catch {
      return undefined;
    }
  }, [currentCity]);

  // Handle Search Result Selection
  const handleSelectSearchResult = (
    tab: TabType,
    payload?: { surahNumber?: number; categoryId?: string; duaId?: string }
  ) => {
    setCurrentTab(tab);
    if (payload?.surahNumber) {
      setSelectedSurahNumber(payload.surahNumber);
    }
    if (payload?.categoryId) {
      setSelectedCategoryId(payload.categoryId);
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-[#faf8f5] dark:bg-[#071311] text-gray-900 dark:text-gray-100 flex flex-col font-cairo transition-colors duration-200`}>
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        nextPrayerInfo={nextPrayerData}
        savedBookmarksCount={bookmarkedIds.size + (lastReadSurah ? 1 : 0)}
      />

      {/* Navigation Bar */}
      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-28 md:pb-8">
        {currentTab === 'quran' && (
          <QuranView
            fontSize={fontSize}
            lastReadSurah={lastReadSurah}
            lastReadAyah={lastReadAyah}
            onSetLastRead={handleSetLastRead}
            initialSurahNumber={selectedSurahNumber}
          />
        )}

        {currentTab === 'tafseer' && (
          <TafseerView
            fontSize={fontSize}
            onOpenSurahInMushaf={(surahNum) => {
              setSelectedSurahNumber(surahNum);
              setCurrentTab('quran');
            }}
          />
        )}

        {currentTab === 'morning_evening' && (
          <MorningEveningView
            fontSize={fontSize}
            soundEnabled={soundEnabled}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentTab === 'travel' && (
          <TravelDuasView
            fontSize={fontSize}
            soundEnabled={soundEnabled}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentTab === 'categories' && (
          <CategoriesView
            fontSize={fontSize}
            soundEnabled={soundEnabled}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            selectedCategoryId={selectedCategoryId}
          />
        )}

        {currentTab === 'library' && <IslamicLibraryView fontSize={fontSize} />}

        {currentTab === 'tasbeeh' && (
          <TasbeehView soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />
        )}

        {currentTab === 'prayer' && <PrayerAndQiblaView onCityChange={setCurrentCity} />}
      </main>

      {/* Global Instant Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Bookmarks Modal */}
      <BookmarksView
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        lastReadSurah={lastReadSurah}
        lastReadAyah={lastReadAyah}
        bookmarkedItems={bookmarkedItems}
        onRemoveBookmark={(id) => {
          setBookmarkedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            try {
              localStorage.setItem('nur_bookmarks', JSON.stringify(Array.from(next)));
            } catch {
              // Ignore
            }
            return next;
          });
        }}
        onSelectSurah={(surahNumber) => {
          setSelectedSurahNumber(surahNumber);
          setCurrentTab('quran');
        }}
        onSelectDhikr={(item) => {
          if (item.category === 'morning' || item.category === 'evening') {
            setCurrentTab('morning_evening');
          } else if (item.category === 'travel') {
            setCurrentTab('travel');
          } else {
            setSelectedCategoryId(item.category);
            setCurrentTab('categories');
          }
        }}
      />

      {/* Footer with Creator Attribution */}
      <footer className="py-5 pb-20 md:pb-5 border-t border-emerald-100 dark:border-emerald-950/80 bg-white/70 dark:bg-[#0c1f1c]/70 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <WifiOff className="w-3.5 h-3.5" />
            <span>نور الإيمان يعمل 100% بدون إنترنت • صدقة جارية</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200">
            <span>صُنع بكل حب</span>
            <span className="text-rose-500 animate-pulse text-sm">❤️</span>
            <span className="text-emerald-800 dark:text-amber-300 font-extrabold font-quran text-base">يوسف محمد</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
