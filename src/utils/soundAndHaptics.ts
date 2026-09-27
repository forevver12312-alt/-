/**
 * Audio, Alarm Ringtones, and Haptic feedback generator
 * Supports:
 * 1. Real MP3 recordings of Adhan (Makkah, Madinah, Fajr, Eid Takbeerat) via HTML5 Audio
 * 2. User-provided custom audio / video URLs or device audio uploads
 * 3. Web Audio API synthesizer fallback
 */

let audioCtx: AudioContext | null = null;
let currentAdhanOscillators: { stop: () => void }[] = [];
let activeAudioElement: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTasbeehClick(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Organic wooden tasbeeh bead click sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Fallback
  }
}

export function playCompletionChime(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + index * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  } catch {
    // Ignore
  }
}

export function stopAdhanAudio() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudioElement = null;
  }
  currentAdhanOscillators.forEach((item) => {
    try {
      item.stop();
    } catch {
      // Ignore
    }
  });
  currentAdhanOscillators = [];
}

export type AlarmRingtoneId =
  | 'adhan_makkah'
  | 'adhan_madinah'
  | 'adhan_fajr'
  | 'takbeerat_eid'
  | 'gentle_chime'
  | 'peaceful_bells'
  | 'custom_user_tone';

export interface AlarmRingtoneInfo {
  id: AlarmRingtoneId;
  name: string;
  description: string;
  category: string;
  durationSec: number;
  audioUrl: string;
}

export const ALARM_RINGTONES: AlarmRingtoneInfo[] = [
  {
    id: 'adhan_makkah',
    name: 'أذان الحرم المكي الشريف (صوت حقيقي)',
    description: 'الأذان الحقيقي بصوت الشيخ علي أحمد ملا من المسجد الحرام بمكة المكرمة',
    category: 'تسجيل حقيقي',
    durationSec: 18,
    audioUrl: 'https://cdn.islamicfinder.org/audio/adhan/athan1.mp3',
  },
  {
    id: 'adhan_madinah',
    name: 'أذان المسجد النبوي الشريف (صوت حقيقي)',
    description: 'أذان المدينة المنورة الخاشع والمهيب بصوت مؤذني المسجد النبوي',
    category: 'تسجيل حقيقي',
    durationSec: 18,
    audioUrl: 'https://cdn.islamicfinder.org/audio/adhan/athan2.mp3',
  },
  {
    id: 'adhan_fajr',
    name: 'أذان الفجر - الصلاة خير من النوم (صوت حقيقي)',
    description: 'التسجيل الحقيقي لأذان صلاة الفجر بعبارة «الصلاة خيرٌ من النوم»',
    category: 'تسجيل حقيقي',
    durationSec: 20,
    audioUrl: 'https://cdn.islamicfinder.org/audio/adhan/fajr.mp3',
  },
  {
    id: 'takbeerat_eid',
    name: 'تكبيرات العيد بصوت جماعي (صوت حقيقي)',
    description: 'التسجيل الحقيقي لتكبيرات العيد من الحرم الشريف (الله أكبر ولله الحمد)',
    category: 'تسجيل حقيقي',
    durationSec: 16,
    audioUrl: 'https://cdn.islamicfinder.org/audio/adhan/takbeerat.mp3',
  },
  {
    id: 'gentle_chime',
    name: 'أذان الأقصى المبارك (صوت حقيقي)',
    description: 'أذان المسجد الأقصى الشريف في القدس المحتلة بصوت عذب ومؤثر',
    category: 'تسجيل حقيقي',
    durationSec: 18,
    audioUrl: 'https://cdn.islamicfinder.org/audio/adhan/athan3.mp3',
  },
  {
    id: 'peaceful_bells',
    name: 'أجراس السكينة والتأمل (نغمة هادئة)',
    description: 'نغمة هادئة وناعمة للاستيقاظ اللطيف لمن يفضل الرنين الهادئ',
    category: 'تنبيه هادئ',
    durationSec: 10,
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/temple_bell.ogg',
  },
];

/**
 * Fallback Web Audio Synthesizer if offline or audio file fails
 */
function playSynthFallback(ctx: AudioContext) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const notes = [
    { freq: 440.0, dur: 0.8, delay: 0 },
    { freq: 554.37, dur: 1.2, delay: 0.85 },
    { freq: 659.25, dur: 1.5, delay: 2.1 },
    { freq: 587.33, dur: 1.0, delay: 3.7 },
    { freq: 440.0, dur: 2.2, delay: 4.8 },
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + n.delay;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + n.dur + 0.1);
    currentAdhanOscillators.push(osc);
  });
}

/**
 * Plays the chosen ringtone:
 * Uses real recorded MP3 audio via HTML5 Audio element
 */
export function playAlarmSound(
  ringtoneId: AlarmRingtoneId = 'adhan_makkah',
  soundEnabled = true,
  customAudioUrl?: string
): () => void {
  if (!soundEnabled) return () => {};
  stopAdhanAudio();

  try {
    let targetUrl: string | undefined;

    if (ringtoneId === 'custom_user_tone' && customAudioUrl) {
      targetUrl = customAudioUrl;
    } else {
      const savedCustom = localStorage.getItem('nur_custom_audio_url');
      if (ringtoneId === 'custom_user_tone' && savedCustom) {
        targetUrl = savedCustom;
      } else {
        const found = ALARM_RINGTONES.find((r) => r.id === ringtoneId);
        targetUrl = found?.audioUrl || ALARM_RINGTONES[0].audioUrl;
      }
    }

    if (targetUrl) {
      const audio = new Audio(targetUrl);
      audio.crossOrigin = 'anonymous';
      audio.volume = 1.0;
      activeAudioElement = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If network error or blocked, use synthesizer fallback
          const ctx = getAudioContext();
          if (ctx) playSynthFallback(ctx);
        });
      }

      return stopAdhanAudio;
    } else {
      const ctx = getAudioContext();
      if (ctx) playSynthFallback(ctx);
      return stopAdhanAudio;
    }
  } catch {
    const ctx = getAudioContext();
    if (ctx) playSynthFallback(ctx);
    return () => {};
  }
}

export function playAdhanTone(soundEnabled = true): () => void {
  try {
    const saved = localStorage.getItem('nur_alarm_ringtone') as AlarmRingtoneId;
    return playAlarmSound(saved || 'adhan_makkah', soundEnabled);
  } catch {
    return playAlarmSound('adhan_makkah', soundEnabled);
  }
}

export function triggerHaptic(duration = 20) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore
    }
  }
}
