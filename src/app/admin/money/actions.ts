
'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting, MoneySettings } from '@/services/settingsService';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function saveMoneySettingsAction(
  data: MoneySettings
): Promise<ActionResult> {
  // Basic validation, can be expanded with Zod if needed
  if (!data.defaultCurrency || !data.showArsSymbol || !data.showUsdSymbol) {
    return { success: false, message: 'Todos los campos de moneda son requeridos.' };
  }
  if (data.exchangeRateArsToUsd === undefined || data.exchangeRateArsToUsd <= 0) {
     return { success: false, message: 'El tipo de cambio ARS a USD debe ser un número positivo.' };
  }


  try {
    await updateSetting<MoneySettings>('money', data);
    revalidatePath('/admin/money'); 
    // Potentially revalidate public pages that display prices if they directly read these settings
    // revalidatePath('/courses');
    return { success: true, message: 'Configuración de moneda guardada exitosamente!' };
  } catch (error) {
    console.error('Failed to save money settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al guardar configuración: ${errorMessage}` };
  }
}

    