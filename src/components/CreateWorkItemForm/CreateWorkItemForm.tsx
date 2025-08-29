import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { FormCreateWorkItemSchema, type CreateWorkItemFormData } from '../../schemas';
import type { CreateWorkItemFormProps } from './types';

export default function CreateWorkItemForm({
  newItemData,
  availableParents,
  onUpdateField,
  onSave,
  onCancel,
  hideParentSelector = false,
}: CreateWorkItemFormProps) {
  // Form management with react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<CreateWorkItemFormData>({
    resolver: zodResolver(FormCreateWorkItemSchema),
    defaultValues: {
      title: newItemData.title || '',
      description: newItemData.description || '',
      type: newItemData.type || 'task',
      status: newItemData.status || 'backlog',
      priority: newItemData.priority || 'medium',
      parentId: newItemData.parentId || '',
      assignee: newItemData.assignee || '',
      dueDate: newItemData.dueDate || '',
    },
    mode: 'onChange',
  });

  // Sync form data back to parent component
  useEffect(() => {
    const subscription = watch((value) => {
      // Update each field that changed
      Object.entries(value).forEach(([field, fieldValue]) => {
        if (fieldValue !== newItemData[field as keyof typeof newItemData]) {
          onUpdateField(field as keyof typeof newItemData, fieldValue);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdateField, newItemData]);

  const handleFormSubmit = handleSubmit(() => {
    onSave();
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Create New Work Item
        </h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            {...register('title')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (isValid) {
                  handleFormSubmit();
                }
              }
            }}
            placeholder="Enter work item title..."
            className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              errors.title ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
            }`}
            autoFocus
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            placeholder="Enter description..."
            rows={3}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            {...register('type')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="epic">Epic</option>
            <option value="feature">Feature</option>
            <option value="story">Story</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="spike">Spike</option>
            <option value="research">Research</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            {...register('priority')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Parent */}
        {!hideParentSelector && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Item
            </label>
            <select
              {...register('parentId')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">No Parent</option>
              {availableParents
                .filter(parent => parent.id !== newItemData.id)
                .map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.title} ({parent.type})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee
          </label>
          <input
            type="text"
            {...register('assignee')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (isValid) {
                  handleFormSubmit();
                }
              }
            }}
            placeholder="Enter assignee..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            {...register('dueDate')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleFormSubmit}
          disabled={!isValid}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          type="button"
        >
          <Plus className="w-4 h-4" />
          <span>Create Item</span>
        </button>
      </div>
    </div>
  );
}