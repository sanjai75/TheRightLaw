import { useState } from 'react';
import { Search } from 'lucide-react';
import { Language, t } from '@/lib/i18n';
import { Jurisdiction } from '@/data/types';

interface SearchInputProps {
  language: Language;
  jurisdiction: Jurisdiction;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const examplesByJurisdiction: Record<Jurisdiction, { en: string; hi: string }[]> = {
  IN: [
    { en: "My landlord won't return my deposit", hi: 'मेरे मकान मालिक ने जमा राशि वापस नहीं की' },
    { en: 'Someone hacked my social media account', hi: 'किसी ने मेरा सोशल मीडिया अकाउंट हैक कर लिया' },
    { en: 'I was fired without notice', hi: 'मुझे बिना नोटिस के निकाल दिया गया' },
    { en: 'Defective product caused injury', hi: 'दोषपूर्ण उत्पाद से चोट लगी' },
    { en: 'Money deducted from account via fraud call', hi: 'फ्रॉड कॉल से अकाउंट से पैसे कट गए' },
    { en: 'Husband is harassing me for dowry', hi: 'पति दहेज के लिए परेशान कर रहा है' },
    { en: 'Builder delayed flat possession by 2 years', hi: 'बिल्डर ने फ्लैट का कब्जा 2 साल से देरी की' },
    { en: 'My employer is not paying minimum wages', hi: 'मेरा नियोक्ता न्यूनतम वेतन नहीं दे रहा' },
  ],
  US: [
    { en: 'My employer fired me for taking medical leave', hi: '' },
    { en: 'Identity theft — someone opened credit cards in my name', hi: '' },
    { en: 'Landlord is discriminating against me for my race', hi: '' },
    { en: 'Company sold me a defective product and won\'t refund', hi: '' },
    { en: 'I was pulled over without probable cause', hi: '' },
    { en: 'My personal data was leaked in a breach', hi: '' },
    { en: 'I\'m getting harassed by robocalls', hi: '' },
    { en: 'My school shared my records without consent', hi: '' },
  ],
  UK: [
    { en: 'My employer dismissed me unfairly', hi: '' },
    { en: 'Landlord won\'t fix heating and it\'s winter', hi: '' },
    { en: 'Someone accessed my computer without permission', hi: '' },
    { en: 'I bought a faulty product and want a refund', hi: '' },
    { en: 'I was discriminated against at work due to my age', hi: '' },
    { en: 'My personal data was shared without consent', hi: '' },
    { en: 'I\'m being harassed by a family member', hi: '' },
    { en: 'I had a road accident and need to report it', hi: '' },
  ],
};

export default function SearchInput({ language, jurisdiction, onSearch, isSearching }: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const examples = examplesByJurisdiction[jurisdiction].map((ex) =>
    language === 'hi' && ex.hi ? ex.hi : ex.en
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder={t('search.placeholder', language)}
            rows={3}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none font-body text-base transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="mt-3 w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (language === 'en' ? 'Analyzing with AI...' : 'AI से विश्लेषण हो रहा है...') : t('search.button', language)}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {examples.slice(0, 6).map((ex, i) => (
          <button
            key={i}
            onClick={() => { setQuery(ex); onSearch(ex); }}
            className="text-xs px-3 py-1.5 bg-secondary text-muted-foreground rounded-full hover:bg-accent/20 hover:text-foreground transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
