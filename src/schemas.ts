import { z } from "zod";

// Base schemas
export const EstimatedEffortSchema = z.object({
  value: z.number().min(0),
  unit: z.enum(["hours", "days", "weeks", "months", "story_points", "t_shirt_size"]),
});

export const AcceptanceCriteriaSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  completed: z.boolean().optional().default(false),
});

export const DependencySchema = z.object({
  id: z.string().optional(),
  type: z.enum(["blocks", "blocked_by", "relates_to", "duplicates", "clones"]),
  targetId: z.string().min(1),
  description: z.string().optional(),
});

// Work item status and types
export const WorkItemStatusSchema = z.enum([
  "backlog",
  "todo", 
  "in_progress",
  "review",
  "testing",
  "done",
  "blocked",
  "cancelled"
]);

export const PrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const WorkItemTypeSchema = z.enum([
  "epic",
  "feature", 
  "story",
  "task",
  "bug",
  "spike",
  "research"
]);

export const WorkItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: WorkItemTypeSchema,
  status: WorkItemStatusSchema,
  priority: PrioritySchema,
  parentId: z.string().optional(),
  estimatedEffort: EstimatedEffortSchema.optional(),
  actualEffort: EstimatedEffortSchema.optional(),
  assignee: z.string().optional(),
  reporter: z.string().optional(),
  createdDate: z.string().optional(),
  updatedDate: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(AcceptanceCriteriaSchema).optional(),
  dependencies: z.array(DependencySchema).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["software", "infrastructure", "design", "research", "physical", "other"]),
  status: WorkItemStatusSchema,
  priority: PrioritySchema,
  estimatedEffort: EstimatedEffortSchema.optional(),
  tags: z.array(z.string()).optional(),
  createdDate: z.string().min(1),
  targetDate: z.string().optional(),
  owner: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const MetadataSchema = z.object({
  version: z.string().optional(),
  lastUpdated: z.string().optional(),
  totalWorkItems: z.number().min(0).optional(),
  completedWorkItems: z.number().min(0).optional(),
  totalEstimatedEffort: EstimatedEffortSchema.optional(),
  schemaVersion: z.string().optional(),
});

export const ProjectDataSchema = z.object({
  project: ProjectSchema,
  workItems: z.array(WorkItemSchema),
  metadata: MetadataSchema.optional(),
});

// Inferred types
export type EstimatedEffort = z.infer<typeof EstimatedEffortSchema>;
export type AcceptanceCriteria = z.infer<typeof AcceptanceCriteriaSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type WorkItemStatus = z.infer<typeof WorkItemStatusSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type WorkItemType = z.infer<typeof WorkItemTypeSchema>;
export type WorkItem = z.infer<typeof WorkItemSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type ProjectData = z.infer<typeof ProjectDataSchema>;

// Extended type for UI (includes children for hierarchy)
export interface WorkItemWithChildren extends WorkItem {
  children: WorkItemWithChildren[];
}

// Filter types for expandable filter system
export const FilterTypeSchema = z.enum(["status", "type", "priority", "tags", "assignee"]);
export type FilterType = z.infer<typeof FilterTypeSchema>;

export interface FilterValue {
  id: string;
  label: string;
  value: string | string[];
  type: FilterType;
}

export interface FilterOptions {
  type: FilterType;
  label: string;
  icon?: string;
  options: Array<{
    value: string;
    label: string;
    color?: string;
  }>;
}

export interface FilterState {
  activeFilters: FilterValue[];
  availableFilters: FilterOptions[];
}


// Legacy type for backward compatibility
export type ProjectEditFormData = z.infer<typeof ProjectSchema>;

// Type aliases for backward compatibility
export type StatusType = WorkItemStatus;
export type PriorityType = Priority;

// ===========================
// Form Validation Schemas
// ===========================

