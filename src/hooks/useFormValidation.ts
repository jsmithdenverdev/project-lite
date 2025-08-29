import { useForm, UseFormProps, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo } from 'react';
import { ZodSchema } from 'zod';
import {
  NewProjectFormSchema,
  FormCreateWorkItemSchema,
  FormEditWorkItemSchema,
  EditProjectFormSchema,
  QuickCreateWorkItemFormSchema,
  BulkCreateWorkItemFormSchema,
  NewProjectFormData,
  CreateWorkItemFormData,
  EditWorkItemFormData,
  EditProjectFormData,
  QuickCreateWorkItemFormData,
  BulkCreateWorkItemFormData,
} from '../schemas';
import {
  NewProjectFormHook,
  CreateWorkItemFormHook,
  EditWorkItemFormHook,
  EditProjectFormHook,
  QuickCreateWorkItemFormHook,
  BulkCreateWorkItemFormHook,
  FormHookOptions,
} from '../types/forms';

// ===========================
// Generic Form Hook
// ===========================

/**
 * Generic form hook with Zod schema validation
 */
export function useFormWithValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  options: FormHookOptions<T> = {}
) {
  const {
    defaultValues,
    resetOnSubmit = false,
    validateOnChange = true,
    validateOnBlur = true,
    reValidateMode = 'onChange',
    transform,
    onSubmit,
    onError,
  } = options;

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: validateOnChange ? 'onChange' : validateOnBlur ? 'onBlur' : 'onSubmit',
    reValidateMode,
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
    reset,
  } = form;

  const submitHandler = useCallback(
    async (data: T) => {
      try {
        const transformedData = transform ? await transform(data) : data;
        await onSubmit?.(transformedData);
        
        if (resetOnSubmit) {
          reset();
        }
      } catch (error) {
        console.error('Form submission error:', error);
        // Handle submission errors if needed
      }
    },
    [transform, onSubmit, resetOnSubmit, reset]
  );

  const errorHandler = useCallback(
    (errors: any) => {
      onError?.(errors);
    },
    [onError]
  );

  const onSubmitHandler = handleSubmit(submitHandler, errorHandler);

  return {
    ...form,
    isValid,
    isDirty,
    isSubmitting,
    onSubmit: onSubmitHandler,
  };
}

// ===========================
// Specific Form Hooks
// ===========================

/**
 * Hook for new project creation form
 */
export function useNewProjectForm(
  options: FormHookOptions<NewProjectFormData> = {}
): NewProjectFormHook {
  const defaultValues: Partial<NewProjectFormData> = {
    type: 'software',
    priority: 'medium',
    stakeholders: [],
    tags: [],
    ...options.defaultValues,
  };

  return useFormWithValidation(NewProjectFormSchema, {
    ...options,
    defaultValues,
  });
}

/**
 * Hook for work item creation form
 */
export function useCreateWorkItemForm(
  options: FormHookOptions<CreateWorkItemFormData> = {}
): CreateWorkItemFormHook {
  const defaultValues: Partial<CreateWorkItemFormData> = {
    type: 'task',
    status: 'backlog',
    priority: 'medium',
    tags: [],
    acceptanceCriteria: [],
    dependencies: [],
    ...options.defaultValues,
  };

  return useFormWithValidation(FormCreateWorkItemSchema, {
    ...options,
    defaultValues,
  });
}

/**
 * Hook for work item editing form
 */
export function useEditWorkItemForm(
  workItemId: string,
  options: FormHookOptions<EditWorkItemFormData> = {}
): EditWorkItemFormHook {
  const defaultValues: Partial<EditWorkItemFormData> = {
    id: workItemId,
    type: 'task',
    status: 'backlog',
    priority: 'medium',
    ...options.defaultValues,
  };

  return useFormWithValidation(FormEditWorkItemSchema, {
    ...options,
    defaultValues,
  });
}

