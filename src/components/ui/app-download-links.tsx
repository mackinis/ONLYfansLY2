import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface AppLinkProps {
  url?: string;
  Icon?: LucideIcon;
  brand?: string;
}

interface AppDownloadLinksProps {
  android?: AppLinkProps;
  ios?: AppLinkProps;
  title?: string;
}

export function AppDownloadLinks({ 
  android = siteConfig.appDownloadLinks.android, 
  ios = siteConfig.appDownloadLinks.ios,
  title = "Download Our App"
}: AppDownloadLinksProps) {
  
  if (!android?.url && !ios?.url) {
    return null; // Don't render if no links are configured
  }

  return (
    <section className="py-12 md:py-20 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-primary">{title}</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
          {android?.url && android.Icon && (
            <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 hover:text-primary transition-colors">
              <Link href={android.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <android.Icon className="w-6 h-6" />
                <span>Get it on <span className="font-semibold">{android.brand || 'Android'}</span></span>
              </Link>
            </Button>
          )}
          {ios?.url && ios.Icon && (
             <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 hover:text-primary transition-colors">
              <Link href={ios.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ios.Icon className="w-6 h-6" />
                <span>Download on the <span className="font-semibold">{ios.brand || 'iOS'}</span></span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
