'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSetting, GeneralSettings } from '@/services/settingsService';
import { saveGeneralSettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminConfigGeneralPage() {
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  
  // New state for Hero Banner
  const [heroMainText, setHeroMainText] = useState('');
  const [heroSecondaryText, setHeroSecondaryText] = useState('');
  const [heroDescriptionText, setHeroDescriptionText] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroMainTextColor, setHeroMainTextColor] = useState('#FFFFFF');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<GeneralSettings>('general');
        if (settings) {
          setSiteName(settings.siteName || '');
          setSiteDescription(settings.siteDescription || '');
          setAdminEmail(settings.adminEmail || '');
          
          setHeroMainText(settings.heroMainText || '');
          setHeroSecondaryText(settings.heroSecondaryText || '');
          setHeroDescriptionText(settings.heroDescriptionText || '');
          setHeroImageUrl(settings.heroImageUrl || '');
          setHeroMainTextColor(settings.heroMainTextColor || '#FFFFFF');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los ajustes generales.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleSaveGeneralSettings = async () => {
    const settingsData: GeneralSettings = {
      siteName,
      siteDescription,
      adminEmail,
      heroMainText,
      heroSecondaryText,
      heroDescriptionText,
      heroImageUrl,
      heroMainTextColor,
    };

    startTransition(async () => {
      const result = await saveGeneralSettingsAction(settingsData);
      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Configuración General</h1>
        <p className="text-muted-foreground">Gestiona los ajustes principales de tu plataforma ONLYfansLY.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Sitio</CardTitle>
          <CardDescription>Información básica sobre tu plataforma que se usa en metadatos y otras áreas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nombre del Sitio</Label>
            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="ONLYfansLY" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Descripción del Sitio (para SEO)</Label>
            <Textarea id="siteDescription" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="Tu universo de contenido exclusivo e interacción." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email del Administrador</Label>
            <Input id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalización del Hero Banner</CardTitle>
          <CardDescription>Controla el contenido visual y textual del banner principal en la página de inicio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="heroMainText">Titular Principal</Label>
              <Input id="heroMainText" value={heroMainText} onChange={(e) => setHeroMainText(e.target.value)} placeholder="Ej: Bienvenido a ONLYfansLY" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="heroMainTextColor">Color del Titular Principal</Label>
                <div className="flex items-center gap-2">
                    <Input id="heroMainTextColor" type="color" value={heroMainTextColor} onChange={(e) => setHeroMainTextColor(e.target.value)} className="p-1 h-10 w-14" />
                    <Input type="text" value={heroMainTextColor.toUpperCase()} onChange={(e) => setHeroMainTextColor(e.target.value)} placeholder="#FFFFFF" />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSecondaryText">Titular Secundario</Label>
              <Input id="heroSecondaryText" value={heroSecondaryText} onChange={(e) => setHeroSecondaryText(e.target.value)} placeholder="Ej: Tu Universo de Streams" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroDescriptionText">Texto Descriptivo</Label>
              <Textarea id="heroDescriptionText" value={heroDescriptionText} onChange={(e) => setHeroDescriptionText(e.target.value)} placeholder="Ej: Descubre contenido increíble..." rows={3} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="heroImageUrl">URL de Imagen de Fondo (Opcional)</Label>
              <Input id="heroImageUrl" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://example.com/your-image.png" />
              <p className="text-xs text-muted-foreground">Si se deja vacío, se usará un fondo de degradado por defecto.</p>
            </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button onClick={handleSaveGeneralSettings} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Configuración General'}
        </Button>
      </div>
    </div>
  );
}
