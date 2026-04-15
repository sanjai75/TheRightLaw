export type Language = 'en' | 'hi';

const translations: Record<string, Record<Language, string>> = {
  'app.title': { en: 'TheRightLaw', hi: 'द राइट लॉ' },
  'app.tagline': { en: 'Discover the Laws That May Apply to Your Situation', hi: 'अपनी स्थिति पर लागू होने वाले कानूनों की खोज करें' },
  'app.subtitle': { en: 'Legal frameworks mapped to your real-life situations — not legal advice.', hi: 'आपकी वास्तविक स्थितियों से जुड़े कानूनी ढांचे — कानूनी सलाह नहीं।' },
  'disclaimer': { en: 'This platform provides general legal information only and does not constitute legal advice. Always consult a qualified legal professional.', hi: 'यह प्लेटफॉर्म केवल सामान्य कानूनी जानकारी प्रदान करता है और कानूनी सलाह नहीं है। हमेशा एक योग्य कानूनी पेशेवर से परामर्श करें।' },
  'search.placeholder': { en: 'Describe your issue in simple words...', hi: 'अपनी समस्या को सरल शब्दों में बताएं...' },
  'search.button': { en: 'Search Laws', hi: 'कानून खोजें' },
  'search.examples': { en: 'Try: "My landlord won\'t return my deposit" or "Someone stole my phone"', hi: 'उदाहरण: "मेरे मकान मालिक ने जमा राशि वापस नहीं की" या "किसी ने मेरा फोन चुरा लिया"' },
  'jurisdiction.label': { en: 'Jurisdiction', hi: 'क्षेत्राधिकार' },
  'results.exact': { en: 'Applicable Legal Frameworks', hi: 'लागू कानूनी ढांचे' },
  'results.related': { en: 'Related Legal Frameworks', hi: 'संबंधित कानूनी ढांचे' },
  'results.none': { en: 'No legal frameworks found matching your query. Try rephrasing or broadening your description.', hi: 'आपकी खोज से मेल खाने वाला कोई कानूनी ढांचा नहीं मिला। अपना विवरण पुनः लिखें या विस्तार करें।' },
  'results.category': { en: 'Category Identified', hi: 'पहचानी गई श्रेणी' },
  'results.confidence': { en: 'Confidence', hi: 'विश्वास स्कोर' },
  'results.source': { en: 'View Official Source', hi: 'आधिकारिक स्रोत देखें' },
  'results.section': { en: 'Section', hi: 'धारा' },
  'results.effective': { en: 'Effective', hi: 'प्रभावी' },
  'results.amended': { en: 'Last Amended', hi: 'अंतिम संशोधन' },
  'results.lowConfidence': { en: 'Results may not precisely match your situation.', hi: 'परिणाम आपकी स्थिति से सटीक मेल नहीं खा सकते।' },
  'results.maySay': { en: 'Legal frameworks that may apply', hi: 'लागू हो सकने वाले कानूनी ढांचे' },
  'nav.about': { en: 'About', hi: 'हमारे बारे में' },
  'nav.howItWorks': { en: 'How It Works', hi: 'कैसे काम करता है' },
  'language': { en: 'English', hi: 'हिन्दी' },
  'back': { en: '← New Search', hi: '← नई खोज' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}
