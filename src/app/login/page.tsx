
'use client';

import { useState, type FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { loginUserAction } from '@/app/auth/actions'; // Importar la nueva acción de login

// Define una clave para localStorage
const USER_SESSION_KEY = 'onlyfansly_user_session';

interface UserSessionData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Comprobar si ya hay una sesión de usuario en localStorage
    const storedSession = localStorage.getItem(USER_SESSION_KEY);
    if (storedSession) {
      try {
        const sessionData: UserSessionData = JSON.parse(storedSession);
        if (sessionData && sessionData.uid) {
          if (sessionData.isVerified) {
            // FIX: Redirect based on role to prevent loop
            router.replace(sessionData.role === 'admin' ? '/admin' : '/');
          } else {
            // User is not verified, send them to the verification page
            router.replace(`/verify-account?uid=${sessionData.uid}`);
          }
        }
      } catch (error) {
        console.error("Error parsing stored session:", error);
        localStorage.removeItem(USER_SESSION_KEY); // Limpiar sesión corrupta
      }
    }
    setIsCheckingAuth(false);
  }, [router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const result = await loginUserAction(formData);

      if (result.success && result.user) {
        toast({ title: "Login Exitoso", description: "Redirigiendo..." });
        
        // Guardar datos de sesión en localStorage
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(result.user));

        if (result.user.isVerified) {
          router.push(result.user.role === 'admin' ? '/admin' : '/'); // O dashboard de usuario
        } else {
          // Pasar el UID a la página de verificación, por ejemplo, mediante query params
          router.push(`/verify-account?uid=${result.user.uid}`);
        }
      } else {
        toast({ title: "Login Fallido", description: result.message || "Credenciales incorrectas.", variant: "destructive" });
        localStorage.removeItem(USER_SESSION_KEY); // Asegurarse de limpiar sesión en caso de fallo
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ title: "Login Fallido", description: error.message || "Ocurrió un error inesperado.", variant: "destructive" });
      localStorage.removeItem(USER_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando estado de autenticación...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Login</CardTitle>
          <CardDescription>Accede a tu cuenta ONLYfansLY.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Tu contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Iniciando sesión...' : 'Login'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
