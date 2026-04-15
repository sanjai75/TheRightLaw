import { Clock, Trash2, Bookmark, X } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { Language, t } from '@/lib/i18n';
import { useState } from 'react';

interface SearchHistoryProps {
  language: Language;
  onSearch: (query: string) => void;
}

export default function SearchHistory({ language, onSearch }: SearchHistoryProps) {
  const { searchHistory, clearSearchHistory, bookmarks, removeBookmark } = useAppStore();
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');

  if (searchHistory.length === 0 && bookmarks.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          {language === 'en' ? 'Recent' : 'हाल ही में'} ({searchHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {language === 'en' ? 'My Cases' : 'मेरे केस'} ({bookmarks.length})
        </button>
      </div>

      {activeTab === 'history' && searchHistory.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {language === 'en' ? 'Search History' : 'खोज इतिहास'}
            </span>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              {language === 'en' ? 'Clear' : 'साफ़ करें'}
            </button>
          </div>
          <div className="space-y-1">
            {searchHistory.slice(0, 8).map((item, i) => (
              <button
                key={i}
                onClick={() => onSearch(item.query)}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors"
              >
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-foreground">{item.query}</span>
                <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">
                  {item.jurisdiction}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookmarks' && bookmarks.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="space-y-1">
            {bookmarks.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors"
              >
                <Bookmark className="h-3 w-3 text-accent flex-shrink-0" />
                <button
                  onClick={() => onSearch(item.query)}
                  className="flex-1 text-left truncate text-foreground"
                >
                  {item.actName}
                </button>
                <span className="text-[10px] text-muted-foreground">{item.jurisdiction}</span>
                <button
                  onClick={() => removeBookmark(item.actId)}
                  className="text-muted-foreground hover:text-destructive p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
