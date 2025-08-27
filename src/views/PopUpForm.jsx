import React, { useState } from 'react';

export default function PopUpForm({
  title,
  placeholder,
  onSubmit,
  onClose,
  childrenTop,
  secondPlaceholder,
  enableSecondInput = false,
  enableDueDate = false,
  enableUserSelect = false,
  childrenBottom
}) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (input1.trim() && (!enableSecondInput || input2.trim())) {
      const args = [input1];
      if (enableSecondInput) args.push(input2);
      if (enableDueDate) args.push(dueDate);
      
      onSubmit(...args);
      setInput1('');
      setInput2('');
      setDueDate('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
        {childrenTop && <div>{childrenTop}</div>}
        
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>

        <input
          type="text"
          placeholder={placeholder}
          value={input1}
          onChange={(e) => setInput1(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {enableSecondInput && (
          <input
            type="text"
            placeholder={secondPlaceholder || 'Second input'}
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {enableDueDate && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {childrenBottom && <div>{childrenBottom}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
