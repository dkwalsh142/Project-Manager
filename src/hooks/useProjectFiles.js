import { useState, useEffect } from 'react';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const useProjectFiles = (user, projectId) => {
        
        const [files, setFiles] = useState([]);
        useEffect(() =>{
            if (!user) return;
            if (!user?.uid || !projectId ) return;
            const fileRef = collection(db, "projects", projectId, "files");
            const unsubscribe = onSnapshot(fileRef, (snapshot) =>{
                const fileList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
                }));
            setFiles(fileList)
            });
        return () => unsubscribe();
        }, [user, projectId])
        return files;
    }

export default useProjectFiles;