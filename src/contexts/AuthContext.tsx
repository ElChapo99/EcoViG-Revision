import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { User as AppUser } from '../types';
import { bootstrapSpecialStudentProfile } from '../lib/userBootstrap';
import { ensureTeacherHasLinkCode } from '../lib/teacherCode';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUserLocal: (updatedFields: Partial<AppUser>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  refreshUser: async () => {},
  updateUserLocal: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Optimistic local update method for zero-latency state changes
  const updateUserLocal = (updatedFields: Partial<AppUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      try {
        localStorage.setItem(`ecovig_user_${prev.uid}`, JSON.stringify(updated));
      } catch (e) {
        // ignore storage errors
      }
      return updated;
    });
  };

  const processUserData = async (uid: string, rawData: any): Promise<AppUser> => {
    let data = { ...rawData };
    const userDocRef = doc(db, 'users', uid);

    // Force admin role for this specific email
    if (data.email === 'jesusduran2504@outlook.com' && data.role !== 'admin') {
      await updateDoc(userDocRef, { role: 'admin' });
      data.role = 'admin';
    }

    // Special student account with all mandatory missions completed
    if (data.email === 'a222200054@unison.mx') {
      data = await bootstrapSpecialStudentProfile(uid, data);
    }

    // Ensure teacher role always has a unique linkCode generated
    if (data.role === 'teacher' && !data.linkCode) {
      const code = await ensureTeacherHasLinkCode(uid, data.linkCode);
      data.linkCode = code;
    }

    return { uid, ...data } as AppUser;
  };

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const processed = await processUserData(uid, userDoc.data());
        setUser(processed);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser.uid);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      // Clean up previous doc subscription if any
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (currentUser) {
        // First try to load from local cache for instant render
        try {
          const cached = localStorage.getItem(`ecovig_user_${currentUser.uid}`);
          if (cached) {
            setUser(JSON.parse(cached));
          }
        } catch (e) {
          // ignore cache read errors
        }

        // Attach real-time snapshot listener on user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeDoc = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const processed = await processUserData(currentUser.uid, snapshot.data());
              setUser(processed);
              try {
                localStorage.setItem(`ecovig_user_${currentUser.uid}`, JSON.stringify(processed));
              } catch (e) {
                // ignore
              }
            } else {
              setUser(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error in user doc onSnapshot:', error);
            // Fallback to fetch
            fetchUserData(currentUser.uid).finally(() => setLoading(false));
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, refreshUser, updateUserLocal, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
