
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
  getCountFromServer,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { z } from 'zod';

const COURSES_COLLECTION = "courses";

// Schema definition updated for discounts and final price
export const courseSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  price: z.string().min(1, { message: "El precio es requerido." }),
  finalPrice: z.string().optional(), // New optional field for the discount price
  duration: z.string().min(1, { message: "La duración es requerida." }),
  date: z.string().optional(),
  thumbnailUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }).optional().or(z.literal('')),
  imageUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }).optional().or(z.literal('')),
  courseVideoUrl: z.string().optional(),
  videoPreviewUrl: z.string().optional(),
  order: z.number().optional(), // Added for ordering
});

export interface CourseData {
  title: string;
  description: string;
  price: string;
  finalPrice?: string; // New optional field for the discount price
  duration: string;
  date?: string; 
  thumbnailUrl?: string; 
  imageUrl?: string;
  courseVideoUrl?: string; 
  videoPreviewUrl?: string; 
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  order?: number; // Added for ordering
}

export interface Course extends CourseData {
  id: string;
}

// Create a new course
export async function addCourse(courseData: CourseData): Promise<string> {
  try {
    const coll = collection(db, COURSES_COLLECTION);
    const snapshot = await getCountFromServer(coll);
    const currentCount = snapshot.data().count;

    const docRef = await addDoc(coll, {
      ...courseData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      order: currentCount + 1, // Set order to be the last one
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding course: ", error);
    throw new Error("Failed to add course.");
  }
}

// Get all courses, sorted by the new 'order' field
export async function getCourses(): Promise<Course[]> {
  try {
    const q = query(collection(db, COURSES_COLLECTION), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as CourseData),
    })) as Course[];
  } catch (error) {
    // If the index is missing, Firestore throws an error. We can fall back to createdAt.
    if (error instanceof Error && error.message.includes("indexes?create_composite")) {
        console.warn("Firestore index for 'order' field is missing. Falling back to ordering by 'createdAt'. Please create the required index in Firebase for reordering to work.");
        const fallbackQuery = query(collection(db, COURSES_COLLECTION), orderBy("createdAt", "desc"));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseData)) as Course[];
    }
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

// Batch update the order of courses
export async function updateCoursesOrder(courses: { id: string, order: number }[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    courses.forEach(course => {
      const docRef = doc(db, COURSES_COLLECTION, course.id);
      batch.update(docRef, { order: course.order });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error updating courses order: ", error);
    throw new Error("Failed to update courses order.");
  }
}
