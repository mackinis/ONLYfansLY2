
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, AlertTriangle } from "lucide-react";
import { getCourses, deleteCourse, type Course } from '@/services/courseService';
import { useToast } from "@/hooks/use-toast";
import { deleteCourseAction } from './actions';
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
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCourses() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("No se pudieron cargar los cursos. Intenta de nuevo más tarde.");
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, [toast]);

  const handleDeleteCourse = async (courseId: string) => {
    startDeleteTransition(async () => {
      const result = await deleteCourseAction(courseId);
      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        });
        setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="ml-auto flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Gestionar Cursos</h1>
          <p className="text-muted-foreground">Añade, edita y organiza el contenido de los cursos.</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Curso
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6 flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5"/>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cursos</CardTitle>
          <CardDescription>Vista general de todos los cursos disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 && !error && !isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              No hay cursos creados todavía. ¡Añade el primero!
            </p>
          ) : courses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Image 
                        src={course.thumbnailUrl || course.imageUrl || "https://placehold.co/100x100.png"} 
                        alt={course.title}
                        width={60}
                        height={60}
                        className="rounded-md object-cover aspect-square"
                        data-ai-hint="course education"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.price}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" asChild className="mr-2" title="Editar Curso">
                        <Link href={`/admin/courses/edit/${course.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el curso.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCourse(course.id)} 
                              disabled={isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
