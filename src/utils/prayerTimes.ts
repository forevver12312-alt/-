import { CityLocation, PrayerTimeData } from '../types';

export const POPULAR_CITIES: CityLocation[] = [
  // المملكة العربية السعودية
  { name: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262, timezone: 3 },
  { name: 'المدينة المنورة', country: 'السعودية', lat: 24.4672, lng: 39.6111, timezone: 3 },
  { name: 'الرياض', country: 'السعودية', lat: 24.7136, lng: 46.6753, timezone: 3 },
  { name: 'جدة', country: 'السعودية', lat: 21.5433, lng: 39.1728, timezone: 3 },
  { name: 'الدمام', country: 'السعودية', lat: 26.4207, lng: 50.0888, timezone: 3 },
  { name: 'الخبر', country: 'السعودية', lat: 26.2818, lng: 50.2083, timezone: 3 },
  { name: 'الأحساء (الهفوف)', country: 'السعودية', lat: 25.3800, lng: 49.5855, timezone: 3 },
  { name: 'الطائف', country: 'السعودية', lat: 21.2854, lng: 40.4222, timezone: 3 },
  { name: 'تبوك', country: 'السعودية', lat: 28.3835, lng: 36.5662, timezone: 3 },
  { name: 'بريدة (القصيم)', country: 'السعودية', lat: 26.3260, lng: 43.9750, timezone: 3 },
  { name: 'عنيزة', country: 'السعودية', lat: 26.0858, lng: 43.9936, timezone: 3 },
  { name: 'حائل', country: 'السعودية', lat: 27.5114, lng: 41.7208, timezone: 3 },
  { name: 'أبها', country: 'السعودية', lat: 18.2164, lng: 42.5053, timezone: 3 },
  { name: 'خميس مشيط', country: 'السعودية', lat: 18.3000, lng: 42.7333, timezone: 3 },
  { name: 'نجران', country: 'السعودية', lat: 17.4924, lng: 44.1277, timezone: 3 },
  { name: 'جازان', country: 'السعودية', lat: 16.8892, lng: 42.5511, timezone: 3 },
  { name: 'ينبع', country: 'السعودية', lat: 24.0232, lng: 38.1900, timezone: 3 },
  { name: 'الجبيل', country: 'السعودية', lat: 27.0174, lng: 49.6225, timezone: 3 },
  { name: 'الباحة', country: 'السعودية', lat: 20.0129, lng: 41.4677, timezone: 3 },
  { name: 'حفر الباطن', country: 'السعودية', lat: 28.4328, lng: 45.9708, timezone: 3 },
  { name: 'عرعر', country: 'السعودية', lat: 30.9753, lng: 41.0381, timezone: 3 },
  { name: 'سكاكا (الجوف)', country: 'السعودية', lat: 29.9697, lng: 40.2064, timezone: 3 },
  { name: 'القريات', country: 'السعودية', lat: 31.3318, lng: 37.3428, timezone: 3 },

  // جمهورية مصر العربية
  { name: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357, timezone: 2 },
  { name: 'الجيزة', country: 'مصر', lat: 30.0131, lng: 31.2089, timezone: 2 },
  { name: 'الإسكندرية', country: 'مصر', lat: 31.2001, lng: 29.9187, timezone: 2 },
  { name: 'المنصورة', country: 'مصر', lat: 31.0409, lng: 31.3785, timezone: 2 },
  { name: 'طنطا', country: 'مصر', lat: 30.7865, lng: 31.0004, timezone: 2 },
  { name: 'الزقازيق', country: 'مصر', lat: 30.5877, lng: 31.5020, timezone: 2 },
  { name: 'بورسعيد', country: 'مصر', lat: 31.2653, lng: 32.3019, timezone: 2 },
  { name: 'السويس', country: 'مصر', lat: 29.9668, lng: 32.5498, timezone: 2 },
  { name: 'الإسماعيلية', country: 'مصر', lat: 30.5965, lng: 32.2715, timezone: 2 },
  { name: 'أسيوط', country: 'مصر', lat: 27.1809, lng: 31.1837, timezone: 2 },
  { name: 'سوهاج', country: 'مصر', lat: 26.5569, lng: 31.6948, timezone: 2 },
  { name: 'قنا', country: 'مصر', lat: 26.1551, lng: 32.7160, timezone: 2 },
  { name: 'الأقصر', country: 'مصر', lat: 25.6872, lng: 32.6396, timezone: 2 },
  { name: 'أسوان', country: 'مصر', lat: 24.0889, lng: 32.8998, timezone: 2 },
  { name: 'الفيوم', country: 'مصر', lat: 29.3084, lng: 30.8428, timezone: 2 },
  { name: 'بني سويف', country: 'مصر', lat: 29.0661, lng: 31.0994, timezone: 2 },
  { name: 'المنيا', country: 'مصر', lat: 28.1099, lng: 30.7503, timezone: 2 },
  { name: 'دمياط', country: 'مصر', lat: 31.4175, lng: 31.8144, timezone: 2 },
  { name: 'شرم الشيخ', country: 'مصر', lat: 27.9158, lng: 34.3299, timezone: 2 },
  { name: 'الغردقة', country: 'مصر', lat: 27.2579, lng: 33.8116, timezone: 2 },

  // الإمارات العربية المتحدة
  { name: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708, timezone: 4 },
  { name: 'أبوظبي', country: 'الإمارات', lat: 24.4539, lng: 54.3773, timezone: 4 },
  { name: 'الشارقة', country: 'الإمارات', lat: 25.3463, lng: 55.4209, timezone: 4 },
  { name: 'العين', country: 'الإمارات', lat: 24.2075, lng: 55.7447, timezone: 4 },
  { name: 'عجمان', country: 'الإمارات', lat: 25.4052, lng: 55.5136, timezone: 4 },
  { name: 'رأس الخيمة', country: 'الإمارات', lat: 25.6741, lng: 55.9804, timezone: 4 },
  { name: 'الفجيرة', country: 'الإمارات', lat: 25.1288, lng: 56.3265, timezone: 4 },

  // دولة الكويت
  { name: 'مدينة الكويت', country: 'الكويت', lat: 29.3759, lng: 47.9774, timezone: 3 },
  { name: 'حولي', country: 'الكويت', lat: 29.3330, lng: 48.0289, timezone: 3 },
  { name: 'الأحمدي', country: 'الكويت', lat: 29.0769, lng: 48.0839, timezone: 3 },
  { name: 'الجهراء', country: 'الكويت', lat: 29.3375, lng: 47.6581, timezone: 3 },
  { name: 'الفروانية', country: 'الكويت', lat: 29.2784, lng: 47.9583, timezone: 3 },

  // دولة قطر
  { name: 'الدوحة', country: 'قطر', lat: 25.2854, lng: 51.5310, timezone: 3 },
  { name: 'الريان', country: 'قطر', lat: 25.2919, lng: 51.4244, timezone: 3 },
  { name: 'الوكرة', country: 'قطر', lat: 25.1768, lng: 51.6048, timezone: 3 },
  { name: 'الخور', country: 'قطر', lat: 25.6839, lng: 51.5058, timezone: 3 },

  // مملكة البحرين
  { name: 'المنامة', country: 'البحرين', lat: 26.2285, lng: 50.5860, timezone: 3 },
  { name: 'المحرق', country: 'البحرين', lat: 26.2572, lng: 50.6119, timezone: 3 },
  { name: 'الرفاع', country: 'البحرين', lat: 26.1300, lng: 50.5550, timezone: 3 },

  // سلطنة عُمان
  { name: 'مسقط', country: 'عُمان', lat: 23.5880, lng: 58.3829, timezone: 4 },
  { name: 'صلالة', country: 'عُمان', lat: 17.0151, lng: 54.0924, timezone: 4 },
  { name: 'صحار', country: 'عُمان', lat: 24.3639, lng: 56.7468, timezone: 4 },
  { name: 'نزوى', country: 'عُمان', lat: 22.9333, lng: 57.5333, timezone: 4 },

  // المملكة الأردنية الهاشمية
  { name: 'عَمّان', country: 'الأردن', lat: 31.9454, lng: 35.9284, timezone: 3 },
  { name: 'الزرقاء', country: 'الأردن', lat: 32.0728, lng: 36.0880, timezone: 3 },
  { name: 'إربد', country: 'الأردن', lat: 32.5568, lng: 35.8469, timezone: 3 },
  { name: 'العقبة', country: 'الأردن', lat: 29.5320, lng: 35.0063, timezone: 3 },
  { name: 'السلط', country: 'الأردن', lat: 32.0392, lng: 35.7272, timezone: 3 },

  // دولة فلسطين
  { name: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137, timezone: 2 },
  { name: 'غزة', country: 'فلسطين', lat: 31.5017, lng: 34.4668, timezone: 2 },
  { name: 'خان يونس', country: 'فلسطين', lat: 31.3462, lng: 34.3063, timezone: 2 },
  { name: 'رام الله', country: 'فلسطين', lat: 31.9038, lng: 35.2034, timezone: 2 },
  { name: 'نابلس', country: 'فلسطين', lat: 32.2211, lng: 35.2544, timezone: 2 },
  { name: 'الخليل', country: 'فلسطين', lat: 31.5326, lng: 35.0998, timezone: 2 },
  { name: 'جنين', country: 'فلسطين', lat: 32.4608, lng: 35.3009, timezone: 2 },

  // جمهورية العراق
  { name: 'بغداد', country: 'العراق', lat: 33.3152, lng: 44.3661, timezone: 3 },
  { name: 'البصرة', country: 'العراق', lat: 30.5081, lng: 47.7835, timezone: 3 },
  { name: 'الموصل', country: 'العراق', lat: 36.3400, lng: 43.1300, timezone: 3 },
  { name: 'أربيل', country: 'العراق', lat: 36.1911, lng: 44.0092, timezone: 3 },
  { name: 'النجف الأشرف', country: 'العراق', lat: 32.0000, lng: 44.3333, timezone: 3 },
  { name: 'كربلاء', country: 'العراق', lat: 32.6160, lng: 44.0249, timezone: 3 },
  { name: 'كركوك', country: 'العراق', lat: 35.4681, lng: 44.3922, timezone: 3 },
  { name: 'السليمانية', country: 'العراق', lat: 35.5613, lng: 45.4357, timezone: 3 },

  // الجمهورية العربية السورية
  { name: 'دمشق', country: 'سوريا', lat: 33.5138, lng: 36.2765, timezone: 3 },
  { name: 'حلب', country: 'سوريا', lat: 36.2021, lng: 37.1343, timezone: 3 },
  { name: 'حمص', country: 'سوريا', lat: 34.7324, lng: 36.7137, timezone: 3 },
  { name: 'حماة', country: 'سوريا', lat: 35.1318, lng: 36.7578, timezone: 3 },
  { name: 'اللاذقية', country: 'سوريا', lat: 35.5317, lng: 35.7901, timezone: 3 },
  { name: 'دير الزور', country: 'سوريا', lat: 35.3359, lng: 40.1408, timezone: 3 },

  // الجمهورية اللبنانية
  { name: 'بيروت', country: 'لبنان', lat: 33.8938, lng: 35.5018, timezone: 2 },
  { name: 'طرابلس (لبنان)', country: 'لبنان', lat: 34.4367, lng: 35.8497, timezone: 2 },
  { name: 'صيدا', country: 'لبنان', lat: 33.5631, lng: 35.3689, timezone: 2 },

  // الجمهورية اليمنية
  { name: 'صنعاء', country: 'اليمن', lat: 15.3694, lng: 44.1910, timezone: 3 },
  { name: 'عدن', country: 'اليمن', lat: 12.7855, lng: 45.0187, timezone: 3 },
  { name: 'تعز', country: 'اليمن', lat: 13.5795, lng: 44.0209, timezone: 3 },
  { name: 'الحديدة', country: 'اليمن', lat: 14.7978, lng: 42.9545, timezone: 3 },
  { name: 'المكلا (حضرموت)', country: 'اليمن', lat: 14.5425, lng: 49.1242, timezone: 3 },

  // دول المغرب العربي
  { name: 'طرابلس', country: 'ليبيا', lat: 32.8872, lng: 13.1913, timezone: 2 },
  { name: 'بنغازي', country: 'ليبيا', lat: 32.1166, lng: 20.0686, timezone: 2 },
  { name: 'مصراتة', country: 'ليبيا', lat: 32.3754, lng: 15.0925, timezone: 2 },
  { name: 'تونس العاصمة', country: 'تونس', lat: 36.8065, lng: 10.1815, timezone: 1 },
  { name: 'صفاقس', country: 'تونس', lat: 34.7406, lng: 10.7603, timezone: 1 },
  { name: 'سوسة', country: 'تونس', lat: 35.8256, lng: 10.6369, timezone: 1 },
  { name: 'الجزائر العاصمة', country: 'الجزائر', lat: 36.7538, lng: 3.0588, timezone: 1 },
  { name: 'وهران', country: 'الجزائر', lat: 35.6987, lng: -0.6349, timezone: 1 },
  { name: 'قسنطينة', country: 'الجزائر', lat: 36.3650, lng: 6.6147, timezone: 1 },
  { name: 'عنابة', country: 'الجزائر', lat: 36.9000, lng: 7.7667, timezone: 1 },
  { name: 'الرباط', country: 'المغرب', lat: 34.0209, lng: -6.8416, timezone: 1 },
  { name: 'الدار البيضاء', country: 'المغرب', lat: 33.5731, lng: -7.5898, timezone: 1 },
  { name: 'مراكش', country: 'المغرب', lat: 31.6295, lng: -7.9811, timezone: 1 },
  { name: 'فاس', country: 'المغرب', lat: 34.0333, lng: -5.0000, timezone: 1 },
  { name: 'طنجة', country: 'المغرب', lat: 35.7595, lng: -5.8340, timezone: 1 },
  { name: 'أغادير', country: 'المغرب', lat: 30.4278, lng: -9.5981, timezone: 1 },

  // جمهورية السودان
  { name: 'الخرطوم', country: 'السودان', lat: 15.5007, lng: 32.5599, timezone: 2 },
  { name: 'أم درمان', country: 'السودان', lat: 15.6506, lng: 32.4831, timezone: 2 },
  { name: 'بورتسودان', country: 'السودان', lat: 19.6175, lng: 37.2164, timezone: 2 },

  // عواصم ومدن عالمية
  { name: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784, timezone: 3 },
  { name: 'أنقرة', country: 'تركيا', lat: 39.9334, lng: 32.8597, timezone: 3 },
  { name: 'لندن', country: 'بريطانيا', lat: 51.5074, lng: -0.1278, timezone: 0 },
  { name: 'باريس', country: 'فرنسا', lat: 48.8566, lng: 2.3522, timezone: 1 },
  { name: 'برلين', country: 'ألمانيا', lat: 52.5200, lng: 13.4050, timezone: 1 },
  { name: 'نيويورك', country: 'أمريكا', lat: 40.7128, lng: -74.0060, timezone: -5 },
  { name: 'تورونتو', country: 'كندا', lat: 43.6532, lng: -79.3832, timezone: -5 },
];

