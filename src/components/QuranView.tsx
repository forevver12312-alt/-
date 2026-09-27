import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  MoveHorizontal,
  Columns2,
  FileText,
  Image as ImageIcon,
  Check,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  X,
  Sparkles,
  Users,
  Film,
  Music,
  Upload,
  UserCheck,
  Baby,
} from 'lucide-react';
import { SURAH_INDEX } from '../data/quranIndex';
import { searchArabicMatches } from '../utils/arabicSearch';
import { triggerHaptic } from '../utils/soundAndHaptics';
import {
  fetchFullQuran,
  fetchMushafPages,
  MushafPage,
  PageEntry,
  getSurahStartPage,
} from '../utils/quranLoader';

export interface ReciterInfo {
  id: string;
  name: string;
  style: string;
  subFolder: string;
  category: 'famous' | 'kids';
  badge: string;
}

export const RECITERS_LIST: ReciterInfo[] = [
  {
    id: 'husary',
    name: 'الشيخ محمود خليل الحصري',
    style: 'مرتل متقن مخارج الحروف والأحكام',
    subFolder: 'Husary_128kbps',
    category: 'famous',
    badge: 'الذهبي المتقن',
  },
  {
    id: 'dosari',
    name: 'الشيخ ياسر الدوسري',
    style: 'تلاوة حجازية نجدية خاشعة ومؤثرة',
    subFolder: 'Yasser_Ad-Dussary_128kbps',
    category: 'famous',
    badge: 'خاشع ومؤثر',
  },
  {
    id: 'muaiqly',
    name: 'الشيخ ماهر المعيقلي',
    style: 'إمام الحرم المكي الشريف بصوت هادئ',
    subFolder: 'MaherAlMuaiqly128kbps',
    category: 'famous',
    badge: 'الحرم المكي',
  },
  {
    id: 'afasy',
    name: 'الشيخ مشاري راشد العفاسي',
    style: 'صوت شجي وندي عذب النغمات',
    subFolder: 'Alafasy_128kbps',
    category: 'famous',
    badge: 'عذب وندي',
  },
  {
    id: 'abdulbasit',
    name: 'الشيخ عبد الباسط عبد الصمد',
    style: 'المصحف المرتل برواية حفص عن عاصم',
    subFolder: 'Abdul_Basit_Murattal_192kbps',
    category: 'famous',
    badge: 'صوت مكة',
  },
  {
    id: 'minshawi',
    name: 'الشيخ محمد صديق المنشاوي',
    style: 'صوت باكي رقيق يلامس القلوب',
    subFolder: 'Minshawy_Murattal_128kbps',
    category: 'famous',
    badge: 'الصوت الباكي',
  },
  {
    id: 'ghamdi',
    name: 'الشيخ سعد الغامدي',
    style: 'تلاوة عذبة وسلسة تريح النفس',
    subFolder: 'Ghamadi_40kbps',
    category: 'famous',
    badge: 'تلاوة هادئة',
  },
  {
    id: 'ajmi',
    name: 'الشيخ أحمد بن علي العجمي',
    style: 'نبرة حماسية وجزلة محبوبة',
    subFolder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    category: 'famous',
    badge: 'صوت مميز',
  },
  {
    id: 'minshawi_kids',
    name: 'المصحف المعلم للأطفال (المنشاوي وترديد الأطفال)',
    style: 'قراءة آية بآية مع ترديد جماعي لأطفال للتحفيظ',
    subFolder: 'Minshawy_Teacher_128kbps',
    category: 'kids',
    badge: 'تحفيظ أطفال 👶',
  },
  {
    id: 'husary_kids',
    name: 'المصحف المعلم للأطفال (الحصري وترديد الأطفال)',
    style: 'تعليم التجويد للأطفال خطوة بخطوة',
    subFolder: 'Hussary_Muallim_128kbps',
    category: 'kids',
    badge: 'تحفيظ أطفال 👶',
  },
];

interface QuranViewProps {
  fontSize: number;
  lastReadSurah: number | null;
  lastReadAyah: number | null;
  onSetLastRead: (surahNumber: number, ayahNumber: number) => void;
  initialSurahNumber?: number | null;
}

interface PlayingAyah {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  isPlaying: boolean;
}

interface CustomMediaTrack {
  url: string;
  fileName: string;
  isExtractedFromVideo: boolean;
  isPlaying: boolean;
}

