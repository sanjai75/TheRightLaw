import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Language, t } from '@/lib/i18n';

interface DisclaimerBannerProps {
  language: Language;
  compact?: boolean;
  dismissible?: boolean;
}

export default function DisclaimerBanner({ language, compact, dismissible = false }: DisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="disclaimer-banner flex items-start gap-3">
      <AlertTriangle className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-accent shrink-0 mt-0.5`} />
      <p className={`${compact ? 'text-xs' : 'text-sm'} flex-1`}>
        {t('disclaimer', language)}
      </p>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded hover:bg-secondary transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
