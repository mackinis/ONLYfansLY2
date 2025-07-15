
'use server';

import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase/firestore';
import { updateSetting, type StorySettings } from '@/services/settingsService';
import { updateStory as updateStoryService, deleteStory as deleteStoryService, type StoryData } from '@/services/storyService';
import { z } from 'zod';

interface ActionResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

export async function saveStorySettingsAction(data: StorySettings): Promise<ActionResult> {
  try {
    await updateSetting<StorySettings>('stories', data);
    revalidatePath('/admin/stories');
    revalidatePath('/stories'); 
    revalidatePath('/');
    return { success: true, message: '¡Ajustes de historias guardados exitosamente!' };
  } catch (error) {
    console.error('Failed to save story settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al guardar los ajustes: ${errorMessage}` };
  }
}

export async function updateStoryStatusAction(storyId: string, newStatus: 'approved' | 'rejected' | 'pending'): Promise<ActionResult> {
  try {
    const updatePayload: Partial<StoryData> = { 
      status: newStatus,
      updatedAt: Timestamp.now(),
    };
    if (newStatus === 'approved') {
      updatePayload.approvedAt = Timestamp.now();
    }
    await updateStoryService(storyId, updatePayload);
    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath('/');
    return { success: true, message: `Estado de la historia actualizado a ${newStatus}.` };
  } catch (error) {
    console.error('Failed to update story status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al actualizar el estado de la historia: ${errorMessage}` };
  }
}

export async function deleteAdminStoryAction(storyId: string): Promise<ActionResult> {
  try {
    await deleteStoryService(storyId);
    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath('/');
    return { success: true, message: 'Historia eliminada exitosamente.' };
  } catch (error) {
    console.error('Failed to delete story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al eliminar la historia: ${errorMessage}` };
  }
}

const partialStorySchema = z.object({
    userId: z.string().min(1, "User ID is required.").optional(),
    userName: z.string().min(1, "User name is required.").optional(),
    userAvatar: z.string().url().optional().or(z.literal('')),
    title: z.string().min(3, "Title must be at least 3 characters.").optional(),
    imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
    videoUrl: z.string().optional(),
    videoPreviewUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
    caption: z.string().max(500, "Caption can be max 500 characters.").optional().or(z.literal('')),
    approvedAt: z.date().optional(),
});


export async function updateStoryAction(storyId: string, data: Partial<StoryData>): Promise<ActionResult> {
    const validation = partialStorySchema.safeParse(data);
    
    if (!validation.success) {
        return { success: false, message: "Error de validación.", errors: validation.error.issues };
    }
  
    try {
        await updateStoryService(storyId, validation.data);
        revalidatePath('/admin/stories');
        revalidatePath(`/admin/stories/edit/${storyId}`);
        revalidatePath('/stories');
        revalidatePath('/');
        return { success: true, message: 'Historia actualizada exitosamente!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
        return { success: false, message: `Error al actualizar la historia: ${errorMessage}` };
    }
}
