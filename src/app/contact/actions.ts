
'use server';

import nodemailer from 'nodemailer';
import { z } from 'zod';
import { getSetting, type GeneralSettings } from '@/services/settingsService';

const contactSchema = z.object({
  name: z.string().min(1, "Nombre es requerido."),
  email: z.string().email("Email inválido."),
  subject: z.string().min(1, "Asunto es requerido."),
  message: z.string().min(1, "Mensaje es requerido."),
});

interface ActionResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

export async function sendContactEmailAction(
  data: unknown
): Promise<ActionResult> {
  const validation = contactSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Error de validación.", errors: validation.error.issues };
  }

  const { name, email, subject, message } = validation.data;

  try {
    const settings = await getSetting<GeneralSettings>('general');
    const adminEmail = settings?.adminEmail;

    if (!adminEmail) {
      console.error("ADMIN_EMAIL not configured in general settings.");
      throw new Error("El sistema no está configurado para recibir mensajes. Contacta al administrador por otro medio.");
    }
    
    // Check for Nodemailer environment variables
    const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        console.error(`[CONTACT_ACTION] Missing Nodemailer environment variable: ${varName}`);
        throw new Error('Error de configuración del servidor de correo.');
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!, 10),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `Nuevo Mensaje de Contacto: ${subject}`,
      html: `
        <h1>Nuevo Mensaje desde el Formulario de Contacto</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email del Remitente:</strong> ${email}</p>
        <hr>
        <h2>Mensaje:</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: '¡Gracias! Tu mensaje ha sido enviado exitosamente.' };

  } catch (error) {
    console.error("Error sending contact email:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al enviar el mensaje: ${errorMessage}` };
  }
}
