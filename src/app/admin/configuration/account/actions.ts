
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserProfile, type UserProfile } from '@/services/userService';
import crypto from 'crypto';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ActionResult {
  success: boolean;
  message: string;
}

function hashPassword(password: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

export async function updateAdminProfileAction(
  userId: string,
  data: Partial<UserProfile>
): Promise<ActionResult> {
  if (!userId) {
    return { success: false, message: 'Admin user ID is missing.' };
  }
  try {
    const updateData: Partial<UserProfile> = {};
    // Only add fields to update if they are actually provided to avoid overwriting with undefined
    if (data.email) updateData.email = data.email;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl; // Allow setting empty string
    
    await updateUserProfile(userId, updateData);

    revalidatePath('/admin/configuration/account');
    revalidatePath('/admin', 'layout');
    
    return { success: true, message: 'Perfil actualizado exitosamente!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al actualizar perfil: ${errorMessage}` };
  }
}

export async function updateAdminPasswordAction(
  userId: string,
  passwords: { current: string; new: string }
): Promise<ActionResult> {
    if (!userId) {
        return { success: false, message: 'Admin user ID is missing.' };
    }
    if (!passwords.current || !passwords.new) {
        return { success: false, message: 'Ambas contraseñas son requeridas.' };
    }

    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return { success: false, message: 'Admin user not found.' };
        }

        const adminData = userDoc.data();
        const storedHashedPassword = adminData.password;
        const providedHashedPassword = hashPassword(passwords.current);

        if (providedHashedPassword !== storedHashedPassword) {
            return { success: false, message: 'La contraseña actual es incorrecta.' };
        }
        
        const newHashedPassword = hashPassword(passwords.new);
        await updateUserProfile(userId, { password: newHashedPassword });

        return { success: true, message: 'Contraseña actualizada exitosamente!' };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
        return { success: false, message: `Error al cambiar la contraseña: ${errorMessage}` };
    }
}
