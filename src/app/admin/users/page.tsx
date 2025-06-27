
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, type UserProfile } from '@/services/userService'; 
import { toggleUserChatStatusAction, toggleUserSuspensionAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users as UsersIcon, MessageSquare, Edit, Eye, UserSlash, UserCheck, Ban } from "lucide-react";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const fetchedUsers = await getAllUsers();
        // Filter out the admin user from the list displayed
        setUsers(fetchedUsers.filter(user => user.role !== 'admin'));
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [toast]);

  const handleToggleChatStatus = async (userId: string, currentCanChat: boolean) => {
    startTransition(async () => {
      const result = await toggleUserChatStatusAction(userId, !currentCanChat);
      if (result.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.uid === userId ? { ...user, canChat: !currentCanChat } : user
          )
        );
        toast({
          title: "Actualizado",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo actualizar el estado del chat del usuario.",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleSuspension = async (userId: string, currentIsSuspended: boolean) => {
    startTransition(async () => {
      const result = await toggleUserSuspensionAction(userId, !currentIsSuspended);
      if (result.success) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.uid === userId ? { ...user, isSuspended: !currentIsSuspended } : user
          )
        );
        toast({
          title: "Actualizado",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo actualizar el estado de suspensión.",
          variant: "destructive",
        });
      }
    });
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
         <div className="flex items-center gap-4">
            <UsersIcon className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-headline font-bold text-primary">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra cuentas de usuario, roles y permisos.</p>
            </div>
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3 mb-1" /></CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12 ml-2" />
                <Skeleton className="h-6 w-8 ml-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <UsersIcon className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra cuentas, roles, permisos de chat y suspensiones. El administrador no aparece en esta lista.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios Registrados</CardTitle>
          <CardDescription>Visualiza y gestiona los usuarios (excluyendo administradores).</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay usuarios (no administradores) registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-center">Permitir Chat</TableHead>
                  <TableHead className="text-center">Suspendido</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid} className={user.isSuspended ? "bg-destructive/10 hover:bg-destructive/20" : ""}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={user.canChat === undefined ? true : user.canChat}
                        onCheckedChange={() => handleToggleChatStatus(user.uid, user.canChat === undefined ? true : user.canChat)}
                        disabled={isProcessing || user.role === 'admin'} 
                        aria-label={`Permitir chat para ${user.email}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                       <Switch
                        checked={!!user.isSuspended}
                        onCheckedChange={() => handleToggleSuspension(user.uid, !!user.isSuspended)}
                        disabled={isProcessing}
                        aria-label={`Suspender a ${user.email}`}
                        className="data-[state=checked]:bg-destructive"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="Ver Perfil">
                        <Link href={`/admin/users/${user.uid}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell> 
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    