import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";




const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser){
              setUser(currentUser);
            } else {
              setUser(null)
            }
        setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  ); 
}

export const logout = () => {
  signOut(auth)
    .then(() => console.log("Logged out"))
    .catch((err) => console.error("Logout error", err));
};

export const useAuth = () => useContext(AuthContext);