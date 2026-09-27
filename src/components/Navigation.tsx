import React from 'react';
import {
  BookOpen,
  BookMarked,
  Sunrise,
  Plane,
  Sparkles,
  Users,
  Compass,
  Clock,
} from 'lucide-react';

export type TabType =
  | 'quran'
  | 'tafseer'
  | 'morning_evening'
  | 'travel'
  | 'categories'
  | 'library'
  | 'tasbeeh'
  | 'prayer';

interface NavigationProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, setCurrentTab }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    {
      id: 'quran',
      label: 'المصحف الشريف',
      shortLabel: 'المصحف',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'tafseer',
      label: 'تفسير القرآن',
      shortLabel: 'التفسير',
      icon: <BookMarked className="w-4 h-4" />,
    },
    {
      id: 'morning_evening',
      label: 'أذكار الصباح والمساء',
      shortLabel: 'الأذكار',
      icon: <Sunrise className="w-4 h-4" />,
    },
    {
      id: 'travel',
      label: 'أدعية السفر',
      shortLabel: 'السفر',
      icon: <Plane className="w-4 h-4" />,
    },
    {
      id: 'categories',
      label: 'باقي الأدعية والاستخارة',
      shortLabel: 'الأدعية',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'library',
      label: 'قصص الأنبياء والسيرة',
      shortLabel: 'القصص والسيرة',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'tasbeeh',
      label: 'السبحة الذكية',
      shortLabel: 'السبحة',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'prayer',
      label: 'مواقيت الصلاة والقبلة',
      shortLabel: 'الصلاة',
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation Bar */}
      <nav className="hidden md:block bg-white dark:bg-[#0c1f1c] border-b border-emerald-100 dark:border-emerald-950/80 shadow-xs sticky top-[57px] sm:top-[61px] z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between gap-1 py-1.5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20 dark:bg-emerald-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <span className={active ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071311]/95 backdrop-blur-md border-t border-emerald-200/60 dark:border-emerald-900/60 shadow-2xl"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
      >
        <div className="flex items-center justify-between px-1 py-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate(15);
                  }
                }}
                className={`flex-1 min-w-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                  active
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    active
                      ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-amber-300 scale-110 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.icon}
                </div>
                <span className="text-[10px] mt-0.5 truncate max-w-full text-center">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
