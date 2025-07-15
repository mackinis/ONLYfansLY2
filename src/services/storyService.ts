
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

const STORIES_COLLECTION = "stories";

export type StoryStatus = 'pending' | 'approved' | 'rejected';

export interface StoryData {
  userId: string;
  userName: string;
  userAvatar?: string;
  title?: string;
  imageUrl?: string;
  videoUrl?: string;
  videoPreviewUrl?: string; 
  caption?: string;
  status: StoryStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  approvedAt?: Timestamp;
  expiresAt?: Timestamp;
}

export interface Story extends StoryData {
  id: string;
}

export const storySchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  userName: z.string().min(1, "User name is required."),
  userAvatar: z.string().url().optional().or(z.literal('')),
  title: z.string().min(3, "Title must be at least 3 characters.").optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  videoUrl: z.string().optional(),
  videoPreviewUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  caption: z.string().max(500, "Caption can be max 500 characters.").optional().or(z.literal('')),
  approvedAt: z.date().optional(),
}).refine(data => data.imageUrl || data.videoUrl, {
  message: "Either an image URL or a video URL/iframe is required.",
  path: ["imageUrl"], 
});


// Create a new story (user action, status will be 'pending')
export async function addStory(storyData: Omit<StoryData, 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, STORIES_COLLECTION), {
      ...storyData,
      status: 'pending' as StoryStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding story: ", error);
    throw new Error("Failed to add story.");
  }
}

// Get all approved stories for public display
export async function getStories(limit: number = 12): Promise<Story[]> {
  try {
    const q = query(
      collection(db, STORIES_COLLECTION), 
      where("status", "==", "approved"), 
      orderBy("approvedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as StoryData),
    })) as Story[];
  } catch (error) {
    console.error("Error getting stories: ", error);
    return []; // Return empty array on error to prevent site crash
  }
}

// Get stories for admin panel (all statuses, or filter by status)
export async function getAdminStories(filterStatus?: StoryStatus): Promise<Story[]> {
   try {
    let q;
    if (filterStatus) {
      q = query(collection(db, STORIES_COLLECTION), where("status", "==", filterStatus), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, STORIES_COLLECTION), orderBy("createdAt", "desc"));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as StoryData),
    })) as Story[];
  } catch (error) {
    console.error("Error getting admin stories: ", error);
    throw new Error("Failed to get admin stories.");
  }
}


// Get a single story by ID
export async function getStory(id: string): Promise<Story | null> {
  try {
    const docRef = doc(db, STORIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as StoryData) } as Story;
    }
    return null;
  } catch (error) {
    console.error("Error getting story: ", error);
    throw new Error("Failed to get story.");
  }
}

// Update a story (e.g., admin changes status, user edits caption if allowed)
export async function updateStory(id: string, storyData: Partial<StoryData>): Promise<void> {
  try {
    const docRef = doc(db, STORIES_COLLECTION, id);
    const updateData: Partial<StoryData> & { updatedAt: Timestamp } = {
      ...storyData,
      updatedAt: Timestamp.now(),
    };
    if (storyData.status === 'approved' && !storyData.approvedAt) {
        updateData.approvedAt = Timestamp.now();
    }
    if (storyData.approvedAt instanceof Date) {
        updateData.approvedAt = Timestamp.fromDate(storyData.approvedAt);
    }
    await updateDoc(docRef, updateData as any);
  } catch (error) {
    console.error("Error updating story: ", error);
    throw new Error("Failed to update story.");
  }
}

// Delete a story
export async function deleteStory(id: string): Promise<void> {
  try {
    const docRef = doc(db, STORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting story: ", error);
    throw new Error("Failed to delete story.");
  }
}
