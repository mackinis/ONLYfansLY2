import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SETTINGS_COLLECTION = "settings";

export interface GeneralSettings {
  siteName?: string;
  siteDescription?: string;
  adminEmail?: string;
  heroMainText?: string;
  heroSecondaryText?: string;
  heroDescriptionText?: string;
  heroImageUrl?: string;
  heroMainTextColor?: string;
}

export type StreamVisibility = 'public' | 'private' | 'exclusive' | 'disabled';
export type StreamType = 'iframe' | 'webcam';
export type ChatMode = 'loggedInOnly' | 'public';

export interface LivestreamSettings {
  streamUrl?: string;
  visibility?: StreamVisibility;
  streamTitle?: string;
  streamDescription?: string;
  isChatEnabled?: boolean;
  chatMode?: ChatMode; // 'loggedInOnly' or 'public'
  exclusiveUserIds?: string[];
  adminChatDisplayName?: string;
  streamType?: StreamType;
  webcamOfflineMessage?: string;
  forbiddenKeywords?: string;
}

export type CurrencyOption = 'ARS' | 'USD' | 'BOTH';

export interface MoneySettings {
  defaultCurrency?: CurrencyOption;
  showArsSymbol?: string;
  showUsdSymbol?: string;
  exchangeRateArsToUsd?: number; 
}

export interface WhatsAppSettings {
  whatsAppNumber?: string;
  enableWhatsAppWidget?: boolean;
  defaultWelcomeMessage?: string;
  widgetColor?: string;
  iconColor?: string;
  widgetIconType?: 'default' | 'custom';
  widgetIconUrl?: string;
}

export interface AppearanceSettings {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  logoFile?: string; 
  logoExternalUrl?: string;
  showLogoFooter?: boolean;
  showBrandNameFooter?: boolean;
  brandNameFooter?: string;
}

export interface StorySettings {
  allowUserSubmission?: boolean; 
  defaultEditWindowMinutes?: number; 
  defaultStoryVideoPreviewUrl?: string;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface SocialMediaSettings {
  links: SocialMediaLink[];
}

export interface AppMobilesSettings {
  androidUrl?: string;
  androidBrand?: string;
  androidIconUrl?: string;
  iosUrl?: string;
  iosBrand?: string;
  iosIconUrl?: string;
}


export async function getSetting<T>(docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    console.warn(`Setting document ${docId} does not exist in ${SETTINGS_COLLECTION}. Returning null.`);
    return null;
  } catch (error) {
    console.error(`Error getting setting ${docId}:`, error);
    return null; 
  }
}

export async function updateSetting<T extends object>(docId: string, data: Partial<T>): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error updating setting ${docId}:`, error);
    throw new Error(`Failed to update setting ${docId}`);
  }
}
