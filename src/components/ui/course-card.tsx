
'use client';

import type { Course as CourseFromService } from '@/services/courseService';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, CalendarDays, Tag, PlayCircle, Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { CourseVideoPlayer } from './CourseVideoPlayer';
import { ScrollArea } from './scroll-area';

const DialogTitle = DialogTitleComponent;

export interface Course extends CourseFromService {
  dataAiHint?: string;
}

// Helper function to format duration
const formatDuration = (durationStr: string | undefined): string | null => {
  if (!durationStr) return null;

  // Check if the string is purely numeric
  if (/^\d+$/.test(durationStr)) {
    const totalMinutes = parseInt(durationStr, 10);
    if (isNaN(totalMinutes)) return durationStr; // Return original if not a number

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes} min.`;
    } else {
      return `${totalMinutes} min.`;
    }
  }
  
  // Return the original string if it contains non-numeric characters (e.g., "A tu ritmo")
  return durationStr;
};


export function CourseCard({ course }: { course: Course }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const hasVideo = !!course.courseVideoUrl;
  const hasDiscount = course.finalPrice && course.finalPrice.trim() !== '' && course.finalPrice !== course.price;
  
  const handleWatchVideoClick = () => {
    setIsDetailsModalOpen(false); // Close details if open
    if (hasVideo) {
      setIsVideoModalOpen(true);
    }
  };

  const formattedDuration = formatDuration(course.duration);

  return (
    <>
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300 h-full rounded-lg w-full max-w-sm bg-card border border-border/50 group">
        
        <CardHeader 
          className="p-0 relative cursor-pointer"
          onClick={() => hasVideo ? setIsVideoModalOpen(true) : setIsDetailsModalOpen(true)}
          role="button"
          aria-label={`Ver video del curso ${course.title}`}
        >
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              {course.videoPreviewUrl ? (
                 <CourseVideoPlayer 
                    url={course.videoPreviewUrl}
                    isPreview={true}
                    className="w-full h-full object-cover"
                  />
              ) : (
                <Image
                  src={course.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(course.title)}`}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{objectFit: "cover"}}
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={course.dataAiHint || "education technology"}
                />
              )}
              {hasVideo && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-16 w-16 text-white/80" />
                </div>
              )}
            </div>
        </CardHeader>
        
        <div 
          className="p-4 flex-grow flex flex-col cursor-pointer"
          onClick={() => setIsDetailsModalOpen(true)}
          role="button"
          aria-label={`Ver detalles del curso ${course.title}`}
        >
          <CardTitle className="font-headline text-xl mb-2 hover:text-primary transition-colors">{course.title}</CardTitle>
          <div className="flex-grow">
            <CardDescription className="text-sm text-muted-foreground mb-3 font-body line-clamp-2">{course.description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-base text-muted-foreground mt-auto pt-2">
            {formattedDuration && <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-primary" /> {formattedDuration}</span>}
            {course.date && <span className="flex items-center"><CalendarDays className="w-4 h-4 mr-1.5 text-primary" /> {course.date}</span>}
          </div>
        </div>
        
        <CardFooter className="p-4 border-t border-border/30 flex justify-between items-center">
          <div 
            className="flex flex-col items-start cursor-pointer"
            onClick={() => setIsDetailsModalOpen(true)}
            role="button"
          >
            {hasDiscount && (
              <span className="line-through text-muted-foreground text-xs">
                {course.price}
              </span>
            )}
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1 text-primary" />
              <span className="text-lg font-bold text-primary">
                {hasDiscount ? course.finalPrice : course.price}
              </span>
            </div>
          </div>
          <Button 
            className="w-auto" 
            onClick={() => setIsDetailsModalOpen(true)} 
            size="sm"
          >
              <PlayCircle className="mr-2 h-4 w-4" /> Ver Curso
          </Button>
        </CardFooter>
      </Card>
      
      {hasVideo && (
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
            <DialogContent className="max-w-3xl w-full p-0 border-0 bg-black">
                <DialogHeader className="sr-only">
                  <DialogTitle>{`Video del curso: ${course.title}`}</DialogTitle>
                  <DialogDescription>Reproductor de video para el curso seleccionado.</DialogDescription>
                </DialogHeader>
                <div className="aspect-video">
                   <CourseVideoPlayer key={course.id} url={course.courseVideoUrl!} className="w-full h-full rounded-lg" />
                </div>
            </DialogContent>
        </Dialog>
      )}

       <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-[90vw] bg-card border-primary/30 shadow-xl p-0 max-h-[90vh] flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
                <DialogTitle className="font-headline text-2xl text-primary">{course.title}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow overflow-y-auto">
                <div className="p-6 space-y-4">
                    <div className="relative aspect-video w-full rounded-md overflow-hidden border border-border">
                        {course.videoPreviewUrl ? (
                           <CourseVideoPlayer 
                                url={course.videoPreviewUrl}
                                isPreview={true}
                                className="w-full h-full object-cover"
                            />
                        ) : course.imageUrl ? (
                             <Image
                                src={course.imageUrl}
                                alt={course.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{objectFit: "cover"}}
                            />
                        ) : (
                             <Image
                                src={`https://placehold.co/600x400.png?text=Preview`}
                                alt={course.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{objectFit: "cover"}}
                            />
                        )}
                    </div>
                    <h3 className="font-semibold text-lg mt-4">Descripción</h3>
                    <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {course.description}
                    </p>
                </div>
            </ScrollArea>
             <DialogFooter className="p-6 border-t border-border flex-shrink-0 sm:justify-between items-center">
                 <div>
                    {hasDiscount && (
                        <span className="line-through text-muted-foreground text-sm mr-2">
                        {course.price}
                        </span>
                    )}
                    <span className="text-lg font-semibold text-primary">
                        {hasDiscount ? course.finalPrice : course.price}
                    </span>
                 </div>
                <Button onClick={handleWatchVideoClick} disabled={!hasVideo} className="w-full sm:w-auto mt-2 sm:mt-0">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Ver Video del Curso
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
