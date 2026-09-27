import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Sword,
  Users,
  Compass,
  Search,
  Check,
  ChevronLeft,
  X,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  PROPHETS_STORIES,
  SEERAH_MILESTONES,
  GHAZWAT_LIST,
  COMPANIONS_STORIES,
  ProphetStory,
  SeerahMilestone,
  GhazwaItem,
  CompanionStory,
} from '../data/islamicLibraryData';
import { searchArabicMatches } from '../utils/arabicSearch';

type LibraryTab = 'prophets' | 'seerah' | 'companions' | 'ghazwat';

interface IslamicLibraryViewProps {
  fontSize: number;
}

export const IslamicLibraryView: React.FC<IslamicLibraryViewProps> = ({ fontSize }) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('prophets');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detailed modal for reading full story
  const [activeStoryModal, setActiveStoryModal] = useState<{
    title: string;
    subtitle: string;
    content: React.ReactNode;
  } | null>(null);

  // Filtered lists
  const filteredProphets = PROPHETS_STORIES.filter((p) => {
    return (
      !searchQuery.trim() ||
      searchArabicMatches(p.name, searchQuery) ||
      searchArabicMatches(p.title, searchQuery) ||
      searchArabicMatches(p.summary, searchQuery)
    );
  });

  const filteredSeerah = SEERAH_MILESTONES.filter((s) => {
    return (
      !searchQuery.trim() ||
      searchArabicMatches(s.title, searchQuery) ||
      searchArabicMatches(s.story, searchQuery) ||
      searchArabicMatches(s.era, searchQuery)
    );
  });

  const filteredCompanions = COMPANIONS_STORIES.filter((c) => {
    return (
      !searchQuery.trim() ||
      searchArabicMatches(c.name, searchQuery) ||
      searchArabicMatches(c.title, searchQuery) ||
      searchArabicMatches(c.biography, searchQuery)
    );
  });

  const filteredGhazwat = GHAZWAT_LIST.filter((g) => {
    return (
      !searchQuery.trim() ||
      searchArabicMatches(g.name, searchQuery) ||
      searchArabicMatches(g.events, searchQuery) ||
      searchArabicMatches(g.location, searchQuery)
    );
  });

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-7 shadow-lg border border-amber-500/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>المكتبة الإسلامية والتاريخية الشاملة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-quran text-amber-100">
              قصص الأنبياء • السيرة النبوية • الصحابة • الغزوات
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl leading-relaxed">
              سلسلة موثقة وشاملة تروي أحسن القصص، وسيرة الحبيب المصطفى ﷺ، وبطولات الصحابة الكرام، وملاحم الغزوات النبوية بأسلوب ميسر وعبر ملهمة.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-2.5 shadow-sm border border-emerald-100 dark:border-emerald-950/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => setActiveTab('prophets')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'prophets'
                ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>قصص الأنبياء ({PROPHETS_STORIES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('seerah')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'seerah'
                ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>السيرة النبوية ({SEERAH_MILESTONES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('companions')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'companions'
                ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>قصص الصحابة ({COMPANIONS_STORIES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ghazwat')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'ghazwat'
                ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Sword className="w-4 h-4 text-amber-400" />
            <span>غزوات الرسول ﷺ ({GHAZWAT_LIST.length})</span>
          </button>
        </div>

        {/* Search Bar in Library */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute right-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في القصص، الأنبياء، الصحابة، الغزوات..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-gray-50 dark:bg-[#071311] border border-gray-200 dark:border-emerald-950 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-hidden"
          />
        </div>
      </div>

      {/* ================= SECTION 1: PROPHETS STORIES ================= */}
      {activeTab === 'prophets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProphets.map((prophet) => (
            <div
              key={prophet.id}
              onClick={() => {
                setActiveStoryModal({
                  title: prophet.name,
                  subtitle: prophet.title,
                  content: (
                    <div className="space-y-4 text-right">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-300/40 text-xs text-amber-900 dark:text-amber-200">
                        <strong>المعجزة الكبرى: </strong> {prophet.miracle}
                      </div>

                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300/40 text-xs text-emerald-900 dark:text-emerald-200 font-quran text-sm">
                        ﴿{prophet.quranicMention}﴾
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-gray-900 dark:text-white">تفاصيل القصة:</h5>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-loose text-justify">
                          {prophet.summary}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-emerald-950">
                        <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">الدروس والعبر المستفادة:</h5>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-300">
                          {prophet.lessons.map((lesson, idx) => (
                            <li key={idx}>{lesson}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ),
                });
              }}
              className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-5 shadow-xs border border-emerald-100 dark:border-emerald-950/70 hover:border-emerald-300 dark:hover:border-emerald-700 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                    {prophet.title}
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold group-hover:translate-x-[-4px] transition">
                    اقرأ القصة كاملة ←
                  </span>
                </div>

                <h3 className="text-lg font-bold font-quran text-gray-900 dark:text-white mb-2">
                  {prophet.name}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {prophet.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-emerald-950/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{prophet.miracle}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= SECTION 2: PROPHETIC SEERAH ================= */}
      {activeTab === 'seerah' && (
        <div className="space-y-4">
          {filteredSeerah.map((milestone, idx) => (
            <div
              key={milestone.id}
              onClick={() => {
                setActiveStoryModal({
                  title: milestone.title,
                  subtitle: `${milestone.era} • ${milestone.year}`,
                  content: (
                    <div className="space-y-4 text-right">
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-loose text-justify">
                        {milestone.story}
                      </p>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300/30 text-xs text-emerald-900 dark:text-emerald-200">
                        <strong>العبرة النبوية: </strong> {milestone.keyLesson}
                      </div>
                    </div>
                  ),
                });
              }}
              className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-5 shadow-xs border border-emerald-100 dark:border-emerald-950/70 hover:border-emerald-300 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                      {milestone.era}
                    </span>
                    <span className="text-[11px] text-gray-400">{milestone.year}</span>
                  </div>
                  <h3 className="text-base font-bold font-quran text-gray-900 dark:text-white mt-1">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                    {milestone.story}
                  </p>
                </div>
              </div>

              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap self-end sm:self-center">
                التفاصيل ←
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ================= SECTION 3: COMPANIONS STORIES ================= */}
      {activeTab === 'companions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCompanions.map((comp) => (
            <div
              key={comp.id}
              onClick={() => {
                setActiveStoryModal({
                  title: comp.name,
                  subtitle: comp.title,
                  content: (
                    <div className="space-y-4 text-right">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-300/40 text-xs text-amber-900 dark:text-amber-200">
                        <strong>فضله ومكانته: </strong> {comp.virtue}
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-gray-900 dark:text-white">سيرته العطرة:</h5>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-loose text-justify">
                          {comp.biography}
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300/40 text-xs text-emerald-900 dark:text-emerald-200">
                        <strong>موقف تاريخي بارز: </strong> {comp.famousEvent}
                      </div>
                    </div>
                  ),
                });
              }}
              className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-5 shadow-xs border border-emerald-100 dark:border-emerald-950/70 hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {comp.category}
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    سيرته ←
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-quran text-gray-900 dark:text-white">
                  {comp.name}
                </h3>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-2">
                  {comp.title}
                </span>

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {comp.biography}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-emerald-950/60 text-[11px] text-gray-500 dark:text-gray-400">
                <span>{comp.famousEvent}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= SECTION 4: GHAZWAT ================= */}
      {activeTab === 'ghazwat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGhazwat.map((ghazwa) => (
            <div
              key={ghazwa.id}
              onClick={() => {
                setActiveStoryModal({
                  title: ghazwa.name,
                  subtitle: `${ghazwa.yearHijri} (${ghazwa.yearGregorian}) • ${ghazwa.location}`,
                  content: (
                    <div className="space-y-4 text-right">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/30 rounded-xl">
                          <strong>القائد: </strong> {ghazwa.commander}
                        </div>
                        <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/30 rounded-xl">
                          <strong>الجيشان: </strong> {ghazwa.armySize}
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-300/40 text-xs text-amber-900 dark:text-amber-200">
                        <strong>سبب الغزوة: </strong> {ghazwa.cause}
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-gray-900 dark:text-white">سير الأحداث:</h5>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-loose text-justify">
                          {ghazwa.events}
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300/40 text-xs text-emerald-900 dark:text-emerald-200">
                        <strong>النتيجة: </strong> {ghazwa.outcome}
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-emerald-950">
                        <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">الدروس المستفادة:</h5>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-300">
                          {ghazwa.keyLessons.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ),
                });
              }}
              className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-5 shadow-xs border border-emerald-100 dark:border-emerald-950/70 hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {ghazwa.yearHijri}
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    أحداث الغزوة ←
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-quran text-gray-900 dark:text-white">
                  {ghazwa.name}
                </h3>
                <span className="text-xs text-gray-400 block mb-2">
                  الموقع: {ghazwa.location}
                </span>

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {ghazwa.events}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-emerald-950/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                <span>{ghazwa.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* READING MODAL FOR FULL STORY */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0c1f1c] rounded-3xl shadow-2xl border border-emerald-600/30 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-emerald-950 flex items-center justify-between bg-emerald-50/60 dark:bg-[#071311]/60">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white font-quran">
                  {activeStoryModal.title}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {activeStoryModal.subtitle}
                </p>
              </div>
              <button
                onClick={() => setActiveStoryModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(85vh-120px)] scrollbar-thin">
              {activeStoryModal.content}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-emerald-950 flex justify-end bg-gray-50/50 dark:bg-[#071311]/30">
              <button
                onClick={() => setActiveStoryModal(null)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
