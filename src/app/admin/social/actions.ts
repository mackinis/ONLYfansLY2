
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, SocialMediaSettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveSocialMediaSettingsAction(
  data: SocialMediaSettings
): Promise<ActionResult> {
  // Basic validation: ensure all links have a platform and a valid URL
  if (data.links) {
    for (const link of data.links) {
      if (!link.platform || link.platform.trim() === '') {
        return { success: false, message: 'Todas las plataformas deben tener un nombre.' };
      }
      if (!link.url || link.url.trim() === '') {
        return { success: false, message: `El enlace para ${link.platform} debe tener una URL.` };
      }
      try {
        new URL(link.url); // Validate URL format
      } catch (_) {
        return { success: false, message: `La URL '${link.url}' para ${link.platform} no es válida.` };
      }
    }
  }

  try {
    await updateSetting<SocialMediaSettings>('social_media', data); // Using 'social_media' as docId
    revalidatePath('/admin/social'); 
    revalidatePath('/', 'layout'); // Revalidate all pages as footer might change
    return { success: true, message: 'Configuración de redes sociales guardada exitosamente!' };
  } catch (error) {
    console.error('Failed to save social media settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al guardar configuración: ${errorMessage}` };
  }
}
