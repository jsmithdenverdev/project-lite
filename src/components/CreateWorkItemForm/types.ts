import type { 
  WorkItem, 
  CreateWorkItemFormData
} from '../../schemas';
import type { CreateWorkItemFormProps as BaseCreateWorkItemFormProps } from '../../types/forms';

// Legacy props interface (for backward compatibility)
export interface CreateWorkItemFormProps {
  newItemData: Partial<WorkItem>;
  availableParents: WorkItem[];
  onUpdateField: (field: keyof WorkItem, value: WorkItem[keyof WorkItem]) => void;
  onSave: () => void;
  onCancel: () => void;
  hideParentSelector?: boolean;
}

// Enhanced props interface with react-hook-form integration
export interface CreateWorkItemFormWithHookProps extends BaseCreateWorkItemFormProps {
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Props for the hook-enabled form component
export interface HookedCreateWorkItemFormProps {
  onSubmit: (data: CreateWorkItemFormData) => void | Promise<void>;
  onCancel?: () => void;
  availableParents?: Array<{ id: string; title: string; type: string }>;
  defaultValues?: Partial<CreateWorkItemFormData>;
  hideParentSelector?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}