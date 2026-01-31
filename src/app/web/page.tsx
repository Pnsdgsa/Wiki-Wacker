"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWikiContent } from "@/app/actions";

// This will be a simple helper to create a full HTML document.
function createFullHtmlPage(title: string, content: string): string {
    // Basic styling for readability, as Fandom's CSS won't be present.
    const styles = `
        body { font-family: sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; }
        img { max-width: 100%; height: auto; border-radius: 4px; }
        a { color: #0066cc; }
        h1, h2, h3 { border-bottom: 1px solid #eaeaea; padding-bottom: 0.3em; margin-top: 1.5em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        .infobox { float: right; width: 250px; border: 1px solid #ccc; padding: 0.5rem; margin-left: 1rem; background: #f9f9f9; font-size: 0.9em; }
    `;
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>${styles}</style>
        </head>
        <body>
            <h1>${title}</h1>
            <hr />
            ${content}
        </body>
        </html>
    `;
}

export default function WebPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Using a flag to prevent double-execution in React 18 Strict Mode
    let didRun = false;

    async function processUrl() {
      if (didRun || !url) return;
      didRun = true;

      try {
        const result = await getWikiContent(url);
        if (result.success) {
          const fullHtml = createFullHtmlPage(result.title, result.content);
          const blob = new Blob([fullHtml], { type: "text/html" });
          const blobUrl = URL.createObjectURL(blob);
          // Replace the current page with the blob content
          window.location.replace(blobUrl);
        } else {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      }
    }

    processUrl();
  }, [url]);

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Error</h1>
        <p style={{ color: "red" }}>{error}</p>
        <a href="/">Go Back</a>
      </div>
    );
  }
  
  if (!url) {
    return (
        <div style={{ padding: "2rem" }}>
            <h1>Error</h1>
            <p>No URL provided.</p>
            <a href="/">Go Back</a>
        </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Loading...</h1>
      <p>Please wait while we extract the content.</p>
    </div>
  );
}
