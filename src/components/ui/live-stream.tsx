
interface LiveStreamProps {
  streamUrl: string;
  title?: string;
}

function isIframeString(str: string): boolean {
  const trimmedStr = str.trim().toLowerCase();
  return trimmedStr.startsWith("<iframe") && trimmedStr.endsWith("</iframe>");
}

export function LiveStream({ streamUrl, title = "Live Stream" }: LiveStreamProps) {
  if (!streamUrl) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">Live stream is currently offline or not configured.</p>
      </div>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center text-primary">
          {title}
        </h2>
        <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl border border-primary/30">
          {isIframeString(streamUrl) ? (
            <div dangerouslySetInnerHTML={{ __html: streamUrl }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
          ) : (
            <iframe
              src={streamUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          )}
        </div>
      </div>
    </section>
  );
}
