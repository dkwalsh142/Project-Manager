import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PopUpForm from '../views/PopUpForm';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, setDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import useProjects from "../hooks/useProjects";
import { useAuth, logout } from "../hooks/useAuth";
import useSharedProjects from "../hooks/useSharedProjects";
import SelectForm from '../views/SelectForm';
import useUserTasks from '../hooks/useUserTasks';
import DisplayCard from '../views/DisplayCard';
import { Folder } from 'lucide-react';
import TaskCard from '../views/TaskCard';


export default function Dashboard() {
  const { user } = useAuth();
  const projects = useProjects(user);
  const sharedProjects = useSharedProjects(user);
  const userTasks = useUserTasks(user);
  const [showPopup, setShowPopup] = useState(false);
  const [showProjectDeleteSelection, setShowProjectDeleteSelection] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [showEditProject, setShowEditProject] = useState(false);

  const handleAddProject = async (newProject, startDueDate) => {
    try {
      const projectRef = await addDoc(collection(db,"projects"),{
        name: newProject,
        createdAt: serverTimestamp(),
        owner: user.uid,
        collaborators: [user.uid],
        dueDate: startDueDate ? startDueDate: null,
      });


      await setDoc(doc(db, "users", user.uid, "projectRefs", projectRef.id), {
        projectID: projectRef.id,
        name: newProject,
        ref: projectRef,
        relation: "owner",
        dueDate: startDueDate || null,
      });

    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }

  const handleDeleteProjects = async (selected) => {
    for (const projectId of selected) {
      await deleteDoc(doc(db, "projects", projectId))
      await deleteDoc(doc(db, "users", user.uid, "projectRefs", projectId))
    }
  }

  const handleEditProjects = (projectID) => {
    const project = projects.find(p => p.id === projectID);
    if (project) {
      setEditProject(project);
      setTimeout(() => setShowEditProject(true), 0);
    }
  };

  const handleSubmitProjectEdit = async (newName, newDueDate) => {
    if (!editProject) return;
    try {
      const projectRef = doc(db, "projects", editProject.id);
      const userRef = doc(db, "users", user.uid, "projectRefs", editProject.id);

      const updates = {};
      if (newName && newName !== editProject.name) updates.name = newName;
      if (newDueDate && newDueDate !== editProject.dueDate) updates.dueDate = newDueDate || null;

      await updateDoc(projectRef, updates);
      await updateDoc(userRef, updates);

      setEditProject(null);
      setShowEditProject(false);
    } catch (err) {
      console.error("Error updating project", err);
    }
  };


  return (<div className="p-6 max-w-7xl mx-auto space-y-8">
    <div className="flex justify-between items-center">
      <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-xl shadow-sm">
        <p className="text-lg font-semibold">Welcome {user.displayName}</p>
      </div>
      <button onClick={logout} className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500">
        Log out
      </button>
    </div>

    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Projects</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <DisplayCard
            key={project.id}
            id={project.id}
            name={project.name}
            icon={<Folder />}
            dueDate={project.dueDate}
            onEdit={handleEditProjects}
            linkTo={`/project/${project.id}`}
          />
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setShowPopup(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Project
        </button>

        {projects.length > 0 && (
          <button
            onClick={() => setShowProjectDeleteSelection(true)}
            className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
          >
            Delete Project
          </button>
        )}
      </div>
    </section>

    {showPopup && (
      <PopUpForm
        title="New Project"
        placeholder="Title New Project:"
        onSubmit={handleAddProject}
        onClose={() => setShowPopup(false)}
        enableDueDate={true}
      />
    )}

    {showProjectDeleteSelection &&(
      <SelectForm
        title="Select Projects To Delete"
        options={projects.map((project) => ({
          id: project.id,
          label: project.name,
        }))}
        onSubmit={handleDeleteProjects}
        onClose={() => setShowProjectDeleteSelection(false)}
      />
    )}

    {showEditProject && editProject && (
      <PopUpForm
        title="Edit Project"
        placeholder="Update Project Name"
        initialValue={editProject.name}
        initialDueDate={editProject.dueDate}
        onSubmit={handleSubmitProjectEdit}
        onClose={() => {
          setEditProject(null)
          setShowEditProject(false);
        }}
        enableDueDate={true}
      />
    )}

    <section>
      <h2 className="text-2xl font-bold mb-2">Shared Projects</h2>
      {sharedProjects.length === 0 ? (
        <p className="text-gray-500 italic">Your Shared Projects Will Appear Here</p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sharedProjects.map((project) => (
          <DisplayCard
            key={project.id}
            id={project.id}
            name={project.name}
            icon={<Folder />}
            dueDate={project.dueDate}
            onEdit={handleEditProjects}
            linkTo={`/project/${project.id}`}
          />
        ))}
      </div>
      )}
    </section>

    

    <section>
      <h2 className="text-2xl font-bold mb-2">Your Tasks</h2>
      {userTasks.length === 0 ? (
        <p className="text-gray-500 italic">Your Incomplete Tasks Will Appear Here</p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {userTasks.map((task) => (
          <TaskCard 
          key={task.id} 
          task={task} />
        ))}
      </div>
      )}
    </section>
  </div>  

  );


  
}
