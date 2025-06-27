
'use server';

import { revalidatePath } from 'next/cache';
import { addStory, type StoryData, storySchema } from '@/services/storyService';
import type { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
// import { auth } from '@/lib/firebase'; // TODO: Uncomment and use for actual user auth

interface ActionResult {
  success: boolean;
  message: string;
  storyId?: string;
  errors?: z.ZodIssue[];
}

export async function addStoryAction(data: { title: string; mediaUrl: string; caption?: string }): Promise<ActionResult> {
  // TODO: Get actual user from Firebase Auth when implemented
  // const currentUser = auth.currentUser;
  // if (!currentUser) {
  //   return { success: false, message: "Debes iniciar sesión para crear una historia." };
  // }

  // Simulate user data for now
  const simulatedUser = {
    id: 'simulatedUserId123', // Replace with actual user.uid
    name: 'Simulated User', // Replace with actual user.displayName or fetched profile name
    avatarUrl: 'https://placehold.co/50x50.png?text=SU' // Replace with actual user.photoURL or fetched avatar
  };

  const storyDataToValidate: Omit<StoryData, 'status' | 'createdAt' | 'updatedAt'> = {
    userId: simulatedUser.id,
    userName: simulatedUser.name,
    userAvatar: simulatedUser.avatarUrl,
    title: data.title,
    caption: data.caption || '',
  };

  // Check if mediaUrl is for image or video and assign accordingly
  // Basic check, can be improved (e.g., regex for video platform URLs)
  if (data.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) != null) {
    storyDataToValidate.imageUrl = data.mediaUrl;
  } else {
    // Assume it's a video URL or embed code
    storyDataToValidate.videoUrl = data.mediaUrl;
  }
  
  const validation = storySchema.safeParse(storyDataToValidate);

  if (!validation.success) {
    return { success: false, message: "Error de validación.", errors: validation.error.issues };
  }

  try {
    // addStory in service already sets status to 'pending' and timestamps
    const storyId = await addStory(validation.data);
    revalidatePath('/stories'); // Revalidate public stories page
    revalidatePath('/'); // Revalidate homepage if stories are displayed there
    // No revalidation for admin/stories yet, as it's not fully implemented
    return { success: true, message: '¡Historia enviada para revisión!', storyId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al enviar historia: ${errorMessage}` };
  }
}
