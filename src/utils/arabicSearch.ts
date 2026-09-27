/**
 * Normalizes Arabic text for flexible, diacritic-insensitive search.
 * Strips tashkeel (fatha, damma, kasra, sukun, shadda, tanween),
 * normalizes forms of Alef (أ, إ, آ -> ا), Taa Marbuta (ة -> ه), Yaa (ى -> ي).
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    // Normalize Alefs
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Yaa
    .replace(/ى/g, 'ي')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function searchArabicMatches(source: string, query: string): boolean {
  if (!query.trim()) return true;
  const normSource = normalizeArabic(source);
  const normQuery = normalizeArabic(query);
  return normSource.includes(normQuery);
}
