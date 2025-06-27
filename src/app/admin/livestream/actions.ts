
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, LivestreamSettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveLivestreamSettingsAction(
  data: LivestreamSettings & { exclusiveUserIdsString?: string }
): Promise<ActionResult> {
  try {
    const settingsToSave: LivestreamSettings = {
      streamUrl: data.streamUrl,
      visibility: data.visibility,
      streamTitle: data.streamTitle,
      streamDescription: data.streamDescription,
      isChatEnabled: data.isChatEnabled,
      chatMode: data.chatMode,
      adminChatDisplayName: data.adminChatDisplayName,
      streamType: data.streamType, 
      webcamOfflineMessage: data.webcamOfflineMessage,
      forbiddenKeywords: data.forbiddenKeywords
    };

    if (data.visibility === 'exclusive' && data.exclusiveUserIdsString) {
      settingsToSave.exclusiveUserIds = data.exclusiveUserIdsString
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
    } else {
      settingsToSave.exclusiveUserIds = []; 
    }

    await updateSetting<LivestreamSettings>('livestream', settingsToSave);
    revalidatePath('/admin/livestream'); 
    revalidatePath('/', 'layout'); 
    revalidatePath('/live'); 
    return { success: true, message: 'Livestream settings saved successfully!' };
  } catch (error) {
    console.error('Failed to save livestream settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}