// Base form field schemas with validation messages
export const FormEstimatedEffortSchema = z.object({
  value: z.number()
    .min(0, "Effort value must be non-negative")
    .max(99999, "Effort value is too large"),
  unit: z.enum(["hours", "days", "weeks", "months", "story_points", "t_shirt_size"], {
    message: "Please select a valid effort unit",
  }),
}).refine(data => data.value > 0 || data.unit === "story_points", {
  message: "Effort value must be greater than 0",
  path: ["value"],
});

export const FormAcceptanceCriteriaSchema = z.object({
  id: z.string().optional(),
  description: z.string()
    .min(1, "Acceptance criteria description is required")
    .max(1000, "Description is too long (max 1000 characters)"),
  completed: z.boolean().optional().default(false),
});

export const FormDependencySchema = z.object({
  id: z.string().optional(),
  type: z.enum(["blocks", "blocked_by", "relates_to", "duplicates", "clones"], {
    message: "Please select a valid dependency type",
  }),
  targetId: z.string()
    .min(1, "Target work item is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid work item ID format"),
  description: z.string()
    .max(500, "Description is too long (max 500 characters)")
    .optional(),
});

// New Project Form Schema
export const NewProjectFormSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Project name is too long (max 100 characters)")
    .trim(),
  description: z.string()
    .max(2000, "Description is too long (max 2000 characters)")
    .optional()
    .transform(val => val?.trim() || undefined),
  type: z.enum(["software", "infrastructure", "design", "research", "physical", "other"], {
    message: "Please select a valid project type",
  }),
  priority: PrioritySchema.default("medium"),
  estimatedEffort: FormEstimatedEffortSchema.optional(),
  targetDate: z.string()
    .optional()
    .refine(val => !val || new Date(val) > new Date(), {
      message: "Target date must be in the future",
    })
    .transform(val => val || undefined),
  owner: z.string()
    .max(100, "Owner name is too long (max 100 characters)")
    .optional()
    .transform(val => val?.trim() || undefined),
  stakeholders: z.array(z.string().trim().min(1))
    .optional()
    .default([])
    .transform(arr => arr?.filter(s => s.length > 0) || []),
  tags: z.array(z.string().trim().min(1))
    .optional()
    .default([])
    .transform(arr => arr?.filter(t => t.length > 0) || []),
});

// Form schemas for react-hook-form integration
export const FormCreateWorkItemSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long (max 200 characters)")
    .trim(),
  description: z.string()
    .max(5000, "Description is too long (max 5000 characters)")
    .optional()
    .transform(val => val?.trim() || undefined),
  type: WorkItemTypeSchema.default("task"),
  status: WorkItemStatusSchema.default("backlog"),
  priority: PrioritySchema.default("medium"),
  parentId: z.string()
    .min(1)
    .optional()
    .transform(val => val || undefined),
  estimatedEffort: FormEstimatedEffortSchema.optional(),
  assignee: z.string()
    .max(100, "Assignee name is too long (max 100 characters)")
    .optional()
    .transform(val => val?.trim() || undefined),
  reporter: z.string()
    .max(100, "Reporter name is too long (max 100 characters)")
    .optional()
    .transform(val => val?.trim() || undefined),
  startDate: z.string()
    .optional()
    .refine(val => !val || new Date(val) <= new Date(), {
      message: "Start date cannot be in the future",
    })
    .transform(val => val || undefined),
  dueDate: z.string()
    .optional()
    .transform(val => val || undefined),
  tags: z.array(z.string().trim().min(1))
    .optional()
    .default([])
    .transform(arr => arr?.filter(t => t.length > 0) || []),
  acceptanceCriteria: z.array(FormAcceptanceCriteriaSchema)
    .optional()
    .default([]),
  dependencies: z.array(FormDependencySchema)
    .optional()
    .default([]),
}).refine(data => {
  if (data.startDate && data.dueDate) {
    return new Date(data.startDate) <= new Date(data.dueDate);
  }
  return true;
}, {
  message: "Start date must be before due date",
  path: ["dueDate"],
});

