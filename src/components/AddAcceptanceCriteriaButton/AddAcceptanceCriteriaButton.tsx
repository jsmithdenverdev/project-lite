import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import type { AddAcceptanceCriteriaButtonProps } from './types';

export default function AddAcceptanceCriteriaButton({ onAddCriteria }: AddAcceptanceCriteriaButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [criteriaValue, setCriteriaValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (criteriaValue.trim()) {
      onAddCriteria(criteriaValue.trim());
      setCriteriaValue('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setCriteriaValue('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="flex items-start space-x-2">
        <textarea
          value={criteriaValue}
          onChange={(e) => setCriteriaValue(e.target.value)}
          placeholder="Enter acceptance criteria..."
          rows={2}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        />
        <div className="flex flex-col space-y-1">
          <button
            type="submit"
            className="p-0.5 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
            title="Add criteria (Cmd/Ctrl + Enter)"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Cancel (Escape)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      type="button"
    >
      <Plus className="w-3 h-3" />
      <span>Add Acceptance Criteria</span>
    </button>
  );
}