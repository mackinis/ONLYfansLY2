
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getActivePopups, type Popup } from '@/services/popupService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { CourseVideoPlayer } from './CourseVideoPlayer';
import { Button } from './button';
import { X } from 'lucide-react';

export function HomepagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupToShow, setPopupToShow] = useState<Popup | null>(null);

  useEffect(() => {
    const checkAndShowPopup = async () => {
      try {
        const popups = await getActivePopups();
        if (popups.length > 0) {
          const firstPopup = popups[0];
          
          if (firstPopup.displayRule === 'once_per_session') {
            const popupShown = sessionStorage.getItem(`popup_${firstPopup.id}`);
            if (!popupShown) {
              setPopupToShow(firstPopup);
              setIsOpen(true);
              sessionStorage.setItem(`popup_${firstPopup.id}`, 'true');
            }
          } else { // 'always'
            setPopupToShow(firstPopup);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error fetching or displaying popup:", error);
      }
    };

    // Delay showing the popup slightly to not be too intrusive on page load.
    const timer = setTimeout(checkAndShowPopup, 1500); 
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen || !popupToShow) {
    return null;
  }

  const { type, contentTitle, contentText, imageUrl, videoUrl } = popupToShow;
  const hasTextContent = contentTitle || contentText;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl w-full p-0 border-0 shadow-2xl rounded-lg overflow-hidden grid-cols-1 grid data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
        
        { (type.includes('image') && imageUrl) && (
          <div className="relative aspect-video w-full">
            <Image src={imageUrl} alt={contentTitle || "Popup Image"} fill style={{objectFit: 'cover'}} data-ai-hint="advertisement promotion"/>
          </div>
        )}

        { (type.includes('video') && videoUrl) && (
          <div className="aspect-video w-full bg-black">
            <CourseVideoPlayer url={videoUrl} className="w-full h-full" isPreview={false} />
          </div>
        )}

        {hasTextContent ? (
          <DialogHeader className="p-6 text-center">
            {contentTitle && <DialogTitle className="text-2xl font-headline text-primary mb-2">{contentTitle}</DialogTitle>}
            {contentText && <DialogDescription className="text-base text-muted-foreground">{contentText}</DialogDescription>}
          </DialogHeader>
        ) : (
          <DialogHeader className="sr-only">
            <DialogTitle>{popupToShow.title}</DialogTitle>
            <DialogDescription>
              {popupToShow.imageUrl ? "Popup with image" : "Popup with video"}
            </DialogDescription>
          </DialogHeader>
        )}

        <DialogClose asChild>
            <button className="absolute right-2 top-2 rounded-full p-1.5 bg-black/40 text-white hover:bg-black/60 transition-colors z-10" aria-label="Cerrar">
                <X className="h-5 w-5" />
            </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
