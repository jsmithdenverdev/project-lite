import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import type { AddTagButtonProps } from './types';

export default function AddTagButton({ onAddTag }: AddTagButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [tagValue, setTagValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagValue.trim()) {
      onAddTag(tagValue.trim());
      setTagValue('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTagValue('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center space-x-1">
        <input
          type="text"
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          placeholder="Add tag..."
          className="px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          autoFocus
          onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
        />
        <button
          type="submit"
          className="p-0.5 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
          title="Add tag"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      type="button"
      title="Add tag"
    >
      <Plus className="w-3 h-3" />
      <span>Add Tag</span>
    </button>
  );
}