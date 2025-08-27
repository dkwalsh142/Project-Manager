import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";


const useSharedProjects = (user) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projects"),
      where("collaborators", "array-contains", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sharedProjects = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(project => project.owner !== user.uid);
      setProjects(sharedProjects);
    });
    return () => unsubscribe();
  }, [user]);

  return projects;
};

export default useSharedProjects;