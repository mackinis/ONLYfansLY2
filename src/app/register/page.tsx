
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { registerUserAction } from '@/app/auth/actions';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!termsAccepted) {
      toast({ title: "Error", description: "Debes aceptar los términos y condiciones.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('dni', dni);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('postalCode', postalCode);
    formData.append('city', city);
    formData.append('province', province);
    formData.append('country', country);
    formData.append('password', password);
    
    try {
      const result = await registerUserAction(formData);
      if (result.success) {
        toast({
          title: "¡Registro Exitoso!",
          description: "Revisa tu correo electrónico para verificar tu cuenta.",
        });
        router.push('/login'); // Redirect to login page after successful registration
      } else {
        toast({
          title: "Error en el Registro",
          description: result.message || "No se pudo completar el registro. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado durante el registro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Crear Cuenta</CardTitle>
          <CardDescription>Únete a ONLYfansLY hoy. Completa tus datos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" placeholder="Tu nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" placeholder="Tu apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" placeholder="Tu DNI" value={dni} onChange={(e) => setDni(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" placeholder="Tu número de teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Tu dirección completa" value={address} onChange={(e) => setAddress(e.target.value)} required disabled={isLoading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input id="postalCode" placeholder="Ej: 1234" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" placeholder="Tu ciudad" value={city} onChange={(e) => setCity(e.target.value)} required disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="province">Provincia / Estado</Label>
                <Input id="province" placeholder="Tu provincia o estado" value={province} onChange={(e) => setProvince(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">País</Label>
                <Input id="country" placeholder="Tu país" value={country} onChange={(e) => setCountry(e.target.value)} required disabled={isLoading} />
              </div>
            </div>
            
            <div className="space-y-1.5 relative">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Crea una contraseña" 
                required 
                className="pr-10"
                value={password} onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-7 h-7 px-2" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-1.5 relative">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirma tu contraseña" 
                required 
                className="pr-10"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-7 h-7 px-2" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" required checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} disabled={isLoading} />
              <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                Acepto los <Link href="/terms" className="underline hover:text-primary">términos y condiciones</Link> y la <Link href="/privacy" className="underline hover:text-primary">política de privacidad</Link>.
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
