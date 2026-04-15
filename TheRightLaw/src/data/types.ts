export type Jurisdiction = 'IN' | 'US' | 'UK';

export type LegalCategory =
  | 'criminal'
  | 'civil'
  | 'consumer'
  | 'property'
  | 'family'
  | 'labor'
  | 'traffic'
  | 'cyber'
  | 'constitutional'
  | 'environmental'
  | 'tax'
  | 'corporate';

export interface LawSection {
  sectionNumber: string;
  title: string;
  summary: string;
  summaryHi?: string;
}

export interface LawAct {
  id: string;
  name: string;
  nameHi?: string;
  year: number;
  country: Jurisdiction;
  state?: string;
  category: LegalCategory;
  sections: LawSection[];
  summary: string;
  summaryHi?: string;
  sourceUrl: string;
  effectiveDate: string;
  lastAmendedDate: string;
  keywords: string[];
  phrases?: string[];
}

export interface SearchResult {
  act: LawAct;
  matchedSections: LawSection[];
  confidence: number;
  matchType: 'exact' | 'related';
  categoryMatch: LegalCategory;
  aiExplanation?: string;
}

export interface SearchQuery {
  text: string;
  jurisdiction: Jurisdiction;
  state?: string;
  language: 'en' | 'hi';
}
