
'use client';

import { useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getStory } from '@/services/storyService';
import type { StoryData } from '@/services/storyService';
import { updateStoryAction } from '../../actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

const formSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres.").optional().or(z.literal('')),
    caption: z.string().max(500, "La leyenda puede tener un máximo de 500 caracteres.").optional().or(z.literal('')),
    imageUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }).optional().or(z.literal('')),
    videoUrl: z.string().optional().or(z.literal('')),
    videoPreviewUrl: z.string().url({ message: "Por favor, introduce una URL de imagen de previsualización válida." }).optional().or(z.literal('')),
    userName: z.string().min(1, "El nombre de usuario es requerido."),
    userAvatar: z.string().url({ message: "Por favor, introduce una URL de avatar válida." }).optional().or(z.literal('')),
    approvedAt: z.date().optional(),
});


type FormData = z.infer<typeof formSchema>;

export default function AdminEditStoryPage() {
    const router = useRouter();
    const params = useParams();
    const storyId = params.id as string;
    const { toast } = useToast();
    const [isLoadingData, setIsLoadingData] = useTransition();
    const [isSaving, startSavingTransition] = useTransition();

    const { register, handleSubmit, formState: { errors }, reset, control } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const formatDateForInput = (date: Date | undefined): string => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (!storyId) return;

        const fetchStory = async () => {
            setIsLoadingData(async () => {
                try {
                    const story = await getStory(storyId);
                    if (story) {
                        reset({
                            title: story.title,
                            caption: story.caption,
                            imageUrl: story.imageUrl,
                            videoUrl: story.videoUrl,
                            videoPreviewUrl: story.videoPreviewUrl,
                            userName: story.userName,
                            userAvatar: story.userAvatar,
                            approvedAt: story.approvedAt?.toDate(),
                        });
                    } else {
                        toast({ title: "Error", description: "No se encontró la historia.", variant: "destructive" });
                        router.push('/admin/stories');
                    }
                } catch (error) {
                    toast({ title: "Error", description: "No se pudo cargar la historia.", variant: "destructive" });
                }
            });
        };
        fetchStory();
    }, [storyId, reset, router, toast, setIsLoadingData]);

    const onSubmit = (data: FormData) => {
        startSavingTransition(async () => {
            const result = await updateStoryAction(storyId, data);
            if (result.success) {
                toast({ title: "¡Éxito!", description: result.message });
                router.push('/admin/stories');
            } else {
                const errorMessage = result.errors ? result.errors.map(e => e.message).join(' ') : result.message;
                toast({ title: "Error", description: errorMessage, variant: "destructive" });
            }
        });
    };
    
    if (isLoadingData) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/stories">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver a Historias</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-headline font-bold text-primary">Editar Historia</h1>
                    <p className="text-muted-foreground">Modifica los detalles de la historia.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Contenido de la Historia</CardTitle>
                        <CardDescription>Realiza los cambios necesarios y guárdalos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" {...register("title")} disabled={isSaving}/>
                            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caption">Leyenda</Label>
                            <Textarea id="caption" {...register("caption")} rows={4} disabled={isSaving}/>
                            {errors.caption && <p className="text-sm text-destructive">{errors.caption.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="imageUrl">URL de imagen de vista previa</Label>
                            <Input id="imageUrl" {...register("imageUrl")} disabled={isSaving}/>
                            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="videoUrl">URL de Video / Iframe</Label>
                            <Input id="videoUrl" {...register("videoUrl")} disabled={isSaving}/>
                            {errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="videoPreviewUrl">URL de Imagen de Previsualización para Video (Opcional)</Label>
                            <Input id="videoPreviewUrl" {...register("videoPreviewUrl")} disabled={isSaving} placeholder="https://ejemplo.com/preview.png"/>
                            <p className="text-xs text-muted-foreground">Si la historia tiene video, esta imagen se usará como miniatura.</p>
                            {errors.videoPreviewUrl && <p className="text-sm text-destructive">{errors.videoPreviewUrl.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Detalles del Autor y Fecha</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="userName">Nombre de Usuario</Label>
                            <Input id="userName" {...register("userName")} disabled={isSaving}/>
                            {errors.userName && <p className="text-sm text-destructive">{errors.userName.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="userAvatar">URL del Avatar del Usuario</Label>
                            <Input id="userAvatar" {...register("userAvatar")} disabled={isSaving}/>
                            {errors.userAvatar && <p className="text-sm text-destructive">{errors.userAvatar.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="approvedAt">Fecha de Aprobación</Label>
                             <Controller 
                                name="approvedAt" 
                                control={control} 
                                render={({ field }) => (
                                    <Input 
                                        id="approvedAt" 
                                        type="date" 
                                        value={formatDateForInput(field.value)} 
                                        onChange={(e) => field.onChange(e.target.valueAsDate)} 
                                        disabled={isSaving}
                                    />
                                )} 
                            />
                            {errors.approvedAt && <p className="text-sm text-destructive">{errors.approvedAt.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <CardFooter className="px-0 pt-6">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </CardFooter>
            </form>
        </div>
    );
}
