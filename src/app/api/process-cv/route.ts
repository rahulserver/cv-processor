import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, parseCV } from '@/lib/pdf/parser';
import { promises as fs } from 'fs';
import path from 'path';
export const maxDuration = 59;
export async function POST(req: NextRequest) {
  try {
    const filePath = path.resolve(process.cwd(), 'test/data/05-versions-space.pdf');

    // Create the file if it doesn't exist
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure directory exists
      await fs.writeFile(filePath, ''); // Create an empty file
    }
  
  
    const formData = await req.formData();
    let text: string;

    // Check if using sample CV
    const useSample = formData.get('useSample');
    if (useSample) {
      // Read sample CV from public directory
      const samplePath = path.join(process.cwd(), 'public/resources', 'sample-cv.pdf');
      const buffer = await fs.readFile(samplePath);
      text = await extractTextFromPDF(buffer);
    } else {
      const file = formData.get('cv') as File;
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Convert uploaded File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      text = await extractTextFromPDF(buffer);
    }

    // Process CV with our AI agent
    const processedCV = await parseCV(text);

    return NextResponse.json({
      success: true,
      data: processedCV
    });

  } catch (error) {
    console.error('Error processing CV:', error);
    return NextResponse.json(
      { error: 'Failed to process CV' },
      { status: 500 }
    );
  }
}

export async function GET() {
    return NextResponse.json({ message: 'GET method works!' });
}
  