
'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSetting, type SocialMediaSettings, type SocialMediaLink } from '@/services/settingsService';
import { saveSocialMediaSettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Trash2, Share2 as Share2Icon } from 'lucide-react';
import { siteConfig } from '@/config/site';

const MAX_SOCIAL_LINKS = 10; // Arbitrary limit

export default function AdminSocialMediaPage() {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<SocialMediaSettings>('social_media');
        if (settings && settings.links && settings.links.length > 0) {
          setSocialLinks(settings.links);
        } else {
          // Pre-populate with default links from siteConfig if none exist
          const defaultLinks = siteConfig.socialLinks.map(link => ({ platform: link.platform, url: '' }));
          setSocialLinks(defaultLinks);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load social media settings.",
          variant: "destructive",
        });
        const defaultLinks = siteConfig.socialLinks.map(link => ({ platform: link.platform, url: '' }));
        setSocialLinks(defaultLinks);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleLinkChange = (index: number, field: keyof SocialMediaLink, value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setSocialLinks(updatedLinks);
  };

  const addLinkField = useCallback(() => {
    if (socialLinks.length < MAX_SOCIAL_LINKS) {
      setSocialLinks([...socialLinks, { platform: '', url: '' }]);
    } else {
      toast({
        title: "Límite Alcanzado",
        description: `Solo puedes añadir hasta ${MAX_SOCIAL_LINKS} enlaces de redes sociales.`,
        variant: "default",
      });
    }
  }, [socialLinks, toast]);

  const removeLinkField = (index: number) => {
    if (socialLinks.length > 1) {
      const updatedLinks = socialLinks.filter((_, i) => i !== index);
      setSocialLinks(updatedLinks);
    } else {
      // If it's the last one, clear it instead of removing the row
      setSocialLinks([{ platform: '', url: '' }]);
    }
  };

  const handleSaveSettings = async () => {
    // Filter out empty links before saving, unless it's the only link and it's empty (admin might want to clear all)
    const linksToSave = socialLinks.filter(link => link.platform.trim() !== '' || link.url.trim() !== '');
    
    // Basic validation
    for (const link of linksToSave) {
        if (!link.platform.trim() || !link.url.trim()) {
            toast({ title: "Error de Validación", description: "Asegúrate de que todos los enlaces tengan plataforma y URL.", variant: "destructive" });
            return;
        }
        try {
            new URL(link.url); // Check if URL is valid
        } catch (_) {
            toast({ title: "Error de Validación", description: `La URL '${link.url}' para ${link.platform} no es válida.`, variant: "destructive" });
            return;
        }
    }


    const settingsData: SocialMediaSettings = {
      links: linksToSave.length > 0 ? linksToSave : [] // Save empty array if all were cleared
    };

    startTransition(async () => {
      const result = await saveSocialMediaSettingsAction(settingsData);
      toast({
        title: result.success ? "¡Éxito!" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
       if (result.success && linksToSave.length === 0 && socialLinks.some(l => l.platform || l.url)) {
        setSocialLinks([{ platform: '', url: '' }]); // Reset to one empty field if all were cleared by saving
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="h-8 w-60 mb-1" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-4 p-4 border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-end">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            ))}
            <Skeleton className="h-10 w-36" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Share2Icon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Configurar Redes Sociales</h1>
          <p className="text-muted-foreground">Gestiona los enlaces a tus perfiles de redes sociales que se mostrarán en el pie de página.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enlaces de Redes Sociales</CardTitle>
          <CardDescription>Añade o actualiza los enlaces a tus plataformas sociales. Estos reemplazarán los enlaces predeterminados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-md shadow-sm relative bg-card">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(150px,_1fr)_2fr_auto] gap-4 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor={`platform-${index}`}>Plataforma</Label>
                  <Input 
                    id={`platform-${index}`} 
                    value={link.platform}
                    onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                    placeholder="Ej: Facebook, X, Instagram" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`url-${index}`}>URL Completa</Label>
                  <Input 
                    id={`url-${index}`} 
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    placeholder="https://www.facebook.com/tu_pagina" 
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeLinkField(index)} 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive self-end mb-1"
                  aria-label="Eliminar enlace"
                  disabled={isSaving}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
               <p className="text-xs text-muted-foreground">
                Nombres de plataforma comunes (para íconos automáticos): facebook, x, instagram, linkedin, youtube. Otros mostrarán iniciales.
              </p>
            </div>
          ))}
          <Button variant="outline" onClick={addLinkField} disabled={isSaving || socialLinks.length >= MAX_SOCIAL_LINKS}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Otro Enlace
          </Button>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Configuración de Redes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
