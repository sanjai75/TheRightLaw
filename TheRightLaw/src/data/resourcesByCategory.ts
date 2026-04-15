import { LegalCategory, Jurisdiction } from './types';

export interface ResourceItem {
  type: 'helpline' | 'website' | 'step';
  label: string;
  labelHi?: string;
  value: string; // phone number, URL, or step description
  valueHi?: string;
}

export interface CategoryResources {
  title: string;
  titleHi?: string;
  resources: ResourceItem[];
}

const resourcesMap: Record<Jurisdiction, Partial<Record<LegalCategory, CategoryResources>>> = {
  IN: {
    cyber: {
      title: 'Cyber Crime Resources',
      titleHi: 'साइबर अपराध संसाधन',
      resources: [
        { type: 'helpline', label: 'National Cyber Crime Helpline', labelHi: 'राष्ट्रीय साइबर अपराध हेल्पलाइन', value: '1930' },
        { type: 'website', label: 'Report Cyber Crime Online', labelHi: 'ऑनलाइन साइबर अपराध दर्ज करें', value: 'https://cybercrime.gov.in' },
        { type: 'helpline', label: 'RBI Customer Grievance (Banking)', labelHi: 'RBI ग्राहक शिकायत (बैंकिंग)', value: '14440' },
        { type: 'step', label: 'Block your bank account/card immediately', labelHi: 'अपना बैंक खाता/कार्ड तुरंत ब्लॉक करें', value: 'Call your bank helpline within 1 hour (golden hour)', valueHi: '1 घंटे के भीतर अपने बैंक हेल्पलाइन पर कॉल करें (गोल्डन आवर)' },
        { type: 'step', label: 'File FIR at nearest police station', labelHi: 'निकटतम पुलिस स्टेशन में FIR दर्ज करें', value: 'Carry all transaction details, screenshots, and ID proof', valueHi: 'सभी लेनदेन विवरण, स्क्रीनशॉट और ID प्रमाण ले जाएं' },
        { type: 'step', label: 'Report to bank with written complaint', labelHi: 'बैंक को लिखित शिकायत दें', value: 'Include transaction ID, date, amount, and fraud description', valueHi: 'लेनदेन आईडी, तारीख, राशि और धोखाधड़ी का विवरण शामिल करें' },
      ],
    },
    consumer: {
      title: 'Consumer Protection Resources',
      titleHi: 'उपभोक्ता संरक्षण संसाधन',
      resources: [
        { type: 'helpline', label: 'National Consumer Helpline', labelHi: 'राष्ट्रीय उपभोक्ता हेल्पलाइन', value: '1800-11-4000' },
        { type: 'website', label: 'Consumer Helpline Portal', labelHi: 'उपभोक्ता हेल्पलाइन पोर्टल', value: 'https://consumerhelpline.gov.in' },
        { type: 'website', label: 'E-Daakhil (File Consumer Case Online)', labelHi: 'ई-दाखिल (ऑनलाइन उपभोक्ता केस दर्ज करें)', value: 'https://edaakhil.nic.in' },
        { type: 'step', label: 'Send written notice to seller/company', labelHi: 'विक्रेता/कंपनी को लिखित नोटिस भेजें', value: 'Keep a copy via registered post or email', valueHi: 'रजिस्टर्ड पोस्ट या ईमेल द्वारा कॉपी रखें' },
        { type: 'step', label: 'File complaint on consumer forum', labelHi: 'उपभोक्ता मंच पर शिकायत दर्ज करें', value: 'Claims up to ₹1 crore go to District Commission', valueHi: '₹1 करोड़ तक के दावे जिला आयोग में जाते हैं' },
      ],
    },
    criminal: {
      title: 'Criminal Law Resources',
      titleHi: 'आपराधिक कानून संसाधन',
      resources: [
        { type: 'helpline', label: 'Police Emergency', labelHi: 'पुलिस आपातकालीन', value: '112' },
        { type: 'helpline', label: 'Women Helpline', labelHi: 'महिला हेल्पलाइन', value: '181' },
        { type: 'website', label: 'File FIR Online (varies by state)', labelHi: 'ऑनलाइन FIR दर्ज करें', value: 'https://digitalpolice.gov.in' },
        { type: 'step', label: 'File an FIR at the nearest police station', labelHi: 'निकटतम पुलिस स्टेशन में FIR दर्ज करें', value: 'Police cannot refuse to register an FIR (Section 154 CrPC)', valueHi: 'पुलिस FIR दर्ज करने से मना नहीं कर सकती (धारा 154 CrPC)' },
        { type: 'step', label: 'Collect and preserve evidence', labelHi: 'साक्ष्य एकत्र और सुरक्षित रखें', value: 'Photos, CCTV, witnesses, medical reports', valueHi: 'फोटो, CCTV, गवाह, मेडिकल रिपोर्ट' },
      ],
    },
    family: {
      title: 'Family Law Resources',
      titleHi: 'पारिवारिक कानून संसाधन',
      resources: [
        { type: 'helpline', label: 'Women Helpline', labelHi: 'महिला हेल्पलाइन', value: '181' },
        { type: 'helpline', label: 'Childline (for child-related issues)', labelHi: 'चाइल्डलाइन', value: '1098' },
        { type: 'website', label: 'National Commission for Women', labelHi: 'राष्ट्रीय महिला आयोग', value: 'http://ncw.nic.in' },
        { type: 'step', label: 'Consult a family court lawyer', labelHi: 'पारिवारिक अदालत के वकील से परामर्श करें', value: 'Free legal aid available via NALSA (1516)', valueHi: 'NALSA (1516) के माध्यम से मुफ्त कानूनी सहायता उपलब्ध' },
        { type: 'step', label: 'File for protection order if domestic violence', labelHi: 'घरेलू हिंसा होने पर सुरक्षा आदेश के लिए आवेदन करें', value: 'Under DV Act Section 12, apply to Magistrate', valueHi: 'DV अधिनियम धारा 12 के तहत मजिस्ट्रेट को आवेदन करें' },
      ],
    },
    labor: {
      title: 'Labor & Employment Resources',
      titleHi: 'श्रम और रोजगार संसाधन',
      resources: [
        { type: 'helpline', label: 'Labour Helpline (Shram Suvidha)', labelHi: 'श्रम हेल्पलाइन (श्रम सुविधा)', value: '14434' },
        { type: 'website', label: 'Shram Suvidha Portal', labelHi: 'श्रम सुविधा पोर्टल', value: 'https://shramsuvidha.gov.in' },
        { type: 'step', label: 'File complaint with Labour Commissioner', labelHi: 'श्रम आयुक्त को शिकायत दर्ज करें', value: 'For unpaid wages, wrongful termination, etc.', valueHi: 'अवैतनिक वेतन, गलत बर्खास्तगी आदि के लिए' },
      ],
    },
    property: {
      title: 'Property & Housing Resources',
      titleHi: 'संपत्ति और आवास संसाधन',
      resources: [
        { type: 'website', label: 'RERA Authority (varies by state)', labelHi: 'RERA प्राधिकरण (राज्य अनुसार)', value: 'https://rera.gov.in' },
        { type: 'step', label: 'File complaint with RERA for builder disputes', labelHi: 'बिल्डर विवादों के लिए RERA में शिकायत दर्ज करें', value: 'Online filing available on state RERA portals', valueHi: 'राज्य RERA पोर्टल पर ऑनलाइन फाइलिंग उपलब्ध' },
        { type: 'step', label: 'Send legal notice to landlord/builder', labelHi: 'मकान मालिक/बिल्डर को कानूनी नोटिस भेजें', value: 'Via registered post with acknowledgment', valueHi: 'पावती के साथ रजिस्टर्ड पोस्ट द्वारा' },
      ],
    },
    traffic: {
      title: 'Traffic & Road Safety',
      titleHi: 'यातायात और सड़क सुरक्षा',
      resources: [
        { type: 'helpline', label: 'Road Accident Emergency', labelHi: 'सड़क दुर्घटना आपातकालीन', value: '112' },
        { type: 'website', label: 'E-Challan Portal', labelHi: 'ई-चालान पोर्टल', value: 'https://echallan.parivahan.gov.in' },
        { type: 'step', label: 'Report accident to police immediately', labelHi: 'दुर्घटना की तुरंत पुलिस को रिपोर्ट करें', value: 'Required under Motor Vehicles Act', valueHi: 'मोटर वाहन अधिनियम के तहत आवश्यक' },
      ],
    },
    constitutional: {
      title: 'Constitutional & RTI Resources',
      titleHi: 'संवैधानिक और RTI संसाधन',
      resources: [
        { type: 'website', label: 'RTI Online Portal', labelHi: 'RTI ऑनलाइन पोर्टल', value: 'https://rtionline.gov.in' },
        { type: 'step', label: 'File RTI application online', labelHi: 'ऑनलाइन RTI आवेदन दर्ज करें', value: 'Fee: ₹10 for central government departments', valueHi: 'शुल्क: केंद्र सरकार विभागों के लिए ₹10' },
      ],
    },
    environmental: {
      title: 'Environmental Resources',
      titleHi: 'पर्यावरण संसाधन',
      resources: [
        { type: 'website', label: 'Central Pollution Control Board', labelHi: 'केंद्रीय प्रदूषण नियंत्रण बोर्ड', value: 'https://cpcb.nic.in' },
        { type: 'step', label: 'File complaint with State Pollution Control Board', labelHi: 'राज्य प्रदूषण नियंत्रण बोर्ड में शिकायत दर्ज करें', value: 'Online or in person at your state board', valueHi: 'अपने राज्य बोर्ड में ऑनलाइन या व्यक्तिगत रूप से' },
      ],
    },
    tax: {
      title: 'Taxation Resources',
      titleHi: 'कराधान संसाधन',
      resources: [
        { type: 'helpline', label: 'Income Tax Helpline', labelHi: 'आयकर हेल्पलाइन', value: '1800-180-1961' },
        { type: 'website', label: 'Income Tax e-Filing', labelHi: 'आयकर ई-फाइलिंग', value: 'https://www.incometax.gov.in' },
        { type: 'website', label: 'GST Portal', labelHi: 'GST पोर्टल', value: 'https://www.gst.gov.in' },
      ],
    },
    corporate: {
      title: 'Corporate & Business Resources',
      titleHi: 'कॉर्पोरेट और व्यापार संसाधन',
      resources: [
        { type: 'website', label: 'MCA (Ministry of Corporate Affairs)', labelHi: 'कॉर्पोरेट मामलों का मंत्रालय', value: 'https://www.mca.gov.in' },
        { type: 'website', label: 'IBBI (Insolvency & Bankruptcy Board)', labelHi: 'IBBI (दिवाला और शोधन बोर्ड)', value: 'https://ibbi.gov.in' },
      ],
    },
  },
  US: {
    cyber: {
      title: 'Cyber Crime Resources',
      resources: [
        { type: 'website', label: 'FBI Internet Crime Complaint Center (IC3)', value: 'https://www.ic3.gov' },
        { type: 'website', label: 'FTC Report Fraud', value: 'https://reportfraud.ftc.gov' },
        { type: 'helpline', label: 'Identity Theft Hotline', value: '1-877-438-4338' },
        { type: 'step', label: 'Freeze your credit with all 3 bureaus', value: 'Equifax, Experian, and TransUnion' },
        { type: 'step', label: 'File a report with local police', value: 'Needed for insurance and credit disputes' },
      ],
    },
    consumer: {
      title: 'Consumer Protection Resources',
      resources: [
        { type: 'website', label: 'FTC Consumer Information', value: 'https://consumer.ftc.gov' },
        { type: 'website', label: 'Consumer Financial Protection Bureau', value: 'https://www.consumerfinance.gov' },
        { type: 'step', label: 'File complaint with FTC', value: 'Visit reportfraud.ftc.gov' },
        { type: 'step', label: 'Contact your state Attorney General', value: 'For state-specific consumer protection' },
      ],
    },
    criminal: {
      title: 'Criminal Law Resources',
      resources: [
        { type: 'helpline', label: 'Emergency', value: '911' },
        { type: 'helpline', label: 'National Domestic Violence Hotline', value: '1-800-799-7233' },
        { type: 'website', label: 'Victims of Crime Resource Center', value: 'https://ovc.ojp.gov' },
        { type: 'step', label: 'File a police report', value: 'Contact your local police department' },
      ],
    },
    family: {
      title: 'Family Law Resources',
      resources: [
        { type: 'helpline', label: 'Childhelp National Hotline', value: '1-800-422-4453' },
        { type: 'helpline', label: 'National Domestic Violence Hotline', value: '1-800-799-7233' },
        { type: 'website', label: 'Legal Aid Finder', value: 'https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help' },
      ],
    },
    labor: {
      title: 'Labor & Employment Resources',
      resources: [
        { type: 'website', label: 'Department of Labor', value: 'https://www.dol.gov' },
        { type: 'website', label: 'EEOC (Employment Discrimination)', value: 'https://www.eeoc.gov' },
        { type: 'helpline', label: 'DOL Wage & Hour Division', value: '1-866-487-9243' },
        { type: 'step', label: 'File wage complaint with DOL', value: 'For unpaid wages and overtime violations' },
      ],
    },
    property: {
      title: 'Property & Housing Resources',
      resources: [
        { type: 'website', label: 'HUD Fair Housing', value: 'https://www.hud.gov/topics/housing_discrimination' },
        { type: 'helpline', label: 'HUD Helpline', value: '1-800-569-4287' },
        { type: 'step', label: 'File fair housing complaint with HUD', value: 'For housing discrimination issues' },
      ],
    },
    traffic: {
      title: 'Traffic & Vehicle Safety',
      resources: [
        { type: 'helpline', label: 'NHTSA Vehicle Safety Hotline', value: '1-888-327-4236' },
        { type: 'website', label: 'NHTSA Recalls', value: 'https://www.nhtsa.gov/recalls' },
      ],
    },
    environmental: {
      title: 'Environmental Resources',
      resources: [
        { type: 'website', label: 'EPA (Environmental Protection Agency)', value: 'https://www.epa.gov' },
        { type: 'step', label: 'Report environmental violations to EPA', value: 'Visit epa.gov/enforcement/report-environmental-violations' },
      ],
    },
    tax: {
      title: 'Tax Resources',
      resources: [
        { type: 'helpline', label: 'IRS Helpline', value: '1-800-829-1040' },
        { type: 'website', label: 'IRS e-File', value: 'https://www.irs.gov/filing' },
      ],
    },
    constitutional: {
      title: 'Constitutional & Civil Rights',
      resources: [
        { type: 'website', label: 'ACLU', value: 'https://www.aclu.org' },
        { type: 'website', label: 'DOJ Civil Rights Division', value: 'https://www.justice.gov/crt' },
      ],
    },
    corporate: {
      title: 'Corporate & Business Resources',
      resources: [
        { type: 'website', label: 'SEC (Securities & Exchange Commission)', value: 'https://www.sec.gov' },
        { type: 'website', label: 'SBA (Small Business Administration)', value: 'https://www.sba.gov' },
      ],
    },
  },
  UK: {
    cyber: {
      title: 'Cyber Crime Resources',
      resources: [
        { type: 'website', label: 'Action Fraud (National Fraud Reporting)', value: 'https://www.actionfraud.police.uk' },
        { type: 'helpline', label: 'Action Fraud Helpline', value: '0300 123 2040' },
        { type: 'website', label: 'National Cyber Security Centre', value: 'https://www.ncsc.gov.uk' },
        { type: 'step', label: 'Report to Action Fraud', value: 'File online or call the helpline' },
        { type: 'step', label: 'Contact your bank fraud team', value: 'Most UK banks have 24/7 fraud lines' },
      ],
    },
    consumer: {
      title: 'Consumer Protection Resources',
      resources: [
        { type: 'helpline', label: 'Citizens Advice Consumer Helpline', value: '0808 223 1133' },
        { type: 'website', label: 'Citizens Advice', value: 'https://www.citizensadvice.org.uk' },
        { type: 'step', label: 'Write formal complaint to business', value: 'Request refund/repair within 30 days for faulty goods' },
        { type: 'step', label: 'Escalate to Financial Ombudsman if financial', value: 'Visit financial-ombudsman.org.uk' },
      ],
    },
    criminal: {
      title: 'Criminal Law Resources',
      resources: [
        { type: 'helpline', label: 'Emergency', value: '999' },
        { type: 'helpline', label: 'Non-emergency Police', value: '101' },
        { type: 'website', label: 'Victim Support', value: 'https://www.victimsupport.org.uk' },
      ],
    },
    family: {
      title: 'Family Law Resources',
      resources: [
        { type: 'helpline', label: 'National Domestic Abuse Helpline', value: '0808 2000 247' },
        { type: 'website', label: 'Family Mediation Council', value: 'https://www.familymediationcouncil.org.uk' },
        { type: 'website', label: 'Legal Aid Agency', value: 'https://www.gov.uk/legal-aid' },
      ],
    },
    labor: {
      title: 'Employment Resources',
      resources: [
        { type: 'helpline', label: 'ACAS (Advisory, Conciliation & Arbitration)', value: '0300 123 1100' },
        { type: 'website', label: 'ACAS', value: 'https://www.acas.org.uk' },
        { type: 'website', label: 'Employment Tribunal', value: 'https://www.gov.uk/employment-tribunals' },
        { type: 'step', label: 'Raise grievance with employer first', value: 'Follow your workplace grievance procedure' },
        { type: 'step', label: 'Contact ACAS for early conciliation', value: 'Required before Employment Tribunal claim' },
      ],
    },
    property: {
      title: 'Housing Resources',
      resources: [
        { type: 'website', label: 'Shelter (Housing Charity)', value: 'https://www.shelter.org.uk' },
        { type: 'helpline', label: 'Shelter Helpline', value: '0808 800 4444' },
        { type: 'step', label: 'Contact local council housing team', value: 'For emergency housing or disputes' },
      ],
    },
    traffic: {
      title: 'Road Traffic Resources',
      resources: [
        { type: 'website', label: 'DVLA', value: 'https://www.gov.uk/browse/driving' },
        { type: 'step', label: 'Report road accidents to police within 24 hours', value: 'Required under Road Traffic Act' },
      ],
    },
    environmental: {
      title: 'Environmental Resources',
      resources: [
        { type: 'website', label: 'Environment Agency', value: 'https://www.gov.uk/government/organisations/environment-agency' },
        { type: 'helpline', label: 'Environment Agency Incident Hotline', value: '0800 80 70 60' },
      ],
    },
    tax: {
      title: 'Tax Resources',
      resources: [
        { type: 'helpline', label: 'HMRC Helpline', value: '0300 200 3300' },
        { type: 'website', label: 'HMRC Self Assessment', value: 'https://www.gov.uk/self-assessment-tax-returns' },
      ],
    },
    constitutional: {
      title: 'Human Rights Resources',
      resources: [
        { type: 'website', label: 'Equality and Human Rights Commission', value: 'https://www.equalityhumanrights.com' },
        { type: 'website', label: 'Liberty (Civil Liberties)', value: 'https://www.libertyhumanrights.org.uk' },
      ],
    },
    corporate: {
      title: 'Corporate & Business Resources',
      resources: [
        { type: 'website', label: 'Companies House', value: 'https://www.gov.uk/government/organisations/companies-house' },
        { type: 'website', label: 'Insolvency Service', value: 'https://www.gov.uk/government/organisations/insolvency-service' },
      ],
    },
  },
};

export function getResourcesForCategory(
  jurisdiction: Jurisdiction,
  category: LegalCategory
): CategoryResources | null {
  return resourcesMap[jurisdiction]?.[category] ?? null;
}
