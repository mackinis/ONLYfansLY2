
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSetting, type AppMobilesSettings } from '@/services/settingsService';
import { saveAppMobilesSettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Smartphone } from 'lucide-react';

export default function AdminAppMobilesPage() {
  // State for all form fields
  const [androidUrl, setAndroidUrl] = useState('');
  const [androidBrand, setAndroidBrand] = useState('');
  const [androidIconUrl, setAndroidIconUrl] = useState('');
  const [iosUrl, setIosUrl] = useState('');
  const [iosBrand, setIosBrand] = useState('');
  const [iosIconUrl, setIosIconUrl] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<AppMobilesSettings>('app_mobiles');
        if (settings) {
          setAndroidUrl(settings.androidUrl || '');
          setAndroidBrand(settings.androidBrand || '');
          setAndroidIconUrl(settings.androidIconUrl || '');
          setIosUrl(settings.iosUrl || '');
          setIosBrand(settings.iosBrand || '');
          setIosIconUrl(settings.iosIconUrl || '');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los ajustes de las apps.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    const settingsData: AppMobilesSettings = {
      androidUrl,
      androidBrand,
      androidIconUrl,
      iosUrl,
      iosBrand,
      iosIconUrl,
    };
    startTransition(async () => {
      const result = await saveAppMobilesSettingsAction(settingsData);
      toast({
        title: result.success ? "¡Éxito!" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
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
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="pt-4">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Enlaces de Apps Móviles</h1>
          <p className="text-muted-foreground">Configura los enlaces de descarga para tus apps de Android e iOS.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Android</CardTitle>
          <CardDescription>Introduce los detalles para la app en Google Play Store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="androidUrl">Google Play Store URL</Label>
            <Input id="androidUrl" value={androidUrl} onChange={(e) => setAndroidUrl(e.target.value)} placeholder="https://play.google.com/store/apps/details?id=..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="androidBrand">Texto del Botón (Opcional)</Label>
            <Input id="androidBrand" value={androidBrand} onChange={(e) => setAndroidBrand(e.target.value)} placeholder="Google Play" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="androidIconUrl">URL del Ícono Personalizado (Opcional)</Label>
            <Input id="androidIconUrl" value={androidIconUrl} onChange={(e) => setAndroidIconUrl(e.target.value)} placeholder="https://example.com/android-icon.png" />
            <p className="text-xs text-muted-foreground">Si se deja en blanco, se usará el ícono por defecto.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de iOS</CardTitle>
          <CardDescription>Introduce los detalles para la app en la Apple App Store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="iosUrl">Apple App Store URL</Label>
            <Input id="iosUrl" value={iosUrl} onChange={(e) => setIosUrl(e.target.value)} placeholder="https://apps.apple.com/app/your-app/id..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iosBrand">Texto del Botón (Opcional)</Label>
            <Input id="iosBrand" value={iosBrand} onChange={(e) => setIosBrand(e.target.value)} placeholder="App Store" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iosIconUrl">URL del Ícono Personalizado (Opcional)</Label>
            <Input id="iosIconUrl" value={iosIconUrl} onChange={(e) => setIosIconUrl(e.target.value)} placeholder="https://example.com/ios-icon.png" />
            <p className="text-xs text-muted-foreground">Si se deja en blanco, se usará el ícono por defecto.</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="pt-2">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </div>
  );
}
