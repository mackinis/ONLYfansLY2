
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, WhatsAppSettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveWhatsAppSettingsAction(
  data: WhatsAppSettings
): Promise<ActionResult> {
  // Basic validation, can be expanded with Zod
  if (data.enableWhatsAppWidget && !data.whatsAppNumber) {
     return { success: false, message: 'Se requiere un número de WhatsApp si el widget está habilitado.' };
  }
  if (data.widgetIconType === 'custom' && !data.widgetIconUrl) {
    return { success: false, message: 'Se requiere una URL para el ícono personalizado.' };
  }


  try {
    await updateSetting<WhatsAppSettings>('whatsapp', data);
    revalidatePath('/admin/whatsapp'); 
    revalidatePath('/'); // Revalidate homepage as widget is there
    return { success: true, message: 'Configuración de WhatsApp guardada exitosamente!' };
  } catch (error) {
    console.error('Failed to save WhatsApp settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al guardar configuración: ${errorMessage}` };
  }
}
