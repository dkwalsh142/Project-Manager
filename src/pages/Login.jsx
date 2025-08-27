import React from 'react';
import { auth, provider, db, initAuth} from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import { handleFirstLogin } from '../hooks/handleFirstLogin';


export default function Login() {
  const handleLogin = async () => {
    try{ 
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()){
        await setDoc(doc(db, "users", user.uid),{
          name: user.displayName || "Anonymous",
          email: user.email || "No email",
          createdAt: serverTimestamp(),
        }, {merge: true});

        await handleFirstLogin(user);
      }

      
      
    } catch (error){
      console.error("login failed", error)
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 overflow-hidden">

      <h1 className="absolute top-1/4 transform -translate-y-1/2 text-[6rem] sm:text-[8rem] font-bold text-blue-500 opacity-100 z-0 select-none leading-none">
        Student Project
      </h1>

      <h1 className="absolute bottom-1/4 transform translate-y-1/2 text-[6rem] sm:text-[8rem] font-bold text-blue-500 opacity-100 z-0 select-none leading-none">
        Manager
      </h1>

      {/* Login Bubble */}
      <div className="relative bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center z-10">
        <h1 className="text-2xl font-semibold mb-6">Welcome to Student Project Manager</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
