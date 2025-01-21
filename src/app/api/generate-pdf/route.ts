import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { ParsedCV } from '@/lib/pdf/types';

export async function POST(req: NextRequest) {
  try {
    const data: ParsedCV = await req.json();
    
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Generate HTML content
    const html = generateHTML(data);
    await page.setContent(html);
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      printBackground: true
    });
    
    await browser.close();
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=cv.pdf'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generateHTML(cv: ParsedCV): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Add your CSS styles here */
          body { font-family: Arial, sans-serif; }
          h1, h2 { color: #333; }
          ul { padding-left: 20px; }
          /* ... more styles ... */
        </style>
      </head>
      <body>
        <h1>${cv.firstName}</h1>
        <hr/>
        
        <h2>Summary</h2>
        <p>${cv.objective}</p>
        
        <h2>Skills</h2>
        <ul>
          ${Object.entries(cv.skills).map(([category, skills]) => `
            <li><strong>${category}:</strong> ${skills}</li>
          `).join('')}
        </ul>
        
        <h2>Experience</h2>
        ${cv.experience.map(exp => `
          <div>
            <p><strong>${exp.position}</strong></p>
            <p>${exp.company} | ${exp.period}</p>
            <ul>
              ${exp.responsibilities.map(resp => `
                <li>${resp}</li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
        
        ${cv.education.length ? `
          <h2>Education</h2>
          ${cv.education.map(edu => `
            <div>
              <p><strong>${edu.qualification}</strong></p>
              <p>${edu.institution} - ${edu.completionDate}</p>
            </div>
          `).join('')}
        ` : ''}
      </body>
    </html>
  `;
} 