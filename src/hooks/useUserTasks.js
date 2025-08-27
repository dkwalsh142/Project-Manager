import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import useProjects from "./useProjects";
import useSharedProjects from "./useSharedProjects";

const useUserTasks = (user) => {
  const [userTasks, setUserTasks] = useState([]);
  const ownProjects = useProjects(user);
  const sharedProjects = useSharedProjects(user);
  

  useEffect(() => {
    const allProjects = [...ownProjects, ...sharedProjects];
    if (!user || allProjects.length === 0) return;

    const unsubscribes = allProjects.map((project) => {
      const taskRef = collection(db, "projects", project.id, "tasks");
      const q = query(taskRef, where("assigned", "array-contains", user.uid));

      return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          projectId: project.id,
        }))
        .filter((task) => !task.done);

        setUserTasks((prev) => {
          const others = prev.filter((t) => t.projectId !== project.id);
          return [...others, ...tasks];
        });
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user, ownProjects, sharedProjects]);

  return userTasks;
};

export default useUserTasks;
