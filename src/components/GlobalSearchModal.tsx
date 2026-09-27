import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  BookOpen,
  BookMarked,
  Sunrise,
  Sunset,
  Plane,
  Sparkles,
  Users,
  Sword,
} from 'lucide-react';
import { SURAH_INDEX } from '../data/quranIndex';
import { MORNING_ADHKAR, EVENING_ADHKAR, TRAVEL_DUAS, OTHER_DUA_CATEGORIES } from '../data/adhkarData';
import { SURAH_TAFSEER_LIST } from '../data/tafseerData';
import {
  PROPHETS_STORIES,
  SEERAH_MILESTONES,
  COMPANIONS_STORIES,
  GHAZWAT_LIST,
} from '../data/islamicLibraryData';
import { searchArabicMatches } from '../utils/arabicSearch';
import { TabType } from './Navigation';
import { fetchFullQuran } from '../utils/quranLoader';
import { SurahData } from '../types';

interface SearchResultItem {
  type: 'surah' | 'ayah' | 'adhkar' | 'dua' | 'tafseer' | 'story' | 'history';
  categoryLabel: string;
  categoryIcon: React.ReactNode;
  title: string;
  subtitle: string;
  tab: TabType;
  actionPayload?: {
    surahNumber?: number;
    categoryId?: string;
    duaId?: string;
  };
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tab: TabType, payload?: { surahNumber?: number; categoryId?: string; duaId?: string }) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [allSurahs, setAllSurahs] = useState<SurahData[]>([]);

  useEffect(() => {
    fetchFullQuran().then((data) => setAllSurahs(data));
  }, []);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const list: SearchResultItem[] = [];

    // 1. Search in Quran Surahs
    for (const surah of SURAH_INDEX) {
      if (
        searchArabicMatches(surah.name, trimmed) ||
        surah.englishName.toLowerCase().includes(trimmed.toLowerCase()) ||
        `سورة ${surah.name}`.includes(trimmed) ||
        surah.number.toString() === trimmed
      ) {
        list.push({
          type: 'surah',
          categoryLabel: 'المصحف الشريف',
          categoryIcon: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          title: `سورة ${surah.name}`,
          subtitle: `${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${surah.numberOfAyahs} آية • صفحة ${surah.page}`,
          tab: 'quran',
          actionPayload: { surahNumber: surah.number },
        });
      }
    }

    // 2. Search in Tafseer
    for (const tafseer of SURAH_TAFSEER_LIST) {
      if (
        searchArabicMatches(tafseer.name, trimmed) ||
        searchArabicMatches(tafseer.theme, trimmed) ||
        searchArabicMatches(tafseer.summary, trimmed)
      ) {
        list.push({
          type: 'tafseer',
          categoryLabel: 'تفسير القرآن',
          categoryIcon: <BookMarked className="w-4 h-4 text-amber-500" />,
          title: `تفسير سورة ${tafseer.name}`,
          subtitle: tafseer.theme,
          tab: 'tafseer',
          actionPayload: { surahNumber: tafseer.number },
        });
      }
    }

    // 3. Search in Prophets Stories
    for (const prophet of PROPHETS_STORIES) {
      if (
        searchArabicMatches(prophet.name, trimmed) ||
        searchArabicMatches(prophet.title, trimmed) ||
        searchArabicMatches(prophet.summary, trimmed)
      ) {
        list.push({
          type: 'story',
          categoryLabel: 'قصص الأنبياء',
          categoryIcon: <Sparkles className="w-4 h-4 text-amber-500" />,
          title: prophet.name,
          subtitle: `${prophet.title} • ${prophet.miracle}`,
          tab: 'library',
        });
      }
    }

    // 4. Search in Seerah
    for (const s of SEERAH_MILESTONES) {
      if (searchArabicMatches(s.title, trimmed) || searchArabicMatches(s.story, trimmed)) {
        list.push({
          type: 'history',
          categoryLabel: 'السيرة النبوية',
          categoryIcon: <BookOpen className="w-4 h-4 text-emerald-500" />,
          title: s.title,
          subtitle: `${s.era} (${s.year}) - ${s.keyLesson}`,
          tab: 'library',
        });
      }
    }

    // 5. Search in Companions
    for (const comp of COMPANIONS_STORIES) {
      if (searchArabicMatches(comp.name, trimmed) || searchArabicMatches(comp.biography, trimmed)) {
        list.push({
          type: 'story',
          categoryLabel: 'قصص الصحابة',
          categoryIcon: <Users className="w-4 h-4 text-teal-500" />,
          title: comp.name,
          subtitle: `${comp.title} - ${comp.virtue}`,
          tab: 'library',
        });
      }
    }

    // 6. Search in Ghazwat
    for (const ghazwa of GHAZWAT_LIST) {
      if (searchArabicMatches(ghazwa.name, trimmed) || searchArabicMatches(ghazwa.events, trimmed)) {
        list.push({
          type: 'history',
          categoryLabel: 'غزوات الرسول ﷺ',
          categoryIcon: <Sword className="w-4 h-4 text-rose-500" />,
          title: ghazwa.name,
          subtitle: `${ghazwa.yearHijri} • ${ghazwa.outcome}`,
          tab: 'library',
        });
      }
    }

    // 7. Search in Complete Quran Ayahs
    if (allSurahs.length > 0) {
      for (const surah of allSurahs) {
        for (const ayah of surah.ayahs) {
          if (searchArabicMatches(ayah.text, trimmed)) {
            list.push({
              type: 'ayah',
              categoryLabel: `آية من سورة ${surah.name}`,
              categoryIcon: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
              title: `سورة ${surah.name} - آية [${ayah.numberInSurah}]`,
              subtitle: ayah.text,
              tab: 'quran',
              actionPayload: { surahNumber: surah.number },
            });
            if (list.length >= 35) break;
          }
        }
        if (list.length >= 35) break;
      }
    }

    // 8. Search in Morning Adhkar
    for (const item of MORNING_ADHKAR) {
      if (searchArabicMatches(item.text, trimmed) || (item.virtue && searchArabicMatches(item.virtue, trimmed))) {
        list.push({
          type: 'adhkar',
          categoryLabel: 'أذكار الصباح',
          categoryIcon: <Sunrise className="w-4 h-4 text-amber-500" />,
          title: item.text.slice(0, 70) + (item.text.length > 70 ? '...' : ''),
          subtitle: item.virtue || item.reference || 'أذكار الصباح المأثورة',
          tab: 'morning_evening',
          actionPayload: { categoryId: 'morning', duaId: item.id },
        });
      }
    }

    // 9. Search in Evening Adhkar
    for (const item of EVENING_ADHKAR) {
      if (searchArabicMatches(item.text, trimmed) || (item.virtue && searchArabicMatches(item.virtue, trimmed))) {
        list.push({
          type: 'adhkar',
          categoryLabel: 'أذكار المساء',
          categoryIcon: <Sunset className="w-4 h-4 text-indigo-400" />,
          title: item.text.slice(0, 70) + (item.text.length > 70 ? '...' : ''),
          subtitle: item.virtue || item.reference || 'أذكار المساء المأثورة',
          tab: 'morning_evening',
          actionPayload: { categoryId: 'evening', duaId: item.id },
        });
      }
    }

    // 10. Search in Travel Duas
    for (const item of TRAVEL_DUAS) {
      if (
        searchArabicMatches(item.text, trimmed) ||
        (item.virtue && searchArabicMatches(item.virtue, trimmed)) ||
        'سفر مسافر ركوب سيارة طائرة دابة'.includes(trimmed)
      ) {
        list.push({
          type: 'dua',
          categoryLabel: 'أدعية السفر',
          categoryIcon: <Plane className="w-4 h-4 text-sky-500" />,
          title: item.text.slice(0, 70) + (item.text.length > 70 ? '...' : ''),
          subtitle: item.virtue || item.reference || 'دعاء السفر والمواصلات',
          tab: 'travel',
          actionPayload: { duaId: item.id },
        });
      }
    }

    // 11. Search in all other categories & Istikhara
    for (const cat of OTHER_DUA_CATEGORIES) {
      const matchCat = searchArabicMatches(cat.title, trimmed) || searchArabicMatches(cat.description, trimmed);
      for (const item of cat.items) {
        if (
          matchCat ||
          searchArabicMatches(item.text, trimmed) ||
          (item.virtue && searchArabicMatches(item.virtue, trimmed))
        ) {
          list.push({
            type: 'dua',
            categoryLabel: cat.title,
            categoryIcon: <Sparkles className="w-4 h-4 text-amber-500" />,
            title: item.text.slice(0, 70) + (item.text.length > 70 ? '...' : ''),
            subtitle: item.virtue || item.reference || cat.description,
            tab: 'categories',
            actionPayload: { categoryId: cat.id, duaId: item.id },
          });
        }
      }
    }

    return list.slice(0, 40);
  }, [query, allSurahs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1f1c] rounded-2xl shadow-2xl border border-emerald-600/30 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950 flex items-center gap-3 bg-emerald-50/50 dark:bg-[#071311]/50">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن سورة، تفسير، قصة نبي، صحابي، غزوة، دعاء..."
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base font-medium outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-emerald-950/60 transition"
          >
            إغلاق
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        {!query.trim() && (
          <div className="p-5 overflow-y-auto">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              عمليات بحث سريعة وشاملة
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                'تفسير الفاتحة',
                'قصة يوسف عليه السلام',
                'غزوة بدر',
                'خالد بن الوليد',
                'صلاة الاستخارة',
                'دعاء السفر',
                'الهجرة النبوية',
                'سيد الاستغفار',
                'سورة الكهف',
                'أبو بكر الصديق',
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-medium text-gray-700 dark:text-emerald-200 border border-transparent hover:border-emerald-300/40 transition cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
              <p>البحث يعمل تلقائياً وبدقة عالية في القرآن والتفسير والقصص والأذكار بدون إنترنت.</p>
            </div>
          </div>
        )}

        {/* Results List */}
        {query.trim().length >= 2 && (
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-gray-100 dark:divide-emerald-950/60">
            {results.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p className="font-medium text-sm">لم يتم العثور على نتائج لـ "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">جرّب كلمة أخرى مثل: يوسف، بدر، سفر، استخارة، الكهف</p>
              </div>
            ) : (
              results.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectResult(res.tab, res.actionPayload);
                    onClose();
                  }}
                  className="p-3 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 rounded-xl transition cursor-pointer flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                      {res.categoryIcon}
                      {res.categoryLabel}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      انتقال ←
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 font-quran leading-relaxed">
                    {res.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {res.subtitle}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
