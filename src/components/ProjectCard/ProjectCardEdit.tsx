import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditProjectFormSchema, type EditProjectFormData } from '../../schemas';
import type { ProjectCardEditProps } from './types';

export default function ProjectCardEdit({ editData, onUpdateField, onSave }: ProjectCardEditProps) {
  // Form management with react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(EditProjectFormSchema),
    defaultValues: {
      name: editData.name || '',
      description: editData.description || '',
      type: editData.type || 'software',
      status: editData.status || 'backlog',
      priority: editData.priority || 'medium',
      estimatedEffort: editData.estimatedEffort || { value: 0, unit: 'hours' },
    },
    mode: 'onChange',
  });

  // Sync form data back to parent component
  useEffect(() => {
    const subscription = watch((value) => {
      // Update each field that changed
      Object.entries(value).forEach(([field, fieldValue]) => {
        if (fieldValue !== editData[field as keyof typeof editData]) {
          onUpdateField(field as keyof typeof editData, fieldValue);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdateField, editData]);

  const handleFormSubmit = handleSubmit(() => {
    if (onSave) {
      onSave();
    }
  });

  return (
    <div className="flex-1 space-y-4">
      {/* Project Name */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name
        </label>
        <input
          type="text"
          {...register("name")}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (isValid && onSave) {
                handleFormSubmit();
              }
            }
          }}
          className={`w-full text-lg font-bold p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
            errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
        )}
      </div>
      
      {/* Project Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={2}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            {...register("status")}
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
            {...register("priority")}
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
          {...register("type")}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            {...register("estimatedEffort.value", { valueAsNumber: true })}
            placeholder="Value"
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <select
            {...register("estimatedEffort.unit")}
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