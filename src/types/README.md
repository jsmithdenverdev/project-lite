# React Hook Form Integration with TypeScript and Zod

This document explains how to use the comprehensive TypeScript types and Zod schema integration for react-hook-form in Project Lite.

## Overview

The project now includes:
- **Zod schemas** with validation messages for all form types
- **TypeScript types** derived from schemas using `z.infer<>`
- **Custom hooks** for type-safe form management
- **Pre-configured form components** with validation
- **Utility types** for advanced form patterns

## File Structure

```
src/
├── schemas.ts              # Zod schemas and inferred types
├── types/
│   └── forms.ts           # React Hook Form specific types
├── hooks/
│   └── useFormValidation.ts # Custom form hooks
└── components/
    └── HookedCreateWorkItemForm/ # Example form component
```

## Basic Usage

### 1. Using Form Hooks

```typescript
import { useCreateWorkItemForm } from '../hooks/useFormValidation';
import { CreateWorkItemFormData } from '../schemas';

function MyComponent() {
  const form = useCreateWorkItemForm({
    defaultValues: {
      type: 'task',
      priority: 'medium',
    },
    onSubmit: async (data: CreateWorkItemFormData) => {
      // Data is fully typed and validated
      console.log(data.title); // TypeScript knows this is a string
    },
  });

  const { control, register, handleSubmit, formState: { errors } } = form;
  
  return (
    <form onSubmit={form.onSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 2. Form Validation

All forms use Zod schemas for validation with custom error messages:

```typescript
// Schema includes validation rules and messages
export const CreateWorkItemFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long (max 200 characters)")
    .trim(),
  // ... other fields
});

// Type is automatically inferred
export type CreateWorkItemFormData = z.infer<typeof CreateWorkItemFormSchema>;
```

### 3. Type-Safe Field Registration

```typescript
// Register fields with full type safety
<input
  {...register('title')} // TypeScript knows 'title' is valid
  type="text"
  className={hasError('title') ? 'error' : 'normal'}
/>

// Controller for complex fields
<Controller
  name="priority" // Type-safe field name
  control={control}
  render={({ field }) => (
    <select {...field}>
      {PRIORITY_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )}
/>
```

## Available Form Schemas

### NewProjectFormSchema
For creating new projects:
- Required: `name`, `type`
- Optional: `description`, `priority`, `targetDate`, `owner`, `stakeholders`, `tags`
- Validation: String lengths, date constraints, array filtering

### CreateWorkItemFormSchema  
For creating work items:
- Required: `title`
- Optional: All other fields with sensible defaults
- Validation: Cross-field validation (start/due dates), string trimming
- Special: Array fields are filtered to remove empty strings

### EditWorkItemFormSchema
For editing existing work items:
- Extends `CreateWorkItemFormSchema` but makes most fields optional
- Required: `id`, `title`, `type`
- Maintains validation rules from create schema

### EditProjectFormSchema
For editing existing projects:
- Uses `ProjectSchema.pick()` for field selection
- Required: `id`, `name`
- Maintains all validation from project schema

## Custom Hooks

### useCreateWorkItemForm
```typescript
const form = useCreateWorkItemForm({
  defaultValues: { type: 'task' },
  onSubmit: async (data) => {
    // Handle submission
  },
  resetOnSubmit: true,
});
```

### useEditWorkItemForm
```typescript
const form = useEditWorkItemForm(workItemId, {
  defaultValues: existingData,
  onSubmit: async (data) => {
    // Handle updates
  },
});
```

### useFormPersistence
Save form state to localStorage:
```typescript
const { saveFormData, loadFormData, clearSavedData } = useFormPersistence(
  'workItemForm',
  form
);
```

## Advanced Patterns

### Conditional Validation
```typescript
const { validateConditionally } = useConditionalValidation(form, {
  assignee: (value, formData) => 
    formData.status === 'in_progress' ? !!value : true,
});
```

### Array Field Management
```typescript
const { fields, addItem, removeItem } = useFormArray(
  control,
  'acceptanceCriteria',
  () => ({ description: '', completed: false })
);
```

### Form State Management
```typescript
// Full form state type
interface FormState<T> {
  data: Partial<T>;
  validation: FormValidationState;
  submission: FormSubmissionState;
  meta: {
    mode: 'create' | 'edit' | 'view';
    version: number;
    lastModified: Date;
  };
}
```

## Type Safety Features

### 1. No `any` Types
All form data is strictly typed using Zod inference.

### 2. Field Name Validation
```typescript
// TypeScript prevents typos in field names
type CreateWorkItemFormFields = keyof CreateWorkItemFormData;
// 'title' | 'description' | 'type' | 'status' | ...
```

### 3. Proper Error Handling
```typescript
const getErrorMessage = (fieldName: keyof CreateWorkItemFormData) => {
  const error = errors[fieldName];
  return error?.message; // Properly typed
};
```

### 4. Schema Composition
```typescript
// Reuse and extend existing schemas
export const EditWorkItemFormSchema = CreateWorkItemFormSchema
  .partial() // Make all fields optional
  .extend({
    id: z.string().min(1, "Work item ID is required"),
    // Override specific fields to be required
    title: z.string().min(1, "Title is required"),
  });
```

## Constants for Dropdowns

Pre-defined options with proper typing:

```typescript
import { 
  WORK_ITEM_TYPE_OPTIONS,
  WORK_ITEM_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  EFFORT_UNIT_OPTIONS,
  DEPENDENCY_TYPE_OPTIONS 
} from '../types/forms';

// Each option has: { value: string; label: string; disabled?: boolean; }
```

## Migration Guide

### From Legacy Forms
1. Replace manual validation with Zod schemas
2. Use form hooks instead of useState
3. Leverage Controller for complex fields
4. Add proper error handling with typed error messages

### Example Migration
```typescript
// Before (legacy)
const [formData, setFormData] = useState<Partial<WorkItem>>({});
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = () => {
  // Manual validation
  if (!formData.title) {
    setErrors({ title: 'Title is required' });
    return;
  }
  // Submit logic...
};

// After (with hooks)
const form = useCreateWorkItemForm({
  onSubmit: async (data) => {
    // Data is validated automatically
    await createWorkItem(data);
  },
});
```

## Best Practices

1. **Always use form hooks** instead of manual form state
2. **Leverage schema composition** to reuse validation logic
3. **Use Controller** for complex form controls
4. **Include error handling** in form components
5. **Provide proper TypeScript types** for all props
6. **Use constants** for dropdown options
7. **Test form validation** thoroughly
8. **Handle async operations** properly in onSubmit

## Error Handling

### Display Field Errors
```typescript
{hasError('title') && (
  <div className="error-message">
    <AlertCircle className="w-4 h-4" />
    {getErrorMessage('title')}
  </div>
)}
```

### Form-Level Error Summary
```typescript
{Object.keys(errors).length > 0 && (
  <div className="error-summary">
    <h3>Please fix the following errors:</h3>
    <ul>
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>• {error?.message}</li>
      ))}
    </ul>
  </div>
)}
```

This integration provides a robust, type-safe foundation for all form handling in Project Lite while maintaining backward compatibility with existing components.