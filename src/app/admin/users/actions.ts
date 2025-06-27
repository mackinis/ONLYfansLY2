
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserChatSettings, updateUserSuspensionStatus } from '@/services/userService';

interface ActionResult {
  success: boolean;
  message: string;
  updatedUserEmail?: string; 
}

export async function toggleUserChatStatusAction(
  userId: string,
  canChat: boolean
): Promise<ActionResult> {
  if (!userId) {
    return { success: false, message: 'User ID is required.' };
  }

  try {
    await updateUserChatSettings(userId, { canChat });
    
    revalidatePath('/admin/users'); 
    revalidatePath('/live'); 
    
    return { 
      success: true, 
      message: `Estado de chat del usuario actualizado exitosamente.`
    };
  } catch (error) {
    console.error('Failed to toggle user chat status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Error al actualizar estado de chat: ${errorMessage}` };
  }
}

export async function toggleUserSuspensionAction(
  userId: string,
  isSuspended: boolean
): Promise<ActionResult> {
  if (!userId) {
    return { success: false, message: 'User ID is required.' };
  }

  try {
    await updateUserSuspensionStatus(userId, isSuspended);
    revalidatePath('/admin/users');
    return {
      success: true,
      message: `Estado de suspensión del usuario actualizado exitosamente.`,
    };
  } catch (error) {
    console.error('Failed to toggle user suspension status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Error al actualizar suspensión: ${errorMessage}` };
  }
}

    