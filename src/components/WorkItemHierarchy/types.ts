import type { WorkItem, WorkItemWithChildren } from '../../schemas';


export interface WorkItemHierarchyProps {
  workItems: WorkItemWithChildren[];
  expandedItems: Set<string>;
  editingItems: Set<string>;
  editFormData: Record<string, Partial<WorkItem>>;
  availableParents?: WorkItem[];
  
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