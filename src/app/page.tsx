"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link as LinkIcon, Wand2 } from "lucide-react";

const FormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }).refine(
    (url) => url.includes("fandom.com/wiki/"),
    { message: "Please enter a Fandom wiki URL." }
  ),
});

export default function Home() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: "https://growagarden.fandom.com/wiki/Crops",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    router.push(`/web?url=${encodeURIComponent(data.url)}`);
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
                <Button type="submit" className="w-full sm:w-auto flex-shrink-0 h-11 text-base px-6">
                  Wack It!
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
