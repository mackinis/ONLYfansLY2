
'use server';

import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { z } from 'zod';

console.log('[AUTH_ACTIONS_MODULE_SCOPE] Loading src/app/auth/actions.ts');
console.log(`[AUTH_ACTIONS_MODULE_SCOPE] ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? 'Loaded' : 'MISSING or Empty'}`);

if (db) {
  console.log('[AUTH_ACTIONS_MODULE_SCOPE] Imported \'db\' (Firestore) object seems available.');
} else {
  console.error('[AUTH_ACTIONS_MODULE_SCOPE] CRITICAL: Imported \'db\' (Firestore) object is NOT available.');
}

const registerSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido."),
  lastName: z.string().min(1, "Apellido es requerido."),
  dni: z.string().min(1, "DNI es requerido."),
  phone: z.string().min(1, "Teléfono es requerido."),
  email: z.string().email("Email inválido."),
  address: z.string().min(1, "Dirección es requerida."),
  postalCode: z.string().min(1, "Código Postal es requerido."),
  city: z.string().min(1, "Ciudad es requerida."),
  province: z.string().min(1, "Provincia es requerida."),
  country: z.string().min(1, "País es requerido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

function hashPassword(password: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

function generateVerificationToken(length = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function sendVerificationEmail(to: string, token: string) {
  console.log(`[SEND_VERIFICATION_EMAIL] Attempting to send email to: ${to}`);
  
  const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  let missingVar = false;
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.error(`[SEND_VERIFICATION_EMAIL] Missing Nodemailer environment variable: ${varName}`);
      missingVar = true;
    }
  }
  if (missingVar) {
    throw new Error('Error de configuración del servidor de correo: Faltan variables de entorno.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_PORT === "465", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Bienvenido a ONLYfansLY - Verifica tu cuenta',
    html: `
      <h1>¡Bienvenido a ONLYfansLY!</h1>
      <p>Gracias por registrarte. Por favor, usa el siguiente token para verificar tu cuenta:</p>
      <h2 style="font-size: 20px; letter-spacing: 1px; border: 1px dashed #ccc; padding: 10px; display: inline-block;">${token}</h2>
      <p>Si no te registraste en ONLYfansLY, por favor ignora este correo.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SEND_VERIFICATION_EMAIL] Verification email sent successfully to: ${to}`);
  } catch (error) {
    console.error('[SEND_VERIFICATION_EMAIL] Error sending verification email via Nodemailer:', error);
    throw new Error('No se pudo enviar el correo de verificación.');
  }
}

export async function registerUserAction(formData: FormData) {
  console.log('[REGISTER_USER_ACTION] --- Action Invoked (START) ---');
  const rawFormData = Object.fromEntries(formData.entries());
  console.log('[REGISTER_USER_ACTION] Received formData:', rawFormData);

  if (!db) {
    console.error("[REGISTER_USER_ACTION] CRITICAL: Firestore 'db' object is NOT available.");
    return { success: false, message: 'Error crítico de configuración del servidor (DB no disponible).' };
  }
  console.log("[REGISTER_USER_ACTION] Firestore 'db' object is available.");

  const validation = registerSchema.safeParse(rawFormData);

  if (!validation.success) {
    console.error("[REGISTER_USER_ACTION] Zod validation failed.", validation.error.flatten());
    return { success: false, message: "Error de validación en el servidor.", errors: validation.error.flatten().fieldErrors };
  }
  console.log("[REGISTER_USER_ACTION] Zod validation successful.");

  const { 
    email, password, firstName, lastName, dni, phone, 
    address, postalCode, city, province, country 
  } = validation.data;

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      console.log(`[REGISTER_USER_ACTION] Email ${email} already exists in Firestore.`);
      return { success: false, message: 'Este correo electrónico ya está registrado.' };
    }
    console.log(`[REGISTER_USER_ACTION] Email ${email} is available.`);

    const hashedPassword = hashPassword(password);
    console.log(`[REGISTER_USER_ACTION] Password hashed for email: ${email}`);

    const verificationToken = generateVerificationToken();
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    console.log(`[REGISTER_USER_ACTION] User role determined as: ${role} for email: ${email}`);

    const newUserRef = doc(collection(db, "users"));
    const userId = newUserRef.id;

    const userData = {
      uid: userId, 
      email,
      firstName,
      lastName,
      dni,
      phone,
      address,
      postalCode,
      city,
      province,
      country,
      password: hashedPassword, 
      role,
      verificationToken,
      isVerified: false,
      isSuspended: false,
      avatarUrl: '', // Initialize with empty avatar URL
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(newUserRef, userData);
    console.log("[REGISTER_USER_ACTION] Firestore document created for user:", userId);

    await sendVerificationEmail(email, verificationToken);

    console.log("[REGISTER_USER_ACTION] Registration process completed successfully for:", email);
    return { success: true, message: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.' };

  } catch (error: any) {
    console.error("[REGISTER_USER_ACTION] Error during custom registration process:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    let errorMessage = 'Error al registrar el usuario. Inténtalo de nuevo.';
     if (error.message) { 
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

export async function loginUserAction(formData: FormData) {
  console.log('[LOGIN_USER_ACTION] --- Action Invoked (START) ---');
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email y contraseña son requeridos.' };
  }
  if (!db) {
    console.error("[LOGIN_USER_ACTION] CRITICAL: Firestore 'db' object is NOT available.");
    return { success: false, message: 'Error crítico de configuración del servidor (DB).' };
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`[LOGIN_USER_ACTION] User not found for email: ${email}`);
      return { success: false, message: 'Email o contraseña incorrectos.' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    if (userData.isSuspended) {
      console.log(`[LOGIN_USER_ACTION] Account suspended for email: ${email}`);
      return { success: false, message: 'Esta cuenta ha sido suspendida. Contacta al administrador.' };
    }

    const storedHashedPassword = userData.password;
    const providedHashedPassword = hashPassword(password);

    if (providedHashedPassword !== storedHashedPassword) {
      console.log(`[LOGIN_USER_ACTION] Password mismatch for email: ${email}`);
      return { success: false, message: 'Email o contraseña incorrectos.' };
    }

    console.log(`[LOGIN_USER_ACTION] Login successful for email: ${email}, User ID: ${userDoc.id}`);
    return {
      success: true,
      message: 'Login exitoso.',
      user: {
        uid: userDoc.id, 
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isVerified: userData.isVerified,
        avatarUrl: userData.avatarUrl || '', // Return avatar URL on login
      },
    };
  } catch (error: any) {
    console.error("[LOGIN_USER_ACTION] Error during custom login:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return { success: false, message: 'Error al intentar iniciar sesión.' };
  }
}


export async function verifyTokenAction(userId: string, token: string) {
  console.log(`[VERIFY_TOKEN_ACTION] --- Action Invoked for user: ${userId} with token: ${token} ---`);
  if (!userId || !token) {
    return { success: false, message: 'ID de usuario y token son requeridos.' };
  }
  if (!db) {
    console.error("[VERIFY_TOKEN_ACTION] CRITICAL: Firestore 'db' object is not initialized.");
    return { success: false, message: 'Error de configuración del servidor (DB).' };
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.log("[VERIFY_TOKEN_ACTION] User document not found for ID:", userId);
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const userData = userDocSnap.data();
    if (userData.isVerified) {
      console.log("[VERIFY_TOKEN_ACTION] User already verified:", userId);
      return { success: true, message: 'Tu cuenta ya está verificada.' };
    }

    if (userData.verificationToken === token) {
      console.log("[VERIFY_TOKEN_ACTION] Token match for user:", userId);
      await updateDoc(userDocRef, {
        isVerified: true,
        verificationToken: null, 
        updatedAt: Timestamp.now(),
      });
      console.log("[VERIFY_TOKEN_ACTION] User verified successfully in Firestore:", userId);
      return { success: true, message: '¡Cuenta verificada exitosamente!' };
    } else {
      console.log("[VERIFY_TOKEN_ACTION] Token mismatch for user:", userId);
      return { success: false, message: 'Token inválido o expirado.' };
    }
  } catch (error: any) {
    console.error("[VERIFY_TOKEN_ACTION] Token verification error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return { success: false, message: 'Error al verificar el token.' };
  }
}

export async function resendVerificationTokenAction(userId: string) {
  console.log(`[RESEND_TOKEN_ACTION] --- Action Invoked for user: ${userId} ---`);
  if (!userId) {
    return { success: false, message: 'ID de usuario es requerido.' };
  }
   if (!db) {
    console.error("[RESEND_TOKEN_ACTION] CRITICAL: Firestore 'db' object is not initialized.");
    return { success: false, message: 'Error de configuración del servidor (DB).' };
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.log("[RESEND_TOKEN_ACTION] User document not found for ID:", userId);
      return { success: false, message: 'Usuario no encontrado.' };
    }
    const userData = userDocSnap.data();
    if (userData.isVerified) {
        console.log("[RESEND_TOKEN_ACTION] User already verified:", userId);
        return { success: false, message: 'Tu cuenta ya está verificada.' }; 
    }
    if (!userData.email) {
        console.error("[RESEND_TOKEN_ACTION] User data is missing email for user:", userId);
        return { success: false, message: 'No se pudo encontrar el email del usuario para reenviar el token.' };
    }

    const newVerificationToken = generateVerificationToken();
    await updateDoc(userDocRef, {
      verificationToken: newVerificationToken,
      updatedAt: Timestamp.now(),
    });
    console.log("[RESEND_TOKEN_ACTION] Updated token in Firestore for user:", userId);

    await sendVerificationEmail(userData.email, newVerificationToken);
    console.log("[RESEND_TOKEN_ACTION] Resend process completed for user:", userId);
    return { success: true, message: 'Se ha reenviado un nuevo token de verificación a tu correo.' };
  } catch (error: any) {
    console.error("[RESEND_TOKEN_ACTION] Resend token error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
     let errorMessage = 'Error al reenviar el token.';
     if (error.message) { 
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}
