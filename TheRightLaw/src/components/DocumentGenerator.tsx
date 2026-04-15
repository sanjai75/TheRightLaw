import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Download, Copy, Check, X, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Language } from '@/lib/i18n';
import { SearchResult, Jurisdiction } from '@/data/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

interface DocumentGeneratorProps {
  language: Language;
  query: string;
  jurisdiction: Jurisdiction;
  results: SearchResult[];
}

type DocType = 'fir' | 'complaint' | 'consumer_complaint' | 'legal_notice' | 'grievance' | 'cyber_complaint';

interface DocOption {
  type: DocType;
  labelEn: string;
  labelHi: string;
  descEn: string;
  descHi: string;
  icon: string;
}

const docOptions: DocOption[] = [
  { type: 'fir', labelEn: 'FIR / Police Complaint', labelHi: 'प्राथमिकी / पुलिस शिकायत', descEn: 'First Information Report for criminal offences', descHi: 'आपराधिक अपराधों के लिए प्राथमिकी', icon: '🚔' },
  { type: 'complaint', labelEn: 'Formal Complaint Letter', labelHi: 'औपचारिक शिकायत पत्र', descEn: 'Official complaint to authorities or organizations', descHi: 'अधिकारियों को आधिकारिक शिकायत', icon: '📝' },
  { type: 'consumer_complaint', labelEn: 'Consumer Complaint', labelHi: 'उपभोक्ता शिकायत', descEn: 'Complaint to Consumer Forum / Commission', descHi: 'उपभोक्ता मंच में शिकायत', icon: '🛒' },
  { type: 'legal_notice', labelEn: 'Legal Notice', labelHi: 'कानूनी नोटिस', descEn: 'Formal legal notice before legal action', descHi: 'कानूनी कार्रवाई से पहले नोटिस', icon: '⚖️' },
  { type: 'grievance', labelEn: 'Grievance / RTI Application', labelHi: 'शिकायत / RTI आवेदन', descEn: 'Grievance petition or Right to Information request', descHi: 'शिकायत याचिका या सूचना का अधिकार', icon: '📋' },
  { type: 'cyber_complaint', labelEn: 'Cyber Crime Complaint', labelHi: 'साइबर अपराध शिकायत', descEn: 'Online fraud, hacking, or cyber harassment report', descHi: 'ऑनलाइन धोखाधड़ी या साइबर उत्पीड़न रिपोर्ट', icon: '💻' },
];

const DOC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-document`;

export default function DocumentGenerator({ language, query, jurisdiction, results }: DocumentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const chatContext = {
    results: results.slice(0, 8).map((r) => ({
      actName: r.act.name,
      year: r.act.year,
      confidence: r.confidence,
      sections: r.matchedSections.map((s) => ({
        number: s.sectionNumber,
        title: s.title,
      })),
    })),
  };

  const generateDocument = useCallback(async (docType: DocType) => {
    setSelectedDoc(docType);
    setShowPicker(false);
    setIsOpen(true);
    setDocumentContent('');
    setIsGenerating(true);

    try {
      const resp = await fetch(DOC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          query,
          jurisdiction,
          documentType: docType,
          results: chatContext.results,
          language,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setDocumentContent(`⚠️ ${data.error || `Error ${resp.status}`}. Please try again.`);
        setIsGenerating(false);
        return;
      }

      if (!resp.body) {
        setDocumentContent('⚠️ No response. Please try again.');
        setIsGenerating(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setDocumentContent(content);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch {
      setDocumentContent('⚠️ Connection error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [query, jurisdiction, language, chatContext.results]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    // Simple text wrapping for PDF
    const lines = pdf.splitTextToSize(documentContent, maxWidth);
    let y = 20;
    const lineHeight = 5;

    for (const line of lines) {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    }

    const docLabel = docOptions.find(d => d.type === selectedDoc);
    const fileName = `${docLabel?.labelEn.replace(/\s+/g, '_') || 'Legal_Document'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const selectedDocOption = docOptions.find(d => d.type === selectedDoc);

  return (
    <>
      {/* Main button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <FileText className="h-5 w-5" />
          {language === 'en' ? 'Generate Legal Document Draft' : 'कानूनी दस्तावेज़ ड्राफ्ट बनाएं'}
          <ChevronDown className={`h-4 w-4 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
        </button>

        {/* Document type picker dropdown */}
        {showPicker && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-40 overflow-hidden">
            <div className="p-3 border-b border-border bg-secondary/50">
              <p className="text-xs font-medium text-muted-foreground">
                {language === 'en' ? 'Choose document type:' : 'दस्तावेज़ प्रकार चुनें:'}
              </p>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto">
              {docOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => generateDocument(opt.type)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/80 transition-colors text-left"
                >
                  <span className="text-lg mt-0.5">{opt.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {language === 'en' ? opt.labelEn : opt.labelHi}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'en' ? opt.descEn : opt.descHi}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document preview dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base font-display">
                <FileText className="h-5 w-5 text-primary" />
                {selectedDocOption && (language === 'en' ? selectedDocOption.labelEn : selectedDocOption.labelHi)}
                {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Disclaimer */}
          <div className="px-5 py-2 bg-accent/10 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-accent shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              {language === 'en'
                ? 'AI-generated draft — review with a legal professional before submission.'
                : 'AI-जनित ड्राफ्ट — जमा करने से पहले कानूनी पेशेवर से समीक्षा करवाएं।'}
            </p>
          </div>

          {/* Document content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            {documentContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-[13px] leading-relaxed [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm [&>p]:my-2">
                <ReactMarkdown>{documentContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                <p className="text-sm">{language === 'en' ? 'Generating your document...' : 'आपका दस्तावेज़ तैयार हो रहा है...'}</p>
              </div>
            )}
          </div>

          {/* Actions bar */}
          {documentContent && !isGenerating && (
            <div className="px-5 py-3 border-t border-border flex items-center gap-2 flex-shrink-0 bg-secondary/30">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? (language === 'en' ? 'Copied!' : 'कॉपी हो गया!') : (language === 'en' ? 'Copy Text' : 'टेक्स्ट कॉपी करें')}
              </button>
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                {language === 'en' ? 'Download PDF' : 'PDF डाउनलोड'}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
