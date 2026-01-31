import { Suspense } from 'react';
import { getWikiContent } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function WikiContent({ url }: { url: string | undefined }) {
  if (!url) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No URL provided. Please go back and enter a URL.</AlertDescription>
      </Alert>
    );
  }

  const result = await getWikiContent(url);

  if (!result.success) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Extraction Failed</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-lg w-full mt-8 transition-opacity duration-500 animate-in fade-in-50">
      <CardHeader>
         <CardTitle className="text-3xl font-headline">{result.title || 'Extracted Content'}</CardTitle>
         <CardDescription>
           Content extracted from <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{url}</a>
         </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="wiki-content"
          dangerouslySetInnerHTML={{ __html: result.content }}
        />
      </CardContent>
    </Card>
  );
}

export default function WebPage({ searchParams }: { searchParams: { url?: string } }) {
  const url = searchParams.url;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background font-body">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-between w-full">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground font-headline">
              Wiki Viewer
            </h1>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Link>
            </Button>
        </div>
        
        <Suspense fallback={
          <div className="flex flex-col justify-center items-center py-20 gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Wacking the wiki... please wait...</p>
          </div>
        }>
          {/* @ts-expect-error Server Component is fine here */}
          <WikiContent url={url} />
        </Suspense>
      </div>
    </main>
  );
}
