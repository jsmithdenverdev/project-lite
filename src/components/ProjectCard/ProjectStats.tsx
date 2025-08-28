import { getPriorityColor } from '../../utils/workItemHelpers';
import type { ProjectStatsProps } from './types';

export default function ProjectStats({ 
  totalItems, 
  completedItems, 
  estimatedEffort, 
  priority 
}: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {totalItems}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {completedItems}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">
          {estimatedEffort?.value || 0}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Est.{" "}
          {estimatedEffort?.unit || "hours"}
        </div>
      </div>
      <div className="text-center">
        <div
          className={`text-2xl font-bold ${getPriorityColor(priority)}`}
        >
          {priority?.toUpperCase() || "MED"}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Priority</div>
      </div>
    </div>
  );
}