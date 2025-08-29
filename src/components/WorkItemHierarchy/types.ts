import type { WorkItem, WorkItemStatus } from '../../schemas';

export interface WorkItemWithChildren extends WorkItem {
  children: WorkItemWithChildren[];
}

export interface WorkItemHierarchyProps {
  workItems: WorkItem[];
  expandedItems: Set<string>;
  editingItems: Set<string>;
  editFormData: Record<string, Partial<WorkItem>>;
  statusFilter?: WorkItemStatus | 'all';
  
  // Event handlers
  onToggleExpanded: (itemId: string) => void;
  onToggleEdit: (itemId: string) => void;
  onSaveItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateField: (itemId: string, field: keyof WorkItem, value: WorkItem[keyof WorkItem]) => void;
  onAddTag: (itemId: string, tag: string) => void;
  onRemoveTag: (itemId: string, tagIndex: number) => void;
  onAddAcceptanceCriteria: (itemId: string, description: string) => void;
  onRemoveAcceptanceCriteria: (itemId: string, criteriaIndex: number) => void;
  onToggleAcceptanceCriteria: (itemId: string, criteriaIndex: number, completed: boolean) => void;
  onAddChild?: (parentId: string) => void;
}