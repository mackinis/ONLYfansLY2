
'use server';

import { revalidatePath } from 'next/cache';
import { addStory as addStoryService, type StoryData } from '@/services/storyService';
import type { z } from 'zod';
import { z as zod } from 'zod';

interface ActionResult {
  success: boolean;
  message: string;
  storyId?: string;
  errors?: z.ZodIssue[];
}

const addStoryActionSchema = zod.object({
  title: zod.string().min(3, { message: 'El título debe tener al menos 3 caracteres.' }).max(100),
  mediaUrl: zod.string().min(1, {message: 'Se requiere una URL de imagen o video/iframe.'}).refine(val => val.startsWith('http') || val.startsWith('<iframe'), { message: 'Por favor, introduce una URL válida o código iframe.'}),
  caption: zod.string().max(500).optional(),
  // User data passed in
  userId: zod.string().min(1),
  userName: zod.string().min(1),
  userAvatar: zod.string().url().optional().or(zod.literal('')),
});


export async function addStoryAction(data: z.infer<typeof addStoryActionSchema>): Promise<ActionResult> {
  const validation = addStoryActionSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: "Error de validación.", errors: validation.error.issues };
  }

  const { title, mediaUrl, caption, userId, userName, userAvatar } = validation.data;
  
  const storyDataToSave: Omit<StoryData, 'status' | 'createdAt' | 'updatedAt'> = {
    userId,
    userName,
    userAvatar: userAvatar || '',
    title,
    caption: caption || '',
  };

  if (mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null) {
    storyDataToSave.imageUrl = mediaUrl;
  } else {
    storyDataToSave.videoUrl = mediaUrl;
  }
  
  try {
    const storyId = await addStoryService(storyDataToSave);
    revalidatePath('/stories');
    revalidatePath('/');
    return { success: true, message: '¡Historia enviada para revisión!', storyId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al enviar historia: ${errorMessage}` };
  }
}
