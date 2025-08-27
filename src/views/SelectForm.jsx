import React, { useState } from 'react';

export default function SelectForm({ title, options, onSubmit, onClose }) {
  const [selected, setSelected] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      onSubmit(selected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 min-w-[300px] shadow-xl">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-2 mb-6">
          {options.map(option => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={() => handleCheckboxChange(option.id)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
