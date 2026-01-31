"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Link as LinkIcon, AlertCircle, Wand2 } from "lucide-react";

import { getWikiContent } from "./actions";

const FormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }).refine(
    (url) => url.includes("fandom.com/wiki/"),
    { message: "Please enter a Fandom wiki URL." }
  ),
});

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: "https://growagarden.fandom.com/wiki/Crops",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(null);
    setContent(null);
    setPageTitle(null);

    startTransition(async () => {
      const result = await getWikiContent(data.url);
      if (result.success) {
        setContent(result.content);
        setPageTitle(result.title);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background font-body">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <Wand2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground font-headline">
            Wiki Wacker
          </h1>
          <p className="text-lg text-muted-foreground">
            Paste a Fandom.com wiki page URL to magically extract its content.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="sr-only">URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="https://your-wiki.fandom.com/wiki/Page_Title" {...field} className="pl-11 h-11 text-base" />
                        </div>
                      </FormControl>
                      <FormMessage className="pt-1" />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto flex-shrink-0 h-11 text-base px-6">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Wacking...
                    </>
                  ) : (
                    "Wack It!"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isPending && (
          <div className="flex flex-col justify-center items-center py-10 gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Extracting content, please wait...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Extraction Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {content && (
          <Card className="mt-8 transition-opacity duration-500 animate-in fade-in-50 shadow-lg">
            <CardHeader>
               <CardTitle className="text-3xl font-headline">{pageTitle || 'Extracted Content'}</CardTitle>
               <CardDescription>Content extracted from the provided URL.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="wiki-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
