import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '@/lib/i18n';
import { Jurisdiction, LegalCategory } from '@/data/types';

export interface SearchHistoryItem {
  query: string;
  jurisdiction: Jurisdiction;
  timestamp: number;
  topCategory?: LegalCategory;
}

export interface BookmarkItem {
  actId: string;
  actName: string;
  query: string;
  jurisdiction: Jurisdiction;
  timestamp: number;
}

export interface FeedbackItem {
  actId: string;
  query: string;
  helpful: boolean;
  comment?: string;
  timestamp: number;
}

interface AppState {
  // Preferences
  language: Language;
  jurisdiction: Jurisdiction;
  darkMode: 'system' | 'light' | 'dark';

  // Search history
  searchHistory: SearchHistoryItem[];
  bookmarks: BookmarkItem[];
  feedback: FeedbackItem[];

  // Actions
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setJurisdiction: (j: Jurisdiction) => void;
  setDarkMode: (mode: 'system' | 'light' | 'dark') => void;

  addSearchHistory: (item: Omit<SearchHistoryItem, 'timestamp'>) => void;
  clearSearchHistory: () => void;

  addBookmark: (item: Omit<BookmarkItem, 'timestamp'>) => void;
  removeBookmark: (actId: string) => void;
  isBookmarked: (actId: string) => boolean;

  addFeedback: (item: Omit<FeedbackItem, 'timestamp'>) => void;
  getFeedback: (actId: string, query: string) => FeedbackItem | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      jurisdiction: 'IN',
      darkMode: 'system',
      searchHistory: [],
      bookmarks: [],
      feedback: [],

      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((s) => ({ language: s.language === 'en' ? 'hi' : 'en' })),
      setJurisdiction: (jurisdiction) => set({ jurisdiction }),
      setDarkMode: (darkMode) => set({ darkMode }),

      addSearchHistory: (item) =>
        set((s) => ({
          searchHistory: [
            { ...item, timestamp: Date.now() },
            ...s.searchHistory.filter((h) => h.query !== item.query),
          ].slice(0, 20),
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),

      addBookmark: (item) =>
        set((s) => ({
          bookmarks: [{ ...item, timestamp: Date.now() }, ...s.bookmarks.filter((b) => b.actId !== item.actId)],
        })),
      removeBookmark: (actId) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.actId !== actId) })),
      isBookmarked: (actId) => get().bookmarks.some((b) => b.actId === actId),

      addFeedback: (item) =>
        set((s) => ({
          feedback: [
            { ...item, timestamp: Date.now() },
            ...s.feedback.filter((f) => !(f.actId === item.actId && f.query === item.query)),
          ],
        })),
      getFeedback: (actId, query) =>
        get().feedback.find((f) => f.actId === actId && f.query === query),
    }),
    {
      name: 'therightlaw-store',
      partialize: (state) => ({
        language: state.language,
        jurisdiction: state.jurisdiction,
        darkMode: state.darkMode,
        searchHistory: state.searchHistory,
        bookmarks: state.bookmarks,
        feedback: state.feedback,
      }),
    }
  )
);
