import type { WorkItem } from '../../schemas';

export interface CreateWorkItemFormProps {
  newItemData: Partial<WorkItem>;
  availableParents: WorkItem[];
  onUpdateField: (field: keyof WorkItem, value: WorkItem[keyof WorkItem]) => void;
  onSave: () => void;
  onCancel: () => void;
  hideParentSelector?: boolean;
}