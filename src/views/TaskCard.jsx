import React from 'react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Circle, Clock, Users, Tag } from 'lucide-react';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

export default function TaskCard({ task, collaborators = [], onToggleDone }) {

  const { id, name, dueDate, assigned, priority, done } = task;
  const [assignedNames, setAssignedNames] = useState({});

  useEffect(() => {
    const fetchNames = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !assigned || assigned.length === 0) {
        setAssignedNames({})
        return}
      const newNames = {};
      for (const uid of assigned || []) {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          newNames[uid] = data.name || data.email || uid;
        } else {
          newNames[uid] = uid;
        }
      }
      setAssignedNames(newNames);   
    };

    fetchNames();
  }, [assigned]);



  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{name || 'Unnamed Task'}</h3>
        {onToggleDone ? (
        <button
            onClick={() => onToggleDone(id, !done)}
            title={done ? 'Mark as Incomplete' : 'Mark as Complete'}
        >
            {done ? (
            <CheckCircle className="text-green-500" />
            ) : (
            <Circle className="text-gray-400 hover:text-green-500" />
            )}
        </button>
        ) : (
        done ? (
            <CheckCircle className="text-green-500" />
        ) : (
            <Circle className="text-gray-300" />
        )
        )}

      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          {dueDate ? (
            new Date(dueDate).toLocaleString([], {
              dateStyle: "short",
              timeStyle: "short",
            })
          ) : (
            <span className="italic text-gray-400">No due date</span>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Users size={16} className="mt-[2px]" />
          {Object.keys(assignedNames).length > 0 ? (
            <ul className="list-disc list-inside space-y-0.5">
                {Object.entries(assignedNames).map(([uid, name]) => (
                <li key={uid}>{name}</li>
                ))}
            </ul>
            ) : (
            <span className="italic text-gray-400">Unassigned</span>
            )}
        </div>

        <div className="flex items-center gap-2">
          <Tag size={16} />
          {priority ? (
            <span className="capitalize">{priority}</span>
          ) : (
            <span className="italic text-gray-400">No priority</span>
          )}
        </div>
      </div>
    </div>
  );
}
