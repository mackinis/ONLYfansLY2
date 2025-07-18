
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from "@/hooks/use-toast";
import { addPopupAction } from '../actions'; 
import { type PopupData, popupSchema } from '@/services/popupService';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

type FormData = PopupData;

export default function AdminNewPopupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<FormData>({
    resolver: zodResolver(popupSchema),
    defaultValues: {
      title: '',
      isActive: true,
      type: 'image_only',
      displayRule: 'once_per_session',
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
      contentTitle: '',
      contentText: '',
      imageUrl: '',
      videoUrl: '',
    },
  });
  
  const popupType = watch('type');

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      const result = await addPopupAction(data);
      if (result.success) {
        toast({ title: "¡Éxito!", description: result.message });
        reset(); 
        router.push('/admin/popups'); 
      } else {
        const errorMessage = result.errors ? result.errors.map(e => e.message).join(' ') : result.message;
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      }
    });
  };
  
  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild><Link href="/admin/popups"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Volver</span></Link></Button>
        <div><h1 className="text-3xl font-headline font-bold text-primary">Añadir Nuevo Popup</h1><p className="text-muted-foreground">Completa los detalles del nuevo popup.</p></div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Configuración General</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="title">Título Interno (para tu referencia)</Label>
              <Input id="title" {...register("title")} placeholder="Ej: Promo de Verano" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="expiresAt">Fecha de Caducidad</Label>
                    <Controller name="expiresAt" control={control} render={({ field }) => (<Input id="expiresAt" type="date" value={formatDateForInput(field.value)} onChange={(e) => field.onChange(e.target.valueAsDate)} /> )}/>
                    {errors.expiresAt && <p className="text-sm text-destructive">{errors.expiresAt.message}</p>}
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                    <div className="flex items-center space-x-2"><Controller name="isActive" control={control} render={({ field }) => <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />} /><Label htmlFor="isActive">Activo al crearse</Label></div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Tipo de Popup</Label><Controller name="type" control={control} render={({ field }) => (<RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1"><div className="flex items-center space-x-2"><RadioGroupItem value="image_only" id="type-img" /><Label htmlFor="type-img">Solo Imagen</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="video_only" id="type-vid" /><Label htmlFor="type-vid">Solo Video</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="image_text" id="type-img-txt" /><Label htmlFor="type-img-txt">Imagen y Texto</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="video_text" id="type-vid-txt" /><Label htmlFor="type-vid-txt">Video y Texto</Label></div></RadioGroup>)} />{errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}</div>
              <div className="space-y-2"><Label>Regla de Visualización</Label><Controller name="displayRule" control={control} render={({ field }) => (<RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1"><div className="flex items-center space-x-2"><RadioGroupItem value="always" id="rule-always" /><Label htmlFor="rule-always">Siempre</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="once_per_session" id="rule-session" /><Label htmlFor="rule-session">Una vez por sesión</Label></div></RadioGroup>)} />{errors.displayRule && <p className="text-sm text-destructive">{errors.displayRule.message}</p>}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Contenido del Popup</CardTitle><CardDescription>Rellena los campos según el tipo de popup elegido.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                 {(popupType.includes('text')) && (
                    <>
                        <div className="space-y-2"><Label htmlFor="contentTitle">Título del Contenido (Opcional)</Label><Input id="contentTitle" {...register("contentTitle")} placeholder="Ej: ¡Oferta Especial!" />{errors.contentTitle && <p className="text-sm text-destructive">{errors.contentTitle.message}</p>}</div>
                        <div className="space-y-2"><Label htmlFor="contentText">Texto del Contenido (Opcional)</Label><Textarea id="contentText" {...register("contentText")} placeholder="Describe tu promoción o mensaje aquí..." rows={4} />{errors.contentText && <p className="text-sm text-destructive">{errors.contentText.message}</p>}</div>
                    </>
                 )}
                 {(popupType.includes('image')) && (
                    <div className="space-y-2"><Label htmlFor="imageUrl">URL de la Imagen</Label><Input id="imageUrl" {...register("imageUrl")} placeholder="https://ejemplo.com/imagen.png" />{errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}</div>
                 )}
                 {(popupType.includes('video')) && (
                    <div className="space-y-2"><Label htmlFor="videoUrl">URL de Video o Iframe</Label><Input id="videoUrl" {...register("videoUrl")} placeholder="https://youtube.com/embed/... o <iframe...>" />{errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl.message}</p>}</div>
                 )}
            </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
             <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>) : 'Guardar Popup'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
