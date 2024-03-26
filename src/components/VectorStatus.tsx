'use client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import VectorStatusProgress from './VectorStatusProgress';

type Props = {
  documentId: number;
};

const VectorStatus = ({ documentId }: Props) => {
  const [vectorStatus, setVectorStatus] = useState(false);
  const [progress, setProgress] = useState(10);
  const { data } = useQuery({
    queryKey: ['vector_status', documentId],
    queryFn: async () => {
      const response = await axios.post('/api/get-vector-status', {
        documentId,
      });

      if (
        typeof response.data.isLoaded != 'undefined' &&
        response.data.isLoaded != vectorStatus
      ) {
        if (response.data.isLoaded) {
          toast('File anda sudah dicerna.');
        }
      }
      return response.data;
    },
    refetchInterval: () => (!vectorStatus ? 10000 : false),
  });
  useEffect(() => {
    if (data && typeof data.isLoaded != 'undefined') {
      setVectorStatus(data.isLoaded);
    }
    if (progress < 80) setProgress((p) => p + 10);
  }, [data]);
  return (
    <div className="flex gap-2 min-w-min">
      {!vectorStatus && <VectorStatusProgress progressCount={progress} />}
      <Badge
        variant="outline"
        className={cn('text-blue-500', {
          'text-yellow-400': !vectorStatus,
        })}
      >
        {vectorStatus ? 'AI Ready' : 'AI Not Ready'}
      </Badge>
    </div>
  );
};

export default VectorStatus;
