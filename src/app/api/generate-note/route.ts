import { getContext } from '@/lib/context';
import { db } from '@/lib/db';
import { $notes, $template, documents } from '@/lib/db/schema';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai-edge';

export const runtime = 'edge';
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });

const openai = new OpenAIApi(config);
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { noteId, title, templateId, customTemplate } = body.data;

    if (!noteId || !title || (!templateId && !customTemplate)) {
      return new NextResponse('missing URL params', { status: 400 });
    }
    noteId = parseInt(noteId);
    //get db note object
    const notes = await db.select().from($notes).where(eq($notes.id, noteId));
    if (notes.length != 1) {
      return NextResponse.json({ error: 'note not found' }, { status: 404 });
    }
    const note = notes[0];

    let template;
    if (templateId) {
      templateId = parseInt(templateId);
      //get template object
      const templates = await db
        .select()
        .from($template)
        .where(eq($template.id, templateId));
      if (templates.length != 1) {
        return NextResponse.json(
          { error: 'template not found' },
          { status: 404 }
        );
      }
      template = templates[0];
    } else {
      template = customTemplate;
    }
    const _documents = await db
      .select()
      .from(documents)
      .where(eq(documents.id, note.documentId));
    if (_documents.length !== 1) {
      return NextResponse.json(
        { error: 'document not found' },
        { status: 404 }
      );
    }
    const context = await getContext(title, _documents[0].documentKey);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
          The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
          AI is a well-behaved and well-mannered individual.
          AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
          The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
          AI assistant is a big fan of Pinecone and Vercel.
          START CONTEXT BLOCK
          ${context}
          END OF CONTEXT BLOCK
          START STRUCTURE BLOCK
          ${template.id ? template.content : template}
          END OF STRUCTURE BLOCK
          AI assistant will take into account any CONTEXT BLOCK that is provided and generate a ${
            template.id ? template.templateName : 'writing'
          } 
          following the structure provided in STRUCTURE BLOCK.
          AI assistant will generate content along with its HTML Tags.
          If the context does not provide the necessary information, the AI assistant will expand using its large corpus knowledge.
          AI assistant will include the context as citation with APA in-text citation style.
          `,
        },
        {
          role: 'user',
          content: `
            I am writing in a notion text editor app.
            Help me complete my writing with title of: ##${title}##
            keep the tone of the text consistent.
            `,
        },
      ],
      stream: true,
    });
    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        //save system message into db
        await db
          .update($notes)
          .set({ content: completion })
          .where(eq($notes.id, noteId));
      },
    });

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
