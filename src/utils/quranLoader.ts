import { SurahData, Ayah } from '../types';
import { OFFLINE_SURAHS } from '../data/quranSurahs';
import { SURAH_INDEX } from '../data/quranIndex';

export interface PageEntry {
  type: 'surah_header' | 'bismillah' | 'ayah';
  surahNumber?: number;
  surahName?: string;
  revelationType?: string;
  numberOfAyahs?: number;
  numberInSurah?: number;
  text?: string;
  juz?: number;
}

export interface MushafPage {
  pageNumber: number;
  juz: number;
  surahs: string[];
  entries: PageEntry[];
}

let cachedSurahs: SurahData[] | null = null;
let cachedPages: Record<number, MushafPage> | null = null;
let surahFirstPageMap: Record<number, number> | null = null;

export async function fetchFullQuran(): Promise<SurahData[]> {
  if (cachedSurahs) return cachedSurahs;
  try {
    const res = await fetch('/quran.json');
    if (!res.ok) throw new Error('Failed to load quran.json');
    const data = await res.json();
    cachedSurahs = data.map((s: any) => ({
      number: s.number,
      name: s.name.replace(/^سُورَةُ\s+/, ''),
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation || '',
      numberOfAyahs: s.numberOfAyahs,
      revelationType: s.revelationType,
      juz: s.ayahs[0]?.juz || 1,
      page: s.ayahs[0]?.page || 1,
      bismillahPre: s.number !== 1 && s.number !== 9,
      ayahs: s.ayahs.map((a: any) => ({
        numberInSurah: a.numberInSurah,
        text: a.text,
        juz: a.juz,
        page: a.page,
        sajda: !!a.sajda,
      })),
    }));
    return cachedSurahs!;
  } catch (err) {
    console.warn('Falling back to local pre-bundled surahs:', err);
    return Object.values(OFFLINE_SURAHS);
  }
}

export async function fetchMushafPages(): Promise<Record<number, MushafPage>> {
  if (cachedPages) return cachedPages;
  try {
    const res = await fetch('/quran-pages.json');
    if (!res.ok) throw new Error('Failed to load quran-pages.json');
    cachedPages = await res.json();
    return cachedPages!;
  } catch (err) {
    console.warn('Failed to load quran-pages.json:', err);
    return {};
  }
}

export function getSurahStartPage(surahNumber: number): number {
  const meta = SURAH_INDEX.find((s) => s.number === surahNumber);
  if (meta && meta.page) return meta.page;
  return 1;
}