// Edit Work Item Form Schema (allows partial updates)
export const FormEditWorkItemSchema = FormCreateWorkItemSchema.partial().extend({
  id: z.string().min(1, "Work item ID is required"),
  // Title and type should still be required when editing
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long (max 200 characters)")
    .trim(),
  type: WorkItemTypeSchema,
});

// Edit Project Form Schema
export const EditProjectFormSchema = ProjectSchema.pick({
  name: true,
  description: true,
  type: true,
  priority: true,
  estimatedEffort: true,
  targetDate: true,
  owner: true,
  stakeholders: true,
}).extend({
  id: z.string().min(1, "Project ID is required"),
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Project name is too long (max 100 characters)")
    .trim(),
  description: z.string()
    .max(2000, "Description is too long (max 2000 characters)")
    .optional()
    .transform(val => val?.trim() || undefined),
  estimatedEffort: FormEstimatedEffortSchema.optional(),
  targetDate: z.string()
    .optional()
    .refine(val => !val || new Date(val) > new Date(), {
      message: "Target date must be in the future",
    })
    .transform(val => val || undefined),
  owner: z.string()
    .max(100, "Owner name is too long (max 100 characters)")
    .optional()
    .transform(val => val?.trim() || undefined),
  stakeholders: z.array(z.string().trim().min(1))
    .optional()
    .default([])
    .transform(arr => arr?.filter(s => s.length > 0) || []),
});

// Quick Create Work Item Schema (minimal fields for rapid creation)
export const QuickCreateWorkItemFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long (max 200 characters)")
    .trim(),
  type: WorkItemTypeSchema.default("task"),
  parentId: z.string()
    .min(1)
    .optional()
    .transform(val => val || undefined),
});

// Bulk Work Item Creation Schema
export const BulkCreateWorkItemFormSchema = z.object({
  items: z.array(QuickCreateWorkItemFormSchema)
    .min(1, "At least one work item is required")
    .max(50, "Cannot create more than 50 work items at once"),
  defaultType: WorkItemTypeSchema.default("task"),
  defaultStatus: WorkItemStatusSchema.default("backlog"),
  defaultPriority: PrioritySchema.default("medium"),
  parentId: z.string().optional(),
});

// ===========================
// Form Type Definitions
// ===========================

// Inferred form types
export type NewProjectFormData = z.infer<typeof NewProjectFormSchema>;
export type CreateWorkItemFormData = z.infer<typeof FormCreateWorkItemSchema>;
export type EditWorkItemFormData = z.infer<typeof FormEditWorkItemSchema>;
export type EditProjectFormData = z.infer<typeof EditProjectFormSchema>;
export type QuickCreateWorkItemFormData = z.infer<typeof QuickCreateWorkItemFormSchema>;
export type BulkCreateWorkItemFormData = z.infer<typeof BulkCreateWorkItemFormSchema>;

// Form-specific utility types
export type FormEstimatedEffort = z.infer<typeof FormEstimatedEffortSchema>;
export type FormAcceptanceCriteria = z.infer<typeof FormAcceptanceCriteriaSchema>;
export type FormDependency = z.infer<typeof FormDependencySchema>;

// React Hook Form types for field names
export type NewProjectFormFields = keyof NewProjectFormData;
export type CreateWorkItemFormFields = keyof CreateWorkItemFormData;
export type EditWorkItemFormFields = keyof EditWorkItemFormData;
export type EditProjectFormFields = keyof EditProjectFormData;

// Form state types for controlled components
export interface FormFieldError {
  message: string;
  type: string;
}

export interface FormValidationState<T> {
  errors: Partial<Record<keyof T, FormFieldError>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// Helper type for form field registration
export type FormFieldConfig<T> = {
  [K in keyof T]: {
    required?: boolean;
    validate?: (value: T[K]) => string | boolean;
    transform?: (value: T[K]) => T[K];
  };
};