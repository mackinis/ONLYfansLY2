
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getSetting, updateSetting, AppearanceSettings } from '@/services/settingsService';
import { saveAppearanceSettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

const DEFAULT_PRIMARY_COLOR = "#FF69B4";
const DEFAULT_ACCENT_COLOR = "#EE82EE";
const DEFAULT_BACKGROUND_COLOR = "#222222";
const DEFAULT_LOGO_POSITION = 0;
const DEFAULT_BRAND_NAME_COLOR = "#FFFFFF";

export default function AdminConfigAppearancePage() {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
  const [logoExternalUrl, setLogoExternalUrl] = useState('');
  const [showLogoFooter, setShowLogoFooter] = useState(true);
  const [showBrandNameHeader, setShowBrandNameHeader] = useState(false);
  const [brandNameHeaderColor, setBrandNameHeaderColor] = useState(DEFAULT_BRAND_NAME_COLOR);
  const [showBrandNameFooter, setShowBrandNameFooter] = useState(true);
  const [brandNameFooter, setBrandNameFooter] = useState("ONLYfansLY");
  const [logoPositioning, setLogoPositioning] = useState([DEFAULT_LOGO_POSITION]);


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<AppearanceSettings>('appearance');
        if (settings) {
          setPrimaryColor(settings.primaryColor || DEFAULT_PRIMARY_COLOR);
          setAccentColor(settings.accentColor || DEFAULT_ACCENT_COLOR);
          setBackgroundColor(settings.backgroundColor || DEFAULT_BACKGROUND_COLOR);
          setLogoExternalUrl(settings.logoExternalUrl || '');
          setShowBrandNameHeader(settings.showBrandNameHeader === undefined ? false : settings.showBrandNameHeader);
          setBrandNameHeaderColor(settings.brandNameHeaderColor || DEFAULT_BRAND_NAME_COLOR);
          setShowLogoFooter(settings.showLogoFooter === undefined ? true : settings.showLogoFooter);
          setShowBrandNameFooter(settings.showBrandNameFooter === undefined ? true : settings.showBrandNameFooter);
          setBrandNameFooter(settings.brandNameFooter || "ONLYfansLY");
          setLogoPositioning([settings.logoPositioning || DEFAULT_LOGO_POSITION]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los ajustes de apariencia.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    const settingsData: AppearanceSettings = {
      primaryColor,
      accentColor,
      backgroundColor,
      logoExternalUrl,
      showBrandNameHeader,
      brandNameHeaderColor,
      showLogoFooter,
      showBrandNameFooter,
      brandNameFooter,
      logoPositioning: logoPositioning[0],
    };
    startTransition(async () => {
      const result = await saveAppearanceSettingsAction(settingsData);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="pt-4">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-6 w-1/3 mb-1" />
            <Skeleton className="h-10 w-full" />
            <div className="pt-4">
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Configuración de Apariencia</h1>
        <p className="text-muted-foreground">Personaliza la apariencia de tu plataforma.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Esquema de Colores</CardTitle>
          <CardDescription>Define los colores primario, de acento y de fondo (se aplican a las variables de globals.css).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Color Primario</Label>
              <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Color de Acento</Label>
              <Input id="accentColor" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10"/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="backgroundColor">Color de Fondo</Label>
              <Input id="backgroundColor" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-10"/>
            </div>
          </div>
           <p className="text-xs text-muted-foreground">Nota: La selección de fuentes es gestionada por los desarrolladores. Fuentes actuales: Belleza (Títulos), Alegreya (Cuerpo).</p>
          <div className="pt-4">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Esquema de Colores"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo y Marca</CardTitle>
          <CardDescription>Gestiona el logo de tu sitio y el nombre de la marca.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logoUpload">Subir Logo (SVG, PNG)</Label>
            <Input id="logoUpload" type="file" />
            <p className="text-xs text-muted-foreground">La subida de archivos no está soportada actualmente. Por favor, usa el campo de URL a continuación.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="logoExternalUrl">URL del Logo (Opcional)</Label>
            <Input 
              id="logoExternalUrl" 
              value={logoExternalUrl} 
              onChange={(e) => setLogoExternalUrl(e.target.value)} 
              placeholder="https://ejemplo.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">Si se proporciona, esta URL se usará para el logo.</p>
          </div>
          <div className="space-y-2 pt-2">
            <Label htmlFor="logoPositioning">Posicionamiento del Logo (Navbar)</Label>
            <Slider
                id="logoPositioning"
                min={0}
                max={100}
                step={1}
                value={logoPositioning}
                onValueChange={setLogoPositioning}
            />
            <p className="text-xs text-muted-foreground">
                Ajusta la separación del logo respecto al borde izquierdo. 0 = pegado a la izquierda, 100 = centrado en el espacio disponible. Valor actual: {logoPositioning[0]}%
            </p>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="showBrandNameHeader" 
              checked={showBrandNameHeader} 
              onCheckedChange={setShowBrandNameHeader} 
            />
            <Label htmlFor="showBrandNameHeader">Mostrar Nombre de la Marca en Header</Label>
          </div>

          {showBrandNameHeader && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="brandNameHeaderColor">Color del Nombre de la Marca</Label>
              <div className="flex items-center gap-2">
                  <Input id="brandNameHeaderColor" type="color" value={brandNameHeaderColor} onChange={(e) => setBrandNameHeaderColor(e.target.value)} className="p-1 h-10 w-14" />
                  <Input type="text" value={brandNameHeaderColor.toUpperCase()} onChange={(e) => setBrandNameHeaderColor(e.target.value)} placeholder="#FFFFFF" className="max-w-[120px]"/>
              </div>
            </div>
          )}

           <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="showLogoFooter" 
              checked={showLogoFooter} 
              onCheckedChange={setShowLogoFooter} 
            />
            <Label htmlFor="showLogoFooter">Mostrar Logo en Pie de Página</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="showBrandNameFooter" 
              checked={showBrandNameFooter} 
              onCheckedChange={setShowBrandNameFooter} 
            />
            <Label htmlFor="showBrandNameFooter">Mostrar Nombre de la Marca en Pie de Página</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandNameFooter">Texto del Nombre de la Marca</Label>
            <Input 
              id="brandNameFooter" 
              value={brandNameFooter} 
              onChange={(e) => setBrandNameFooter(e.target.value)}
            />
          </div>
          <div className="pt-4">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Ajustes de Marca"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