// Kaaba Coordinates
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Calculate Qibla Direction (Bearing 0-360 from North)
export function calculateQibla(lat: number, lng: number): number {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LNG - lng);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qibla = toDeg(Math.atan2(y, x));
  return (qibla + 360) % 360;
}

function formatTime12(hours: number): string {
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m >= 60) {
    h += 1;
    m -= 60;
  }
  h = (h + 24) % 24;
  const period = h >= 12 ? 'م' : 'ص';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${h12}:${pad(m)} ${period}`;
}

function formatTime24(hours: number): string {
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m >= 60) {
    h += 1;
    m -= 60;
  }
  h = (h + 24) % 24;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:${pad(m)}`;
}

// Offline Astronomical Prayer calculation (Standard Muslim World League / Umm al-Qura standard)
// Automatically updates every day as the `date` parameter advances!
export function calculatePrayerTimes(city: CityLocation, date: Date = new Date()): {
  prayers: PrayerTimeData[];
  nextPrayer: { name: string; arabicName: string; time: string; remainingMinutes: number };
} {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Approximate Sun declination & Equation of Time based on day of year
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eqTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const declination = 23.45 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);

  const latRad = toRad(city.lat);
  const decRad = toRad(declination);

  // Solar Noon
  const solarNoon = 12 + city.timezone - city.lng / 15 - eqTime / 60;

  // Hour angles
  const sunAngle = (angle: number) => {
    const val =
      (Math.sin(toRad(-angle)) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    if (val > 1 || val < -1) return 0;
    return toDeg(Math.acos(val)) / 15;
  };

  const fajrAngle = 18.5; // Standard Fajr sun angle
  const ishaAngle = 18.0; // Standard Isha sun angle

  const fajrDiff = sunAngle(fajrAngle);
  const sunriseDiff = sunAngle(0.833);
  const sunsetDiff = sunriseDiff;
  const ishaDiff = sunAngle(ishaAngle);

  // Asr hour angle (Shafi'i: shadow = length + noon shadow)
  const asrAlt = toDeg(Math.atan(1 / (1 + Math.tan(Math.abs(latRad - decRad)))));
  const asrDiff =
    toDeg(
      Math.acos(
        Math.max(
          -1,
          Math.min(
            1,
            (Math.sin(toRad(asrAlt)) - Math.sin(latRad) * Math.sin(decRad)) /
              (Math.cos(latRad) * Math.cos(decRad))
          )
        )
      )
    ) / 15;

  const fajrTime = solarNoon - fajrDiff;
  const sunriseTime = solarNoon - sunriseDiff;
  const dhuhrTime = solarNoon + 0.05; // ~3 mins after noon
  const asrTime = solarNoon + asrDiff;
  const maghribTime = solarNoon + sunsetDiff + 0.05;
  const ishaTime = solarNoon + ishaDiff;

  const prayersList: PrayerTimeData[] = [
    { name: 'Fajr', arabicName: 'الفجر', time: formatTime12(fajrTime), rawTime24: formatTime24(fajrTime) },
    { name: 'Sunrise', arabicName: 'الشروق', time: formatTime12(sunriseTime), rawTime24: formatTime24(sunriseTime) },
    { name: 'Dhuhr', arabicName: 'الظهر', time: formatTime12(dhuhrTime), rawTime24: formatTime24(dhuhrTime) },
    { name: 'Asr', arabicName: 'العصر', time: formatTime12(asrTime), rawTime24: formatTime24(asrTime) },
    { name: 'Maghrib', arabicName: 'المغرب', time: formatTime12(maghribTime), rawTime24: formatTime24(maghribTime) },
    { name: 'Isha', arabicName: 'العشاء', time: formatTime12(ishaTime), rawTime24: formatTime24(ishaTime) },
  ];

  // Determine next prayer based on current time
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  let next = prayersList[0];
  let minDiff = 24 * 60;

  for (const p of prayersList) {
    const [h, m] = (p.rawTime24 || '00:00').split(':').map(Number);
    const pMinutes = h * 60 + m;
    let diff = pMinutes - currentMinutes;
    if (diff < 0) {
      diff += 24 * 60; // Next day
    }
    if (diff < minDiff && diff >= 0) {
      minDiff = diff;
      next = p;
    }
  }

  const formattedPrayers = prayersList.map((p) => ({
    ...p,
    isNext: p.name === next.name,
  }));

  return {
    prayers: formattedPrayers,
    nextPrayer: {
      name: next.name,
      arabicName: next.arabicName,
      time: next.time,
      remainingMinutes: minDiff,
    },
  };
}

// Convert Gregorian date to Hijri string (approximate offline calculation)
export function getHijriDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return '١٤٤٨ هـ';
  }
}
