export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  juz: number;
  page: number;
}

export interface Ayah {
  numberInSurah: number;
  text: string;
  juz?: number;
  page?: number;
  sajda?: boolean;
}

export interface SurahData extends SurahMeta {
  bismillahPre: boolean;
  ayahs: Ayah[];
}

export interface DhikrItem {
  id: string;
  text: string;
  repeat: number;
  virtue?: string; // فضل الذكر
  reference?: string; // المرجع أو التخريج (رواه البخاري، مسلم، إلخ)
  category: string;
}

export interface DuaCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: DhikrItem[];
}

export interface PrayerTimeData {
  name: string;
  arabicName: string;
  time: string; // 12-hour format e.g. "3:45 م"
  rawTime24?: string; // 24-hour format e.g. "15:45"
  isNext?: boolean;
}

export interface CityLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: number;
}

export interface Bookmark {
  id: string;
  type: 'surah' | 'ayah' | 'dua';
  title: string;
  subtitle?: string;
  targetId: string | number;
  secondaryId?: number; // e.g. ayah number
  createdAt: number;
}
