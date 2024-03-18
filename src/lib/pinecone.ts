import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import md5 from 'md5';
import {
  Document,
  RecursiveCharacterTextSplitter,
} from '@pinecone-database/doc-splitter';
import { getEmbeddings } from './embeddings';
import { convertToAscii, delay } from './utils';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

type PDFPage = {
  pageContent: string;
  metadata: { loc: { pageNumber: number } };
};

let isProcessing = false;

export async function loadS3BatchIntoPinecone(
  file_keys: string[],
  documentKey: string
) {
  // 1. Obtain PDF - download
  console.log('downloading from s3');
  const file_names = await Promise.all(
    file_keys.map((file_key) => downloadFromS3(file_key))
  );

  if (file_names.find((name) => !name)) {
    throw new Error('could not download from s3');
  }

  // 2. read pdf in paragraphs using langchain PDFLoader
  const loaders = file_names.map((file_name) => new PDFLoader(file_name!));
  const pages = await Promise.all(loaders.map((loader) => loader.load()));
  const allPages = pages.flat() as PDFPage[];

  // 3. split and segment the pdf into logical segments
  const segments = await Promise.all(
    allPages.map((page) => prepareDocument(page))
  );

  const allSegment = segments.flat().flat();
  // 4. vectorise and embed individual splitted segments
  const vectors = await embedAllDocumentsWithRetry(allSegment);

  // 5. upload to pinecone
  const pineconeIndex = pc.Index('learnpdf');
  console.log('inserting vectors to pinecone');
  const namespace = convertToAscii(documentKey);
  await pineconeIndex.namespace(namespace).upsert(vectors);

  return segments[0];
}

export async function loadS3IntoPinecone(file_key: string) {
  // 1. Obtain PDF - download
  console.log('downloading from s3');
  const file_name = await downloadFromS3(file_key);

  if (!file_name) {
    throw new Error('could not download from s3');
  }
  // 2. read pdf in paragraphs using langchain PDFLoader
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 3. split and segment the pdf into logical segments
  const segments = await Promise.all(
    pages.map((page) => prepareDocument(page))
  );

  // 4. vectorise and embed individual splitted segments
  const vectors = await Promise.all(
    segments.flat().map((doc) => embedDocument(doc))
  );

  // 5. upload to pinecone
  const pineconeIndex = pc.Index('learnpdf');
  console.log('inserting vectors to pinecone');
  const namespace = convertToAscii(file_key);
  await pineconeIndex.namespace(namespace).upsert(vectors);

  return segments[0];
}

async function prepareDocument(docChunk: PDFPage) {
  let { pageContent, metadata } = docChunk;
  pageContent = pageContent.replace(/\n/g, '');

  const splitter = new RecursiveCharacterTextSplitter();
  const segments = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        //pinecone can only handle upto 36000 bytes so we truncate the paragraph
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return segments;
}

export function truncateStringByBytes(str: string, bytes: number) {
  const enc = new TextEncoder();
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
}

async function embedDocument(doc: Document) {
  const maxRetries = 3; // Maximum number of retries
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(new Date(Date.now()).toLocaleString());
      const embeddings = await getEmbeddings(doc.pageContent);
      const hash = md5(doc.pageContent);
      return {
        id: hash,
        values: embeddings,
        metadata: {
          text: doc.metadata.text,
          pageNumber: doc.metadata.pageNumber,
        },
      } as PineconeRecord;
    } catch (error: any) {
      if (error.code === 'rate_limit_exceeded') {
        await delay(60000); // Delay in milliseconds (adjust as needed)
        retryCount++;
      } else {
        // If error is not rate_limit_exceeded, rethrow the error
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

async function embedAllDocumentsWithRetry(allSegment: Document[]) {
  const vectors = [];

  for (const doc of allSegment) {
    while (isProcessing) {
      console.log('Another document is being processed. Waiting...');
      await delay(1000);
    }

    isProcessing = true;

    try {
      const embeddings = await embedDocument(doc);
      vectors.push(embeddings); // Add embeddings to the vectors array
    } finally {
      isProcessing = false;
    }
  }

  return vectors;
}
