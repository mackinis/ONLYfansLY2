
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSetting, type WhatsAppSettings } from '@/services/settingsService';
import { MessageSquare } from 'lucide-react'; // Default icon
import { cn } from '@/lib/utils';

export function WhatsAppWidget() {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWhatsAppSettings() {
      setIsLoading(true);
      try {
        const fetchedSettings = await getSetting<WhatsAppSettings>('whatsapp');
        setSettings(fetchedSettings);
      } catch (error) {
        console.error("Failed to load WhatsApp settings for widget:", error);
        setSettings(null); // Ensure it's null on error
      } finally {
        setIsLoading(false);
      }
    }
    fetchWhatsAppSettings();
  }, []);

  if (isLoading || !settings || !settings.enableWhatsAppWidget || !settings.whatsAppNumber) {
    return null; // Don't render if loading, no settings, disabled, or no number
  }

  const { 
    whatsAppNumber, 
    defaultWelcomeMessage, 
    widgetColor = '#25D366', // Default WhatsApp green
    iconColor = '#FFFFFF',   // Default white for icon
    widgetIconType = 'default',
    widgetIconUrl 
  } = settings;

  const whatsAppLink = `https://wa.me/${whatsAppNumber.replace(/\D/g, '')}${defaultWelcomeMessage ? `?text=${encodeURIComponent(defaultWelcomeMessage)}` : ''}`;

  return (
    <a
      href={whatsAppLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
        "focus:ring-white" 
      )}
      style={{ backgroundColor: widgetColor }}
      aria-label="Chat en WhatsApp"
    >
      {widgetIconType === 'custom' && widgetIconUrl ? (
        <Image 
            src={widgetIconUrl} 
            alt="WhatsApp" 
            width={28} 
            height={28} 
            className="object-contain"
        />
      ) : (
        <MessageSquare style={{ color: iconColor }} size={28} />
      )}
    </a>
  );
}
