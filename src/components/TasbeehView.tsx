import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Check, Plus } from 'lucide-react';
import { playTasbeehClick, playCompletionChime, triggerHaptic } from '../utils/soundAndHaptics';

interface TasbeehViewProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

const PRESET_DHIKRS = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'لَا إِلَهَ إِلَّا اللَّهُ',
  'اللَّهُ أَكْبَرُ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
  'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
];

export const TasbeehView: React.FC<TasbeehViewProps> = ({
  soundEnabled,
  setSoundEnabled,
}) => {
  const [selectedPhrase, setSelectedPhrase] = useState(PRESET_DHIKRS[0]);
  const [customPhrase, setCustomPhrase] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [targetCount, setTargetCount] = useState<number | 'free'>(33);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalTasbeeh, setTotalTasbeeh] = useState(() => {
    try {
      return Number(localStorage.getItem('nur_total_tasbeeh') || 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nur_total_tasbeeh', totalTasbeeh.toString());
    } catch {
      // Ignore
    }
  }, [totalTasbeeh]);

  const handleTap = () => {
    const nextCount = count + 1;
    const nextTotal = totalTasbeeh + 1;
    setTotalTasbeeh(nextTotal);

    if (targetCount !== 'free' && nextCount >= targetCount) {
      setCount(0);
      setCycles((c) => c + 1);
      playCompletionChime(soundEnabled);
      triggerHaptic(50);
    } else {
      setCount(nextCount);
      playTasbeehClick(soundEnabled);
      triggerHaptic(20);
    }
  };

  const handleReset = () => {
    setCount(0);
    setCycles(0);
    triggerHaptic(15);
  };

  const currentTargetNumber = targetCount === 'free' ? 100 : targetCount;
  const progressPercent =
    targetCount === 'free'
      ? (count % 100)
      : Math.min(100, Math.round((count / targetCount) * 100));

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Title & Stats */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100 dark:border-emerald-950/80 text-center space-y-4">
        {/* Active Phrase Display */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            الذِّكْرُ الْمُخْتَار
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-quran text-gray-900 dark:text-white min-h-[40px] flex items-center justify-center">
            {selectedPhrase}
          </h2>
        </div>

        {/* Phrases Quick Picker */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {PRESET_DHIKRS.map((phrase) => (
            <button
              key={phrase}
              onClick={() => {
                setSelectedPhrase(phrase);
                setCount(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedPhrase === phrase
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {phrase}
            </button>
          ))}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ذكر مخصص</span>
          </button>
        </div>

        {/* Custom Phrase Form */}
        {showCustomInput && (
          <div className="flex gap-2 p-2 bg-gray-50 dark:bg-[#071311] rounded-2xl border border-gray-200 dark:border-emerald-950">
            <input
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="اكتب صيغة الذكر الخاصة بك..."
              className="flex-1 px-3 py-1.5 text-xs bg-transparent text-gray-900 dark:text-white outline-hidden"
            />
            <button
              onClick={() => {
                if (customPhrase.trim()) {
                  setSelectedPhrase(customPhrase.trim());
                  setShowCustomInput(false);
                  setCount(0);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
            >
              تثبيت
            </button>
          </div>
        )}

        {/* Target Buttons */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-emerald-950/60">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">الهدف:</span>
          {[33, 100, 'free'].map((t) => (
            <button
              key={t.toString()}
              onClick={() => {
                setTargetCount(t as number | 'free');
                setCount(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                targetCount === t
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-gray-100 dark:bg-emerald-950/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {t === 'free' ? 'مفتوح ∞' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Large Tactile Bead Button */}
      <div className="relative flex flex-col items-center justify-center py-6 select-none">
        {/* Outer Ring with Progress */}
        <div
          onClick={handleTap}
          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full cursor-pointer flex items-center justify-center p-3 shadow-2xl transition-transform active:scale-95 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 border-4 border-amber-400/40 hover:border-amber-400"
          style={{
            boxShadow: '0 20px 50px rgba(6, 78, 59, 0.4)',
          }}
        >
          {/* Inner Glowing Dial */}
          <div className="w-full h-full rounded-full bg-gradient-to-t from-emerald-950 to-emerald-800 flex flex-col items-center justify-center text-white border-2 border-emerald-500/30 p-4">
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-1">
              {targetCount === 'free' ? 'العد المفتوح' : `الدورة ${cycles + 1}`}
            </span>

            {/* Massive Counter Digits */}
            <span className="text-6xl sm:text-7xl font-extrabold tracking-tight font-quran text-amber-200 drop-shadow-md">
              {count}
            </span>

            {/* Sub Info */}
            <div className="mt-2 text-center text-xs text-emerald-200/80">
              {targetCount !== 'free' && (
                <span>من أصل {targetCount}</span>
              )}
            </div>

            <span className="text-[11px] text-emerald-300/60 mt-3">اضغط للتسبيح</span>
          </div>
        </div>

        {/* Action Controls below button */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0c1f1c] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-700 dark:text-gray-300 hover:text-rose-600 border border-gray-200 dark:border-emerald-950 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تصفير العداد</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0c1f1c] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-950 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            <span>{soundEnabled ? 'الصوت مفعّل' : 'الصوت مكتوم'}</span>
          </button>
        </div>

        {/* Total lifetime counter badge */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <span>إجمالي تسبيحاتك المسجلة: </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-quran text-sm">
            {totalTasbeeh}
          </span>
          <span> تسبيحة</span>
        </div>
      </div>
    </div>
  );
};
