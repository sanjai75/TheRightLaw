import { LawAct, LegalCategory, SearchResult, Jurisdiction } from '@/data/types';
import { getActsByJurisdiction } from '@/data/legalDatabase';
import { supabase } from '@/integrations/supabase/client';

const categoryKeywords: Record<LegalCategory, string[]> = {
  criminal: ['crime', 'murder', 'theft', 'assault', 'robbery', 'killed', 'attack', 'violence', 'arrested', 'jail', 'prison', 'punishment', 'offense', 'offence', 'victim', 'weapon', 'shooting', 'stabbing', 'cheating', 'fraud', 'forgery', 'extortion', 'kidnapping', 'threatening', 'impersonation', 'dishonestly', 'stolen', 'deceived', 'criminal breach of trust'],
  civil: ['rights', 'discrimination', 'equality', 'freedom', 'constitution', 'privacy', 'education', 'records', 'health'],
  consumer: ['product', 'refund', 'defective', 'warranty', 'consumer', 'purchase', 'buy', 'bought', 'seller', 'shop', 'advertisement', 'misleading', 'deceptive', 'return', 'unfair trade'],
  property: ['property', 'land', 'house', 'apartment', 'rent', 'tenant', 'landlord', 'lease', 'eviction', 'builder', 'flat', 'real estate', 'mortgage', 'deed', 'ownership'],
  family: ['marriage', 'divorce', 'custody', 'alimony', 'domestic', 'spouse', 'husband', 'wife', 'child', 'maintenance', 'family', 'abuse', 'dowry'],
  labor: ['employment', 'job', 'salary', 'wages', 'fired', 'terminated', 'dismissal', 'overtime', 'leave', 'worker', 'employer', 'workplace', 'minimum wage', 'bonus', 'redundancy'],
  traffic: ['driving', 'accident', 'vehicle', 'car', 'road', 'traffic', 'licence', 'license', 'speeding', 'drunk driving', 'helmet', 'insurance', 'crash'],
  cyber: ['online', 'internet', 'hacking', 'computer', 'data', 'privacy', 'email', 'digital', 'social media', 'identity theft', 'cyber', 'malware', 'phishing', 'password', 'otp', 'bank fraud', 'upi', 'deducted', 'account', 'transaction', 'money deducted', 'debit', 'credit card', 'net banking', 'mobile banking', 'fraudulent call', 'vishing', 'smishing', 'bank call', 'unauthorized transaction', 'money stolen', 'financial fraud', 'online fraud', 'payment fraud', 'card fraud', 'sim swap', 'aadhaar fraud'],
  constitutional: ['rights', 'freedom', 'government', 'transparency', 'RTI', 'information', 'human rights', 'liberty', 'expression'],
  environmental: ['environment', 'pollution', 'waste', 'water', 'air', 'contamination', 'emission', 'ecology', 'conservation', 'recycling'],
  tax: ['tax', 'income', 'GST', 'filing', 'deduction', 'return', 'audit', 'IRS', 'HMRC', 'refund'],
  corporate: ['company', 'business', 'director', 'shareholder', 'incorporation', 'bankruptcy', 'insolvency', 'debt', 'corporate', 'loan'],
};

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function detectCategories(query: string): LegalCategory[] {
  const tokens = tokenize(query);
  const scores: [LegalCategory, number][] = [];

  for (const [cat, keywords] of Object.entries(categoryKeywords) as [LegalCategory, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      const kwTokens = kw.split(' ');
      if (kwTokens.length > 1) {
        if (query.toLowerCase().includes(kw)) score += 3;
      } else {
        if (tokens.includes(kw)) score += 2;
      }
    }
    if (score > 0) scores.push([cat, score]);
  }

  scores.sort((a, b) => b[1] - a[1]);
  return scores.slice(0, 3).map(([cat]) => cat);
}

function scoreAct(act: LawAct, queryTokens: string[], categories: LegalCategory[], queryLower: string): number {
  let score = 0;

  if (categories.includes(act.category)) {
    score += categories.indexOf(act.category) === 0 ? 40 : 20;
  }

  for (const kw of act.keywords) {
    const kwTokens = kw.split(' ');
    if (kwTokens.length > 1) {
      if (queryLower.includes(kw)) score += 20;
    } else {
      if (queryTokens.includes(kw)) score += 10;
    }
  }

  // Phrase matching
  if (act.phrases) {
    for (const phrase of act.phrases) {
      if (queryLower.includes(phrase.toLowerCase())) score += 15;
    }
  }

  let sectionBonus = 0;
  for (const section of act.sections) {
    const sectionText = (section.title + ' ' + section.summary).toLowerCase();
    for (const qt of queryTokens) {
      if (qt.length > 2 && sectionText.includes(qt)) sectionBonus += 5;
    }
  }
  score += Math.min(sectionBonus, 30);

  return Math.min(score, 100);
}

