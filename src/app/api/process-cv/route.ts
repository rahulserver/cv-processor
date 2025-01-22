import { NextRequest } from 'next/server';
import { TransformStream } from 'stream/web';
import { promises as fs } from 'fs';
import path from 'path';
import { extractTextFromPDF, parseCV } from '@/lib/pdf/parser';
export const runtime = 'edge';
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendProgress = async (message: string, percentage: number) => {
    const data = JSON.stringify({ message, percentage });
    await writer.write(encoder.encode(`data: ${data}\n\n`));
  };

  try {
    // Send response early to allow the frontend to start receiving updates
    const response = new Response(stream.readable as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });

    setTimeout(async () => {
      try {
        await sendProgress('Starting CV processing...', 10);

        const formData = await req.formData();
        let text: string;

        // Check if using sample CV
        const useSample = formData.get('useSample');
        if (useSample) {
          await sendProgress('Loading sample CV...', 20);
          const samplePath = path.join(
            process.cwd(),
            'public/resources',
            'sample-cv.pdf',
          );
          const buffer = await fs.readFile(samplePath);
          text = await extractTextFromPDF(buffer);
        } else {
          await sendProgress('Reading uploaded CV...', 20);
          const file = formData.get('cv') as File;
          if (!file) {
            throw new Error('No file provided');
          }
          const buffer = Buffer.from(await file.arrayBuffer());
          text = await extractTextFromPDF(buffer);
        }

        await sendProgress('Extracting text from PDF...', 40);

        await sendProgress('Analyzing CV content...', 60);
        // TODO: add progress updates to parseCV as well maintaining the progress percentage
        const processedCV = await parseCV(text, sendProgress);

        await sendProgress('Finalizing results...', 90);

        // Send the final result
        const finalResult = JSON.stringify({
          success: true,
          data: processedCV,
          done: true,
        });
        await writer.write(encoder.encode(`data: ${finalResult}\n\n`));
        await writer.close();
      } catch (error) {
        console.error('Error processing CV:', error);
        const errorMessage = JSON.stringify({
          error: 'Failed to process CV',
          done: true,
        });
        await writer.write(encoder.encode(`data: ${errorMessage}\n\n`));
        await writer.close();
      }
    }, 0);

    return response;
  } catch (error) {
    console.error('Error initializing CV processing:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
