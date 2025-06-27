import type { Metadata } from 'next';
import { Belleza, Alegreya } from 'next/font/google';
import './globals.css';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { WhatsAppWidget } from '@/components/ui/whatsapp-widget';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

const fontHeadline = Belleza({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-headline',
});

const fontBody = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <Toaster />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
