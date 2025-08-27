// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { collection, getFirestore, query, where, getDocs } from "firebase/firestore";
import { setPersistence, browserSessionPersistence, inMemoryPersistence } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  //apiKey: ,
  authDomain: "project-manager-eb7fb.firebaseapp.com",
  projectId: "project-manager-eb7fb",
  storageBucket: "project-manager-eb7fb.firebasestorage.app",
  messagingSenderId: "244505960961",
  appId: "1:244505960961:web:64161e90bf71070c95d600"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

const initAuth = async () => {
  try {
    await setPersistence(auth, inMemoryPersistence);
  } catch (err) {
    console.error("Failed to set auth persistence", err);
  }
};


const findUserByEmail = async (email) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  if(snapshot.empty){
    return null;
  } 
  else {
    const userDoc = snapshot.docs[0]
    return {id: userDoc.id}
  } 
}

export { auth, provider, db, findUserByEmail, initAuth};
