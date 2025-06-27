
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, AppearanceSettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveAppearanceSettingsAction(
  data: AppearanceSettings
): Promise<ActionResult> {
  try {
    await updateSetting<AppearanceSettings>('appearance', data);
    revalidatePath('/admin/configuration/appearance');
    // Potentially revalidate all public pages if these settings affect global styles/logo
    revalidatePath('/', 'layout'); 
    return { success: true, message: 'Appearance settings saved successfully!' };
  } catch (error) {
    console.error('Failed to save appearance settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}

    