export const QuranView: React.FC<QuranViewProps> = ({
  fontSize,
  lastReadSurah,
  lastReadAyah,
  onSetLastRead,
  initialSurahNumber,
}) => {
  // Mode: 'mushaf_pages' or 'surah_index'
  const [viewMode, setViewMode] = useState<'mushaf_pages' | 'surah_index'>('mushaf_pages');

  // Page Orientation: 'vertical' (single page) or 'horizontal' (two pages side-by-side / wide open mushaf)
  const [pageOrientation, setPageOrientation] = useState<'vertical' | 'horizontal'>('vertical');

  // Render Type: 'printed' (exact King Fahd 15-line Medina Mushaf layout) or 'text' (interactive justified vector text)
  const [displayType, setDisplayType] = useState<'printed' | 'text'>('text');

  // Current page in the Mushaf (1 to 604)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const savedPage = localStorage.getItem('nur_last_read_page');
      if (savedPage) return Number(savedPage);
    } catch {
      // Ignore
    }
    if (initialSurahNumber) return getSurahStartPage(initialSurahNumber);
    return 1;
  });

  const [pagesData, setPagesData] = useState<Record<number, MushafPage>>({});
  const [loadingPages, setLoadingPages] = useState(true);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJuz, setFilterJuz] = useState<number | 'all'>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [pageTurnAnim, setPageTurnAnim] = useState<'next' | 'prev' | null>(null);

  // Selected Reciter (الشيخ الحصري، ياسر الدوسري، ماهر المعيقلي، أطفال، إلخ)
  const [selectedReciterId, setSelectedReciterId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nur_selected_reciter');
      if (saved && RECITERS_LIST.some((r) => r.id === saved)) return saved;
    } catch {
      // Ignore
    }
    return 'husary';
  });

  // Modal Dialogs
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);

  // Recitation Audio State
  const [currentRecitation, setCurrentRecitation] = useState<PlayingAyah | null>(null);
  const [isSidePlayerOpen, setIsSidePlayerOpen] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedAyahAction, setSelectedAyahAction] = useState<PageEntry | null>(null);

  // Custom Device Audio / Video Track State
  const [customMedia, setCustomMedia] = useState<CustomMediaTrack | null>(null);
  const [customMediaTime, setCustomMediaTime] = useState<{ current: number; duration: number }>({
    current: 0,
    duration: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const customMediaAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentReciter = useMemo(() => {
    return RECITERS_LIST.find((r) => r.id === selectedReciterId) || RECITERS_LIST[0];
  }, [selectedReciterId]);

  // Load pages data on mount
  useEffect(() => {
    let isMounted = true;
    fetchMushafPages().then((data) => {
      if (isMounted) {
        setPagesData(data);
        setLoadingPages(false);
      }
    });
    fetchFullQuran();
    return () => {
      isMounted = false;
    };
  }, []);

  // Jump to surah start page if initialSurahNumber changes
  useEffect(() => {
    if (initialSurahNumber) {
      const targetPage = getSurahStartPage(initialSurahNumber);
      setCurrentPage(targetPage);
      setViewMode('mushaf_pages');
    }
  }, [initialSurahNumber]);

  // Persist current page & reciter
  useEffect(() => {
    try {
      localStorage.setItem('nur_last_read_page', currentPage.toString());
    } catch {
      // Ignore
    }
  }, [currentPage]);

  useEffect(() => {
    try {
      localStorage.setItem('nur_selected_reciter', selectedReciterId);
    } catch {
      // Ignore
    }
  }, [selectedReciterId]);

  // Stop audio when unmounting
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (customMediaAudioRef.current) {
        customMediaAudioRef.current.pause();
        customMediaAudioRef.current = null;
      }
    };
  }, []);

  // Find which page an Ayah is located on
  const findAyahPage = (surahNum: number, ayahNum: number): number | null => {
    for (const [pNum, page] of Object.entries(pagesData)) {
      const hasAyah = page.entries.some(
        (e) => e.type === 'ayah' && e.surahNumber === surahNum && e.numberInSurah === ayahNum
      );
      if (hasAyah) return Number(pNum);
    }
    return null;
  };

  /**
   * Play specific Ayah with the selected Sheikh / Qari (الحصري، ياسر الدوسري، المعيقلي، أطفال، إلخ)
   */
  const playAyahRecitation = (surahNumber: number, ayahNumber: number, surahName?: string) => {
    // If custom media is playing, pause it first
    if (customMediaAudioRef.current) {
      customMediaAudioRef.current.pause();
      setCustomMedia((prev) => (prev ? { ...prev, isPlaying: false } : null));
    }

    const pad3 = (n: number) => n.toString().padStart(3, '0');
    const url = `https://everyayah.com/data/${currentReciter.subFolder}/${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
    const sName = surahName || SURAH_INDEX.find((s) => s.number === surahNumber)?.name || '';

    setAudioLoading(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = url;
    audio.crossOrigin = 'anonymous';

    audio
      .play()
      .then(() => {
        setAudioLoading(false);
        setCurrentRecitation({
          surahNumber,
          ayahNumber,
          surahName: sName,
          isPlaying: true,
        });
      })
      .catch((err) => {
        setAudioLoading(false);
        console.warn('Audio playback error:', err);
      });

    // Check if the reciting Ayah is on another page, and automatically flip the page if needed
    const targetPage = findAyahPage(surahNumber, ayahNumber);
    if (targetPage && targetPage !== currentPage) {
      if (pageOrientation === 'horizontal') {
        if (targetPage !== currentPage && targetPage !== currentPage + 1) {
          setCurrentPage(targetPage % 2 === 0 ? targetPage - 1 : targetPage);
        }
      } else {
        setCurrentPage(targetPage);
      }
    }

    // When the Ayah audio finishes, advance to the next Ayah automatically!
    audio.onended = () => {
      handleNextAyah(surahNumber, ayahNumber);
    };
  };

  /**
   * Advance to Next Ayah
   */
  const handleNextAyah = (currentSurah?: number, currentAyah?: number) => {
    const sNum = currentSurah ?? currentRecitation?.surahNumber ?? 1;
    const aNum = currentAyah ?? currentRecitation?.ayahNumber ?? 1;

    const surahMeta = SURAH_INDEX.find((s) => s.number === sNum);
    const totalInSurah = surahMeta?.numberOfAyahs || 7;

    if (aNum < totalInSurah) {
      playAyahRecitation(sNum, aNum + 1, surahMeta?.name);
    } else if (sNum < 114) {
      const nextSurahMeta = SURAH_INDEX.find((s) => s.number === sNum + 1);
      playAyahRecitation(sNum + 1, 1, nextSurahMeta?.name);
    } else {
      // Reached the end of the Quran
      setCurrentRecitation(null);
    }
  };

  /**
   * Go back to Previous Ayah
   */
  const handlePrevAyah = () => {
    if (!currentRecitation) return;
    const { surahNumber, ayahNumber } = currentRecitation;

    if (ayahNumber > 1) {
      playAyahRecitation(surahNumber, ayahNumber - 1, currentRecitation.surahName);
    } else if (surahNumber > 1) {
      const prevSurahMeta = SURAH_INDEX.find((s) => s.number === surahNumber - 1);
      const totalInPrev = prevSurahMeta?.numberOfAyahs || 7;
      playAyahRecitation(surahNumber - 1, totalInPrev, prevSurahMeta?.name);
    }
  };

  /**
   * Play / Pause Toggle for Reciter
   */
  const togglePlayPause = () => {
    if (!audioRef.current) {
      startRecitationFromCurrentPage();
      return;
    }

    if (currentRecitation?.isPlaying) {
      audioRef.current.pause();
      setCurrentRecitation((prev) => (prev ? { ...prev, isPlaying: false } : null));
    } else {
      if (currentRecitation) {
        audioRef.current.play();
        setCurrentRecitation((prev) => (prev ? { ...prev, isPlaying: true } : null));
      } else {
        startRecitationFromCurrentPage();
      }
    }
    triggerHaptic(20);
  };

  /**
   * Stop Recitation
   */
  const stopRecitation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentRecitation(null);
    triggerHaptic(20);
  };

  /**
   * Start recitation from the first Ayah visible on the current page
   */
  const startRecitationFromCurrentPage = () => {
    const pData = pagesData[currentPage];
    if (pData) {
      const firstAyah = pData.entries.find((e) => e.type === 'ayah' && e.surahNumber && e.numberInSurah);
      if (firstAyah && firstAyah.surahNumber && firstAyah.numberInSurah) {
        playAyahRecitation(firstAyah.surahNumber, firstAyah.numberInSurah, firstAyah.surahName);
        return;
      }
    }
    const surahOnPage = SURAH_INDEX.find((s) => s.page === currentPage) || SURAH_INDEX[0];
    playAyahRecitation(surahOnPage.number, 1, surahOnPage.name);
  };

  /**
   * Long-Press Detection on Ayah:
   * Starts chosen Sheikh recitation directly from the pressed Ayah
   */
  const handleAyahTouchStart = (ayahEntry: PageEntry) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      triggerHaptic(60);
      if (ayahEntry.surahNumber && ayahEntry.numberInSurah) {
        playAyahRecitation(ayahEntry.surahNumber, ayahEntry.numberInSurah, ayahEntry.surahName);
        setCopiedText(`بدء تلاوة ${currentReciter.name} من سورة ${ayahEntry.surahName}: آية ${ayahEntry.numberInSurah}`);
        setTimeout(() => setCopiedText(null), 3000);
      }
    }, 450);
  };

  const handleAyahTouchEnd = (ayahEntry: PageEntry) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleAyahClick = (ayahEntry: PageEntry) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    setSelectedAyahAction(ayahEntry);
    triggerHaptic(15);
  };

  // ================= DEVICE AUDIO / VIDEO EXTRACTION HANDLERS =================
  /**
   * 1. Import Audio File from Device (MP3, M4A, WAV, etc.)
   */
  const handleDeviceAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop online reciter if playing
    stopRecitation();

    const fileUrl = URL.createObjectURL(file);
    const mediaTrack: CustomMediaTrack = {
      url: fileUrl,
      fileName: file.name,
      isExtractedFromVideo: false,
      isPlaying: true,
    };

    setCustomMedia(mediaTrack);
    setShowMediaUploadModal(false);
    playCustomMedia(mediaTrack);

    setCopiedText(`تم تحميل الصوت من جهازك: ${file.name}`);
    setTimeout(() => setCopiedText(null), 3500);
  };

  /**
   * 2. Extract Audio from Video File on Device (MP4, MOV, WEBM, MKV, etc.)
   * In modern HTML5, audio elements decode video soundtrack natively with 0 lag!
   */
  const handleDeviceVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop online reciter if playing
    stopRecitation();

    const fileUrl = URL.createObjectURL(file);
    const mediaTrack: CustomMediaTrack = {
      url: fileUrl,
      fileName: file.name,
      isExtractedFromVideo: true,
      isPlaying: true,
    };

    setCustomMedia(mediaTrack);
    setShowMediaUploadModal(false);
    playCustomMedia(mediaTrack);

    setCopiedText(`تم استخراج الصوت من الفيديو بنجاح: ${file.name}`);
    setTimeout(() => setCopiedText(null), 4000);
  };

  const playCustomMedia = (track: CustomMediaTrack) => {
    if (!customMediaAudioRef.current) {
      customMediaAudioRef.current = new Audio();
    }
    const audio = customMediaAudioRef.current;
    audio.src = track.url;
    audio.play().then(() => {
      setCustomMedia((prev) => (prev ? { ...prev, isPlaying: true } : null));
    });

    audio.ontimeupdate = () => {
      setCustomMediaTime({
        current: audio.currentTime,
        duration: audio.duration || 0,
      });
    };

    audio.onended = () => {
      setCustomMedia((prev) => (prev ? { ...prev, isPlaying: false } : null));
    };
  };

  const toggleCustomMediaPlayPause = () => {
    if (!customMediaAudioRef.current) return;
    if (customMedia?.isPlaying) {
      customMediaAudioRef.current.pause();
      setCustomMedia((prev) => (prev ? { ...prev, isPlaying: false } : null));
    } else {
      customMediaAudioRef.current.play();
      setCustomMedia((prev) => (prev ? { ...prev, isPlaying: true } : null));
    }
  };

  const stopCustomMedia = () => {
    if (customMediaAudioRef.current) {
      customMediaAudioRef.current.pause();
      customMediaAudioRef.current.currentTime = 0;
    }
    setCustomMedia(null);
  };

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // In horizontal two-page spread, advance by 2 pages (or 1 in vertical)
  const goToNextPage = () => {
    const step = pageOrientation === 'horizontal' ? 2 : 1;
    if (currentPage < 604) {
      setPageTurnAnim('next');
      setCurrentPage((p) => Math.min(604, p + step));
      triggerHaptic(20);
      pageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setPageTurnAnim(null), 300);
    }
  };

  const goToPrevPage = () => {
    const step = pageOrientation === 'horizontal' ? 2 : 1;
    if (currentPage > 1) {
      setPageTurnAnim('prev');
      setCurrentPage((p) => Math.max(1, p - step));
      triggerHaptic(20);
      pageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setPageTurnAnim(null), 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'mushaf_pages') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (customMedia) {
          toggleCustomMediaPlayPause();
        } else {
          togglePlayPause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentPage, pageOrientation, currentRecitation, customMedia]);

  // Touch Swipe Gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleJumpToPage = (pageNum: number) => {
    const p = Math.max(1, Math.min(604, pageNum));
    setCurrentPage(p);
    setShowJumpModal(false);
    setViewMode('mushaf_pages');
    triggerHaptic(20);
    pageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSurahFromIndex = (surahNumber: number) => {
    const startPage = getSurahStartPage(surahNumber);
    setCurrentPage(startPage);
    setViewMode('mushaf_pages');
    triggerHaptic(20);
    pageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyAyah = (ayahText: string, surahName: string, numInSurah: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const formatted = `﴿${ayahText}﴾ [سورة ${surahName}: ${numInSurah}]`;
      navigator.clipboard.writeText(formatted);
      setCopiedText(formatted);
      triggerHaptic(15);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const filteredSurahs = useMemo(() => {
    return SURAH_INDEX.filter((surah) => {
      const matchesSearch =
        !searchQuery.trim() ||
        searchArabicMatches(surah.name, searchQuery) ||
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.number.toString() === searchQuery.trim();

      const matchesJuz = filterJuz === 'all' || surah.juz === filterJuz;

      return matchesSearch && matchesJuz;
    });
  }, [searchQuery, filterJuz]);

  const rightPageNum = currentPage;
  const leftPageNum = Math.min(604, currentPage + 1);

  const getPageData = (pNum: number) => pagesData[pNum];

  const getHeaderSurahName = (pNum: number) => {
    const pData = getPageData(pNum);
    if (pData && pData.surahs.length > 0) return pData.surahs.join(' و ');
    const meta = SURAH_INDEX.find((s) => s.page === pNum);
    return meta ? meta.name : '';
  };

  /**
   * Single Mushaf Page Renderer
   */
  const renderSinglePage = (pageNum: number, isRightOfSpread = false, isLeftOfSpread = false) => {
    const pData = getPageData(pageNum);
    const surahName = getHeaderSurahName(pageNum);
    const juzNum = pData?.juz || 1;
    const hasImageError = imageErrorMap[pageNum];
    const shouldUseImage = displayType === 'printed' && !hasImageError;
    const pageImageUrl = `https://everyayah.com/data/quranpngs/${pageNum}.png`;

    return (
      <div
        key={`page-${pageNum}`}
        className={`relative bg-[#fffdf7] dark:bg-[#0c1f1c] rounded-3xl shadow-xl border-4 border-emerald-800/20 dark:border-emerald-700/30 p-3 sm:p-6 min-h-[580px] sm:min-h-[640px] flex flex-col justify-between overflow-hidden transition-all duration-200 ${
          isRightOfSpread ? 'border-l-2 sm:rounded-l-none' : ''
        } ${isLeftOfSpread ? 'border-r-2 sm:rounded-r-none' : ''}`}
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.02) 0%, transparent 80%)',
        }}
      >
        {/* Double Gold Ornamental Frame */}
        <div className="absolute inset-1.5 sm:inset-2.5 border border-amber-600/30 dark:border-amber-500/20 rounded-2xl pointer-events-none" />
        <div className="absolute inset-2.5 sm:inset-3.5 border border-dashed border-emerald-600/20 dark:border-emerald-500/15 rounded-[14px] pointer-events-none" />

        {/* Page Top Header Bar */}
        <div className="relative z-10 border-b border-amber-600/30 dark:border-amber-500/20 pb-2 mb-3 flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>الجزء {juzNum}</span>
          </div>

          <div className="text-center font-quran text-sm sm:text-base text-amber-700 dark:text-amber-400">
            {surahName ? `سورة ${surahName}` : ''}
          </div>

          <div className="flex items-center gap-1">
            <span>الحزب {Math.floor((juzNum - 1) * 2) + 1}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>
        </div>

        {/* Page Content Body */}
        <div className="relative z-10 flex-1 flex flex-col justify-center my-auto py-1">
          {shouldUseImage ? (
            /* EXACT PRINTED MEDINA MUSHAF PAGE */
            <div className="w-full flex items-center justify-center relative min-h-[460px]">
              <img
                src={pageImageUrl}
                alt={`مصحف المدينة صفحة ${pageNum}`}
                loading="eager"
                onError={() => {
                  setImageErrorMap((prev) => ({ ...prev, [pageNum]: true }));
                }}
                className="max-h-[720px] w-auto max-w-full object-contain filter contrast-[1.05] brightness-[0.98] dark:invert dark:contrast-125 dark:brightness-90 select-none rounded-lg"
              />
            </div>
          ) : (
            /* TEXT VECTOR ENGINE (تحديد الآية التي يقرأها القارئ باللون الذهبي المشع) */
            <div className="space-y-3.5 text-justify select-text">
              {pData ? (
                <>
                  {pData.entries.map((entry: PageEntry, index: number) => {
                    if (entry.type === 'surah_header') {
                      return (
                        <div
                          key={`hdr-${index}`}
                          className="my-3 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-amber-200 text-center border-2 border-amber-500/40 shadow-sm"
                        >
                          <h3 className="font-quran text-base sm:text-lg font-bold tracking-wide">
                            {entry.surahName}
                          </h3>
                          <p className="text-[10px] text-emerald-200/80">
                            {entry.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {entry.numberOfAyahs} آيات
                          </p>
                        </div>
                      );
                    }

                    if (entry.type === 'bismillah') {
                      return (
                        <div key={`bsm-${index}`} className="my-2.5 text-center">
                          <p className="font-quran text-base sm:text-lg text-amber-700 dark:text-amber-300 font-bold select-none">
                            {entry.text}
                          </p>
                        </div>
                      );
                    }

                    return null;
                  })}

                  <p
                    className="font-quran text-gray-900 dark:text-gray-100 leading-[2.5] sm:leading-[2.7] text-justify antialiased"
                    style={{ fontSize: `${Math.max(16, fontSize + (pageOrientation === 'horizontal' ? 0 : 2))}px` }}
                  >
                    {pData.entries
                      .filter((e) => e.type === 'ayah')
                      .map((ayahEntry, idx) => {
                        const isCurrentReciting =
                          currentRecitation &&
                          currentRecitation.surahNumber === ayahEntry.surahNumber &&
                          currentRecitation.ayahNumber === ayahEntry.numberInSurah;

                        return (
                          <span
                            key={`ayah-${idx}`}
                            onClick={() => handleAyahClick(ayahEntry)}
                            onTouchStart={() => handleAyahTouchStart(ayahEntry)}
                            onTouchEnd={() => handleAyahTouchEnd(ayahEntry)}
                            onMouseDown={() => handleAyahTouchStart(ayahEntry)}
                            onMouseUp={() => handleAyahTouchEnd(ayahEntry)}
                            className={`inline cursor-pointer rounded-lg transition-all duration-300 px-1 py-0.5 ${
                              isCurrentReciting
                                ? 'bg-amber-300/90 dark:bg-amber-500/30 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500 font-bold shadow-md scale-[1.02] inline-block'
                                : 'hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 text-gray-900 dark:text-gray-100'
                            }`}
                            title={`سورة ${ayahEntry.surahName}: آية ${ayahEntry.numberInSurah} (اضغط مطولاً لبدء تلاوة ${currentReciter.name})`}
                          >
                            {ayahEntry.text}{' '}
                            <span
                              className={`inline-flex items-center justify-center font-bold mx-0.5 text-[0.82em] select-none ${
                                isCurrentReciting
                                  ? 'text-amber-700 dark:text-amber-300 font-extrabold scale-110'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              ۝{ayahEntry.numberInSurah}
                            </span>{' '}
                          </span>
                        );
                      })}
                  </p>
                </>
              ) : (
                <div className="py-20 text-center text-gray-400">
                  <p>جارٍ تحميل الصفحة {pageNum}...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Footer (Page Number Medallion) */}
        <div className="relative z-10 border-t border-amber-600/30 dark:border-amber-500/20 pt-2 mt-3 text-center">
          <div className="inline-flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-800/10 dark:bg-emerald-800/30 border border-amber-500/40 items-center justify-center font-bold text-amber-700 dark:text-amber-300 font-quran text-xs sm:text-sm shadow-inner">
            {pageNum}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-28 select-none relative">
      {/* Hidden file inputs for audio & video extraction from device */}
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleDeviceAudioUpload}
      />
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleDeviceVideoUpload}
      />

      {/* ================= TOP CONTROLS & SWITCHERS BAR ================= */}
      <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-2.5 sm:p-3 shadow-sm border border-emerald-100 dark:border-emerald-950/80 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Main View Mode (Mushaf Pages vs Index) */}
          <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('mushaf_pages')}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'mushaf_pages'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>المصحف ({currentPage}/604)</span>
            </button>

            <button
              onClick={() => setViewMode('surah_index')}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'surah_index'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>فهرس السور (114)</span>
            </button>
          </div>

          {/* Quick Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Reciter Selector Trigger Button */}
            <button
              onClick={() => setShowReciterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              title="تغيير القارئ (ياسر الدوسري، المعيقلي، الحصري، أطفال...)"
            >
              <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="truncate max-w-[130px] sm:max-w-[160px]">{currentReciter.name}</span>
            </button>

            {/* Custom Audio/Video Upload Trigger Button */}
            <button
              onClick={() => setShowMediaUploadModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900 text-xs font-bold transition cursor-pointer"
              title="استيراد صوت أو استخراج صوت من فيديو بهاتفك"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>صوت/فيديو</span>
            </button>

            {/* Vertical / Horizontal (Two-page Spread) Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-emerald-950/60 p-1 rounded-xl border border-gray-200 dark:border-emerald-900/60">
              <button
                onClick={() => {
                  setPageOrientation('vertical');
                  triggerHaptic(15);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  pageOrientation === 'vertical'
                    ? 'bg-white dark:bg-emerald-700 text-emerald-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                title="عرض صفحة واحدة عمودية"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>عمودي</span>
              </button>

              <button
                onClick={() => {
                  setPageOrientation('horizontal');
                  triggerHaptic(15);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  pageOrientation === 'horizontal'
                    ? 'bg-white dark:bg-emerald-700 text-emerald-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                title="عرض أفقي (صفحتان متقابلتان كالمصحف المفتوح)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>أفقي</span>
              </button>
            </div>

            {/* Printed Medina Image vs Text Toggle */}
            <button
              onClick={() => {
                setDisplayType(displayType === 'printed' ? 'text' : 'printed');
                triggerHaptic(15);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-emerald-950/60 hover:bg-gray-200 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-950 text-xs font-bold transition cursor-pointer"
              title="التبديل بين مصحف المدينة المصور والنصي"
            >
              {displayType === 'printed' ? <ImageIcon className="w-3.5 h-3.5 text-amber-600" /> : <FileText className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="hidden sm:inline">{displayType === 'printed' ? 'ورقي' : 'نصي'}</span>
            </button>

            {/* Quick Page Jump & Bookmark */}
            <button
              onClick={() => setShowJumpModal(true)}
              className="p-1.5 rounded-xl bg-gray-100 dark:bg-emerald-950/60 hover:bg-emerald-100 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-200 dark:border-emerald-950 transition cursor-pointer"
              title="انتقال سريع"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const pData = getPageData(currentPage);
                if (pData && pData.entries.length > 0) {
                  const firstAyah = pData.entries.find((e) => e.type === 'ayah');
                  if (firstAyah && firstAyah.surahNumber) {
                    onSetLastRead(firstAyah.surahNumber, firstAyah.numberInSurah || 1);
                  }
                }
                triggerHaptic(25);
              }}
              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer"
              title="حفظ موضع القراءة"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== VIEW 1: MUSHAF PAGES MODE ===================== */}
      {viewMode === 'mushaf_pages' && (
        <div className="space-y-4">
          {/* Top Page Info Bar */}
          <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-2.5 px-4 shadow-xs border border-emerald-100 dark:border-emerald-950/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
              {pageOrientation === 'horizontal' ? (
                <>
                  <span>صفحتا {rightPageNum} و {leftPageNum} من 604</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    الجزء {getPageData(rightPageNum)?.juz || 1}
                  </span>
                </>
              ) : (
                <>
                  <span>صفحة {currentPage} من 604</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    الجزء {getPageData(currentPage)?.juz || 1}
                  </span>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                القارئ الحالي: <strong className="text-emerald-700 dark:text-emerald-400">{currentReciter.name}</strong> • اضغط مطولاً على أي آية لبدء التلاوة منها
              </span>
            </div>

            <button
              onClick={() => setShowJumpModal(true)}
              className="px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              انتقال لصفحة
            </button>
          </div>

          {/* ================= THE MUSHAF CONTAINER ================= */}
          <div
            ref={pageContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`transition-opacity duration-200 ${
              pageTurnAnim ? 'opacity-70 scale-[0.99]' : 'opacity-100 scale-100'
            }`}
          >
            {pageOrientation === 'horizontal' ? (
              /* HORIZONTAL TWO-PAGE SPREAD */
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-0 bg-amber-900/10 p-1 md:p-3 rounded-3xl border-4 border-amber-800/30 shadow-2xl">
                <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/15 via-black/35 to-black/15 z-20 pointer-events-none rounded-sm" />
                <div className="relative">
                  {renderSinglePage(rightPageNum, true, false)}
                </div>
                <div className="relative">
                  {leftPageNum <= 604 && renderSinglePage(leftPageNum, false, true)}
                </div>
              </div>
            ) : (
              /* VERTICAL SINGLE PAGE MODE */
              <div>{renderSinglePage(currentPage)}</div>
            )}
          </div>

          {/* ================= PROMINENT BOTTOM CONTROLS ================= */}
          <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-3 shadow-lg border-2 border-emerald-500/30 flex items-center justify-between gap-3">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer ${
                currentPage <= 1
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-emerald-950/20 text-gray-400'
                  : 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white active:scale-95'
              }`}
            >
              <ChevronRight className="w-5 h-5 text-amber-300" />
              <span>
                {pageOrientation === 'horizontal' ? 'الصفحتان السابقتان' : 'الصفحة السابقة'}
              </span>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowJumpModal(true)}
                className="px-3.5 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="انتقال برقم الصفحة أو الجزء"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                <span>
                  {pageOrientation === 'horizontal'
                    ? `صفحة ${rightPageNum} - ${leftPageNum}`
                    : `صفحة ${currentPage}`}
                </span>
              </button>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= 604}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer ${
                currentPage >= 604
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-emerald-950/20 text-gray-400'
                  : 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white active:scale-95'
              }`}
            >
              <span>
                {pageOrientation === 'horizontal' ? 'الصفحتان التاليتان' : 'الصفحة التالية'}
              </span>
              <ChevronLeft className="w-5 h-5 text-amber-300" />
            </button>
          </div>

          {/* Swipe helper on mobile */}
          <div className="text-center text-[11px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 py-1">
            <MoveHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span>اضغط مطولاً على أي آية للبدء بصوت {currentReciter.name}، أو اسحب بإصبعك لتقليب الصفحات</span>
          </div>

          {/* Toast Notification */}
          {copiedText && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-amber-400" />
              <span>{copiedText}</span>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. CUSTOM DEVICE AUDIO / EXTRACTED VIDEO PLAYER BAR ================= */}
      {customMedia && (
        <div className="fixed left-3 right-3 sm:left-auto sm:right-6 bottom-24 sm:bottom-28 z-40 max-w-sm w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              {customMedia.isExtractedFromVideo ? (
                <Film className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Music className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div className="truncate">
                <span className="text-[10px] text-amber-300 font-bold block">
                  {customMedia.isExtractedFromVideo ? 'صوت مستخرج من فيديو:' : 'ملف صوتي من جهازك:'}
                </span>
                <p className="text-xs font-bold truncate text-white">{customMedia.fileName}</p>
              </div>
            </div>

            <button
              onClick={stopCustomMedia}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
              title="إغلاق الصوت"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Play Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={toggleCustomMediaPlayPause}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {customMedia.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{customMedia.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
            </button>

            <span className="text-[11px] font-mono text-emerald-200">
              {formatAudioTime(customMediaTime.current)} / {formatAudioTime(customMediaTime.duration)}
            </span>
          </div>
        </div>
      )}

      {/* ================= 3. FLOATING SIDE RECITATION CONTROLS (زرار القارئ في الجنب) ================= */}
      {viewMode === 'mushaf_pages' && !customMedia && (
        <div className="fixed right-3 sm:right-6 bottom-24 sm:bottom-8 z-40 flex flex-col items-end gap-2">
          {/* Expanded Recitation Dock */}
          {isSidePlayerOpen ? (
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border-2 border-amber-400/80 max-w-[320px] sm:max-w-xs w-full animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-sm">
                    {currentReciter.category === 'kids' ? '👶' : '🎙️'}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-amber-200">{currentReciter.name}</h5>
                    <p className="text-[10px] text-emerald-300">{currentReciter.style}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowReciterModal(true)}
                    className="p-1 rounded-lg hover:bg-white/10 text-amber-300"
                    title="تغيير القارئ"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsSidePlayerOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 cursor-pointer"
                    title="تصغير المشغل"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Active Ayah Indicator */}
              <div className="p-2 rounded-xl bg-black/25 border border-emerald-700/50 mb-3 text-center">
                {currentRecitation ? (
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-amber-300 font-bold block">
                      {currentRecitation.isPlaying ? 'يتلو الآن:' : 'متوقف مؤقتاً عند:'}
                    </span>
                    <h6 className="font-quran text-sm font-bold text-white">
                      سورة {currentRecitation.surahName} - الآية {currentRecitation.ayahNumber}
                    </h6>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-200">
                    انقر تشغيل أو اضغط مطولاً على أي آية للبدء منها
                  </p>
                )}
              </div>

              {/* Player Control Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handlePrevAyah}
                  disabled={!currentRecitation}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition cursor-pointer"
                  title="الآية السابقة"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  {audioLoading ? (
                    <span>جارٍ التحميل...</span>
                  ) : currentRecitation?.isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{currentRecitation ? 'متابعة' : 'بدء التلاوة'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleNextAyah()}
                  disabled={!currentRecitation}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition cursor-pointer"
                  title="الآية التالية"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {currentRecitation && (
                  <button
                    onClick={stopRecitation}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition cursor-pointer"
                    title="إنهاء التلاوة"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>

              {/* Quick links to change reciter or upload */}
              <div className="mt-2.5 pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => setShowReciterModal(true)}
                  className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3 h-3" />
                  <span>تغيير القارئ</span>
                </button>

                <button
                  onClick={() => setShowMediaUploadModal(true)}
                  className="text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>صوت/فيديو من الهاتف</span>
                </button>
              </div>
            </div>
          ) : (
            /* Minimized Side Button */
            <button
              onClick={() => setIsSidePlayerOpen(true)}
              className={`p-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs transition-all cursor-pointer border-2 active:scale-95 ${
                currentRecitation?.isPlaying
                  ? 'bg-amber-500 text-slate-950 border-white ring-4 ring-amber-400/40 animate-pulse'
                  : 'bg-emerald-900 text-white border-amber-400 hover:bg-emerald-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {currentReciter.category === 'kids' ? '👶' : '🎙️'}
              </div>
              <span className="hidden sm:inline">{currentReciter.name.split(' ')[1] || currentReciter.name}</span>
              {currentRecitation?.isPlaying && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          )}
        </div>
      )}

      {/* ================= 4. RECITERS SELECTION MODAL (قائمة الشيوخ الكبار وقراءة الأطفال) ================= */}
      {showReciterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1f1c] rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-emerald-600/40 text-right space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-950 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  اختر قارئ القرآن الكريم
                </h3>
              </div>
              <button
                onClick={() => setShowReciterModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              تلاوات مرتلة عالية الدقة آية بآية مع تظليل الآية المقروءة والانتقال التلقائي:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {RECITERS_LIST.map((reciter) => {
                const isSelected = selectedReciterId === reciter.id;
                return (
                  <div
                    key={reciter.id}
                    onClick={() => {
                      setSelectedReciterId(reciter.id);
                      setShowReciterModal(false);
                      triggerHaptic(20);
                      // If currently playing, restart with new reciter
                      if (currentRecitation) {
                        playAyahRecitation(
                          currentRecitation.surahNumber,
                          currentRecitation.ayahNumber,
                          currentRecitation.surahName
                        );
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-gray-50 dark:bg-[#071311] border-gray-200 dark:border-emerald-950 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {reciter.category === 'kids' ? '👶' : '🎙️'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                            {reciter.name}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                            {reciter.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {reciter.style}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowReciterModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-emerald-950 text-gray-700 dark:text-gray-300 font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. DEVICE AUDIO & VIDEO EXTRACTION MODAL ================= */}
      {showMediaUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1f1c] rounded-3xl p-6 shadow-2xl border-2 border-emerald-600/40 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-950 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  صوت من الهاتف أو استخراج من فيديو
                </h3>
              </div>
              <button
                onClick={() => setShowMediaUploadModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              يمكنك تشغيل أي تلاوة أو تسجيل من هاتفك للاستماع إليها وأنت تتصفح المصحف الشريف:
            </p>

            <div className="space-y-3">
              {/* Option 1: Pick Audio File */}
              <div
                onClick={() => audioFileInputRef.current?.click()}
                className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer flex items-center gap-3.5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    استيراد ملف صوتي من هاتفك
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    يدعم جميع صيغ الصوت (MP3, M4A, WAV, AAC, OGG)
                  </p>
                </div>
              </div>

              {/* Option 2: Extract Audio from Video File */}
              <div
                onClick={() => videoFileInputRef.current?.click()}
                className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-dashed border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition cursor-pointer flex items-center gap-3.5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300">
                    استخراج الصوت من فيديو في هاتفك
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    اختر أي فيديو (MP4, MOV, MKV, WebM) وسيتم استخراج صوته فوراً
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#071311] rounded-xl text-[11px] text-gray-500 dark:text-gray-400">
              ⚡ يتم التشغيل والاستخراج محلياً على جهازك 100% بدون الحاجة لإنترنت أو رفع الملفات لأي سيرفر.
            </div>

            <button
              onClick={() => setShowMediaUploadModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-emerald-950 text-gray-700 dark:text-gray-300 font-bold text-xs"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ================= 6. AYAH QUICK ACTION MODAL (CLICK POPUP) ================= */}
      {selectedAyahAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1f1c] rounded-3xl p-5 shadow-2xl border border-emerald-600/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-xl">
              📖
            </div>

            <div>
              <h4 className="font-bold text-base font-quran text-gray-900 dark:text-white">
                سورة {selectedAyahAction.surahName} - الآية {selectedAyahAction.numberInSurah}
              </h4>
              <p className="text-xs font-quran text-gray-600 dark:text-gray-300 mt-2 p-3 bg-gray-50 dark:bg-[#071311] rounded-xl border border-gray-200 dark:border-emerald-950 max-h-28 overflow-y-auto leading-relaxed">
                ﴿{selectedAyahAction.text}﴾
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  if (selectedAyahAction.surahNumber && selectedAyahAction.numberInSurah) {
                    playAyahRecitation(
                      selectedAyahAction.surahNumber,
                      selectedAyahAction.numberInSurah,
                      selectedAyahAction.surahName
                    );
                    setSelectedAyahAction(null);
                    triggerHaptic(30);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-current text-amber-300" />
                <span>بدء التلاوة بصوت {currentReciter.name}</span>
              </button>

              <button
                onClick={() => {
                  if (selectedAyahAction.text && selectedAyahAction.surahName && selectedAyahAction.numberInSurah) {
                    handleCopyAyah(
                      selectedAyahAction.text,
                      selectedAyahAction.surahName,
                      selectedAyahAction.numberInSurah
                    );
                    setSelectedAyahAction(null);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-emerald-950/60 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-xs transition cursor-pointer"
              >
                نسخ الآية الكريمة
              </button>

              <button
                onClick={() => setSelectedAyahAction(null)}
                className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: SURAH INDEX ================= */}
      {viewMode === 'surah_index' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c1f1c] rounded-2xl p-4 shadow-sm border border-emerald-100 dark:border-emerald-950/80 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute right-3 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أي سورة من الـ 114 سورة..."
                  className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#071311] border border-gray-200 dark:border-emerald-950 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  الجزء:
                </span>
                <select
                  value={filterJuz}
                  onChange={(e) => setFilterJuz(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-[#071311] border border-gray-200 dark:border-emerald-950 text-xs font-semibold text-gray-800 dark:text-gray-200 outline-hidden cursor-pointer"
                >
                  <option value="all">جميع الأجزاء (30 جزء)</option>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                    <option key={j} value={j}>
                      الجزء {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map((surah) => {
              const isCurrentPageSurah = surah.page === currentPage;

              return (
                <div
                  key={surah.number}
                  onClick={() => handleSelectSurahFromIndex(surah.number)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between group ${
                    isCurrentPageSurah
                      ? 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/40'
                      : 'bg-white dark:bg-[#0c1f1c] border-emerald-100 dark:border-emerald-950/70 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-700 group-hover:text-white transition shadow-xs">
                      {surah.number}
                    </div>

                    <div>
                      <h3 className="font-bold text-base font-quran text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                        سورة {surah.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {surah.numberOfAyahs} آية • صفحة {surah.page}
                      </p>
                    </div>
                  </div>

                  <div className="text-left flex flex-col items-end">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        surah.revelationType === 'Meccan'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      افتح صفحة {surah.page} ←
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK JUMP MODAL */}
      {showJumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1f1c] rounded-3xl p-6 shadow-2xl border border-emerald-600/30 text-right space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-500" />
              <span>الانتقال السريع في المصحف الشريف</span>
            </h3>

            {/* Jump by Page Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                أدخل رقم الصفحة (1 إلى 604):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="604"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder="مثال: 562"
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071311] border border-gray-200 dark:border-emerald-950 text-sm font-bold text-gray-900 dark:text-white outline-hidden"
                />
                <button
                  onClick={() => {
                    const num = parseInt(jumpPageInput, 10);
                    if (!isNaN(num)) handleJumpToPage(num);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition cursor-pointer"
                >
                  انتقال
                </button>
              </div>
            </div>

            {/* Quick Juz Jump */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-emerald-950">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                الانتقال إلى جزء محدد:
              </label>
              <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                  const juzStartPage = (juzNum - 1) * 20 + 2;
                  return (
                    <button
                      key={juzNum}
                      onClick={() => handleJumpToPage(juzNum === 1 ? 1 : juzStartPage)}
                      className="py-1.5 rounded-lg bg-gray-100 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold text-gray-700 dark:text-gray-200 transition cursor-pointer"
                    >
                      جزء {juzNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowJumpModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 dark:bg-emerald-950/80 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
