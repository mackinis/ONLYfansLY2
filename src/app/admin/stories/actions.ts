
'use server';

import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase/firestore';
import { updateSetting, type StorySettings } from '@/services/settingsService';
import { updateStory as updateStoryService, deleteStory as deleteStoryService, type StoryData } from '@/services/storyService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveStorySettingsAction(data: StorySettings): Promise<ActionResult> {
  try {
    await updateSetting<StorySettings>('stories', data);
    revalidatePath('/admin/stories');
    // Potentially revalidate public pages if these settings affect global story display
    revalidatePath('/stories'); 
    revalidatePath('/'); // Homepage often displays stories
    return { success: true, message: 'Story settings saved successfully!' };
  } catch (error) {
    console.error('Failed to save story settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}

export async function updateStoryStatusAction(storyId: string, newStatus: 'approved' | 'rejected'): Promise<ActionResult> {
  try {
    const updatePayload: Partial<StoryData> = { 
      status: newStatus,
      updatedAt: Timestamp.now(), // Ensure updatedAt is always updated
    };
    if (newStatus === 'approved') {
      updatePayload.approvedAt = Timestamp.now();
    }
    await updateStoryService(storyId, updatePayload);
    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath('/');
    return { success: true, message: `Story ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully.` };
  } catch (error) {
    console.error('Failed to update story status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update story status: ${errorMessage}` };
  }
}

export async function deleteAdminStoryAction(storyId: string): Promise<ActionResult> {
  try {
    await deleteStoryService(storyId);
    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath('/');
    return { success: true, message: 'Story deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete story:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to delete story: ${errorMessage}` };
  }
}
