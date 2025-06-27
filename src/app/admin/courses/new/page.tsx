
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addCourseAction } from '../actions'; 
import type { CourseData } from '@/services/courseService';
import { courseSchema } from '@/services/courseService'; 
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type FormData = CourseData;

export default function AdminNewCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      duration: '',
      date: '',
      imageUrl: '',
      courseVideoUrl: '',
      videoPreviewUrl: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      const result = await addCourseAction(data);
      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        });
        reset(); 
        router.push('/admin/courses'); 
      } else {
        let description = result.message;
        if (result.errors) {
          description = result.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(' ');
        }
        toast({
          title: "Error",
          description: description,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver a Cursos</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Añadir Nuevo Curso</h1>
          <p className="text-muted-foreground">Completa los detalles del nuevo curso.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Curso</Label>
                <Input id="title" {...register("title")} placeholder="Ej: Desarrollo Web Moderno" />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input id="price" {...register("price")} placeholder="Ej: $99.99 o Gratis" />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" {...register("description")} placeholder="Describe el curso en detalle..." rows={5} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración</Label>
                <Input id="duration" {...register("duration")} type="text" placeholder="Ej: 45 minutos" />
                {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha del Video (Opcional)</Label>
                <Input id="date" {...register("date")} type="date" placeholder="Ej: 2024-10-26" />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de Imagen para la Tarjeta (Opcional)</Label>
              <Input id="imageUrl" {...register("imageUrl")} placeholder="https://ejemplo.com/imagen.png" />
              <p className="text-xs text-muted-foreground">Esta imagen se mostrará si no hay un video de previsualización.</p>
              {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoPreviewUrl">URL de Video de Previsualización o Iframe (Opcional)</Label>
              <Input id="videoPreviewUrl" {...register("videoPreviewUrl")} placeholder="https://ejemplo.com/preview.mp4 o <iframe...>" />
              <p className="text-xs text-muted-foreground">Video corto (URL directa, YouTube o Iframe) que se reproduce por 5 segundos en la tarjeta. Reemplaza a la imagen.</p>
              {errors.videoPreviewUrl && <p className="text-sm text-destructive">{errors.videoPreviewUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseVideoUrl">URL de Video del Curso o Iframe (Modal, Opcional)</Label>
              <Input id="courseVideoUrl" {...register("courseVideoUrl")} placeholder="https://youtube.com/embed/... o <iframe...>" />
              <p className="text-xs text-muted-foreground">Este es el video completo (URL directa, YouTube o Iframe) que se abrirá en el pop-up.</p>
              {errors.courseVideoUrl && <p className="text-sm text-destructive">{errors.courseVideoUrl.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Curso'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
