import React, { useEffect, useState } from 'react';
import { Progress } from './ui/progress';

type Props = {
  progressCount: number;
};

const VectorStatusProgress = ({ progressCount }: Props) => {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(progressCount), 500);
    return () => clearTimeout(timer);
  }, [progressCount]);

  return (
    <div className="gap-1 m-2 text-sm">
      <span>AI sedang mencerna...</span>
      <Progress value={progress} />
    </div>
  );
};

export default VectorStatusProgress;
