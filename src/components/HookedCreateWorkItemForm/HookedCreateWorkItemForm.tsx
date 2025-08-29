import React from 'react';
import { Controller } from 'react-hook-form';
import { X, Plus, AlertCircle } from 'lucide-react';
import { useCreateWorkItemForm } from '../../hooks/useFormValidation';
import { 
  WORK_ITEM_TYPE_OPTIONS, 
  WORK_ITEM_STATUS_OPTIONS, 
  PRIORITY_OPTIONS 
} from '../../types/forms';
import type { HookedCreateWorkItemFormProps } from '../CreateWorkItemForm/types';

/**
 * Create Work Item Form with react-hook-form integration and Zod validation
 * 
 * This component demonstrates proper TypeScript typing and validation
 * using the new form schemas and hooks.
 */
export default function HookedCreateWorkItemForm({
  onSubmit,
  onCancel,
  availableParents = [],
  defaultValues,
  hideParentSelector = false,
  disabled = false,
  loading = false,
  className = '',
}: HookedCreateWorkItemFormProps) {
  // Use the typed form hook with validation
  const form = useCreateWorkItemForm({
    defaultValues,
    onSubmit,
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    watch,
    setValue,
  } = form;

  // Watch form values for conditional logic
  const watchedType = watch('type');
  const watchedTitle = watch('title');

  // Handle form submission
  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  });

  // Utility to get error message for a field
  const getErrorMessage = (fieldName: string) => {
    const error = errors[fieldName as keyof typeof errors];
    return error?.message as string | undefined;
  };

  // Utility to check if field has error
  const hasError = (fieldName: string) => {
    return Boolean(errors[fieldName as keyof typeof errors]);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Create New Work Item
        </h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
          type="button"
          disabled={disabled || isSubmitting}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title - Required Field */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter work item title..."
              disabled={disabled || isSubmitting}
              className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                ${hasError('title') 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
              autoFocus
            />
            {hasError('title') && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getErrorMessage('title')}
              </div>
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
              disabled={disabled || isSubmitting}
              className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                ${hasError('description') 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
            />
            {hasError('description') && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getErrorMessage('description')}
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={disabled || isSubmitting}
                  className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                    ${hasError('type') 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                >
                  {WORK_ITEM_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {hasError('type') && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getErrorMessage('type')}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={disabled || isSubmitting}
                  className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                    ${hasError('status') 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                >
                  {WORK_ITEM_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {hasError('status') && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getErrorMessage('status')}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={disabled || isSubmitting}
                  className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                    ${hasError('priority') 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {hasError('priority') && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getErrorMessage('priority')}
              </div>
            )}
          </div>

          {/* Parent Item */}
          {!hideParentSelector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parent Item
              </label>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={disabled || isSubmitting}
                    className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                      ${hasError('parentId') 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                  >
                    <option value="">No Parent</option>
                    {availableParents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.title} ({parent.type})
                      </option>
                    ))}
                  </select>
                )}
              />
              {hasError('parentId') && (
                <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getErrorMessage('parentId')}
                </div>
              )}
            </div>
          )}

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <input
              {...register('assignee')}
              type="text"
              placeholder="Enter assignee..."
              disabled={disabled || isSubmitting}
              className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                ${hasError('assignee') 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
            />
            {hasError('assignee') && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getErrorMessage('assignee')}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              {...register('dueDate')}
              type="date"
              disabled={disabled || isSubmitting}
              className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                ${hasError('dueDate') 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }`}
            />
            {hasError('dueDate') && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getErrorMessage('dueDate')}
              </div>
            )}
          </div>
        </div>

        {/* Form Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following errors:
                </h3>
                <ul className="mt-1 text-sm text-red-700 dark:text-red-300 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error?.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            type="button"
            disabled={disabled || isSubmitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled || isSubmitting || !isValid || !watchedTitle?.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Item</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Development Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <div><strong>Form State:</strong> Valid: {isValid ? '✓' : '✗'}, Dirty: {isDirty ? '✓' : '✗'}, Submitting: {isSubmitting ? '✓' : '✗'}</div>
          <div><strong>Current Type:</strong> {watchedType}</div>
          <div><strong>Error Count:</strong> {Object.keys(errors).length}</div>
        </div>
      )}
    </div>
  );
}

// Re-export types for convenience
export type { HookedCreateWorkItemFormProps } from '../CreateWorkItemForm/types';