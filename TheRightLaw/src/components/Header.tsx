import { Scale, Menu } from 'lucide-react';
import { Language, t } from '@/lib/i18n';
import { Jurisdiction } from '@/data/types';
import { getJurisdictionLabel } from '@/data/legalDatabase';
import ThemeToggle from './ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface HeaderProps {
  language: Language;
  jurisdiction: Jurisdiction;
  onLanguageToggle: () => void;
  onJurisdictionChange: (j: Jurisdiction) => void;
}

const jurisdictions: Jurisdiction[] = ['IN', 'US', 'UK'];

export default function Header({ language, jurisdiction, onLanguageToggle, onJurisdictionChange }: HeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const NavControls = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex ${mobile ? 'flex-col gap-4' : 'items-center gap-3'}`}>
      {/* Jurisdiction selector */}
      <div className={`flex items-center gap-1 bg-secondary rounded-lg p-1 ${mobile ? 'w-full justify-center' : ''}`}>
        {jurisdictions.map((j) => (
          <button
            key={j}
            onClick={() => {
              onJurisdictionChange(j);
              if (mobile) setSheetOpen(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              jurisdiction === j
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {getJurisdictionLabel(j)}
          </button>
        ))}
      </div>

      {/* Language toggle */}
      <button
        onClick={() => {
          onLanguageToggle();
          if (mobile) setSheetOpen(false);
        }}
        className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
      >
        {language === 'en' ? 'हिन्दी' : 'English'}
      </button>

      {/* Dark mode toggle */}
      <ThemeToggle />
    </div>
  );

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-accent" />
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            {t('app.title', language)}
          </span>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex">
          <NavControls />
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Menu className="h-5 w-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="pt-8">
                <div className="flex items-center gap-2 mb-8">
                  <Scale className="h-5 w-5 text-accent" />
                  <span className="font-display text-lg font-bold text-foreground">
                    {t('app.title', language)}
                  </span>
                </div>
                <NavControls mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
