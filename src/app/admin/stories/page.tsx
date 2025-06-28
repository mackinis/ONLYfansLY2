
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getSetting, type StorySettings } from '@/services/settingsService';
import { saveStorySettingsAction, updateStoryStatusAction, deleteAdminStoryAction } from './actions'; // Import server actions
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Settings as SettingsIcon, Trash2, CheckCircle, XCircle, Edit3, Eye, UserCircle as UserCircleIcon } from "lucide-react"; // Added UserCircleIcon
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminStories, type Story } from '@/services/storyService';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // Import Avatar components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function AdminStoriesPage() {
  // Settings State
  const [allowUserSubmission, setAllowUserSubmission] = useState(true);
  const [defaultEditWindowMinutes, setDefaultEditWindowMinutes] = useState(60);
  const [defaultStoryVideoPreviewUrl, setDefaultStoryVideoPreviewUrl] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, startSettingsTransition] = useTransition();
  
  // Stories List State
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [isProcessingStory, startStoryProcessTransition] = useTransition();


  const { toast } = useToast();

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoadingSettings(true);
      setIsLoadingStories(true);
      try {
        const settings = await getSetting<StorySettings>('stories');
        if (settings) {
          setAllowUserSubmission(settings.allowUserSubmission === undefined ? true : settings.allowUserSubmission);
          setDefaultEditWindowMinutes(settings.defaultEditWindowMinutes || 60);
          setDefaultStoryVideoPreviewUrl(settings.defaultStoryVideoPreviewUrl || '');
        }

        const fetchedStories = await getAdminStories(); 
        setStories(fetchedStories);

      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los ajustes o la lista de historias.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSettings(false);
        setIsLoadingStories(false);
      }
    }
    fetchInitialData();
  }, [toast]);

  const handleSaveStorySettings = async () => {
    const settingsData: StorySettings = {
      allowUserSubmission,
      defaultEditWindowMinutes,
      defaultStoryVideoPreviewUrl,
    };
    startSettingsTransition(async () => {
      const result = await saveStorySettingsAction(settingsData);
      toast({
        title: result.success ? "¡Éxito!" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  const handleStoryStatusChange = async (storyId: string, newStatus: 'approved' | 'rejected') => {
    startStoryProcessTransition(async () => {
      const result = await updateStoryStatusAction(storyId, newStatus);
      if (result.success) {
        setStories(prev => prev.map(s => s.id === storyId ? { ...s, status: newStatus, approvedAt: newStatus === 'approved' ? Timestamp.now() : s.approvedAt } : s));
        toast({ title: "¡Éxito!", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleDeleteStory = async (storyId: string) => {
     startStoryProcessTransition(async () => {
      const result = await deleteAdminStoryAction(storyId);
      if (result.success) {
        setStories(prev => prev.filter(s => s.id !== storyId));
        toast({ title: "¡Éxito!", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };


  if (isLoadingSettings || isLoadingStories) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-60 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Gestionar Historias</h1>
          <p className="text-muted-foreground">Aprueba, rechaza y gestiona las historias enviadas por los usuarios. Configura los ajustes globales de las historias.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5 text-primary"/> Configuración Global de Historias</CardTitle>
          <CardDescription>Controla cómo se envían y se muestran las historias.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="allowUserSubmission" 
              checked={allowUserSubmission} 
              onCheckedChange={setAllowUserSubmission}
            />
            <Label htmlFor="allowUserSubmission">Permitir a los Usuarios Enviar Historias</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultEditWindowMinutes">Ventana de Edición para el Usuario (minutos después de la aprobación)</Label>
            <Input 
              id="defaultEditWindowMinutes" 
              type="number" 
              value={defaultEditWindowMinutes} 
              onChange={(e) => setDefaultEditWindowMinutes(parseInt(e.target.value, 10))} 
              placeholder="60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultStoryVideoPreviewUrl">URL de Imagen de Previsualización de Video por Defecto (para historias sin imagen propia)</Label>
            <Input 
              id="defaultStoryVideoPreviewUrl" 
              value={defaultStoryVideoPreviewUrl} 
              onChange={(e) => setDefaultStoryVideoPreviewUrl(e.target.value)} 
              placeholder="https://example.com/default-video-preview.png"
            />
             <p className="text-xs text-muted-foreground">Esta imagen se usará como miniatura si una historia tiene un video pero no una URL de imagen específica.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveStorySettings} disabled={isSavingSettings}>
            {isSavingSettings ? 'Guardando Configuración...' : 'Guardar Configuración de Historias'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cola de Moderación de Historias</CardTitle>
          <CardDescription>Revisa, aprueba o rechaza las historias enviadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">Aún no se han enviado historias.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Vista Previa</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Leyenda (Extracto)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell>
                      <Image 
                        src={story.imageUrl || (story.videoUrl && defaultStoryVideoPreviewUrl) || "https://placehold.co/100x100.png"} 
                        alt="Story preview"
                        width={40}
                        height={40}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint="story content"
                      />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={story.userAvatar} alt={story.userName} />
                                <AvatarFallback>
                                    {story.userName ? story.userName.substring(0,1).toUpperCase() : <UserCircleIcon size={16}/>}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{story.userName || 'N/A'}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{story.caption || "Sin leyenda"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        story.status === 'approved' ? 'bg-green-100 text-green-700' :
                        story.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {story.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {story.createdAt ? new Date(story.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {story.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleStoryStatusChange(story.id, 'approved')} disabled={isProcessingStory} title="Aprobar">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleStoryStatusChange(story.id, 'rejected')} disabled={isProcessingStory} title="Rechazar">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {story.status === 'approved' && (
                         <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleStoryStatusChange(story.id, 'rejected')} disabled={isProcessingStory} title="Rechazar/Despublicar">
                            <XCircle className="h-4 w-4" />
                          </Button>
                      )}
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isProcessingStory} title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente la historia.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isProcessingStory}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteStory(story.id)} 
                              disabled={isProcessingStory}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isProcessingStory ? 'Eliminando...' : 'Eliminar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
