import { useState, useCallback } from 'react';
import { Scale, Shield, BookOpen, Globe } from 'lucide-react';
import Header from '@/components/Header';
import SearchInput from '@/components/SearchInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import SearchHistory from '@/components/SearchHistory';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { Language, t } from '@/lib/i18n';
import { Jurisdiction, SearchResult } from '@/data/types';
import { searchLaws, searchLawsHybrid } from '@/lib/searchEngine';
import { useAppStore } from '@/stores/appStore';
import { toast } from '@/hooks/use-toast';

type View = 'home' | 'results';

const Index = () => {
  const { language, jurisdiction, setJurisdiction, toggleLanguage, addSearchHistory } = useAppStore();
  const [view, setView] = useState<View>('home');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [lastQuery, setLastQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      setIsSearching(true);
      setLastQuery(query);
      setView('results');

      try {
        const res = await searchLawsHybrid(query, jurisdiction);
        setResults(res);
        addSearchHistory({ query, jurisdiction, topCategory: res[0]?.categoryMatch });
      } catch (err) {
        console.warn('Hybrid search failed, falling back to keyword search:', err);
        const res = searchLaws(query, jurisdiction);
        setResults(res);
        addSearchHistory({ query, jurisdiction, topCategory: res[0]?.categoryMatch });
        toast({
          title: language === 'en' ? 'Using keyword search' : 'कीवर्ड खोज उपयोग हो रही है',
          description: language === 'en' ? 'AI search is temporarily unavailable.' : 'AI खोज अस्थायी रूप से अनुपलब्ध है।',
        });
      } finally {
        setIsSearching(false);
      }
    },
    [jurisdiction, language, addSearchHistory]
  );

  const handleBack = useCallback(() => {
    setView('home');
    setResults([]);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        language={language}
        jurisdiction={jurisdiction}
        onLanguageToggle={toggleLanguage}
        onJurisdictionChange={setJurisdiction}
      />

      <main className="flex-1">
        {view === 'home' ? (
          <div className="container mx-auto px-4">
            {/* Hero */}
            <div className="max-w-3xl mx-auto text-center pt-16 pb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-xs font-medium mb-6">
                <Shield className="h-3.5 w-3.5" />
                {language === 'en' ? 'AI-Powered Legal Discovery — Not Legal Advice' : 'AI-संचालित कानूनी खोज — कानूनी सलाह नहीं'}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance mb-4">
                {t('app.tagline', language)}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
                {t('app.subtitle', language)}
              </p>

              <SearchInput
                language={language}
                jurisdiction={jurisdiction}
                onSearch={handleSearch}
                isSearching={isSearching}
              />

              {/* Disclaimer */}
              <div className="max-w-xl mx-auto mt-8">
                <DisclaimerBanner language={language} dismissible />
              </div>

              {/* Search History */}
              <SearchHistory language={language} onSearch={handleSearch} />
            </div>

            {/* How it works */}
            <div className="max-w-3xl mx-auto pb-16">
              <div className="gold-divider mb-10" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: Globe,
                    title: language === 'en' ? 'Select Jurisdiction' : 'क्षेत्राधिकार चुनें',
                    desc: language === 'en' ? 'Choose India, US, or UK to search within official legal frameworks.' : 'आधिकारिक कानूनी ढांचे में खोजने के लिए भारत, अमेरिका या ब्रिटेन चुनें।',
                  },
                  {
                    icon: BookOpen,
                    title: language === 'en' ? 'Describe Your Issue' : 'अपनी समस्या बताएं',
                    desc: language === 'en' ? 'Use plain language — AI understands complex situations.' : 'सरल भाषा का उपयोग करें — AI जटिल स्थितियों को समझता है।',
                  },
                  {
                    icon: Scale,
                    title: language === 'en' ? 'Discover Applicable Laws' : 'लागू कानूनों की खोज करें',
                    desc: language === 'en' ? 'Get AI-scored laws with sections, summaries, and official source links.' : 'AI-स्कोर वाले कानून धाराओं, सारांश और आधिकारिक स्रोत लिंक के साथ प्राप्त करें।',
                  },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="text-center p-5">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 mb-3">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <ResultsDisplay
              results={results}
              language={language}
              query={lastQuery}
              jurisdiction={jurisdiction}
              onBack={handleBack}
              isLoading={isSearching}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TheRightLaw — {t('disclaimer', language).split('.')[0]}.
        </div>
      </footer>
    </div>
  );
};

export default Index;
