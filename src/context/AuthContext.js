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

const AUTH_CACHE_KEY = "taskflow_auth_session";
const PROFILE_CACHE_KEY = "taskflow_auth_profile";

function getCachedAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const getCachedAuth = getCachedAuthUser;

function getCachedUserProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAuthCache(user, profile) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      const sessionData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || profile?.displayName || user.email?.split("@")[0] || "",
        photoURL: user.photoURL || profile?.photoURL || null,
      };
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(sessionData));
      localStorage.setItem("taskflow_auth_uid", user.uid);
      if (profile) {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      }
    } else {
      localStorage.removeItem(AUTH_CACHE_KEY);
      localStorage.removeItem(PROFILE_CACHE_KEY);
      localStorage.removeItem("taskflow_auth_uid");
      localStorage.removeItem("taskflow_local_projects");
      localStorage.removeItem("taskflow_dashboard_stats");
      localStorage.removeItem("taskflow_current_project");
    }
  } catch {}
}

export function AuthProvider({ children }) {
  // 1. Immediately read cached session to eliminate refresh lag and page flicker (0ms)
  const [user, setUser] = useState(() => getCachedAuthUser());
  const [userProfile, setUserProfile] = useState(() => getCachedUserProfile());
  const [loading, setLoading] = useState(() => !getCachedAuthUser());

  // Sync user profile from Firestore users/{uid} and registered_emails/{cleanEmail}
  const syncUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    const cleanEmail = firebaseUser.email?.toLowerCase();
    const cleanName = firebaseUser.displayName || cleanEmail?.split("@")[0] || "";

    // Sync registered_emails point index for instant, permission-safe member lookups
    if (cleanEmail) {
      try {
        const regEmailRef = doc(db, "registered_emails", cleanEmail);
        setDoc(
          regEmailRef,
          {
            uid: firebaseUser.uid,
            email: cleanEmail,
            displayName: cleanName,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});
      } catch {}
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 1500)
      );
      const userSnap = await Promise.race([getDoc(userRef), timeoutPromise]);

      if (userSnap && userSnap.exists()) {
        const data = userSnap.data();
        const updatedProfile = {
          ...data,
          photoURL: firebaseUser.photoURL || data.photoURL || null,
        };
        setUserProfile(updatedProfile);
        saveAuthCache(firebaseUser, updatedProfile);
      } else if (userSnap) {
        const newProfile = {
          displayName: cleanName,
          email: cleanEmail,
          photoURL: firebaseUser.photoURL || null,
          createdAt: serverTimestamp(),
        };
        setDoc(userRef, newProfile).catch(() => {});
        setUserProfile(newProfile);
        saveAuthCache(firebaseUser, newProfile);
      }
    } catch {
      setUserProfile((prev) => {
        const fallback = {
          displayName: cleanName,
          email: cleanEmail || "",
          photoURL: firebaseUser.photoURL || prev?.photoURL || null,
          ...(prev || {}),
        };
        saveAuthCache(firebaseUser, fallback);
        return fallback;
      });
    }
  };

  useEffect(() => {
    // Safety fallback: Never leave loading stuck for more than 1500ms
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(safetyTimer);
      if (currentUser) {
        const previousAuth = getCachedAuth();
        if (previousAuth && previousAuth.uid && previousAuth.uid !== currentUser.uid) {
          try {
            localStorage.removeItem("taskflow_local_projects");
            localStorage.removeItem("taskflow_dashboard_stats");
            localStorage.removeItem("taskflow_current_project");
          } catch {}
        }

        const profile = {
          displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "",
          email: currentUser.email?.toLowerCase() || "",
          photoURL: currentUser.photoURL || null,
        };
        setUser(currentUser);
        setUserProfile(profile);
        setLoading(false);
        saveAuthCache(currentUser, profile);

        // Background profile sync
        syncUserProfile(currentUser);
      } else {
        saveAuthCache(null, null);
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        try {
          localStorage.removeItem("taskflow_local_projects");
          localStorage.removeItem("taskflow_dashboard_stats");
          localStorage.removeItem("taskflow_current_project");
          sessionStorage.clear();
        } catch {}
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
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

    const previousAuth = getCachedAuth();
    if (previousAuth && previousAuth.uid && previousAuth.uid !== loggedUser.uid) {
      try {
        localStorage.removeItem("taskflow_local_projects");
        localStorage.removeItem("taskflow_dashboard_stats");
        localStorage.removeItem("taskflow_current_project");
      } catch {}
    }

    // Set state immediately so UI updates and router unblocks instantly
    setUser(createdUser);
    setUserProfile(profileData);
    setLoading(false);

    // 3. Store in Firestore users/{uid} and registered_emails in background without delaying user
    const userDocRef = doc(db, "users", createdUser.uid);
    setDoc(userDocRef, {
      ...profileData,
      createdAt: serverTimestamp(),
    }).catch((err) => {
      console.warn("Firestore user sync deferred:", err?.message);
    });

    const regEmailRef = doc(db, "registered_emails", trimmedEmail);
    setDoc(regEmailRef, {
      uid: createdUser.uid,
      email: trimmedEmail,
      displayName: trimmedName,
      registeredAt: serverTimestamp(),
    }).catch(() => {});

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

    const previousAuth = getCachedAuth();
    if (previousAuth && previousAuth.uid && previousAuth.uid !== loggedUser.uid) {
      try {
        localStorage.removeItem("taskflow_local_projects");
        localStorage.removeItem("taskflow_dashboard_stats");
        localStorage.removeItem("taskflow_current_project");
      } catch {}
    }

    // Set state immediately
    setUser(loggedUser);
    setUserProfile({
      displayName: loggedUser.displayName || loggedUser.email?.split("@")[0] || "",
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

    const previousAuth = getCachedAuth();
    if (previousAuth && previousAuth.uid && previousAuth.uid !== loggedUser.uid) {
      try {
        localStorage.removeItem("taskflow_local_projects");
        localStorage.removeItem("taskflow_dashboard_stats");
        localStorage.removeItem("taskflow_current_project");
      } catch {}
    }

    // Immediately set active user and profile with Google photo to unblock router redirect instantly
    setUser(loggedUser);
    setUserProfile({
      displayName: loggedUser.displayName || loggedUser.email?.split("@")[0] || "",
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
    saveAuthCache(null, null);
    setUser(null);
    setUserProfile(null);
    try {
      localStorage.removeItem("taskflow_local_projects");
      localStorage.removeItem("taskflow_dashboard_stats");
      localStorage.removeItem("taskflow_current_project");
      sessionStorage.clear();
    } catch {}
    try {
      await signOut(auth);
    } catch {}
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

