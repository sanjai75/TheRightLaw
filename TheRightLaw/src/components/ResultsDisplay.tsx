import { SearchResult, LegalCategory } from '@/data/types';
import { Language, t } from '@/lib/i18n';
import { Jurisdiction } from '@/data/types';
import LawCard from './LawCard';
import DisclaimerBanner from './DisclaimerBanner';
import ActionableResources from './ActionableResources';
import LegalChat from './LegalChat';
import DocumentGenerator from './DocumentGenerator';
import { getCategoryLabel, getCategoryLabelHi } from '@/lib/searchEngine';
import { FileDown } from 'lucide-react';
import { exportResultsToPdf } from '@/lib/pdfExport';

interface ResultsDisplayProps {
  results: SearchResult[];
  language: Language;
  query: string;
  jurisdiction: Jurisdiction;
  onBack: () => void;
  isLoading?: boolean;
}

export default function ResultsDisplay({ results, language, query, jurisdiction, onBack, isLoading }: ResultsDisplayProps) {
  const exactResults = results.filter((r) => r.matchType === 'exact');
  const relatedResults = results.filter((r) => r.matchType === 'related');

  const topCategory = results[0]?.categoryMatch;
  const catLabel = topCategory
    ? (language === 'hi' ? getCategoryLabelHi(topCategory) : getCategoryLabel(topCategory))
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('back', language)}
        </button>
        {results.length > 0 && (
          <button
            onClick={() => exportResultsToPdf(results, query, jurisdiction)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <FileDown className="h-3.5 w-3.5" />
            {language === 'en' ? 'Export PDF' : 'PDF डाउनलोड'}
          </button>
        )}
      </div>

      {/* Query echo */}
      <div className="bg-secondary/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground italic">"{query}"</p>
        {catLabel && (
          <p className="text-xs text-accent font-medium mt-1">
            {t('results.category', language)}: {catLabel}
          </p>
        )}
      </div>

      <DisclaimerBanner language={language} compact dismissible />

      {isLoading ? (
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="law-card animate-pulse">
              <div className="h-4 bg-secondary rounded w-1/4 mb-3" />
              <div className="h-6 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary rounded w-full mb-1" />
              <div className="h-3 bg-secondary rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t('results.none', language)}</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Results column */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-4 italic">
              {t('results.maySay', language)}:
            </p>

            {exactResults.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  {t('results.exact', language)}
                </h2>
                <div className="space-y-4">
                  {exactResults.map((r, i) => (
                    <LawCard key={r.act.id} result={r} language={language} index={i} query={query} />
                  ))}
                </div>
              </div>
            )}

            {relatedResults.length > 0 && (
              <div>
                <div className="gold-divider mb-6" />
                <h2 className="font-display text-lg font-semibold text-muted-foreground mb-4">
                  {t('results.related', language)}
                </h2>
                <div className="space-y-4">
                  {relatedResults.map((r, i) => (
                    <LawCard key={r.act.id} result={r} language={language} index={i + exactResults.length} query={query} />
                  ))}
                </div>
              </div>
            )}

            {/* Document Generator CTA */}
            <div className="mt-8 mb-6">
              <DocumentGenerator
                language={language}
                query={query}
                jurisdiction={jurisdiction}
                results={results}
              />
            </div>

            <div className="mt-4">
              <DisclaimerBanner language={language} dismissible />
            </div>
          </div>

          {/* Resources sidebar (desktop) / accordion (mobile) */}
          {topCategory && (
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-4">
                <ActionableResources
                  category={topCategory}
                  jurisdiction={jurisdiction}
                  language={language}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Chat floating button + panel */}
      {!isLoading && results.length > 0 && (
        <LegalChat
          language={language}
          query={query}
          jurisdiction={jurisdiction}
          results={results}
        />
      )}
    </div>
  );
}
