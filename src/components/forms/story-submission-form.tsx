
'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addStoryAction } from '@/app/stories/actions'; // Import the server action

const storySubmissionClientSchema = z.object({
  title: z.string().min(3, { message: 'El título debe tener al menos 3 caracteres.' }).max(100, 'El título no puede exceder los 100 caracteres.'),
  mediaUrl: z.string().min(1, {message: 'Se requiere una URL de imagen o video/iframe.'}).refine(val => val.startsWith('http') || val.startsWith('<iframe'), { message: 'Por favor, introduce una URL válida o código iframe.'}),
  caption: z.string().max(500, 'La leyenda no puede exceder los 500 caracteres.').optional(),
});

type StorySubmissionFormData = z.infer<typeof storySubmissionClientSchema>;

interface StorySubmissionFormProps {
  onSuccess?: () => void; // Callback for successful submission
}

export function StorySubmissionForm({ onSuccess }: StorySubmissionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<StorySubmissionFormData>({
    resolver: zodResolver(storySubmissionClientSchema),
    defaultValues: {
      title: '',
      mediaUrl: '',
      caption: '',
    },
  });

  const onSubmit: SubmitHandler<StorySubmissionFormData> = async (data) => {
    startTransition(async () => {
      const result = await addStoryAction(data);
      
      if (result.success) {
        toast({
          title: '¡Éxito!',
          description: result.message || 'Tu historia ha sido enviada para revisión.',
        });
        reset();
        if (onSuccess) onSuccess();
      } else {
        let description = result.message;
        if (result.errors) {
          description = result.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
        }
        toast({
          title: 'Error al Enviar Historia',
          description: description || 'No se pudo enviar tu historia. Inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
       <div className="space-y-2">
        <Label htmlFor="title">Título de la Historia</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Un título para tu historia"
        />
        {errors.title && <p className="text-sm text-destructive pt-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mediaUrl">URL de Imagen/Video o Código Iframe</Label>
        <Input
          id="mediaUrl"
          {...register('mediaUrl')}
          placeholder="https://ejemplo.com/imagen.jpg o <iframe src='...'></iframe>"
        />
        {errors.mediaUrl && <p className="text-sm text-destructive pt-1">{errors.mediaUrl.message}</p>}
         <p className="text-xs text-muted-foreground">Pega la URL directa de una imagen, un video (ej. YouTube embed) o el código iframe completo.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="caption">Tu Historia (Opcional)</Label>
        <Textarea
          id="caption"
          {...register('caption')}
          placeholder="Cuéntanos sobre tu momento..."
          rows={3}
        />
        {errors.caption && <p className="text-sm text-destructive pt-1">{errors.caption.message}</p>}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar Historia para Revisión'}
      </Button>
      <p className="text-xs text-muted-foreground text-center pt-2">
        Tu historia será revisada por un administrador antes de ser publicada.
      </p>
    </form>
  );
}
