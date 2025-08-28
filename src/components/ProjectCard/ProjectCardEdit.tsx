import type { StatusType, PriorityType, EstimatedEffort } from '../../schemas';
import type { ProjectCardEditProps } from './types';

export default function ProjectCardEdit({ editData, onUpdateField }: ProjectCardEditProps) {
  return (
    <div className="flex-1 space-y-4">
      {/* Project Name */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name
        </label>
        <input
          type="text"
          value={editData.name || ""}
          onChange={(e) => onUpdateField("name", e.target.value)}
          className="w-full text-lg font-bold p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      
      {/* Project Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={editData.description || ""}
          onChange={(e) => onUpdateField("description", e.target.value)}
          rows={2}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={editData.status || "backlog"}
            onChange={(e) => onUpdateField("status", e.target.value as StatusType)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="backlog">Backlog</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={editData.priority || "medium"}
            onChange={(e) => onUpdateField("priority", e.target.value as PriorityType)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Type
        </label>
        <select
          value={editData.type || "software"}
          onChange={(e) => onUpdateField("type", e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="software">Software</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="design">Design</option>
          <option value="research">Research</option>
          <option value="physical">Physical</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Estimated Effort */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Estimated Effort
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            value={editData.estimatedEffort?.value || ""}
            onChange={(e) => onUpdateField("estimatedEffort", {
              ...editData.estimatedEffort,
              value: parseFloat(e.target.value) || 0
            })}
            placeholder="Value"
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <select
            value={editData.estimatedEffort?.unit || "hours"}
            onChange={(e) => onUpdateField("estimatedEffort", {
              ...editData.estimatedEffort,
              unit: e.target.value as EstimatedEffort["unit"]
            })}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="story_points">Story Points</option>
            <option value="t_shirt_size">T-Shirt Size</option>
          </select>
        </div>
      </div>
    </div>
  );
}