import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  BookMarked,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  List,
} from 'lucide-react';
import { SURAH_TAFSEER_LIST } from '../data/tafseerData';
import { SURAH_INDEX } from '../data/quranIndex';
import { searchArabicMatches } from '../utils/arabicSearch';
import { triggerHaptic } from '../utils/soundAndHaptics';

interface TafseerViewProps {
  fontSize: number;
  onOpenSurahInMushaf: (surahNumber: number) => void;
}

export const TafseerView: React.FC<TafseerViewProps> = ({
  fontSize,
  onOpenSurahInMushaf,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  // Mode: 'detail' (showing Tafseer directly) or 'list' (browsing surahs)
  const [mobileMode, setMobileMode] = useState<'detail' | 'list'>('detail');

  const selectedTafseer = SURAH_TAFSEER_LIST.find((s) => s.number === selectedSurahNumber);
  const selectedSurahMeta =
    SURAH_INDEX.find((s) => s.number === selectedSurahNumber) || SURAH_INDEX[0];

  const filteredSurahs = SURAH_INDEX.filter((s) => {
    return (
      !searchQuery.trim() ||
      searchArabicMatches(s.name, searchQuery) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery.trim()
    );
  });

  const handleSelectSurah = (num: number) => {
    setSelectedSurahNumber(num);
    setMobileMode('detail');
    triggerHaptic(15);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextSurah = () => {
    if (selectedSurahNumber < 114) {
      handleSelectSurah(selectedSurahNumber + 1);
    }
  };

  const handlePrevSurah = () => {
    if (selectedSurahNumber > 1) {
      handleSelectSurah(selectedSurahNumber - 1);
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-7 shadow-lg border border-amber-500/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
              <BookMarked className="w-3.5 h-3.5" />
              <span>التفسير الميسر ومقاصد السور</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-quran text-amber-100">
              تفسير سور القرآن الكريم وتدبر معانيه
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl leading-relaxed">
              تفسير شامل وميسر لجميع سور القرآن الكريم مع مقاصدها وفضائلها بدون إنترنت.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mobile View Toggle */}
            <button
              onClick={() => setMobileMode(mobileMode === 'detail' ? 'list' : 'detail')}
              className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
            >
              <List className="w-4 h-4 text-amber-300" />
              <span>{mobileMode === 'detail' ? 'فهرس السور' : 'عرض التفسير'}</span>
            </button>

            <button
              onClick={() => onOpenSurahInMushaf(selectedSurahNumber)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-md cursor-pointer shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>فتح بالمصحف (صـ {selectedSurahMeta.page})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Surah List (Visible on desktop or when mobileMode === 'list') */}
        <div className={`space-y-3 ${mobileMode === 'detail' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-3 shadow-xs border border-emerald-100 dark:border-emerald-950/80 sticky top-20">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                اختر سورة لتفسيرها فوراً:
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                114 سورة
              </span>
            </div>

            <div className="relative mb-2.5">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute right-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم السورة أو رقمها..."
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071311] border border-gray-200 dark:border-emerald-950 text-xs font-semibold text-gray-900 dark:text-white outline-hidden"
              />
            </div>

            <div className="max-h-[550px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {filteredSurahs.map((surah) => {
                const isSelected = surah.number === selectedSurahNumber;
                return (
                  <button
                    key={surah.number}
                    onClick={() => handleSelectSurah(surah.number)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px]">
                        {surah.number}
                      </span>
                      <span className="font-quran text-sm">سورة {surah.name}</span>
                    </div>
                    <span className="text-[10px] opacity-75">{surah.numberOfAyahs} آية</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Tafseer Display (Appears IMMEDIATELY on click) */}
        <div className={`lg:col-span-2 space-y-4 ${mobileMode === 'list' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white dark:bg-[#0c1f1c] rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-100 dark:border-emerald-950/80 space-y-5">
            {/* Quick Switcher & Navigation Header */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-emerald-950 pb-4">
              <button
                onClick={handlePrevSurah}
                disabled={selectedSurahNumber <= 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedSurahNumber <= 1
                    ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-emerald-950/30 text-gray-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابقة</span>
              </button>

              {/* Fast dropdown selector right in the header */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 hidden sm:inline">انتقال:</span>
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => handleSelectSurah(Number(e.target.value))}
                  className="font-bold text-xs sm:text-sm py-1.5 px-3 rounded-xl bg-gray-100 dark:bg-[#071311] border border-gray-200 dark:border-emerald-950 text-gray-900 dark:text-white outline-hidden cursor-pointer"
                >
                  {SURAH_INDEX.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextSurah}
                disabled={selectedSurahNumber >= 114}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedSurahNumber >= 114
                    ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-emerald-950/30 text-gray-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <span>التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Surah Title Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-amber-300 block mb-1">
                  ترتيبها بالمصحف: {selectedSurahMeta.number} • نزلت في {selectedSurahMeta.revelationType === 'Meccan' ? 'مكة المكرمة' : 'المدينة المنورة'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-quran text-amber-100">
                  تَفْسِيرُ سُورَةِ {selectedSurahMeta.name}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-1">
                  عدد آياتها {selectedSurahMeta.numberOfAyahs} آية • تقع في الجزء {selectedSurahMeta.juz} • صفحة {selectedSurahMeta.page}
                </p>
              </div>

              <button
                onClick={() => onOpenSurahInMushaf(selectedSurahMeta.number)}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>اقرأ في صفحة {selectedSurahMeta.page} بالمصحف</span>
              </button>
            </div>

            {/* Main Theme / Objective */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>المحور والمقصد العام للسورة:</span>
              </h4>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40">
                {selectedTafseer?.theme ||
                  `سورة ${selectedSurahMeta.name} الكريمة، نزلت في ${
                    selectedSurahMeta.revelationType === 'Meccan' ? 'مكة المكرمة' : 'المدينة المنورة'
                  } وتتألف من ${selectedSurahMeta.numberOfAyahs} آية، تعالج قضايا الإيمان والتوحيد الخالص والعمل الصالح.`}
              </p>
            </div>

            {/* Virtues */}
            {selectedTafseer?.virtue && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  فضائل السورة المأثورة:
                </h4>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed p-3.5 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-200/40 dark:border-amber-900/30">
                  {selectedTafseer.virtue}
                </p>
              </div>
            )}

            {/* Summary Explanation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                البيان والتفسير الإجمالي للسورة:
              </h4>
              <p
                className="text-gray-700 dark:text-gray-300 leading-loose text-justify font-sans"
                style={{ fontSize: `${fontSize - 2}px` }}
              >
                {selectedTafseer?.summary ||
                  `تتناول سورة ${selectedSurahMeta.name} دلائل قدرة الله ووحدانيته، واستعراض العبر والدروس الإلهية، وحث المؤمنين على العمل الصالح والتزام أوامر الله ونواهيه، والتحذير من أهوال يوم القيامة مع التبشير بالجنة ونعيمها المقيم للمتقين.`}
              </p>
            </div>

            {/* Key Verses Tafseer */}
            {selectedTafseer?.keyVersesTafseer && selectedTafseer.keyVersesTafseer.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-emerald-950">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  تفسير آيات مختارة من السورة:
                </h4>
                <div className="space-y-3">
                  {selectedTafseer.keyVersesTafseer.map((kv, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#071311] border border-gray-200/70 dark:border-emerald-950 space-y-1.5"
                    >
                      <p className="font-quran text-sm sm:text-base font-bold text-gray-900 dark:text-white text-right leading-relaxed">
                        {kv.text} ﴿{kv.ayah}﴾
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        <strong className="text-emerald-700 dark:text-emerald-400">التفسير: </strong>
                        {kv.tafseer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-emerald-950 flex items-center justify-between">
              <button
                onClick={handlePrevSurah}
                disabled={selectedSurahNumber <= 1}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-emerald-950/60 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs disabled:opacity-40"
              >
                ← السورة السابقة
              </button>

              <button
                onClick={() => onOpenSurahInMushaf(selectedSurahMeta.number)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
              >
                فتح السورة بالمصحف
              </button>

              <button
                onClick={handleNextSurah}
                disabled={selectedSurahNumber >= 114}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-emerald-950/60 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs disabled:opacity-40"
              >
                السورة التالية →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
