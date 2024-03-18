'use client';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { File } from '@/lib/db/schema';
import toast from 'react-hot-toast';

type Props = {
  documentId: number;
};

const PDFViewer = ({ documentId }: Props) => {
  let [fileURLs, setFileURLs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      async function fetchFiles() {
        try {
          setIsLoading(true);
          const response = await axios.post<File[]>('/api/get-files', {
            documentId,
          });

          const _files = response.data.map((file) => file.fileUrl);
          setFileURLs(_files);
        } catch (error) {
          toast.error('Error fetching the files');
        } finally {
          setIsLoading(false);
        }
      }

      fetchFiles();
    },
    [documentId]
  );

  return (
    <div className="h-full">
      {isLoading && (
        <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      {!isLoading &&
        fileURLs?.map((url) => (
          <iframe
            key={url}
            src={`https://docs.google.com/gview?url=${url}&embedded=true`}
            className="w-full h-full"
          ></iframe>
        ))}
    </div>
  );
};

export default PDFViewer;
