import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface FeedbackButtonsProps {
  actId: string;
  query: string;
}

export default function FeedbackButtons({ actId, query }: FeedbackButtonsProps) {
  const { addFeedback, getFeedback } = useAppStore();
  const existing = getFeedback(actId, query);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleFeedback = (helpful: boolean) => {
    addFeedback({ actId, query, helpful, comment: comment || undefined });
    setShowComment(false);
    setComment('');
  };

  if (existing) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {existing.helpful ? (
          <ThumbsUp className="h-3.5 w-3.5 text-confidence-high fill-current" />
        ) : (
          <ThumbsDown className="h-3.5 w-3.5 text-confidence-low fill-current" />
        )}
        <span>{existing.helpful ? 'Helpful' : 'Not helpful'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleFeedback(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        title="Helpful"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setShowComment(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        title="Not helpful"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
      {showComment && (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Why? (optional)"
            className="text-xs px-2 py-1 bg-secondary border border-border rounded w-40"
            onKeyDown={(e) => e.key === 'Enter' && handleFeedback(false)}
          />
          <button
            onClick={() => handleFeedback(false)}
            className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded hover:bg-destructive/20"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
