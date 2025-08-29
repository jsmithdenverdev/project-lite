import type { 
  WorkItem, 
  EditWorkItemFormData
} from '../../schemas';
import type { EditWorkItemFormProps as BaseEditWorkItemFormProps } from '../../types/forms';

// Legacy props interface (for backward compatibility)
export interface EditWorkItemFormProps {
  editData: Partial<WorkItem>;
  availableParents: WorkItem[];
  onUpdateField: (field: keyof WorkItem, value: WorkItem[keyof WorkItem]) => void;
  onSave?: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

// Enhanced props interface with react-hook-form integration
export interface EditWorkItemFormWithHookProps extends BaseEditWorkItemFormProps {
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Props for the hook-enabled form component
export interface HookedEditWorkItemFormProps {
  workItemId: string;
  onSubmit: (data: EditWorkItemFormData) => void | Promise<void>;
  onCancel?: () => void;
  onDelete?: () => void | Promise<void>;
  availableParents?: Array<{ id: string; title: string; type: string }>;
  defaultValues?: Partial<EditWorkItemFormData>;
  disabled?: boolean;
  loading?: boolean;
  showDeleteButton?: boolean;
  className?: string;
}