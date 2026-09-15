// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      isLoggedIn: true
    };
    
    // Save to sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Sign out function
export const logout = async () => {
  try {
    await signOut(auth);
    sessionStorage.removeItem('user');
    window.location.href = '/';
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Check if user is logged in
export const isAuthenticated = () => {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Protect route - redirect to login if not authenticated
export const protectRoute = () => {
  const user = isAuthenticated();
  if (!user) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

// Export app for analytics if needed
export { app };