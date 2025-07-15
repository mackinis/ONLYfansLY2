
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Story } from '@/services/storyService'; 
import { UserCircle, Video, Maximize } from 'lucide-react'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog'; // Added DialogTrigger

interface StoryCardProps {
  story: Story;
  defaultVideoPreviewUrl?: string; // Passed from homepage if configured
}

function isIframeString(str: string): boolean {
  if (!str) return false;
  const trimmedStr = str.trim().toLowerCase();
  return trimmedStr.startsWith("<iframe") && trimmedStr.endsWith("</iframe>");
}

export function StoryCard({ story, defaultVideoPreviewUrl }: StoryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Updated logic for display image
  let displayImageUrl = "https://placehold.co/300x500/777/FFFFFF.png?text=Story"; // Default placeholder
  if (story.imageUrl) {
    displayImageUrl = story.imageUrl;
  } else if (story.videoUrl) {
    // Use story-specific preview if available, otherwise fall back to global default
    displayImageUrl = story.videoPreviewUrl || defaultVideoPreviewUrl || "https://placehold.co/300x500/FF69B4/FFFFFF.png?text=Video+Preview";
  }
  
  const dataAiHint = story.imageUrl ? 'story image' : story.videoUrl ? 'story video preview' : 'placeholder';

  const hasVideoContent = !!story.videoUrl;

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Card 
            className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group aspect-[9/16] flex flex-col bg-card cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="relative flex-grow w-full h-full">
              <Image
                src={displayImageUrl}
                alt={story.caption || `Story by ${story.userName}`}
                fill // Changed layout="fill" to fill attribute for Next 13+ Image
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Added sizes attribute
                style={{ objectFit: 'cover' }} // Changed objectFit to style prop
                className="transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={dataAiHint}
              />
              {hasVideoContent && !story.imageUrl && ( // Show video icon if it's a video and no specific image is provided
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="h-12 w-12 text-white/80" />
                  </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarImage src={story.userAvatar} alt={story.userName} />
                    <AvatarFallback>
                      <UserCircle className="h-full w-full text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold text-white truncate">{story.userName}</p>
                </div>
                {story.caption && <p className="text-xs text-gray-200 line-clamp-2">{story.caption}</p>}
              </div>
               <div className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize className="h-4 w-4 text-white/90" />
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={story.userAvatar} alt={story.userName} />
                <AvatarFallback>
                  <UserCircle className="h-full w-full text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg font-semibold">{story.userName}</DialogTitle>
                {/* <DialogDescription>Timestamp or other meta if available</DialogDescription> */}
              </div>
            </div>
          </DialogHeader>
          <div className="p-4 flex-grow overflow-y-auto">
            {story.caption && <p className="text-base text-foreground whitespace-pre-wrap mb-4">{story.caption}</p>}
            
            {hasVideoContent && (
              <div className="aspect-video w-full rounded-md overflow-hidden border border-border mt-4">
                {isIframeString(story.videoUrl!) ? (
                   <div dangerouslySetInnerHTML={{ __html: story.videoUrl! }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
                ) : (
                  <iframe
                    src={story.videoUrl}
                    title={`Video by ${story.userName}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                )}
              </div>
            )}
          </div>
           <DialogClose className="absolute right-3 top-3 rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-card hover:bg-muted">
             <span className="sr-only">Close</span>
           </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
