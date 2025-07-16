
'use server';

import { revalidatePath } from 'next/cache';
import { addCourse, deleteCourse, updateCourse, type CourseData, courseSchema, updateCoursesOrder } from '@/services/courseService'; // Import courseSchema
import type { z } from 'zod'; // Import z to use ZodIssue type

// courseSchema is now imported from courseService

interface ActionResult {
  success: boolean;
  message: string;
  courseId?: string;
  errors?: z.ZodIssue[]; // Use z.ZodIssue directly
}

export async function addCourseAction(data: CourseData): Promise<ActionResult> {
  const validation = courseSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Error de validación.", errors: validation.error.issues };
  }

  try {
    const courseId = await addCourse(validation.data);
    revalidatePath('/admin/courses');
    revalidatePath('/courses'); // If you have a public courses page
    revalidatePath('/'); // Revalidate homepage if courses are displayed there
    return { success: true, message: 'Curso añadido exitosamente!', courseId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al añadir curso: ${errorMessage}` };
  }
}

export async function updateCourseAction(id: string, data: CourseData): Promise<ActionResult> {
  const validation = courseSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Error de validación.", errors: validation.error.issues };
  }
  try {
    await updateCourse(id, validation.data);
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/edit/${id}`);
    revalidatePath('/courses');
    revalidatePath('/');
    return { success: true, message: 'Curso actualizado exitosamente!' };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al actualizar curso: ${errorMessage}` };
  }
}

export async function deleteCourseAction(id: string): Promise<ActionResult> {
  try {
    await deleteCourse(id);
    revalidatePath('/admin/courses');
    revalidatePath('/courses');
    revalidatePath('/');
    return { success: true, message: 'Curso eliminado exitosamente!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al eliminar curso: ${errorMessage}` };
  }
}

export async function saveCoursesOrderAction(
  courses: { id: string; order: number }[]
): Promise<ActionResult> {
  try {
    await updateCoursesOrder(courses);
    revalidatePath('/admin/courses');
    revalidatePath('/');
    return { success: true, message: 'Orden de los cursos guardado exitosamente!' };
  } catch (error) {
    console.error('Failed to save courses order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    return { success: false, message: `Error al guardar el orden: ${errorMessage}` };
  }
}
