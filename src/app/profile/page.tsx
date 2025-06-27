
'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/services/userService';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // Import Avatar components

const USER_SESSION_KEY = 'onlyfansly_user_session';

interface UserSessionData {
  uid: string;
  email: string;
  avatarUrl?: string;
  // Other potential fields from session
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem(USER_SESSION_KEY);
    if (!storedSession) {
      router.replace('/login');
      return;
    }
    try {
      const sessionData: UserSessionData = JSON.parse(storedSession);
      if (!sessionData.uid) {
        router.replace('/login');
        return;
      }
      
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const profile = await getUserProfile(sessionData.uid);
          if (profile) {
            setUserProfile(profile);
            setFirstName(profile.firstName || '');
            setLastName(profile.lastName || '');
            setPhone(profile.phone || '');
            setAddress(profile.address || '');
            setPostalCode(profile.postalCode || '');
            setCity(profile.city || '');
            setProvince(profile.province || '');
            setCountry(profile.country || '');
            setAvatarUrl(profile.avatarUrl || '');
          } else {
            toast({ title: "Error", description: "No se pudo cargar tu perfil.", variant: "destructive" });
            router.replace('/'); // Redirect if profile not found
          }
        } catch (error) {
          toast({ title: "Error", description: "Error al cargar el perfil.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();

    } catch (error) {
      localStorage.removeItem(USER_SESSION_KEY);
      router.replace('/login');
    }
  }, [router, toast]);

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Archivo Demasiado Grande",
          description: "Por favor, elige una imagen de menos de 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userProfile) return;
    setIsSaving(true);

    const updatedData: Partial<UserProfile> = {
      firstName,
      lastName,
      phone,
      address,
      postalCode,
      city,
      province,
      country,
      avatarUrl,
    };

    try {
      await updateUserProfile(userProfile.uid, updatedData);
      toast({ title: "Perfil Actualizado", description: "Tu información ha sido guardada." });
      // Optionally update localStorage session if these fields are used there
      const storedSession = localStorage.getItem(USER_SESSION_KEY);
      if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify({
              ...sessionData,
              firstName, // Update local session to reflect changes immediately
              lastName,
              avatarUrl,
          }));
          window.dispatchEvent(new Event('storage')); // Notify other components of the change
      }

    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const userInitials = firstName && lastName 
    ? `${firstName.charAt(0)}${lastName.charAt(0)}` 
    : userProfile?.email ? userProfile.email.charAt(0).toUpperCase() : '?';


  if (isLoading || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
             <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
                <AvatarFallback className="text-3xl bg-muted">{userInitials}</AvatarFallback>
             </Avatar>
            <div>
              <CardTitle className="text-3xl font-headline text-primary text-center">Mi Perfil</CardTitle>
              <CardDescription className="text-center">Actualiza tu información personal.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
             <div className="space-y-1.5">
              <Label>Foto de Perfil</Label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input 
                  id="avatarUrl" 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  disabled={isSaving} 
                  placeholder="Pega una URL de imagen aquí" 
                  className="flex-grow"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving} className="w-full sm:w-auto">
                  Subir Archivo
                </Button>
                <Input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleAvatarFileChange}
                />
              </div>
               <p className="text-xs text-muted-foreground">Usa una URL o sube un archivo (máx 2MB).</p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSaving} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={userProfile.email || ''} disabled />
              <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSaving} />
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t mt-6">Dirección</h3>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSaving} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} disabled={isSaving} />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="province">Provincia</Label>
                <Input id="province" value={province} onChange={(e) => setProvince(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">País</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={isSaving} />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
