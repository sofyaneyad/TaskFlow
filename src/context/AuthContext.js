"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  loginWithGoogle: async () => {},
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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 2000)
      );
      const userSnap = await Promise.race([getDoc(userRef), timeoutPromise]);

      if (userSnap && userSnap.exists()) {
        const data = userSnap.data();
        if (firebaseUser.photoURL && data.photoURL !== firebaseUser.photoURL) {
          setDoc(userRef, { photoURL: firebaseUser.photoURL }, { merge: true }).catch(() => {});
          setUserProfile({ ...data, photoURL: firebaseUser.photoURL });
        } else {
          setUserProfile({
            ...data,
            photoURL: data.photoURL || firebaseUser.photoURL || null,
          });
        }
      } else if (userSnap) {
        // Create user profile document if missing
        const newProfile = {
          displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          email: firebaseUser.email.toLowerCase(),
          photoURL: firebaseUser.photoURL || null,
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch {
      // Fallback local representation immediately without blocking
      setUserProfile((prev) => ({
        displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        email: firebaseUser.email?.toLowerCase() || "",
        photoURL: firebaseUser.photoURL || prev?.photoURL || null,
        ...(prev || {}),
      }));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 1. Immediately provide profile from Auth to unblock UI instantly with photoURL
        setUserProfile({
          displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
          email: currentUser.email?.toLowerCase() || "",
          photoURL: currentUser.photoURL || null,
        });
        setLoading(false); // Immediate unblock!

        // 2. Fetch full Firestore profile in background
        syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
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
    try {
      await updateProfile(createdUser, { displayName: trimmedName });
    } catch (e) {
      console.warn("updateProfile note:", e?.message);
    }

    const profileData = {
      displayName: trimmedName,
      email: trimmedEmail,
      photoURL: null,
    };

    // Set state immediately so UI updates and router unblocks instantly
    setUser(createdUser);
    setUserProfile(profileData);
    setLoading(false);

    // 3. Store in Firestore users/{uid} in background without delaying user
    const userDocRef = doc(db, "users", createdUser.uid);
    setDoc(userDocRef, {
      ...profileData,
      createdAt: serverTimestamp(),
    }).catch((err) => {
      console.warn("Firestore user sync deferred:", err?.message);
    });

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

    // Set state immediately
    setUser(loggedUser);
    setUserProfile({
      displayName: loggedUser.displayName || loggedUser.email?.split("@")[0] || "User",
      email: loggedUser.email?.toLowerCase() || "",
      photoURL: loggedUser.photoURL || null,
    });
    setLoading(false);

    // Sync in background without blocking login
    syncUserProfile(loggedUser).catch((err) =>
      console.warn("Background user sync note:", err?.message)
    );

    return loggedUser;
  };

  // FR-02 & US-02: Sign in with Google (Gmail) - Superfast responsive login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const userCredential = await signInWithPopup(auth, provider);
    const loggedUser = userCredential.user;

    // Immediately set active user and profile with Google photo to unblock router redirect instantly
    setUser(loggedUser);
    setUserProfile({
      displayName: loggedUser.displayName || loggedUser.email?.split("@")[0] || "User",
      email: loggedUser.email?.toLowerCase() || "",
      photoURL: loggedUser.photoURL || null,
    });
    setLoading(false);

    // Sync full profile to Firestore in background without delaying user
    syncUserProfile(loggedUser).catch((err) =>
      console.warn("Background user sync note:", err?.message)
    );

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
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

