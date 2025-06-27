
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, type AppMobilesSettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveAppMobilesSettingsAction(
  data: AppMobilesSettings
): Promise<ActionResult> {
  try {
    await updateSetting<AppMobilesSettings>('app_mobiles', data);
    revalidatePath('/admin/appmobiles');
    revalidatePath('/', 'layout'); // Revalidate footer
    return { success: true, message: 'Configuración de apps móviles guardada exitosamente!' };
  } catch (error) {
    console.error('Failed to save app mobiles settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al guardar configuración: ${errorMessage}` };
  }
}