/**
 * Hook for project editing form
 */
export function useEditProjectForm(
  projectId: string,
  options: FormHookOptions<EditProjectFormData> = {}
): EditProjectFormHook {
  const defaultValues: Partial<EditProjectFormData> = {
    id: projectId,
    type: 'software',
    priority: 'medium',
    stakeholders: [],
    ...options.defaultValues,
  };

  return useFormWithValidation(EditProjectFormSchema, {
    ...options,
    defaultValues,
  });
}

/**
 * Hook for quick work item creation
 */
export function useQuickCreateWorkItemForm(
  options: FormHookOptions<QuickCreateWorkItemFormData> = {}
): QuickCreateWorkItemFormHook {
  const defaultValues: Partial<QuickCreateWorkItemFormData> = {
    type: 'task',
    ...options.defaultValues,
  };

  return useFormWithValidation(QuickCreateWorkItemFormSchema, {
    ...options,
    defaultValues,
  });
}

/**
 * Hook for bulk work item creation
 */
export function useBulkCreateWorkItemForm(
  options: FormHookOptions<BulkCreateWorkItemFormData> = {}
): BulkCreateWorkItemFormHook {
  const defaultValues: Partial<BulkCreateWorkItemFormData> = {
    items: [],
    defaultType: 'task',
    defaultStatus: 'backlog',
    defaultPriority: 'medium',
    ...options.defaultValues,
  };

  return useFormWithValidation(BulkCreateWorkItemFormSchema, {
    ...options,
    defaultValues,
  });
}

// ===========================
// Form Utility Hooks
// ===========================

/**
 * Hook for managing form state persistence
 */
export function useFormPersistence<T extends Record<string, any>>(
  storageKey: string,
  form: ReturnType<typeof useForm<T>>
) {
  const { watch, reset } = form;

  // Watch all form values
  const formData = watch();

  // Save form data to localStorage on change
  const saveFormData = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [storageKey, formData]);

  // Load form data from localStorage
  const loadFormData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        reset(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
    }
    return null;
  }, [storageKey, reset]);

  // Clear saved form data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }, [storageKey]);

  return {
    saveFormData,
    loadFormData,
    clearSavedData,
  };
}

/**
 * Hook for form field array management
 */
export function useFormArray<T extends Record<string, any>, K extends keyof T>(
  control: any,
  fieldName: K,
  defaultItem: () => T[K] extends Array<infer U> ? U : never
) {
  const { fields, append, remove, move, swap } = useFieldArray({
    control,
    name: fieldName as string,
  });

  const addItem = useCallback(() => {
    append(defaultItem());
  }, [append, defaultItem]);

  const removeItem = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  const moveItem = useCallback((from: number, to: number) => {
    move(from, to);
  }, [move]);

  const swapItems = useCallback((indexA: number, indexB: number) => {
    swap(indexA, indexB);
  }, [swap]);

  return {
    fields,
    addItem,
    removeItem,
    moveItem,
    swapItems,
  };
}

/**
 * Hook for conditional form validation
 */
export function useConditionalValidation<T extends Record<string, any>>(
  form: ReturnType<typeof useForm<T>>,
  conditions: Record<keyof T, (value: any, formData: T) => boolean>
) {
  const { watch, clearErrors, setError } = form;
  const formData = watch();

  const validateConditionally = useCallback(() => {
    Object.entries(conditions).forEach(([fieldName, condition]) => {
      const fieldValue = formData[fieldName as keyof T];
      const isValid = condition(fieldValue, formData);
      
      if (!isValid) {
        setError(fieldName as keyof T, {
          type: 'conditional',
          message: `${fieldName} is required based on current form state`,
        });
      } else {
        clearErrors(fieldName as keyof T);
      }
    });
  }, [formData, conditions, setError, clearErrors]);

  return { validateConditionally };
}

// Re-export useFieldArray from react-hook-form for convenience
export { useFieldArray };