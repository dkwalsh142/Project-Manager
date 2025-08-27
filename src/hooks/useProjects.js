import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";


const useProjects = (user) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "projectRefs"), (snapshot) => {
      const projectList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(project => project.relation === "owner");
      setProjects(projectList);
    });

    return () => unsubscribe();
  }, [user]);

  return projects;
};

export default useProjects;