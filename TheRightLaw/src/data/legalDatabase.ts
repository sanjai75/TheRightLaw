import { LawAct, Jurisdiction } from './types';
import { indianActs } from './indianActs';
import { usActs } from './usActs';
import { ukActs } from './ukActs';

export const allActs: LawAct[] = [...indianActs, ...usActs, ...ukActs];

export function getActsByJurisdiction(jurisdiction: Jurisdiction): LawAct[] {
  return allActs.filter((act) => act.country === jurisdiction);
}

export function getJurisdictionLabel(code: Jurisdiction): string {
  const labels: Record<Jurisdiction, string> = {
    IN: 'India',
    US: 'United States',
    UK: 'United Kingdom',
  };
  return labels[code];
}

export function getJurisdictionLabelHi(code: Jurisdiction): string {
  const labels: Record<Jurisdiction, string> = {
    IN: 'भारत',
    US: 'संयुक्त राज्य अमेरिका',
    UK: 'यूनाइटेड किंगडम',
  };
  return labels[code];
}
