import { useState, useEffect } from 'react';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const useProjectTasks = (user, projectId) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user?.uid || !projectId) {
      setTasks([]);
      return;
    }

    const taskRef = collection(db, "projects", projectId, "tasks");

    const unsubscribe = onSnapshot(
      taskRef,
      (snapshot) => {
        const taskList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(taskList);
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.warn("❌ No permission to fetch tasks for this project.");
          setTasks([]);
        } else {
          console.error("🚨 Firestore snapshot error:", error);
        }
      }
    );

    return () => unsubscribe();
  }, [user, projectId]);

  return tasks;
};

export default useProjectTasks;
