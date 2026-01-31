import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Content Wacker',
  description: 'An all-purpose content extractor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
