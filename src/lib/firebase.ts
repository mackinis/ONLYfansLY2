
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// auth ya no se importa ni se configura aquí para el propósito de registro/login custom
// import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";

// Log individual environment variables before constructing the config object
console.log("Reading Firebase Environment Variables:");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or Empty");
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Loaded" : "MISSING or Empty");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Loaded" : "MISSING or Empty");
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Loaded" : "MISSING or Empty");
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Loaded" : "MISSING or Empty");
console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Loaded" : "MISSING or Empty");
console.log("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? "Loaded" : "MISSING or Empty (Optional)");


const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Asegúrate que sea xxxx.appspot.com
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log the config object that will be used for initialization
console.log("[FIREBASE_LIB] Firebase Config Object being used for initialization:", firebaseConfig);

// Check for missing essential Firebase config keys
const essentialKeys: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId'];
let missingKeysError = false;
for (const key of essentialKeys) {
  if (!firebaseConfig[key]) {
    console.error(`[FIREBASE_LIB] Firebase Critical Error: Missing essential Firebase configuration for ${key}. Value is: '${firebaseConfig[key]}'. Check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()} is correctly set and the development server was restarted.`);
    missingKeysError = true;
  }
}

if (missingKeysError) {
  console.error("[FIREBASE_LIB] Firebase Initialization Failed: Critical Firebase configuration is missing. The application will likely not function correctly with Firebase services.");
}

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("[FIREBASE_LIB] Firebase App initialized successfully.");
  } catch (e) {
    console.error("[FIREBASE_LIB] Firebase Initialization Error:", e);
    app = undefined; 
  }
} else {
  app = getApp();
  console.log("[FIREBASE_LIB] Firebase App already initialized, getting existing app.");
}

let db;
// let auth; // auth ya no se exporta para este flujo custom

if (app) {
  db = getFirestore(app);
  // auth = getAuth(app); // No inicializar auth si no se va a usar para el flujo principal
  console.log("[FIREBASE_LIB] Firestore DB instance created.");
} else {
  console.error("[FIREBASE_LIB] Firebase app is not initialized. Firestore will not be available.");
}

// Exportar solo 'db' y 'app'. 'auth' no se usa para el flujo custom.
export { app, db };
// Si necesitas Firebase Auth para OTRAS cosas (ej. login social), puedes exportarlo, pero las actions no lo usarán.
// Para el flujo actual, mejor no exportarlo para evitar confusión.
// export { app, db, auth };
