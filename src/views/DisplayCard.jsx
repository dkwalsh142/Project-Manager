import { Pencil} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DisplayCard({
  id,
  name,
  icon,
  dueDate,
  onEdit,
  linkTo,
  editable = true,
  newTab = false
}) {
  const navigate = useNavigate();
  function isValidDate(d) {
    if (!d) return false;
    try {
        const date = d.toDate ? d.toDate() : new Date(d);
        return !isNaN(date);
    } catch {
        return false;
    }
    }

    

  return (
    <div
      className="relative w-full max-w-full rounded-2xl border border-gray-300 bg-white shadow hover:shadow-lg transition-all cursor-pointer"
    >
      <a
        href={linkTo}
        target={newTab?"_blank" : "_self"}
        rel={newTab?"noopener noreferrer": undefined}
        className="block p-4 rounded-2xl"
      >
        {/* Left: Icon + Name + Due Date */}
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="text-2xl shrink-0">{icon}</div>
          <div className="overflow-hidden">
            <div className="font-semibold truncate">{name}</div>
            {dueDate && isValidDate(dueDate) &&(
                <div className="text-sm text-gray-500 truncate">
                    Due: {new Date(dueDate).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    })}
                </div>
            )}
          </div>
        </div>
      </a>
        {/* Right: Edit button */}
        {editable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(id);
          }}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
        >
          <Pencil size={18} />
        </button>
        )}
      </div>
  );
}
