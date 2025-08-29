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

// Type aliases for backward compatibility
export type StatusType = WorkItemStatus;
export type PriorityType = Priority;