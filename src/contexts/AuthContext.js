import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setCurrentUser({
          uid: user.uid,
          ...userDoc.data()
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const hasRole = (requiredRole) => {
    if (!currentUser) return false;
    
    // Hierarquia de permissões
    const roleHierarchy = {
      'admin': ['admin', 'mesario', 'eleitor'],
      'mesario': ['mesario', 'eleitor'],
      'eleitor': ['eleitor']
    };
    
    return roleHierarchy[currentUser.role]?.includes(requiredRole);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}