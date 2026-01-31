"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWikiContent } from "@/app/actions";

export default function WebPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      window.location.href = "/";
      return;
    }

    const fetchAndRedirect = async () => {
      try {
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
          const blob = new Blob([fullHtml], { type: "text/html" });
          const blobUrl = URL.createObjectURL(blob);
          window.location.replace(blobUrl);
        } else {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      }
    };

    fetchAndRedirect();
  }, [url]);

  if (error) {
    return (
      <div style={{ padding: "2rem", fontFamily: 'sans-serif', color: 'red' }}>
        <h1>Error</h1>
        <p>{error}</p>
        <a href="/">Go Back</a>
      </div>
    );
  }

  // This page is just for processing, so we show nothing.
  return null;
}
