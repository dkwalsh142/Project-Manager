import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Project from "../pages/ProjectPage";

const handleFirstLogin = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const sampleProjectRef = await addDoc(collection(db, "projects"), {
      name: "Sample Project",
      owner: user.uid,
      collaborators: [user.uid],
      createdAt: new Date(),
    });
    

    await setDoc(doc(db, "users", user.uid, "projectRefs", sampleProjectRef.id), {
      projectID: sampleProjectRef.id,
      name: "Sample Project",
      ref: sampleProjectRef.path,
      relation: "owner",
      dueDate: null,
    });
    
    await addDoc(collection(db, "projects", sampleProjectRef.id, "tasks"), {
      name: "Sample Task",
      assigned: [user.uid],
    });

    await addDoc(collection(db, "projects", sampleProjectRef.id, "files"), {
      name: "Sample File: Wikipedia",
      link: "https://www.wikipedia.org/",
    });
    
  }
};

export { handleFirstLogin };

