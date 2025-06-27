
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
  role?: 'user' | 'admin';
  isVerified?: boolean;
  isSuspended?: boolean; 
  chatDisplayName?: string;
  canChat?: boolean;
  avatarUrl?: string; // Added avatar URL field
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserChatProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  chatDisplayName: string;
  role: 'user' | 'admin';
  canChat: boolean;
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db) {
    console.error("Firestore 'db' object is not available. Cannot get user profile.");
    return null;
  }
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return { uid: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new Error("Failed to get user profile.");
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
   if (!db) {
    console.error("Firestore 'db' object is not available. Cannot update user profile.");
    throw new Error("DB not available for updateUserProfile");
  }
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile.");
  }
}

export async function getUserChatProfile(userId: string): Promise<UserChatProfile | null> {
  if (!db) {
    console.error("Firestore 'db' object is not available. Cannot get user chat profile.");
    return null;
  }
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        uid: userDocSnap.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        chatDisplayName: data.chatDisplayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Usuario',
        role: data.role || 'user',
        canChat: data.canChat === undefined ? true : data.canChat,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user chat profile:", error);
    return null;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
   if (!db) {
    console.error("Firestore 'db' object is not available. Cannot get all users.");
    return [];
  }
  try {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, orderBy("createdAt", "desc")); // Order by creation time
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    console.error("Error getting all users:", error);
    // Check for Firestore index error specifically for orderBy("createdAt")
    if (error instanceof Error && error.message.includes("indexes?create_composite")) {
      console.warn("Firestore composite index missing for querying users by 'createdAt'. Falling back to unordered query. Create the index for optimal performance: ", error.message);
      // Fallback to unordered query if index is missing
      const usersCollectionRefFallback = collection(db, "users");
      const querySnapshotFallback = await getDocs(usersCollectionRefFallback);
      return querySnapshotFallback.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    }
    return []; 
  }
}

export async function updateUserChatSettings(userId: string, settings: { canChat?: boolean; chatDisplayName?: string }): Promise<void> {
  if (!db) {
    console.error("Firestore 'db' object is not available. Cannot update user chat settings.");
    throw new Error("DB not available for updateUserChatSettings");
  }
  if (!userId) throw new Error("User ID is required to update chat settings.");
  if (Object.keys(settings).length === 0) return; 

  const dataToUpdate: Partial<UserProfile> & { updatedAt: Timestamp } = { updatedAt: Timestamp.now() };
  if (settings.canChat !== undefined) {
    dataToUpdate.canChat = settings.canChat;
  }
  if (settings.chatDisplayName !== undefined) {
    dataToUpdate.chatDisplayName = settings.chatDisplayName;
  }
  
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating user chat settings:", error);
    throw new Error("Failed to update user chat settings.");
  }
}

export async function updateUserSuspensionStatus(userId: string, isSuspended: boolean): Promise<void> {
  if (!db) {
    console.error("Firestore 'db' object is not available. Cannot update user suspension status.");
    throw new Error("DB not available for updateUserSuspensionStatus");
  }
  if (!userId) throw new Error("User ID is required to update suspension status.");

  const dataToUpdate: Partial<UserProfile> = {
    isSuspended,
    updatedAt: Timestamp.now(),
  };

  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating user suspension status:", error);
    throw new Error("Failed to update user suspension status.");
  }
}
