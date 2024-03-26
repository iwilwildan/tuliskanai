'use client';
import { uploadToS3 } from '@/lib/s3';
import { useMutation } from '@tanstack/react-query';
import { Inbox, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Props = {};
type pdfParams = {
  file_key: string;
  file_name: string;
};
type vectorParams = {
  pdfData: pdfParams[];
  documentKey: string;
};
const FileUpload = (props: Props) => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: pdfParams[]) => {
      const response = await axios.post('/api/create-document', {
        data,
      });
      return response.data;
    },
  });
  const { mutate: loadVector } = useMutation({
    mutationFn: async (data: vectorParams) => {
      console.log(data);
      const response = await axios.post('/api/load-vector', {
        data,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 5,
    onDrop: async (acceptedFiles) => {
      const totalSize = acceptedFiles.reduce((acc, cur) => acc + cur.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        toast.error('please upload files with total size smaller than 10MB');
        return;
      }

      try {
        setUploading(true);
        const data = (await Promise.all(
          acceptedFiles.map((file) => uploadToS3(file))
        )) as pdfParams[];
        const vectorData = { pdfData: data, documentKey: '' } as vectorParams;
        mutate(data, {
          onSuccess: ({ document_id, documentKey }) => {
            toast.success('Session created');
            router.push(`/document/${document_id}`);
            vectorData.documentKey = documentKey;
            loadVector(vectorData);
          },
          onError: (err) => {
            console.log(err);
            toast.error('error creating session');
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps()}
        className="border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col"
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Pouring sugar to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">
              Upload PDF sebagai bahan
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