/** Original keyword-only search (used as fallback) */
export function searchLaws(query: string, jurisdiction: Jurisdiction): SearchResult[] {
  const acts = getActsByJurisdiction(jurisdiction);
  const queryTokens = tokenize(query);
  const categories = detectCategories(query);

  if (categories.length === 0 && queryTokens.length === 0) return [];

  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const act of acts) {
    const confidence = scoreAct(act, queryTokens, categories, queryLower);
    if (confidence < 5) continue;

    const matchedSections = act.sections.filter((section) => {
      const sectionText = (section.title + ' ' + section.summary).toLowerCase();
      return queryTokens.some((qt) => qt.length > 2 && sectionText.includes(qt));
    });

    results.push({
      act,
      matchedSections: matchedSections.length > 0 ? matchedSections : act.sections.slice(0, 2),
      confidence,
      matchType: confidence >= 30 ? 'exact' : 'related',
      categoryMatch: categories[0] || act.category,
    });
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results.filter(r => r.confidence >= 15).slice(0, 8);
}

/** Hybrid AI + keyword search */
export async function searchLawsHybrid(
  query: string,
  jurisdiction: Jurisdiction
): Promise<SearchResult[]> {
  const acts = getActsByJurisdiction(jurisdiction);
  const queryTokens = tokenize(query);
  const categories = detectCategories(query);
  const queryLower = query.toLowerCase();

  if (categories.length === 0 && queryTokens.length === 0) return [];

  // Compute keyword scores first
  const keywordResults: Map<string, { score: number; act: LawAct; matchedSections: LawAct['sections'] }> = new Map();

  for (const act of acts) {
    const kwScore = scoreAct(act, queryTokens, categories, queryLower);
    if (kwScore < 3) continue;

    const matchedSections = act.sections.filter((section) => {
      const sectionText = (section.title + ' ' + section.summary).toLowerCase();
      return queryTokens.some((qt) => qt.length > 2 && sectionText.includes(qt));
    });

    keywordResults.set(act.id, {
      score: kwScore,
      act,
      matchedSections: matchedSections.length > 0 ? matchedSections : act.sections.slice(0, 2),
    });
  }

  // Build compact catalog for AI
  const actsForAI = acts.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    year: a.year,
    keywords: a.keywords.slice(0, 10),
    sections: a.sections.map((s) => ({ sectionNumber: s.sectionNumber, title: s.title })),
  }));

  // Call AI edge function
  let aiScores: Map<string, { score: number; explanation: string }> = new Map();

  try {
    const { data, error } = await supabase.functions.invoke('legal-search', {
      body: { query, jurisdiction, acts: actsForAI },
    });

    if (!error && data?.scores) {
      for (const item of data.scores) {
        aiScores.set(item.actId, { score: item.score, explanation: item.explanation });
      }
    }
  } catch (err) {
    console.warn('AI search failed, using keyword-only fallback:', err);
  }

  // Merge scores: 60% AI + 40% keyword (or 100% keyword if no AI)
  const hasAI = aiScores.size > 0;
  const results: SearchResult[] = [];

  // Include all acts that have either keyword or AI score
  const allActIds = new Set([...keywordResults.keys(), ...aiScores.keys()]);

  for (const actId of allActIds) {
    const kw = keywordResults.get(actId);
    const ai = aiScores.get(actId);
    const act = kw?.act || acts.find((a) => a.id === actId);
    if (!act) continue;

    const kwScore = kw?.score ?? 0;
    const aiScore = ai?.score ?? 0;

    let confidence: number;
    if (hasAI) {
      confidence = Math.round(0.6 * aiScore + 0.4 * kwScore);
    } else {
      confidence = kwScore;
    }

    if (confidence < 5) continue;

    const matchedSections = kw?.matchedSections ?? act.sections.slice(0, 2);

    results.push({
      act,
      matchedSections,
      confidence: Math.min(confidence, 100),
      matchType: confidence >= 30 ? 'exact' : 'related',
      categoryMatch: categories[0] || act.category,
      aiExplanation: ai?.explanation,
    });
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, 10);
}

export function getCategoryLabel(cat: LegalCategory): string {
  const labels: Record<LegalCategory, string> = {
    criminal: 'Criminal Law',
    civil: 'Civil Rights & Liberties',
    consumer: 'Consumer Protection',
    property: 'Property & Housing',
    family: 'Family & Domestic',
    labor: 'Labor & Employment',
    traffic: 'Traffic & Road Safety',
    cyber: 'Cyber & Digital',
    constitutional: 'Constitutional & Governance',
    environmental: 'Environmental',
    tax: 'Taxation',
    corporate: 'Corporate & Commercial',
  };
  return labels[cat];
}

export function getCategoryLabelHi(cat: LegalCategory): string {
  const labels: Record<LegalCategory, string> = {
    criminal: 'आपराधिक कानून',
    civil: 'नागरिक अधिकार',
    consumer: 'उपभोक्ता संरक्षण',
    property: 'संपत्ति और आवास',
    family: 'पारिवारिक कानून',
    labor: 'श्रम और रोजगार',
    traffic: 'यातायात और सड़क सुरक्षा',
    cyber: 'साइबर और डिजिटल',
    constitutional: 'संवैधानिक और शासन',
    environmental: 'पर्यावरण',
    tax: 'कराधान',
    corporate: 'कॉर्पोरेट और वाणिज्यिक',
  };
  return labels[cat];
}
