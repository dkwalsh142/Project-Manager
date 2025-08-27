import React, { useState, useEffect, Children } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PopUpForm from '../views/PopUpForm';
import { collection, addDoc, doc, getDoc, deleteDoc, updateDoc, arrayUnion} from "firebase/firestore";
import { db } from "../firebase";
import useProjectTasks from "../hooks/useProjectTasks"
import { useAuth } from "../hooks/useAuth";
import { findUserByEmail, auth} from "../firebase"
import SelectForm from '../views/SelectForm';
import useProjectFiles from '../hooks/useProjectFiles';
import { Link as LinkIcon } from 'lucide-react';
import DisplayCard from '../views/DisplayCard';
import TaskCard from '../views/TaskCard';
import { Clock } from 'lucide-react';


export default function Project(){
    const { user } = useAuth();     
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [collaboratorInfo, setCollaboratorInfo] = useState([]);
    const collaborators = project?.collaborators || [];
    const isAuthorized = user && collaborators.includes(user.uid);
    const tasks = useProjectTasks(isAuthorized ? user : null, projectId);


    const files = useProjectFiles(user, projectId);
    const priorities = ["High", "Medium", "Low"]
    const priorityOptions = priorities.map(p => ({ id: p, label: p }));
    const [tempCollaborators, setTempCollaborators] = useState([]);
    const [tempPriority, setTempPriority] = useState("");

    const [showTaskPopup, setShowTaskPopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showTaskDeleteSelection, setShowTaskDeleteSelection] = useState(false);
    const [showUserDeleteSelection, setShowUserDeleteSelection] = useState(false);
    const [showLinkFilePopup, setShowLinkFilePopup] = useState(false);
    const [showFileDeleteSelection, setShowFileDeleteSelection] = useState(false);
    const [showUserAssign, setShowUserAssign] = useState(false);
    const [showPrioritySelection, setShowPrioritySelection] = useState(false);

    

    
    
    
    const handleAddTask = async (newTask, dueDate) => {
        if (!user || !projectId) {
            console.error("Missing user or project ID");
            return;
        }
        try {
            const taskRef = collection(db, "projects", projectId, "tasks");
            await addDoc(taskRef, {
                name: newTask,
                dueDate: dueDate || null,
                assigned: tempCollaborators || [],
                priority: tempPriority?.[0] || "",
                done: false,
            });
        } catch(error) {
            console.error("Error adding task:", error);
        };
        setTempCollaborators(null);
        setTempPriority(null);
      };

    const handleShareProject = async (email) => {
        console.log("🔒 Sharing as:", user?.uid)
        console.log("Firebase auth.currentUser:", auth.currentUser?.uid);
        console.log("App user context:", user?.uid);
        const sharedUser = await findUserByEmail(email)
        if (!sharedUser){
            alert("User must join platform");
            return;
        }

        const collaboratorUid = sharedUser.id;

        console.log("Project collaborators:", collaborators);
        console.log("Project owner:", project?.owner);

        await updateDoc(doc(db, "projects", projectId), {
            collaborators: arrayUnion(collaboratorUid)
        });
        console.log("✅ Shared successfully");
      };

    const handleDeleteTasks = async (selected) => {
        for (const taskId of selected) {
            await deleteDoc(doc(db, "projects", projectId, "tasks", taskId))
        }
    }

    const handleDeleteUsers = async (selected) => {
        try {
            const updatedCollaborators = collaborators.filter(
            (uid) => !selected.includes(uid)
            );
            await updateDoc(doc(db, "projects", projectId), {
            collaborators: updatedCollaborators
            });
        } catch (error) {
            console.error("Error removing collaborators:", error);
        }
    }

    const handleLinkFile = async (fileLink, fileName) => {
        if (!fileLink || !fileName) {
            alert("Please enter both a file link and name.");
        return;
        }
        try {
            const fileRef = collection(db, "projects", projectId, "files");
            await addDoc(fileRef, {
                name: fileName,
                link: fileLink
            });
        } catch(error) {
            console.error("Error adding file:", error);
        }
        
    }

    const handleDeleteFiles = async (selected) => {
        for (const fileId of selected) {
            await deleteDoc(doc(db, "projects", projectId, "files", fileId))
        }
    }

    const handleEditFiles = async (selected) => {
        return
    }

    const handleToggleTaskDone = async (taskId, newValue) => {
      try {
        await updateDoc(doc(db, "projects", projectId, "tasks", taskId), {
          done: newValue,
        });
      } catch (err) {
        console.error("Failed to update task status:", err);
      }
    }



    useEffect(() => {
        const fetchProject = async () => { 
            try {
            const projectRef = doc(db, "projects", projectId); 
            const snapshot = await getDoc(projectRef);
            if (snapshot.exists()) {
                const projectData ={ id: snapshot.id, ...snapshot.data() }
                setProject(projectData);
                
                const collaborators = projectData.collaborators || [];
                if (collaborators.length > 0) {
                  const userDocs = await Promise.all(
                    collaborators.map(async (uid) => {
                      const userSnap = await getDoc(doc(db, "users", uid));
                      return userSnap.exists()
                        ? { id: uid, label: userSnap.data().name || userSnap.data().email || uid }
                        : { id: uid, label: uid };
                    })
                  );
                  setCollaboratorInfo(userDocs);
                } else {
                  setCollaboratorInfo([]); // still set empty if none
                }

            } else {
                console.warn("Project not found");
                navigate('/');
            }
            } catch (error) {
            console.error("Error fetching project:", error);
            }
        };

        if (projectId) {
            fetchProject();
        }
    }, [projectId, navigate]);

    if (!user || !projectId) {
      return <p className="p-6 text-gray-600">Loading project...</p>;
    }

    return(
      <div className="p-6 max-w-7xl mx-auto space-y-10 text-gray-800">

        {/* Header */}
        <div className="flex justify-between items-start">
          {/* Left side: Sharing */}
          <div className="space-y-2">
            <button
              onClick={() => setShowSharePopup(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sharing Options
            </button>
            
          </div>

          {/* Right side: Return to Dashboard */}
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Project Title & Due Date */}
        <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-xl shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold"> {project?.name || "Project"}</h2>
            <p className="text-gray-600 -mt-1 flex items-center gap-1">
              <Clock size={16}/> 
              Due Date:{" "}
              {project?.dueDate
                ? new Date(project.dueDate).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—"}
            </p>
          </div>
        </div>

        {/* Tasks Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTaskPopup(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add New Task
              </button>
              {tasks.length > 0 && (
                <button
                  onClick={() => setShowTaskDeleteSelection(true)}
                  className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                >
                  Delete Task
                </button>
              )}
            </div>
          </div>
          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">Your Tasks Will Appear Here</p>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard 
              key={task.id} 
              task={task} 
              collaborators={collaboratorInfo} 
              onToggleDone={handleToggleTaskDone}/>
            ))}
          </div>
          )}
        </section>

        {/* Files Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Files</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLinkFilePopup(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Link Document
              </button>
              {files.length > 0 && (
                <button
                  onClick={() => setShowFileDeleteSelection(true)}
                  className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                >
                  Delete File
                </button>
              )}
            </div>
          </div>
          {files.length === 0 ? (
            <p className="text-gray-500 italic">Your Linked Files Will Appear Here</p>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((file) => (
                  <DisplayCard
                    key={file.id}
                    id={file.id}
                    name={file.name}
                    icon={<LinkIcon />}
                    onEdit={handleEditFiles}
                    linkTo={file.link}
                    editable = {false}
                    newTab = {true}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Modals (PopUpForm / SelectForm) */}
        {showTaskPopup && (
          <PopUpForm
            title="New Task"
            placeholder="Enter a new Task:"
            onSubmit={handleAddTask}
            onClose={() => setShowTaskPopup(false)}
            enableDueDate={true}
            childrenBottom={
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowUserAssign(true)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Assign User(s)
                </button>
                <button
                  onClick={() => setShowPrioritySelection(true)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Set Priority
                </button>
              </div>
            }
          />
        )}

        {showSharePopup && (
          <PopUpForm
            title="Share Project"
            placeholder="Enter Email:"
            onSubmit={handleShareProject}
            onClose={() => setShowSharePopup(false)}
          >
            {project?.owner === user.uid && collaborators.length > 1 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Delete Permissions</h3>
                <button
                  onClick={() => setShowUserDeleteSelection(true)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Select User
                </button>
              </div>
            )}
          </PopUpForm>
        )}

        {showTaskDeleteSelection && (
          <SelectForm
            title="Select Tasks To Delete"
            options={tasks.map((task) => ({ id: task.id, label: task.name }))}
            onSubmit={handleDeleteTasks}
            onClose={() => setShowTaskDeleteSelection(false)}
          />
        )}

        {showUserDeleteSelection && (
          <SelectForm
            title="Select Users To Revoke Permission"
            options={collaboratorInfo}
            onSubmit={handleDeleteUsers}
            onClose={() => setShowUserDeleteSelection(false)}
          />
        )}

        {showLinkFilePopup && (
          <PopUpForm
            title="Link Google File:"
            placeholder="Enter File Link:"
            secondPlaceholder="Enter File Name:"
            onSubmit={handleLinkFile}
            onClose={() => setShowLinkFilePopup(false)}
            enableSecondInput={true}
          />
        )}

        {showFileDeleteSelection && (
          <SelectForm
            title="Select Files To Delete"
            options={files.map((file) => ({ id: file.id, label: file.name }))}
            onSubmit={handleDeleteFiles}
            onClose={() => setShowFileDeleteSelection(false)}
          />
        )}

        {showUserAssign && (
          <SelectForm
            title="Select User(s) To Assign"
            options={collaboratorInfo}
            onSubmit={setTempCollaborators}
            onClose={() => setShowUserAssign(false)}
          />
        )}

        {showPrioritySelection && (
          <SelectForm
            title="Set Priority"
            options={priorityOptions}
            onSubmit={setTempPriority}
            onClose={() => setShowPrioritySelection(false)}
          />
        )}
      </div>
        )
    }