import type { WorkItem } from '../../schemas';

export interface EditWorkItemFormProps {
  editData: Partial<WorkItem>;
  availableParents: WorkItem[];
  onUpdateField: (field: keyof WorkItem, value: WorkItem[keyof WorkItem]) => void;
}