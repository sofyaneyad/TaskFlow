"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  userProfile: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from Firestore users/{uid}
  const syncUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      } else {
        // Fallback create user profile document if missing
        const newProfile = {
          displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          email: firebaseUser.email.toLowerCase(),
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error("Error fetching user profile from Firestore:", err);
      // Fallback local representation
      setUserProfile({
        displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email.toLowerCase(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // FR-01 & US-01: Register user
  const register = async (name, email, password) => {
    if (!name || name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters.");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    const createdUser = userCredential.user;

    // 2. Update display name in Firebase Auth
    await updateProfile(createdUser, { displayName: trimmedName });

    // 3. Store in Firestore users/{uid} (FR-04)
    const userDocRef = doc(db, "users", createdUser.uid);
    const profileData = {
      displayName: trimmedName,
      email: trimmedEmail,
      createdAt: serverTimestamp(),
    };
    await setDoc(userDocRef, profileData);

    setUser(createdUser);
    setUserProfile(profileData);
    return createdUser;
  };

  // FR-02 & US-02: Sign in user
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const trimmedEmail = email.trim().toLowerCase();
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    const loggedUser = userCredential.user;
    await syncUserProfile(loggedUser);
    return loggedUser;
  };

  // FR-02 & US-02: Sign out user
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
