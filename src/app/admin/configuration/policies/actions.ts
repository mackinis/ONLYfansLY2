
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, type PolicySettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function savePolicySettingsAction(
  data: PolicySettings
): Promise<ActionResult> {
  try {
    await updateSetting<PolicySettings>('policies', data);
    revalidatePath('/admin/configuration/policies');
    revalidatePath('/about');
    revalidatePath('/privacy');
    revalidatePath('/terms');
    return { success: true, message: '¡Configuración de políticas guardada exitosamente!' };
  } catch (error) {
    console.error('Failed to save policy settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al guardar configuración: ${errorMessage}` };
  }
}
