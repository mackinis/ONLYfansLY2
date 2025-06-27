
'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from '@/services/userService';
import { getUserProfile } from '@/services/userService';
import { updateAdminProfileAction, updateAdminPasswordAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

const USER_SESSION_KEY = 'onlyfansly_user_session';

export default function AdminConfigAccountPage() {
    const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, startProfileTransition] = useTransition();
    const [isSavingPassword, startPasswordTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        const fetchAdminProfile = async () => {
            setIsLoading(true);
            const session = localStorage.getItem(USER_SESSION_KEY);
            if (session) {
                try {
                    const parsedSession = JSON.parse(session);
                    if (parsedSession.uid && parsedSession.role === 'admin') {
                        const profile = await getUserProfile(parsedSession.uid);
                        if (profile) {
                            setAdminProfile(profile);
                            setEmail(profile.email || '');
                            setAvatarUrl(profile.avatarUrl || '');
                        } else {
                            toast({ title: "Error", description: "No se pudo encontrar el perfil del administrador.", variant: "destructive" });
                        }
                    }
                } catch (e) {
                    toast({ title: "Error", description: "Error al cargar la sesión del administrador.", variant: "destructive" });
                }
            }
            setIsLoading(false);
        };
        fetchAdminProfile();
    }, [toast]);

    const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ title: "Archivo Demasiado Grande", description: "Elige una imagen de menos de 2MB.", variant: "destructive" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = () => {
        if (!adminProfile) return;
        startProfileTransition(async () => {
            const result = await updateAdminProfileAction(adminProfile.uid, { email, avatarUrl });
            toast({
                title: result.success ? "Éxito" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
            if (result.success) {
                const session = localStorage.getItem(USER_SESSION_KEY);
                if (session) {
                    const sessionData = JSON.parse(session);
                    localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ ...sessionData, email, avatarUrl }));
                    window.dispatchEvent(new Event('storage'));
                }
            }
        });
    };

    const handleChangePassword = () => {
        if (!adminProfile) return;
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Las nuevas contraseñas no coinciden.", variant: "destructive" });
            return;
        }
        startPasswordTransition(async () => {
            const result = await updateAdminPasswordAction(adminProfile.uid, { current: currentPassword, new: newPassword });
            toast({
                title: result.success ? "Éxito" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
            if (result.success) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        });
    };

    const adminInitials = adminProfile?.firstName && adminProfile?.lastName 
        ? `${adminProfile.firstName.charAt(0)}${adminProfile.lastName.charAt(0)}` 
        : adminProfile?.email ? adminProfile.email.charAt(0).toUpperCase() : 'A';
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3 mb-1" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-1/3" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3 mb-1" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-1/3" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold text-primary">Configuración de Cuenta de Administrador</h1>
                <p className="text-muted-foreground">Gestiona los detalles de tu cuenta de administrador.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Información del Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={avatarUrl} alt={adminProfile?.firstName || 'Admin'} />
                            <AvatarFallback className="text-3xl bg-muted">{adminInitials}</AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="avatarUrl">Foto de Perfil (URL o Subida)</Label>
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <Input 
                                        id="avatarUrl"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="Pega una URL o sube un archivo"
                                        disabled={isSavingProfile}
                                        className="flex-grow"
                                    />
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSavingProfile} className="w-full sm:w-auto">
                                        Subir Archivo
                                    </Button>
                                    <Input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={handleAvatarFileChange}
                                        disabled={isSavingProfile}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adminEmail">Dirección de Email</Label>
                                <Input id="adminEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSavingProfile} />
                            </div>
                        </div>
                    </div>
                     <div className="pt-4 flex justify-end">
                        <Button onClick={handleUpdateProfile} disabled={isSavingProfile}>
                            {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Actualizar Perfil
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isSavingPassword} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSavingPassword}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSavingPassword}/>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleChangePassword} disabled={isSavingPassword}>
                            {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cambiar Contraseña
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
