import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Bookmark, Sparkles, Heart } from 'lucide-react';
import { DhikrItem } from '../types';
import { playTasbeehClick, playCompletionChime, triggerHaptic } from '../utils/soundAndHaptics';

interface DhikrCardProps {
  item: DhikrItem;
  fontSize: number;
  soundEnabled: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (item: DhikrItem) => void;
}

export const DhikrCard: React.FC<DhikrCardProps> = ({
  item,
  fontSize,
  soundEnabled,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [currentCount, setCurrentCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const isCompleted = currentCount >= item.repeat;

  const handleTap = () => {
    if (isCompleted) {
      // already completed, allow repeat or reset
      playTasbeehClick(soundEnabled);
      triggerHaptic(15);
      return;
    }

    const nextCount = currentCount + 1;
    setCurrentCount(nextCount);
    triggerHaptic(20);

    if (nextCount >= item.repeat) {
      playCompletionChime(soundEnabled);
      triggerHaptic(40);
    } else {
      playTasbeehClick(soundEnabled);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentCount(0);
    triggerHaptic(15);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const progressPercent = Math.min(100, Math.round((currentCount / item.repeat) * 100));

  return (
    <div
      onClick={handleTap}
      className={`relative select-none overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
        isCompleted
          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
          : 'bg-white dark:bg-[#0c1f1c] border-emerald-100 dark:border-emerald-950/70 hover:border-emerald-300 dark:hover:border-emerald-800'
      }`}
    >
      {/* Top progress stripe */}
      <div className="w-full h-1 bg-emerald-100/50 dark:bg-emerald-950/50">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-emerald-600 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-emerald-950/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {isCompleted ? '✓ تم الإتمام' : `العدد المطلوب: ${item.repeat}`}
            </span>
            {item.repeat > 1 && (
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                ({currentCount} من {item.repeat})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition cursor-pointer"
              title="نسخ الذكر"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Favorite / Bookmark */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
              title={isBookmarked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart
                className={`w-4 h-4 ${
                  isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-gray-400'
                }`}
              />
            </button>

            {/* Reset */}
            {currentCount > 0 && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                title="إعادة ضبط العداد"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* The Dhikr Text with Arabic Calligraphy Font */}
        <p
          className="font-quran leading-loose text-gray-900 dark:text-gray-100 text-right antialiased select-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {item.text}
        </p>

        {/* Virtue (فضل الذكر) */}
        {item.virtue && (
          <div className="mt-1 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">الفضل: </span>
              <span>{item.virtue}</span>
            </div>
          </div>
        )}

        {/* Reference / Source */}
        {item.reference && (
          <div className="text-[11px] text-gray-400 dark:text-gray-500 text-left">
            <span>{item.reference}</span>
          </div>
        )}

        {/* Big Tap Bar / Counter Control */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-emerald-950/60 flex items-center justify-between">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            اضغط في أي مكان للعد
          </span>

          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner transition-all transform active:scale-90 ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-emerald-700/50'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100'
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : currentCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
