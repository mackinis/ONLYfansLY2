
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getSetting, WhatsAppSettings } from '@/services/settingsService';
import { saveWhatsAppSettingsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageSquare, Image as ImageIcon } from 'lucide-react';

const DEFAULT_WIDGET_COLOR = '#25D366'; // Default WhatsApp Green
const DEFAULT_ICON_COLOR = '#FFFFFF';   // Default White

type IconType = 'default' | 'custom';

export default function AdminWhatsAppPage() {
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [enableWidget, setEnableWidget] = useState(false);
  const [defaultMessage, setDefaultMessage] = useState('');
  const [widgetColor, setWidgetColor] = useState(DEFAULT_WIDGET_COLOR);
  const [iconColor, setIconColor] = useState(DEFAULT_ICON_COLOR);
  const [widgetIconType, setWidgetIconType] = useState<IconType>('default');
  const [widgetIconUrl, setWidgetIconUrl] = useState('');


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSetting<WhatsAppSettings>('whatsapp');
        if (settings) {
          setWhatsAppNumber(settings.whatsAppNumber || '');
          setEnableWidget(settings.enableWhatsAppWidget || false);
          setDefaultMessage(settings.defaultWelcomeMessage || '');
          setWidgetColor(settings.widgetColor || DEFAULT_WIDGET_COLOR);
          setIconColor(settings.iconColor || DEFAULT_ICON_COLOR);
          setWidgetIconType(settings.widgetIconType || 'default');
          setWidgetIconUrl(settings.widgetIconUrl || '');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load WhatsApp settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    const settingsData: WhatsAppSettings = {
      whatsAppNumber,
      enableWhatsAppWidget: enableWidget,
      defaultWelcomeMessage: defaultMessage,
      widgetColor,
      iconColor,
      widgetIconType,
      widgetIconUrl,
    };

    startTransition(async () => {
      const result = await saveWhatsAppSettingsAction(settingsData);
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
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" /> 
            <div className="flex gap-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
            </div>
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
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Integración de WhatsApp Chat</h1>
        <p className="text-muted-foreground">Configura las funciones de soporte por chat de WhatsApp.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuración de WhatsApp</CardTitle>
          <CardDescription>Establece tu número de WhatsApp Business y las opciones del widget de chat.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Número de WhatsApp Business (con código de país)</Label>
            <Input 
              id="whatsappNumber" 
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="Ej: 5491123456789" 
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="enableWhatsAppWidget" 
              checked={enableWidget}
              onCheckedChange={setEnableWidget}
            />
            <Label htmlFor="enableWhatsAppWidget">Habilitar Widget de Chat de WhatsApp en el Sitio</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultMessage">Mensaje de Bienvenida Predeterminado (Opcional)</Label>
            <Input 
              id="defaultMessage" 
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              placeholder="¡Hola! ¿Cómo podemos ayudarte hoy?" 
            />
             <p className="text-xs text-muted-foreground">Este mensaje se precargará cuando un usuario haga clic en el widget.</p>
          </div>

          <div className="space-y-4">
            <Label>Ícono del Widget</Label>
            <RadioGroup value={widgetIconType} onValueChange={(v) => setWidgetIconType(v as IconType)} className="flex gap-4">
                <Label htmlFor="icon-default" className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value="default" id="icon-default" />
                    <MessageSquare className="h-5 w-5" />
                    Por Defecto
                </Label>
                 <Label htmlFor="icon-custom" className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value="custom" id="icon-custom" />
                    <ImageIcon className="h-5 w-5" />
                    URL Personalizada
                </Label>
            </RadioGroup>
          </div>

          {widgetIconType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="widgetIconUrl">URL del Ícono Personalizado</Label>
              <Input 
                id="widgetIconUrl" 
                value={widgetIconUrl}
                onChange={(e) => setWidgetIconUrl(e.target.value)}
                placeholder="https://ejemplo.com/whatsapp-icon.png" 
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="widgetColor">Color del Globo del Widget</Label>
              <Input 
                id="widgetColor" 
                type="color" 
                value={widgetColor}
                onChange={(e) => setWidgetColor(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iconColor">Color del Ícono Interno (si es por defecto)</Label>
              <Input 
                id="iconColor" 
                type="color" 
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Configuración de WhatsApp'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
