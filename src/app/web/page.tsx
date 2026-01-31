"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWikiContent } from "@/app/actions";

export default function WebPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This object will hold the blob URL created in the current effect run.
    const currentBlobUrlRef = { current: null as string | null };

    async function processUrl() {
      if (!url) {
        setError("No URL provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setBlobUrl(null);

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
                body { font-family: sans-serif; padding: 1rem 2rem; margin: 0 auto; max-width: 900px; color: #222; line-height: 1.6; }
                img { max-width: 100%; height: auto; border-radius: 8px; }
                a { color: #0645ad; text-decoration: none; }
                a:hover { text-decoration: underline; }
                table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; font-size: 0.9em; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                pre, code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                pre { padding: 1rem; overflow-x: auto; }
                .mw-parser-output .toc { border: 1px solid #a2a9b1; background-color: #f8f9fa; padding: 1em; display: table; margin-bottom: 1em; }
                h1, h2, h3, h4, h5, h6 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.5em; }
                h1 { font-size: 2.2em; }
                h2 { font-size: 1.8em; }
                h3 { font-size: 1.5em; }
              </style>
            </head>
            <body>
              ${result.content}
            </body>
            </html>
          `;
          
          const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
          const newBlobUrl = URL.createObjectURL(htmlBlob);
          currentBlobUrlRef.current = newBlobUrl;
          setBlobUrl(newBlobUrl);

        } else {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    processUrl();

    // Cleanup function to revoke the object URL when the component unmounts or the url changes
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Loading...</h1>
        <p>Please wait while we extract the content.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Error</h1>
        <p style={{ color: "red" }}>{error}</p>
        <a href="/">Go Back</a>
      </div>
    );
  }
  
  if (blobUrl) {
    return (
        <iframe src={blobUrl} style={{ width: '100%', height: '100vh', border: 'none' }} title="Wiki Content" />
    );
  }

  return (
      <div style={{ padding: "2rem" }}>
          <h1>No content to display</h1>
          <p>There was an issue loading the content or no URL was provided.</p>
          <a href="/">Go Back</a>
      </div>
  );
}