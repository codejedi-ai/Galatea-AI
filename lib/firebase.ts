import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBlw_fzjEs-NbOabJkHEpGbfBdDEt7RVvI",
  authDomain: "galatea-ai.firebaseapp.com",
  databaseURL: "https://galatea-ai-default-rtdb.firebaseio.com",
  projectId: "galatea-ai",
  storageBucket: "galatea-ai.firebasestorage.app",
  messagingSenderId: "727737899444",
  appId: "1:727737899444:web:16152c4885a96302af7ae1",
  measurementId: "G-6ZQT56XSCV"
};

if (!firebaseConfig.apiKey) {
  console.error("Firebase API key is missing. Please set NEXT_PUBLIC_FIREBASE_API_KEY environment variable.")
}

// Initialize Firebase
let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
