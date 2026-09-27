import React from 'react';
import { Bookmark, BookmarkCheck, Trash2, BookOpen, Heart, X } from 'lucide-react';
import { SURAH_INDEX } from '../data/quranIndex';
import { DhikrItem } from '../types';
import { TabType } from './Navigation';

interface BookmarksViewProps {
  isOpen: boolean;
  onClose: () => void;
  lastReadSurah: number | null;
  lastReadAyah: number | null;
  bookmarkedItems: DhikrItem[];
  onRemoveBookmark: (id: string) => void;
  onSelectSurah: (surahNumber: number) => void;
  onSelectDhikr: (item: DhikrItem) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  isOpen,
  onClose,
  lastReadSurah,
  lastReadAyah,
  bookmarkedItems,
  onRemoveBookmark,
  onSelectSurah,
  onSelectDhikr,
}) => {
  if (!isOpen) return null;

  const lastSurahMeta = lastReadSurah
    ? SURAH_INDEX.find((s) => s.number === lastReadSurah)
    : null;

  const savedPage = typeof window !== 'undefined' ? localStorage.getItem('nur_last_read_page') : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1f1c] rounded-2xl shadow-2xl border border-emerald-600/30 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950 flex items-center justify-between bg-emerald-50/60 dark:bg-[#071311]/60">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              المحفوظات وعلامات القراءة والمفضلة
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Last read position in Quran */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>علامة قراءة القرآن الكريم</span>
            </h4>

            {lastSurahMeta ? (
              <div
                onClick={() => {
                  onSelectSurah(lastSurahMeta.number);
                  onClose();
                }}
                className="p-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white cursor-pointer hover:shadow-md transition flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] text-amber-300 font-bold block mb-1">
                    آخر موضع قراءة محفوظ {savedPage ? `(صفحة ${savedPage})` : ''}
                  </span>
                  <h5 className="text-lg font-bold font-quran">
                    سورة {lastSurahMeta.name} {savedPage ? `- صفحة ${savedPage}` : `(الآية ${lastReadAyah || 1})`}
                  </h5>
                  <p className="text-xs text-emerald-200/80">
                    الجزء {lastSurahMeta.juz} • {lastSurahMeta.numberOfAyahs} آية
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-white/20 text-xs font-bold">
                  متابعة القراءة ←
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 p-3 bg-gray-50 dark:bg-emerald-950/30 rounded-xl">
                لم تقم بتثبيت علامة قراءة بعد. افتح أي سورة واضغط على زر "علامة حفظ".
              </p>
            )}
          </div>

          {/* Bookmarked Duas & Adhkar */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-amber-500" />
              <span>الأدعية والأذكار المفضلة ({bookmarkedItems.length})</span>
            </h4>

            {bookmarkedItems.length === 0 ? (
              <p className="text-xs text-gray-400 p-3 bg-gray-50 dark:bg-emerald-950/30 rounded-xl">
                لا توجد أدعية في المفضلة حالياً. اضغط على أيقونة القلب على أي ذكر أو دعاء لحفظه هنا للرجوع السريع إليه دون إنترنت.
              </p>
            ) : (
              <div className="space-y-2.5">
                {bookmarkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-emerald-950/40 border border-gray-100 dark:border-emerald-950/60 hover:border-emerald-300 transition flex items-start justify-between gap-3 group"
                  >
                    <div
                      onClick={() => {
                        onSelectDhikr(item);
                        onClose();
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 font-quran line-clamp-2 leading-relaxed">
                        {item.text}
                      </p>
                      {item.virtue && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 line-clamp-1 mt-1">
                          {item.virtue}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveBookmark(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                      title="إزالة من المفضلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
