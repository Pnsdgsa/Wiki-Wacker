import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Wiki Wacker',
  description: 'A Fandom.com wiki content extractor',
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
