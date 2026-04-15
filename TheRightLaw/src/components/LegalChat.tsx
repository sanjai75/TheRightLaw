import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Language, t } from '@/lib/i18n';
import { SearchResult, Jurisdiction } from '@/data/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LegalChatProps {
  language: Language;
  query: string;
  jurisdiction: Jurisdiction;
  results: SearchResult[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`;

async function streamChat({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  context: any;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError('No response body');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  onDone();
}

export default function LegalChat({ language, query, jurisdiction, results }: LegalChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Build context from search results
  const chatContext = {
    query,
    jurisdiction,
    results: results.slice(0, 8).map((r) => ({
      actName: r.act.name,
      year: r.act.year,
      confidence: r.confidence,
      explanation: r.aiExplanation,
      sections: r.matchedSections.map((s) => ({
        number: s.sectionNumber,
        title: s.title,
      })),
    })),
  };

  // Send initial greeting when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: ChatMessage = {
        role: 'assistant',
        content:
          language === 'en'
            ? `I've analyzed your query: **"${query}"** and found ${results.length} relevant legal frameworks. I can help you understand:\n\n- What these laws mean for your situation\n- What steps you can take\n- Where to get official help\n\nWhat would you like to know more about?`
            : `मैंने आपकी क्वेरी का विश्लेषण किया: **"${query}"** और ${results.length} प्रासंगिक कानूनी ढांचे पाए। मैं आपकी मदद कर सकता हूँ:\n\n- ये कानून आपकी स्थिति के लिए क्या मायने रखते हैं\n- आप कौन से कदम उठा सकते हैं\n- आधिकारिक मदद कहाँ मिलेगी\n\nआप किस बारे में और जानना चाहेंगे?`,
      };
      setMessages([greeting]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length === newMessages.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      // Send only user/assistant messages (not the initial greeting context)
      await streamChat({
        messages: newMessages.filter((m) => m.role === 'user' || m.role === 'assistant'),
        context: chatContext,
        onDelta: updateAssistant,
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: language === 'en' ? `⚠️ ${err}. Please try again.` : `⚠️ ${err}. कृपया पुनः प्रयास करें।`,
            },
          ]);
          setIsStreaming(false);
        },
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: language === 'en' ? '⚠️ Connection error. Please try again.' : '⚠️ कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।',
        },
      ]);
      setIsStreaming(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">
          {language === 'en' ? 'Ask AI about these laws' : 'इन कानूनों के बारे में AI से पूछें'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col transition-all duration-300 ${
        isExpanded
          ? 'inset-4'
          : 'bottom-4 right-4 w-[95vw] sm:w-[420px] h-[70vh] max-h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold text-sm text-foreground">
            {language === 'en' ? 'Legal Assistant' : 'कानूनी सहायक'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setIsExpanded(false);
            }}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Disclaimer toggle */}
      {showDisclaimer && (
        <div className="px-3 py-2 bg-accent/10 border-b border-border flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-tight flex-1">
            {language === 'en'
              ? 'This AI provides general legal information only. Always consult a qualified lawyer.'
              : 'यह AI केवल सामान्य कानूनी जानकारी प्रदान करता है। हमेशा एक योग्य वकील से परामर्श करें।'}
          </p>
          <button
            onClick={() => setShowDisclaimer(false)}
            className="text-[10px] text-muted-foreground underline shrink-0 hover:text-foreground"
          >
            {language === 'en' ? 'Dismiss' : 'बंद करें'}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                <User className="h-3.5 w-3.5 text-accent" />
              </div>
            )}
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-secondary rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Ask about these laws...'
                : 'इन कानूनों के बारे में पूछें...'
            }
            disabled={isStreaming}
            className="flex-1 px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
