import { NextRequest, NextResponse } from 'next/server';
import { getWikiContent } from '@/app/actions';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head><title>Error</title></head>
      <body>
        <h1>Error</h1>
        <p>No URL provided.</p>
        <a href="/">Go Back</a>
      </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const result = await getWikiContent(url);

  if (result.success) {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${result.title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; margin: 0 auto; max-width: 900px; padding: 1rem 2rem; }
          img { height: auto; max-width: 100%; }
          a { color: #0645ad; }
          table { border-collapse: collapse; font-size: 0.9em; margin: 1.5rem 0; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .mw-parser-output .toc { background-color: #f8f9fa; border: 1px solid #a2a9b1; display: table; margin-bottom: 1em; padding: 1em; }
        </style>
      </head>
      <body>
        ${result.content}
      </body>
      </html>
    `;
    return new NextResponse(fullHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } else {
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head><title>Error</title></head>
      <body>
        <h1>Error</h1>
        <p>${result.error}</p>
        <a href="/">Go Back</a>
      </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
