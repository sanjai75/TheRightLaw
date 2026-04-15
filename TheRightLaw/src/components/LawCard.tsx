import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, BookOpen, Bookmark } from 'lucide-react';
import { SearchResult } from '@/data/types';
import { Language, t } from '@/lib/i18n';
import ConfidenceScore from './ConfidenceScore';
import FeedbackButtons from './FeedbackButtons';
import { getCategoryLabel, getCategoryLabelHi } from '@/lib/searchEngine';
import { useAppStore } from '@/stores/appStore';

interface LawCardProps {
  result: SearchResult;
  language: Language;
  index: number;
  query: string;
}

export default function LawCard({ result, language, index, query }: LawCardProps) {
  const [expanded, setExpanded] = useState(index < 2);
  const { act, matchedSections, confidence, matchType, aiExplanation } = result;
  const { addBookmark, removeBookmark, isBookmarked } = useAppStore();

  const actName = language === 'hi' && act.nameHi ? act.nameHi : act.name;
  const actSummary = language === 'hi' && act.summaryHi ? act.summaryHi : act.summary;
  const catLabel = language === 'hi' ? getCategoryLabelHi(result.categoryMatch) : getCategoryLabel(result.categoryMatch);
  const bookmarked = isBookmarked(act.id);

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(act.id);
    } else {
      addBookmark({
        actId: act.id,
        actName: act.name,
        query,
        jurisdiction: act.country,
      });
    }
  };

  return (
    <div className={`law-card animate-fade-in`} style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
              matchType === 'exact' ? 'bg-accent/15 text-accent-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              {matchType === 'exact' ? (language === 'en' ? 'Applicable' : 'लागू') : (language === 'en' ? 'Related' : 'संबंधित')}
            </span>
            <span className="text-[10px] text-muted-foreground">{catLabel}</span>
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
            {actName}
            <span className="text-muted-foreground font-body text-sm font-normal ml-2">({act.year})</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{actSummary}</p>

          {/* AI Explanation */}
          {aiExplanation && (
            <p className="text-xs text-accent mt-1.5 italic">
              💡 {aiExplanation}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <ConfidenceScore score={confidence} />
          <button
            onClick={toggleBookmark}
            className={`p-1 rounded transition-colors ${
              bookmarked ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Save to My Cases'}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex gap-4 mt-3 text-[11px] text-muted-foreground">
        <span>{t('results.effective', language)}: {new Date(act.effectiveDate).toLocaleDateString()}</span>
        <span>{t('results.amended', language)}: {new Date(act.lastAmendedDate).toLocaleDateString()}</span>
      </div>

      {/* Expand/Collapse sections */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 mt-3 text-xs text-accent hover:text-accent-foreground transition-colors font-medium"
      >
        <BookOpen className="h-3.5 w-3.5" />
        {matchedSections.length} {t('results.section', language)}{matchedSections.length > 1 ? 's' : ''}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {matchedSections.map((section, i) => (
            <div key={i} className="bg-secondary/50 rounded-lg p-3 text-sm">
              <div className="font-semibold text-foreground">
                {t('results.section', language)} {section.sectionNumber}: {section.title}
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{section.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Source + Feedback */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <a
          href={act.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-foreground transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('results.source', language)}
        </a>
        <FeedbackButtons actId={act.id} query={query} />
      </div>

      {confidence < 30 && (
        <p className="mt-2 text-xs text-confidence-low italic">{t('results.lowConfidence', language)}</p>
      )}
    </div>
  );
}
