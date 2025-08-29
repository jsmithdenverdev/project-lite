import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormEditWorkItemSchema, type EditWorkItemFormData } from '../../schemas';
import type { EditWorkItemFormProps } from './types';

export default function EditWorkItemForm({
  editData,
  availableParents,
  onUpdateField,
  onSave,
}: EditWorkItemFormProps) {
  // Form management with react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<EditWorkItemFormData>({
    resolver: zodResolver(FormEditWorkItemSchema),
    defaultValues: {
      id: editData.id || '',
      title: editData.title || '',
      description: editData.description || '',
      type: editData.type || 'task',
      status: editData.status || 'backlog',
      priority: editData.priority || 'medium',
      parentId: editData.parentId || '',
      assignee: editData.assignee || '',
      dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : '',
    },
    mode: 'onChange',
  });

  // Sync form data back to parent component
  useEffect(() => {
    const subscription = watch((value) => {
      // Update each field that changed
      Object.entries(value).forEach(([field, fieldValue]) => {
        if (field === 'dueDate' && fieldValue) {
          // Convert date back to ISO string for the parent
          const isoDate = new Date(fieldValue as string).toISOString();
          if (isoDate !== editData[field as keyof typeof editData]) {
            onUpdateField(field as keyof typeof editData, isoDate);
          }
        } else if (fieldValue !== editData[field as keyof typeof editData]) {
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
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          {...register('title')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (isValid && onSave) {
                handleFormSubmit();
              }
            }
          }}
          className={`w-full text-sm p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
            errors.title ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            {...register('type')}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            {...register('priority')}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Parent */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Parent Item
          </label>
          <select
            {...register('parentId')}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">No Parent</option>
            {availableParents
              .filter(parent => parent.id !== editData.id)
              .map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.title} ({parent.type})
                </option>
              ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee
          </label>
          <input
            type="text"
            {...register('assignee')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (isValid && onSave) {
                  handleFormSubmit();
                }
              }
            }}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            {...register('dueDate')}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
}