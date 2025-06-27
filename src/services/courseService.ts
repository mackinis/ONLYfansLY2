
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { z } from 'zod';

const COURSES_COLLECTION = "courses";

// Schema definition updated to be more flexible with video URLs/iframes
export const courseSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  price: z.string().min(1, { message: "El precio es requerido." }),
  duration: z.string().min(1, { message: "La duración es requerida." }),
  date: z.string().optional(),
  imageUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }).optional().or(z.literal('')),
  courseVideoUrl: z.string().optional(), // Now a simple string to allow URLs or iframes
  videoPreviewUrl: z.string().optional(), // Now a simple string to allow URLs or iframes
});

export interface CourseData {
  title: string;
  description: string;
  price: string;
  duration: string;
  date?: string; 
  imageUrl?: string;
  courseVideoUrl?: string; // For modal playback
  videoPreviewUrl?: string; // For card preview
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Course extends CourseData {
  id: string;
}

// Create a new course
export async function addCourse(courseData: CourseData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COURSES_COLLECTION), {
      ...courseData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding course: ", error);
    throw new Error("Failed to add course.");
  }
}

// Get all courses
export async function getCourses(): Promise<Course[]> {
  try {
    const q = query(collection(db, COURSES_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as CourseData),
    })) as Course[];
  } catch (error) {
    console.error("Error getting courses: ", error);
    return [];
  }
}

// Get a single course by ID
export async function getCourse(id: string): Promise<Course | null> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as CourseData) } as Course;
    }
    return null;
  } catch (error) {
    console.error("Error getting course: ", error);
    throw new Error("Failed to get course.");
  }
}

// Update a course
export async function updateCourse(id: string, courseData: Partial<CourseData>): Promise<void> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, id);
    await updateDoc(docRef, {
      ...courseData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating course: ", error);
    throw new Error("Failed to update course.");
  }
}

// Delete a course
export async function deleteCourse(id: string): Promise<void> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting course: ", error);
    throw new Error("Failed to delete course.");
  }
}
