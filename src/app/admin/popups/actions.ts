
'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { addPopup, updatePopup, deletePopup, type PopupData, popupSchema } from '@/services/popupService';

interface ActionResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

export async function addPopupAction(data: PopupData): Promise<ActionResult> {
  const validation = popupSchema.safeParse(data);
  if (!validation.success) {
    console.error("Validation failed:", validation.error.issues);
    return { success: false, message: "Error de validación.", errors: validation.error.issues };
  }

  try {
    await addPopup(validation.data);
    revalidatePath('/admin/popups');
    revalidatePath('/');
    return { success: true, message: 'Popup creado exitosamente!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al crear popup: ${errorMessage}` };
  }
}

export async function updatePopupAction(id: string, data: PopupData): Promise<ActionResult> {
  const validation = popupSchema.safeParse(data);
  if (!validation.success) {
    console.error("Validation failed:", validation.error.issues);
    return { success: false, message: "Error de validación.", errors: validation.error.issues };
  }
  try {
    await updatePopup(id, validation.data);
    revalidatePath('/admin/popups');
    revalidatePath(`/admin/popups/edit/${id}`);
    revalidatePath('/');
    return { success: true, message: 'Popup actualizado exitosamente!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al actualizar popup: ${errorMessage}` };
  }
}

export async function deletePopupAction(id: string): Promise<ActionResult> {
  try {
    await deletePopup(id);
    revalidatePath('/admin/popups');
    revalidatePath('/');
    return { success: true, message: 'Popup eliminado exitosamente!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al eliminar popup: ${errorMessage}` };
  }
}

export async function togglePopupStatusAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await updatePopup(id, { isActive });
    revalidatePath('/admin/popups');
    revalidatePath('/');
    return { success: true, message: 'Estado del popup actualizado.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al actualizar estado: ${errorMessage}` };
  }
}
