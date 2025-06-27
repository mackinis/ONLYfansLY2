
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, GeneralSettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveGeneralSettingsAction(
  data: GeneralSettings
): Promise<ActionResult> {
  try {
    await updateSetting<GeneralSettings>('general', data);
    revalidatePath('/admin/configuration/general'); // Revalidate to reflect changes
    revalidatePath('/', 'layout'); // Revalidate homepage and layout for hero content
    return { success: true, message: 'General settings saved successfully!' };
  } catch (error) {
    console.error('Failed to save general settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}
