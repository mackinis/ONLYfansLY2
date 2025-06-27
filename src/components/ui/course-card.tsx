
'use client';

import type { Course as CourseFromService } from '@/services/courseService';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, CalendarDays, Tag, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import { CourseVideoPlayer } from './CourseVideoPlayer';

const DialogTitle = DialogTitleComponent;

export interface Course extends CourseFromService {
  dataAiHint?: string;
}

export function CourseCard({ course }: { course: Course }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasModalContent = course.courseVideoUrl || course.videoPreviewUrl || course.imageUrl;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full rounded-lg w-full max-w-sm bg-card">
        <CardHeader className="p-0 relative">
          <DialogTrigger asChild disabled={!hasModalContent}>
            <div className={`block group ${hasModalContent ? 'cursor-pointer' : ''}`}>
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
                {hasModalContent && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-16 w-16 text-white/80" />
                  </div>
                )}
              </div>
            </div>
          </DialogTrigger>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <DialogTrigger asChild disabled={!hasModalContent}>
             <button className={`text-left w-full ${hasModalContent ? 'cursor-pointer' : ''}`} disabled={!hasModalContent}>
              <CardTitle className="font-headline text-xl mb-2 hover:text-primary transition-colors">{course.title}</CardTitle>
            </button>
          </DialogTrigger>
          <CardDescription className="text-sm text-muted-foreground mb-3 font-body line-clamp-3">{course.description}</CardDescription>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {course.price && <span className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-primary" /> {course.price}</span>}
            {course.duration && <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-primary" /> {course.duration}</span>}
            {course.date && <span className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1.5 text-primary" /> {course.date}</span>}
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <DialogTrigger asChild>
            <Button className="w-full" disabled={!hasModalContent}>Ver</Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      
      {hasModalContent && (
        <DialogContent className="max-w-3xl p-0 border-0 bg-black">
            <DialogHeader className="sr-only">
              <DialogTitle>{course.title}</DialogTitle>
              <DialogDescription>{course.description || "Video del curso"}</DialogDescription>
            </DialogHeader>
            <div className="aspect-video">
               <CourseVideoPlayer key={course.id} url={course.courseVideoUrl || course.videoPreviewUrl || ''} className="w-full h-full rounded-lg" />
            </div>
            <DialogClose />
        </DialogContent>
      )}
    </Dialog>
  );
}
