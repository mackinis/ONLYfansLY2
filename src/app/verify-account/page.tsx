
'use client';

import { useState, type FormEvent, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { verifyTokenAction, resendVerificationTokenAction } from '@/app/auth/actions';
import Link from "next/link";

const USER_SESSION_KEY = 'onlyfansly_user_session';

interface UserSessionData {
  uid: string;
  email: string;
  isVerified: boolean;
  // ... otros datos que puedas tener
}

function VerifyAccountContent() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook para leer query params
  const { toast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Intentar obtener el UID del usuario de los query params (si vino de login)
    const uidFromQuery = searchParams.get('uid');
    let sessionUserId: string | null = uidFromQuery;
    let sessionUserEmail: string | null = null;

    // Si no está en query params, intentar desde localStorage (si el usuario refresca la página)
    if (!sessionUserId) {
      const storedSession = localStorage.getItem(USER_SESSION_KEY);
      if (storedSession) {
        try {
          const sessionData: UserSessionData = JSON.parse(storedSession);
          if (sessionData && sessionData.uid) {
            if (sessionData.isVerified) {
              toast({ title: "Cuenta ya verificada", description: "Redirigiendo..." });
              router.replace(sessionData.role === 'admin' ? '/admin' : '/'); // Asumiendo que tienes 'role'
              return;
            }
            sessionUserId = sessionData.uid;
            sessionUserEmail = sessionData.email;
          } else {
            // Sesión inválida o sin uid
            localStorage.removeItem(USER_SESSION_KEY);
          }
        } catch (error) {
          console.error("Error parsing stored session for verification:", error);
          localStorage.removeItem(USER_SESSION_KEY);
        }
      }
    } else {
      // Si uidFromQuery existe, intentar obtener email de localStorage si es posible
      const storedSession = localStorage.getItem(USER_SESSION_KEY);
      if (storedSession) {
        try {
          const sessionData: UserSessionData = JSON.parse(storedSession);
          if (sessionData && sessionData.uid === uidFromQuery) {
            sessionUserEmail = sessionData.email;
          }
        } catch (e) { /* no hacer nada */ }
      }
    }
    
    if (!sessionUserId) {
      toast({ title: "Error", description: "No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.", variant: "destructive" });
      router.replace('/login');
      return;
    }
    
    setUserId(sessionUserId);
    setUserEmail(sessionUserEmail || "tu correo electrónico"); // Fallback si el email no está

  }, [router, searchParams, toast]);

  const handleVerifyToken = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      toast({ title: "Error", description: "ID de usuario no encontrado.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyTokenAction(userId, token);
      if (result.success) {
        toast({ title: "¡Éxito!", description: result.message });
        // Actualizar la sesión local para reflejar la verificación
        const storedSession = localStorage.getItem(USER_SESSION_KEY);
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ ...sessionData, isVerified: true }));
        }
        router.push(JSON.parse(storedSession || '{}').role === 'admin' ? '/admin' : '/'); // O al dashboard
      } else {
        toast({ title: "Error de Verificación", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error inesperado.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    if (!userId) {
      toast({ title: "Error", description: "ID de usuario no encontrado.", variant: "destructive" });
      return;
    }
    setIsResending(true);
    try {
      const result = await resendVerificationTokenAction(userId);
      if (result.success) {
        toast({ title: "Token Reenviado", description: result.message });
      } else {
        toast({ title: "Error al Reenviar", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error inesperado al reenviar el token.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando información del usuario...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Verificar Cuenta</CardTitle>
          <CardDescription>
            Ingresa el token que enviamos a {userEmail} para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleVerifyToken} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token">Token de Verificación</Label>
              <Input 
                id="token" 
                placeholder="Ingresa tu token" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={isLoading || isResending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isResending}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Verificando...' : 'Verificar Token'}
            </Button>
          </form>
          <div className="text-center">
            <Button variant="link" onClick={handleResendToken} disabled={isLoading || isResending}>
              {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isResending ? 'Reenviando...' : '¿No recibiste el token? Reenviar'}
            </Button>
          </div>
           <p className="text-center text-sm text-muted-foreground">
            Si ya verificaste tu cuenta, intenta <Link href="/login" className="font-medium text-primary hover:underline">iniciar sesión nuevamente</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente wrapper para Suspense
export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div>Cargando parámetros...</div>}>
      <VerifyAccountContent />
    </Suspense>
  )
}
