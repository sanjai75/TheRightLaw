import { Phone, Globe, ArrowRight } from 'lucide-react';
import { LegalCategory, Jurisdiction } from '@/data/types';
import { Language } from '@/lib/i18n';
import { getResourcesForCategory, ResourceItem } from '@/data/resourcesByCategory';

interface ActionableResourcesProps {
  category: LegalCategory;
  jurisdiction: Jurisdiction;
  language: Language;
}

function ResourceIcon({ type }: { type: ResourceItem['type'] }) {
  switch (type) {
    case 'helpline': return <Phone className="h-3.5 w-3.5 text-accent flex-shrink-0" />;
    case 'website': return <Globe className="h-3.5 w-3.5 text-accent flex-shrink-0" />;
    case 'step': return <ArrowRight className="h-3.5 w-3.5 text-accent flex-shrink-0" />;
  }
}

export default function ActionableResources({ category, jurisdiction, language }: ActionableResourcesProps) {
  const resources = getResourcesForCategory(jurisdiction, category);
  if (!resources) return null;

  const title = language === 'hi' && resources.titleHi ? resources.titleHi : resources.title;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Phone className="h-4 w-4 text-accent" />
        {language === 'en' ? 'What to Do Next' : 'आगे क्या करें'}
      </h3>
      <p className="text-xs text-muted-foreground mb-3">{title}</p>

      <div className="space-y-2.5">
        {resources.resources.map((r, i) => {
          const label = language === 'hi' && r.labelHi ? r.labelHi : r.label;
          const value = language === 'hi' && r.valueHi ? r.valueHi : r.value;

          return (
            <div key={i} className="flex items-start gap-2.5">
              <ResourceIcon type={r.type} />
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground">{label}</div>
                {r.type === 'helpline' && (
                  <a
                    href={`tel:${r.value}`}
                    className="text-xs text-accent hover:underline font-semibold"
                  >
                    📞 {r.value}
                  </a>
                )}
                {r.type === 'website' && (
                  <a
                    href={r.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline break-all"
                  >
                    {r.value.replace('https://', '').replace('http://', '')}
                  </a>
                )}
                {r.type === 'step' && (
                  <p className="text-xs text-muted-foreground mt-0.5">{value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
