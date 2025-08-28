import type { WorkItem } from '../../schemas';

export interface WorkItemCardProps {
  item: WorkItem;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  editData?: Partial<WorkItem>;
  availableParents?: WorkItem[];
  
  // Event handlers
  onToggleExpanded: () => void;
  onToggleEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdateField: (field: keyof WorkItem, value: WorkItem[keyof WorkItem]) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tagIndex: number) => void;
  onAddAcceptanceCriteria: (description: string) => void;
  onRemoveAcceptanceCriteria: (criteriaIndex: number) => void;
  onToggleAcceptanceCriteria: (criteriaIndex: number, completed: boolean) => void;
}

export interface WorkItemDisplayProps {
  item: WorkItem;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tagIndex: number) => void;
  onAddAcceptanceCriteria: (description: string) => void;
  onRemoveAcceptanceCriteria: (criteriaIndex: number) => void;
  onToggleAcceptanceCriteria: (criteriaIndex: number, completed: boolean) => void;
}

export interface WorkItemEditProps {
  editData: Partial<WorkItem>;
  availableParents: WorkItem[];
  onUpdateField: (field: keyof WorkItem, value: WorkItem[keyof WorkItem]) => void;
}