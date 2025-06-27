
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, AlertTriangle, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { getAllPopups, type Popup } from '@/services/popupService';
import { useToast } from "@/hooks/use-toast";
import { deletePopupAction, togglePopupStatusAction } from './actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminPopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPopups() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPopups = await getAllPopups();
        setPopups(fetchedPopups);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido.";
        setError(`No se pudieron cargar los popups: ${errorMessage}`);
        toast({ title: "Error", description: `No se pudieron cargar los popups.`, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPopups();
  }, [toast]);
  
  const handleDeletePopup = async (popupId: string) => {
    startTransition(async () => {
      const result = await deletePopupAction(popupId);
      toast({ title: result.success ? "Éxito" : "Error", description: result.message, variant: result.success ? "default" : "destructive" });
      if (result.success) {
        setPopups(prev => prev.filter(p => p.id !== popupId));
      }
    });
  };

  const handleToggleStatus = (popupId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await togglePopupStatusAction(popupId, !currentStatus);
      if (result.success) {
        setPopups(prev => prev.map(p => p.id === popupId ? { ...p, isActive: !currentStatus } : p));
        toast({ title: "Estado Actualizado", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  const getStatus = (popup: Popup) => {
    if (!popup.isActive) return { text: 'Inactivo', variant: 'secondary' as const };
    if (popup.expiresAt.toDate() < new Date()) return { text: 'Expirado', variant: 'destructive' as const };
    return { text: 'Activo', variant: 'default' as const };
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
            <MessageSquare /> Gestionar Popups
          </h1>
          <p className="text-muted-foreground">Crea y administra popups para la página de inicio.</p>
        </div>
        <Button asChild>
          <Link href="/admin/popups/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Popup
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10"><CardContent className="pt-6 flex items-center gap-3 text-destructive"><AlertTriangle className="h-5 w-5"/><p>{error}</p></CardContent></Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Popups</CardTitle>
          <CardDescription>Vista general de todos los popups configurados.</CardDescription>
        </CardHeader>
        <CardContent>
          {popups.length === 0 && !error ? (
            <p className="text-center text-muted-foreground py-8">No hay popups creados. ¡Añade el primero!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="text-center">Activar</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popups.map((popup) => {
                  const status = getStatus(popup);
                  return (
                    <TableRow key={popup.id}>
                      <TableCell className="font-medium">{popup.title}</TableCell>
                      <TableCell>{popup.type.replace('_', ' + ')}</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.text}</Badge></TableCell>
                      <TableCell>{format(popup.expiresAt.toDate(), "dd MMM, yyyy 'a las' HH:mm", { locale: es })}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={popup.isActive} onCheckedChange={() => handleToggleStatus(popup.id, popup.isActive)} disabled={isProcessing} aria-label="Activar popup"/>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" asChild className="mr-2" title="Editar Popup"><Link href={`/admin/popups/edit/${popup.id}`}><Edit className="h-4 w-4" /></Link></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isProcessing}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el popup.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePopup(popup.id)} disabled={isProcessing} className="bg-destructive hover:bg-destructive/90">{isProcessing ? 'Eliminando...' : 'Eliminar'}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
