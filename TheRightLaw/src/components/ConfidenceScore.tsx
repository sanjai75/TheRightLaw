interface ConfidenceScoreProps {
  score: number;
}

export default function ConfidenceScore({ score }: ConfidenceScoreProps) {
  const getColor = () => {
    if (score >= 70) return 'confidence-high';
    if (score >= 30) return 'confidence-medium';
    return 'confidence-low';
  };

  const getBg = () => {
    if (score >= 70) return 'bg-confidence-high/10';
    if (score >= 30) return 'bg-confidence-medium/10';
    return 'bg-confidence-low/10';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getBg()}`}>
      <div className={`w-2 h-2 rounded-full ${score >= 70 ? 'bg-confidence-high' : score >= 30 ? 'bg-confidence-medium' : 'bg-confidence-low'}`} />
      <span className={getColor()}>{score}%</span>
    </div>
  );
}
