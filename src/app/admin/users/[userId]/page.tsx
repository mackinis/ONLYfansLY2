
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from '@/services/userService';
import { getUserProfile } from '@/services/userService';
import { ArrowLeft, Mail, Phone, Home, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // Import Avatar components

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
          const profile = await getUserProfile(userId);
          if (profile) {
            setUserProfile(profile);
          } else {
            toast({ title: "Error", description: "Usuario no encontrado.", variant: "destructive" });
            router.replace('/admin/users');
          }
        } catch (error) {
          toast({ title: "Error", description: "Error al cargar el perfil del usuario.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserProfile();
    } else {
      router.replace('/admin/users');
    }
  }, [userId, router, toast]);

  if (isLoading || !userProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const userInitials = userProfile.firstName && userProfile.lastName 
    ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}` 
    : userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver a Usuarios</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Detalles del Usuario</h1>
          <p className="text-muted-foreground">Perfil completo de {userProfile.firstName} {userProfile.lastName}.</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={userProfile.avatarUrl} alt={`${userProfile.firstName} ${userProfile.lastName}`} />
            <AvatarFallback className="text-2xl bg-muted">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-headline">
              {userProfile.firstName} {userProfile.lastName}
              {userProfile.role === 'admin' && <Badge variant="destructive" className="ml-2">Admin</Badge>}
            </CardTitle>
            <CardDescription>{userProfile.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <InfoItem icon={Mail} label="Email" value={userProfile.email} />
            <InfoItem icon={Phone} label="Teléfono" value={userProfile.phone} />
            <InfoItem icon={Home} label="DNI" value={userProfile.dni} />
            <InfoItem 
              icon={userProfile.isVerified ? CheckCircle : XCircle} 
              label="Verificado" 
              value={userProfile.isVerified ? 'Sí' : 'No'} 
              valueClassName={userProfile.isVerified ? 'text-green-600' : 'text-red-600'}
            />
            <InfoItem 
              icon={userProfile.canChat === undefined || userProfile.canChat ? CheckCircle : XCircle} 
              label="Puede Chatear" 
              value={userProfile.canChat === undefined || userProfile.canChat ? 'Sí' : 'No'}
              valueClassName={(userProfile.canChat === undefined || userProfile.canChat) ? 'text-green-600' : 'text-red-600'}
            />
             <InfoItem 
              icon={userProfile.isSuspended ? ShieldAlert : CheckCircle} 
              label="Suspendido" 
              value={userProfile.isSuspended ? 'Sí' : 'No'}
              valueClassName={userProfile.isSuspended ? 'text-destructive font-semibold' : 'text-green-600'}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2 text-accent flex items-center"><Home className="mr-2 h-5 w-5"/> Dirección</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <InfoItem label="Calle" value={userProfile.address} />
              <InfoItem label="Código Postal" value={userProfile.postalCode} />
              <InfoItem label="Ciudad" value={userProfile.city} />
              <InfoItem label="Provincia" value={userProfile.province} />
              <InfoItem label="País" value={userProfile.country} />
            </div>
          </div>
          
          <Separator />

           <div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Información de la Cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <InfoItem label="UID" value={userProfile.uid} />
                <InfoItem label="Rol" value={userProfile.role} />
                <InfoItem label="Creado" value={userProfile.createdAt ? format(userProfile.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'} />
                <InfoItem label="Actualizado" value={userProfile.updatedAt ? format(userProfile.updatedAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon?: React.ElementType;
  label: string;
  value?: string | number | boolean | null;
  valueClassName?: string;
}

function InfoItem({ icon: Icon, label, value, valueClassName }: InfoItemProps) {
  const displayValue = value === undefined || value === null || value === '' ? 'No especificado' : String(value);
  return (
    <div className="flex flex-col">
      <Label className="text-sm text-muted-foreground mb-0.5 flex items-center">
        {Icon && <Icon className="mr-1.5 h-4 w-4" />} 
        {label}
      </Label>
      <p className={`text-base text-foreground break-words ${valueClassName || ''}`}>{displayValue}</p>
    </div>
  );
}
