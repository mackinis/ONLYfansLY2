
'use client';

import React, { memo, useRef, useEffect } from 'react';

interface CourseVideoPlayerProps {
  url: string;
  isPreview?: boolean;
  className?: string;
}

// Helper to check for iframe strings
const isIframeString = (str: string) => str?.trim().startsWith('<iframe');

// Helper to extract YouTube video ID from various URL formats
const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  // This regex covers: youtu.be, youtube.com/watch, youtube.com/embed, youtube.com/v/
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};


export const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = memo(({ url, isPreview = false, className }) => {
  if (!url) return null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const youTubeId = getYouTubeId(url);

  // This effect handles the short preview for direct video files
  useEffect(() => {
    const videoElement = videoRef.current;
    if (isPreview && videoElement && !youTubeId) { // Only for non-youtube direct videos
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Autoplay was prevented. This is a common browser policy.
          // console.log("Autoplay was prevented for direct video:", error);
        });
      }

      const handleTimeUpdate = () => {
        if (videoElement.currentTime > 5) { // Stop and reset after 5 seconds
          videoElement.pause();
          videoElement.currentTime = 0;
        }
      };

      videoElement.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoElement?.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [isPreview, url, youTubeId]);


  // Handle full iframe strings first
  if (isIframeString(url)) {
    return (
       <div
        dangerouslySetInnerHTML={{ __html: url }}
        className={`${className} [&>iframe]:w-full [&>iframe]:h-full`}
      />
    );
  }

  // Handle YouTube URLs
  if (youTubeId) {
    const embedUrl = `https://www.youtube.com/embed/${youTubeId}`;
    const urlObj = new URL(embedUrl);
    
    if (isPreview) {
        urlObj.searchParams.set('autoplay', '1');
        urlObj.searchParams.set('mute', '1');
        urlObj.searchParams.set('controls', '0');
        urlObj.searchParams.set('showinfo', '0');
        urlObj.searchParams.set('modestbranding', '1');
        urlObj.searchParams.set('loop', '1'); // Loop the preview
        urlObj.searchParams.set('playlist', youTubeId); // Required for loop to work on single video
    } else {
        urlObj.searchParams.set('autoplay', '1');
        urlObj.searchParams.set('controls', '1');
    }

    return (
      <iframe
        src={urlObj.toString()}
        className={className}
        title="Course Video Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen={!isPreview}
      />
    );
  }
  
  // Fallback for direct video links or other video URLs
  return (
    <video
      ref={videoRef}
      key={url} // Re-mount component if url changes
      className={className}
      src={url}
      autoPlay={isPreview}
      muted={isPreview} // Muted is crucial for autoplay in most browsers
      loop={isPreview} // Only loop when it's a short preview
      playsInline // Important for iOS
      controls={!isPreview}
    >
      Tu navegador no soporta la etiqueta de video.
    </video>
  );
});

CourseVideoPlayer.displayName = 'CourseVideoPlayer';
