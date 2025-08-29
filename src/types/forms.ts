import type { UseFormReturn, FieldErrors, Control, RegisterOptions } from 'react-hook-form';
import type { 
  NewProjectFormData,
  CreateWorkItemFormData,
  EditWorkItemFormData,
  EditProjectFormData,
  QuickCreateWorkItemFormData,
  BulkCreateWorkItemFormData,
  WorkItemType,
} from '../schemas';

// ===========================
// React Hook Form Type Extensions
// ===========================

// Generic form hook type
export type FormHookReturn<T extends Record<string, any>> = UseFormReturn<T> & {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
};

// Specific form hook returns
export type NewProjectFormHook = FormHookReturn<NewProjectFormData>;
export type CreateWorkItemFormHook = FormHookReturn<CreateWorkItemFormData>;
export type EditWorkItemFormHook = FormHookReturn<EditWorkItemFormData>;
export type EditProjectFormHook = FormHookReturn<EditProjectFormData>;
export type QuickCreateWorkItemFormHook = FormHookReturn<QuickCreateWorkItemFormData>;
export type BulkCreateWorkItemFormHook = FormHookReturn<BulkCreateWorkItemFormData>;

// Form errors types
export type NewProjectFormErrors = FieldErrors<NewProjectFormData>;
export type CreateWorkItemFormErrors = FieldErrors<CreateWorkItemFormData>;
export type EditWorkItemFormErrors = FieldErrors<EditWorkItemFormData>;
export type EditProjectFormErrors = FieldErrors<EditProjectFormData>;

// Form control types for complex components
export type NewProjectFormControl = Control<NewProjectFormData>;
export type CreateWorkItemFormControl = Control<CreateWorkItemFormData>;
export type EditWorkItemFormControl = Control<EditWorkItemFormData>;
export type EditProjectFormControl = Control<EditProjectFormData>;

// ===========================
// Form Field Configuration
// ===========================

// Generic field configuration
export interface FormFieldConfig<T> {
  name: keyof T;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  validation?: RegisterOptions;
}

// Form section configuration
export interface FormSectionConfig<T> {
  title: string;
  description?: string;
  fields: FormFieldConfig<T>[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// ===========================
// Form Props Interfaces
// ===========================

// Base form props
export interface BaseFormProps<T> {
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<T>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

// New project form props
export interface NewProjectFormProps extends BaseFormProps<NewProjectFormData> {
  showAdvancedFields?: boolean;
}

// Create work item form props
export interface CreateWorkItemFormProps extends BaseFormProps<CreateWorkItemFormData> {
  availableParents?: Array<{ id: string; title: string; type: WorkItemType }>;
  hideParentSelector?: boolean;
  defaultParentId?: string;
  allowedTypes?: WorkItemType[];
}

// Edit work item form props
export interface EditWorkItemFormProps extends BaseFormProps<EditWorkItemFormData> {
  workItemId: string;
  availableParents?: Array<{ id: string; title: string; type: WorkItemType }>;
  onDelete?: () => void | Promise<void>;
  showDeleteButton?: boolean;
}

// Edit project form props
export interface EditProjectFormProps extends BaseFormProps<EditProjectFormData> {
  projectId: string;
  onArchive?: () => void | Promise<void>;
  showArchiveButton?: boolean;
}

// Quick create work item form props
export interface QuickCreateWorkItemFormProps extends BaseFormProps<QuickCreateWorkItemFormData> {
  defaultType?: WorkItemType;
  parentId?: string;
  onCreateMultiple?: () => void;
}

// ===========================
// Form State Management
// ===========================

// Form submission state
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error?: string;
  lastSubmissionTime?: Date;
}

// Form validation state
export interface FormValidationState {
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Set<string>;
  errorCount: number;
  warningCount: number;
}

// Combined form state
export interface FormState<T> {
  data: Partial<T>;
  validation: FormValidationState;
  submission: FormSubmissionState;
  meta: {
    mode: 'create' | 'edit' | 'view';
    version: number;
    lastModified: Date;
  };
}

// ===========================
// Form Component Types
// ===========================

// Generic input component props
export interface FormInputProps<T extends Record<string, any>> {
  name: keyof T;
  control: Control<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
}

// Select component options
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Select input props
export interface FormSelectProps<T extends Record<string, any>> extends FormInputProps<T> {
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
}

// Date input props
export interface FormDateProps<T extends Record<string, any>> extends FormInputProps<T> {
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  format?: string;
}

// Array field props
export interface FormArrayProps<T extends Record<string, any>, K extends keyof T> {
  name: K;
  control: Control<T>;
  label: string;
  addButtonText?: string;
  removeButtonText?: string;
  maxItems?: number;
  minItems?: number;
  renderItem: (index: number, remove: () => void) => React.ReactNode;
}

// ===========================
// Form Utility Types
// ===========================

// Type-safe form field paths
export type FormFieldPath<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? U extends object
      ? `${string & K}.${number}.${string & keyof U}` | `${string & K}.${number}`
      : `${string & K}.${number}`
    : T[K] extends object
      ? `${string & K}.${string & keyof T[K]}` | (string & K)
      : string & K;
}[keyof T];

// Form transformation utilities
export type FormTransformFn<TInput, TOutput> = (data: TInput) => TOutput | Promise<TOutput>;
export type FormValidationFn<T> = (data: T) => Record<keyof T, string> | null;

// Form hook options
export interface FormHookOptions<T> {
  defaultValues?: Partial<T>;
  resetOnSubmit?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  transform?: FormTransformFn<T, T>;
  onSubmit?: (data: T) => void | Promise<void>;
  onError?: (errors: FieldErrors<T>) => void;
}

// ===========================
// Constants for Form Options
// ===========================

// Status options for dropdowns
export const WORK_ITEM_STATUS_OPTIONS: SelectOption[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'testing', label: 'Testing' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Priority options for dropdowns
export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Work item type options for dropdowns
export const WORK_ITEM_TYPE_OPTIONS: SelectOption[] = [
  { value: 'epic', label: 'Epic' },
  { value: 'feature', label: 'Feature' },
  { value: 'story', label: 'Story' },
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'spike', label: 'Spike' },
  { value: 'research', label: 'Research' },
];

// Project type options for dropdowns
export const PROJECT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'software', label: 'Software' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'physical', label: 'Physical' },
  { value: 'other', label: 'Other' },
];

// Effort unit options for dropdowns
export const EFFORT_UNIT_OPTIONS: SelectOption[] = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'story_points', label: 'Story Points' },
  { value: 't_shirt_size', label: 'T-Shirt Size' },
];

// Dependency type options for dropdowns
export const DEPENDENCY_TYPE_OPTIONS: SelectOption[] = [
  { value: 'blocks', label: 'Blocks' },
  { value: 'blocked_by', label: 'Blocked By' },
  { value: 'relates_to', label: 'Relates To' },
  { value: 'duplicates', label: 'Duplicates' },
  { value: 'clones', label: 'Clones' },
];