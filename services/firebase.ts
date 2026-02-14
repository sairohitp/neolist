import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOhNSYVL2gm6kwyu3xLwUH7Lh9WXXzGmQ",
  authDomain: "neolist.firebaseapp.com",
  projectId: "neolist",
  storageBucket: "neolist.appspot.com",
  messagingSenderId: "656716025876",
  appId: "1:656716025876:web:9238ef519b2f85a0d9d701"
};

// ✅ check if config is real
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch(error) {
    console.error("Firebase core initialization failed:", error);
    app = null;
    auth = null;
    db = null;
  }
}

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
    if (!auth) throw new Error("Firebase not initialized");
    return signInWithPopup(auth, provider);
};

// Export nullable instances
export { auth, db };
