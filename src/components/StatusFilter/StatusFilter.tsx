import { type WorkItemStatus } from '../../schemas';

interface StatusFilterProps {
  selectedStatus: WorkItemStatus | 'all';
  onStatusChange: (status: WorkItemStatus | 'all') => void;
  className?: string;
}

const statusOptions: Array<{ value: WorkItemStatus | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' },
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' },
  { value: 'todo', label: 'Todo', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800' },
  { value: 'review', label: 'Review', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800' },
  { value: 'testing', label: 'Testing', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600' }
];

export default function StatusFilter({ selectedStatus, onStatusChange, className = '' }: StatusFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statusOptions.map((option) => {
        const isActive = selectedStatus === option.value;
        const baseClasses = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer border';
        const activeClasses = isActive 
          ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900 border-blue-500' 
          : 'border-transparent';
        
        return (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`${baseClasses} ${option.color} ${activeClasses}`}
            type="button"
            aria-pressed={isActive}
            role="tab"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}