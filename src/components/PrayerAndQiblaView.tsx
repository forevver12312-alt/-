import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  Clock,
  MapPin,
  BellRing,
  BellOff,
  Calendar,
  Volume2,
  VolumeX,
  Search,
  Crosshair,
  Check,
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Music,
  Play,
  Square,
  Sparkles,
} from 'lucide-react';
import {
  POPULAR_CITIES,
  calculatePrayerTimes,
  calculateQibla,
  getHijriDate,
} from '../utils/prayerTimes';
import { CityLocation } from '../types';
import {
  ALARM_RINGTONES,
  AlarmRingtoneId,
  playAlarmSound,
  stopAdhanAudio,
  triggerHaptic,
} from '../utils/soundAndHaptics';
import { searchArabicMatches } from '../utils/arabicSearch';

interface PrayerAndQiblaViewProps {
  onCityChange?: (city: CityLocation) => void;
}

export const PrayerAndQiblaView: React.FC<PrayerAndQiblaViewProps> = ({ onCityChange }) => {
  // Current time state that ticks automatically every minute to update the day & times
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'tomorrow'>('today');

  // Selected City / Region
  const [selectedCity, setSelectedCity] = useState<CityLocation>(() => {
    try {
      const saved = localStorage.getItem('nur_selected_city');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return POPULAR_CITIES[0]; // Makkah default
  });

  // Search input for region/city typing
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Compass orientation
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  // Prayer Alarm Settings
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nur_prayer_alarm');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Selected Ringtone (نغمة المنبه)
  const [selectedRingtone, setSelectedRingtone] = useState<AlarmRingtoneId>(() => {
    try {
      const saved = localStorage.getItem('nur_alarm_ringtone') as AlarmRingtoneId;
      if (saved && ALARM_RINGTONES.some((r) => r.id === saved)) return saved;
    } catch {
      // Ignore
    }
    return 'adhan_makkah';
  });

  const [isPlayingAdhanTest, setIsPlayingAdhanTest] = useState(false);
  const [activeAdhanAlert, setActiveAdhanAlert] = useState<{ prayerName: string; time: string } | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Automatically tick every 30 seconds to update daily times, countdowns, and detect day change (midnight)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Save selected city & propagate to parent
  useEffect(() => {
    try {
      localStorage.setItem('nur_selected_city', JSON.stringify(selectedCity));
    } catch {
      // Ignore
    }
    if (onCityChange) {
      onCityChange(selectedCity);
    }
  }, [selectedCity, onCityChange]);

  // Save alarm setting & ringtone choice
  useEffect(() => {
    try {
      localStorage.setItem('nur_prayer_alarm', alarmEnabled.toString());
    } catch {
      // Ignore
    }
  }, [alarmEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('nur_alarm_ringtone', selectedRingtone);
    } catch {
      // Ignore
    }
  }, [selectedRingtone]);

  // Request browser notification permission if alarm is enabled
  useEffect(() => {
    if (alarmEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [alarmEnabled]);

  // Compass device orientation
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
      } else if ((e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading !== undefined) {
        setDeviceHeading((e as unknown as { webkitCompassHeading: number }).webkitCompassHeading);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  // Filter cities by user search query
  const matchingCities = useMemo(() => {
    if (!citySearchQuery.trim()) return POPULAR_CITIES.slice(0, 15);
    return POPULAR_CITIES.filter(
      (c) =>
        searchArabicMatches(c.name, citySearchQuery) ||
        searchArabicMatches(c.country, citySearchQuery)
    );
  }, [citySearchQuery]);

  // Date for calculation (Today or Tomorrow)
  const calculationDate = useMemo(() => {
    if (activeDateTab === 'tomorrow') {
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return currentDate;
  }, [activeDateTab, currentDate]);

  const hijriStr = getHijriDate(calculationDate);
  const { prayers, nextPrayer } = calculatePrayerTimes(selectedCity, calculationDate);
  const qiblaAngle = Math.round(calculateQibla(selectedCity.lat, selectedCity.lng));

  // Auto-check for Adhan time arrival
  useEffect(() => {
    if (!alarmEnabled) return;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const currentHM = `${pad(currentDate.getHours())}:${pad(currentDate.getMinutes())}`;

    // Check if current minute matches any prayer time
    const matchingPrayer = prayers.find(
      (p) => p.name !== 'Sunrise' && (p.rawTime24 === currentHM || p.time === currentHM)
    );

    if (matchingPrayer) {
      const alertKey = `nur_alert_${matchingPrayer.name}_${currentDate.toDateString()}`;
      if (!sessionStorage.getItem(alertKey)) {
        sessionStorage.setItem(alertKey, 'true');
        setActiveAdhanAlert({ prayerName: matchingPrayer.arabicName, time: matchingPrayer.time });
        playAlarmSound(selectedRingtone, true);
        triggerHaptic(100);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`حان الآن موعد صلاة ${matchingPrayer.arabicName}`, {
            body: `الله أكبر، حان الآن موعد أذان صلاة ${matchingPrayer.arabicName} بحسب توقيت ${selectedCity.name}`,
            icon: '/pwa-192x192.png',
          });
        }
      }
    }
  }, [alarmEnabled, currentDate, prayers, selectedCity, selectedRingtone]);

  // GPS Auto-detect handler
  const handleGPSDetect = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsMessage('خاصية تحديد الموقع غير مدعومة في متصفحك.');
      return;
    }

    setGpsLoading(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const timezone = Math.round(-new Date().getTimezoneOffset() / 60);

        let closest = POPULAR_CITIES[0];
        let minDistance = Number.MAX_VALUE;

        for (const city of POPULAR_CITIES) {
          const dist = Math.hypot(city.lat - latitude, city.lng - longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closest = city;
          }
        }

        if (minDistance < 0.6) {
          setSelectedCity(closest);
          setGpsMessage(`تم تحديد موقعك بدقة: ${closest.name} (${closest.country})`);
        } else {
          const customLocation: CityLocation = {
            name: `موقعي الحالي (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
            country: 'محدد بنظام GPS',
            lat: latitude,
            lng: longitude,
            timezone,
          };
          setSelectedCity(customLocation);
          setGpsMessage('تم ضبط مواقيت الصلاة والقبلة بدقة على إحداثيات موقعك الحالي.');
        }

        setGpsLoading(false);
        triggerHaptic(30);
        setTimeout(() => setGpsMessage(null), 4000);
      },
      (error) => {
        setGpsLoading(false);
        setGpsMessage('تعذر الوصول إلى الموقع (تأكد من تفعيل خدمة الموقع في جهازك).');
        setTimeout(() => setGpsMessage(null), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleTestSelectedAlarm = () => {
    if (isPlayingAdhanTest) {
      stopAdhanAudio();
      setIsPlayingAdhanTest(false);
    } else {
      setIsPlayingAdhanTest(true);
      const toneInfo = ALARM_RINGTONES.find((r) => r.id === selectedRingtone);
      const stop = playAlarmSound(selectedRingtone, true);
      stopAudioRef.current = stop;
      triggerHaptic(40);
      setTimeout(() => {
        setIsPlayingAdhanTest(false);
      }, (toneInfo?.durationSec || 10) * 1000);
    }
  };

  const formatRemaining = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h} ساعة و ${m} دقيقة`;
    return `${m} دقيقة`;
  };

  const needleRotation =
    deviceHeading !== null ? (qiblaAngle - deviceHeading + 360) % 360 : qiblaAngle;

  const gregorianDateStr = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(calculationDate);

  const selectedToneObj = ALARM_RINGTONES.find((r) => r.id === selectedRingtone) || ALARM_RINGTONES[0];

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* ================= 1. REGION SELECTION & SEARCH BOX ================= */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100 dark:border-emerald-950/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-emerald-950 pb-3">
          <div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
              تحديد المنطقة والمدينة (اكتب منطقتك وتتحدث المواقيت يومياً)
            </span>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg sm:text-xl font-bold font-quran text-gray-900 dark:text-white">
                {selectedCity.name} <span className="text-xs text-gray-400 font-sans font-normal">({selectedCity.country})</span>
              </h3>
            </div>
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleGPSDetect}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50 text-xs font-bold transition cursor-pointer"
          >
            <Crosshair className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'جارٍ تحديد موقعك...' : 'تحديد موقعي تلقائياً (GPS)'}</span>
          </button>
        </div>

        {/* GPS Status Message Toast */}
        {gpsMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{gpsMessage}</span>
          </div>
        )}

        {/* Search & Type City / Region Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>اكتب اسم مدينتك أو منطقتك للبحث السريع:</span>
            <span className="text-[11px] text-gray-400">أكثر من 120 مدينة عربية وإسلامية</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute right-3.5 top-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={citySearchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setCitySearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="اكتب مدينتك (مثل: مكة، الرياض، جدة، الدمام، تبوك، القاهرة، المنصورة، دبي، حلب)..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#071311] border border-gray-200 dark:border-emerald-950 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Autocomplete Results Dropdown */}
          {isSearchOpen && (
            <div className="mt-1 p-2 rounded-2xl bg-white dark:bg-[#071311] border border-emerald-200 dark:border-emerald-900 shadow-xl max-h-56 overflow-y-auto space-y-1 z-20 scrollbar-thin">
              {matchingCities.length === 0 ? (
                <div className="p-3 text-center text-xs text-gray-400">
                  لم يتم العثور على مدينة بهذا الاسم. يمكنك استخدام زر (تحديد موقعي GPS).
                </div>
              ) : (
                matchingCities.map((city) => {
                  const isCurrent = city.name === selectedCity.name;
                  return (
                    <button
                      key={`${city.name}-${city.country}`}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsSearchOpen(false);
                        setCitySearchQuery('');
                        triggerHaptic(15);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{city.name}</span>
                        <span className="text-[10px] opacity-75 font-normal">({city.country})</span>
                      </div>
                      <span className="text-[10px] opacity-60">توقيت UTC+{city.timezone}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Quick Popular Cities Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-400 text-[11px] font-semibold">اختيار سريع:</span>
          {['مكة المكرمة', 'المدينة المنورة', 'الرياض', 'جدة', 'الدمام', 'القاهرة', 'دبي', 'القدس الشريف', 'عَمّان', 'بغداد'].map((cityName) => {
            const cityObj = POPULAR_CITIES.find((c) => c.name === cityName);
            if (!cityObj) return null;
            const isSelected = selectedCity.name === cityName;
            return (
              <button
                key={cityName}
                onClick={() => {
                  setSelectedCity(cityObj);
                  setIsSearchOpen(false);
                  triggerHaptic(15);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 dark:bg-emerald-950/60 text-gray-700 dark:text-gray-300 hover:bg-emerald-100'
                }`}
              >
                {cityName}
              </button>
            );
          })}
        </div>

        {/* Daily Auto-Update Confirmation Note */}
        <div className="pt-3 border-t border-gray-100 dark:border-emerald-950/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>يتحدث وقت الصلاة والأذان تلقائياً كل يوم بحسب توقيت: {selectedCity.name}</span>
          </div>
          <span className="hidden sm:inline text-[11px] text-gray-400">{gregorianDateStr}</span>
        </div>
      </div>

      {/* ================= 2. ADHAN ALARM CARD ================= */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100 dark:border-emerald-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              alarmEnabled
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-gray-100 dark:bg-emerald-950/60 text-gray-400'
            }`}
          >
            {alarmEnabled ? <BellRing className="w-5 h-5 animate-bounce" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                منبه الأذان والتنبيه بدخول وقت الصلاة
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  alarmEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {alarmEnabled ? 'مفعّل' : 'معطّل'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              تنبيه فوري بدخول وقت الصلاة بحسب التوقيت الدقيق لمنطقة {selectedCity.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleTestSelectedAlarm}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isPlayingAdhanTest
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            {isPlayingAdhanTest ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingAdhanTest ? 'إيقاف التجربة' : 'تجربة الأذان'}</span>
          </button>

          <button
            onClick={() => {
              setAlarmEnabled(!alarmEnabled);
              triggerHaptic(20);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              alarmEnabled
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-gray-200 dark:bg-emerald-950/40 text-gray-700 dark:text-gray-300'
            }`}
          >
            {alarmEnabled ? 'تعطيل المنبه' : 'تشغيل المنبه'}
          </button>
        </div>
      </div>

      {/* ================= 3. TODAY / TOMORROW DATE SWITCHER ================= */}
      <div className="flex items-center justify-between bg-white dark:bg-[#0c1f1c] rounded-2xl p-2 shadow-xs border border-emerald-100 dark:border-emerald-950/80">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveDateTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDateTab === 'today'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50'
            }`}
          >
            مواقيت اليوم ({gregorianDateStr.split(' ')[0]})
          </button>
          <button
            onClick={() => setActiveDateTab('tomorrow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDateTab === 'tomorrow'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50'
            }`}
          >
            مواقيت الغد
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>{hijriStr}</span>
        </div>
      </div>

      {/* ================= 4. NEXT PRAYER COUNTDOWN CARD ================= */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-600/40 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <Clock className="w-4 h-4" />
            الصلاة القادمة في {selectedCity.name}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-quran text-amber-100">
            صلاة {nextPrayer.arabicName}
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            يحين موعدها في تمام الساعة <strong className="text-white text-sm">{nextPrayer.time}</strong>
          </p>
        </div>

        <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
          <span className="text-[11px] text-emerald-200 block">الوقت المتبقي للأذان</span>
          <span className="text-2xl sm:text-3xl font-bold font-quran text-amber-300">
            {formatRemaining(nextPrayer.remainingMinutes)}
          </span>
        </div>
      </div>

      {/* ================= 5. PRAYER TIMES 6-BOX GRID (12-HOUR FORMAT) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {prayers.map((p) => {
          const getPrayerIcon = () => {
            if (p.name === 'Fajr') return <Sunrise className="w-4 h-4 text-amber-400" />;
            if (p.name === 'Sunrise') return <Sun className="w-4 h-4 text-amber-500" />;
            if (p.name === 'Dhuhr') return <Sun className="w-4 h-4 text-amber-400" />;
            if (p.name === 'Asr') return <Sun className="w-4 h-4 text-amber-500" />;
            if (p.name === 'Maghrib') return <Sunset className="w-4 h-4 text-rose-400" />;
            return <Moon className="w-4 h-4 text-indigo-400" />;
          };

          return (
            <div
              key={p.name}
              className={`p-4 rounded-2xl border text-center transition-all ${
                p.isNext && activeDateTab === 'today'
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-[#0c1f1c] border-emerald-100 dark:border-emerald-950/70'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                {getPrayerIcon()}
                <span
                  className={`text-xs font-bold ${
                    p.isNext && activeDateTab === 'today'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {p.arabicName}
                </span>
              </div>

              <span className="text-base sm:text-xl font-bold font-quran text-gray-900 dark:text-white">
                {p.time}
              </span>

              {p.isNext && activeDateTab === 'today' && (
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  القادمة
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= 6. QIBLA COMPASS ================= */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100 dark:border-emerald-950/80">
        <div className="text-center max-w-md mx-auto space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>بوصلة القبلة لمنطقة {selectedCity.name}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-quran text-gray-900 dark:text-white">
            اتجاه القبلة نحو الكعبة المشرفة
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            زاوية القبلة من موقعك في <strong>{selectedCity.name}</strong> هي{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{qiblaAngle}°</strong> عن الشمال الحقيقي.
          </p>
        </div>

        {/* Visual Dial */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-emerald-700/30 dark:border-emerald-600/30 bg-radial from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-[#071311] flex items-center justify-center shadow-lg">
            <span className="absolute top-2 font-bold text-xs text-rose-600">شمال (N)</span>
            <span className="absolute bottom-2 font-bold text-xs text-gray-400">جنوب (S)</span>
            <span className="absolute right-2 font-bold text-xs text-gray-400">شرق (E)</span>
            <span className="absolute left-2 font-bold text-xs text-gray-400">غرب (W)</span>

            <div
              className="absolute w-full h-full flex items-center justify-center transition-transform duration-500"
              style={{
                transform: `rotate(${needleRotation}deg)`,
              }}
            >
              <div className="flex flex-col items-center h-48 sm:h-56 justify-between pointer-events-none">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-300 text-xs font-bold flex items-center justify-center shadow-md border border-amber-400">
                    🕋
                  </div>
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[18px] border-b-emerald-600" />
                </div>

                <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[14px] border-t-gray-400" />
              </div>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500 text-center max-w-xs">
            قم بتوجيه هاتفك أفقياً حتى تشير الكعبة المشرفة إلى قبلة صلاتك في {selectedCity.name}.
          </p>
        </div>
      </div>

      {/* ================= 7. ADHAN ARRIVAL POPUP MODAL ================= */}
      {activeAdhanAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in zoom-in-95">
          <div className="w-full max-w-md bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-3xl animate-bounce">
              🕌
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                أذان الصلاة
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-quran text-amber-100">
                حان الآن موعد صلاة {activeAdhanAlert.prayerName}
              </h3>
              <p className="text-xs text-emerald-200">
                الساعة الآن {activeAdhanAlert.time} حسب التوقيت المحلي لمنطقة {selectedCity.name}
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl text-xs text-amber-200/90 leading-relaxed font-quran">
              «اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ»
            </div>

            <button
              onClick={() => {
                stopAdhanAudio();
                setActiveAdhanAlert(null);
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition shadow-lg cursor-pointer"
            >
              تمت الاستجابة (إيقاف التنبيه)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
