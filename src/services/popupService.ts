
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
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { z } from 'zod';

const POPUPS_COLLECTION = "popups";

// Zod schema for validation
export const popupSchema = z.object({
  title: z.string().min(1, { message: "El título interno es requerido." }),
  isActive: z.boolean(),
  type: z.enum(['image_only', 'video_only', 'image_text', 'video_text'], {
    required_error: "Debe seleccionar un tipo de popup."
  }),
  displayRule: z.enum(['always', 'once_per_session'], {
    required_error: "Debe seleccionar una regla de visualización."
  }),
  expiresAt: z.date({
    required_error: "La fecha de caducidad es requerida.",
    invalid_type_error: "Eso no es una fecha!",
  }),
  contentTitle: z.string().optional(),
  contentText: z.string().optional(),
  imageUrl: z.string().url({ message: "URL de imagen no válida." }).optional().or(z.literal('')),
  videoUrl: z.string().optional().or(z.literal('')),
}).refine(data => {
    if (data.type.includes('image') && !data.imageUrl) return false;
    if (data.type.includes('video') && !data.videoUrl) return false;
    if (data.type.includes('text') && !data.contentTitle && !data.contentText) return false;
    return true;
}, {
    message: "Falta contenido requerido para el tipo de popup seleccionado (imagen, video, o texto).",
    path: ["type"],
});


export type PopupData = z.infer<typeof popupSchema> & {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export interface Popup extends Omit<PopupData, 'expiresAt'> {
    id: string;
    expiresAt: Timestamp;
}

// Add a new popup
export async function addPopup(data: PopupData): Promise<string> {
    try {
        const popupDataForFirestore = {
            ...data,
            expiresAt: Timestamp.fromDate(data.expiresAt),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, POPUPS_COLLECTION), popupDataForFirestore);
        return docRef.id;
    } catch (error) {
        console.error("Error adding popup:", error);
        throw new Error("No se pudo añadir el popup.");
    }
}

// Get all popups for the admin panel
export async function getAllPopups(): Promise<Popup[]> {
    try {
        const q = query(collection(db, POPUPS_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Popup));
    } catch (error) {
        console.error("Error getting all popups:", error);
        throw new Error("No se pudieron cargar los popups.");
    }
}

// Get only active, non-expired popups for the homepage
export async function getActivePopups(): Promise<Popup[]> {
    try {
        const now = Timestamp.now();
        const q = query(
            collection(db, POPUPS_COLLECTION),
            where("isActive", "==", true),
            where("expiresAt", ">", now),
            orderBy("expiresAt", "asc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Popup));
    } catch (error) {
        console.error("Error getting active popups:", error);
        return [];
    }
}


// Get a single popup by ID
export async function getPopup(id: string): Promise<Popup | null> {
    try {
        const docRef = doc(db, POPUPS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Popup;
        }
        return null;
    } catch (error) {
        console.error("Error getting popup:", error);
        throw new Error("No se pudo obtener el popup.");
    }
}

// Update a popup
export async function updatePopup(id: string, data: Partial<PopupData>): Promise<void> {
    try {
        const docRef = doc(db, POPUPS_COLLECTION, id);
        const dataToUpdate: any = { ...data, updatedAt: Timestamp.now() };
        
        if (data.expiresAt && data.expiresAt instanceof Date) {
            dataToUpdate.expiresAt = Timestamp.fromDate(data.expiresAt);
        }

        await updateDoc(docRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating popup:", error);
        throw new Error("No se pudo actualizar el popup.");
    }
}

// Delete a popup
export async function deletePopup(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, POPUPS_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting popup:", error);
        throw new Error("No se pudo eliminar el popup.");
    }
}
