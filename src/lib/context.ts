import { Pinecone } from '@pinecone-database/pinecone';
import { convertToAscii } from './utils';
import { getEmbeddings } from './embeddings';

export async function getMatchingVectors(
  embeddings: number[],
  document_key: string
) {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = await pc.index('learnpdf');
  try {
    const namespace = convertToAscii(document_key);

    const queryResult = await index.namespace(namespace).query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log('error searching pinecone vectors', error);
    throw error;
  }
}
export async function getContext(query: string, document_key: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matchingVectors = await getMatchingVectors(
    queryEmbeddings,
    document_key
  );

  const qualifiedResult = matchingVectors.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifiedResult.map((res) => (res.metadata as Metadata).text);

  return docs.join('\n').substring(0, 3000);
}
