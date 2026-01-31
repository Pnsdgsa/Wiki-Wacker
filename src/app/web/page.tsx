"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWikiContent } from "@/app/actions";

export default function WebPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const [page, setPage] = useState<{ title: string, content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function processUrl() {
      if (!url) {
        setError("No URL provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getWikiContent(url);
        if (result.success) {
          setPage({ title: result.title, content: result.content });
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
  
  if (!page) {
    return (
        <div style={{ padding: "2rem" }}>
            <h1>Error</h1>
            <p>No content was loaded.</p>
            <a href="/">Go Back</a>
        </div>
    );
  }

  return (
    <div style={{padding: '2rem'}}>
      <h1>{page.title}</h1>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
