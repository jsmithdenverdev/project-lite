import {
  Folder,
  Target,
  FileText,
  List,
  AlertCircle,
  Zap,
  Circle,
} from 'lucide-react';
import type { WorkItemType, PriorityType } from '../../schemas';
import { getPriorityColor } from '../../utils/workItemHelpers';

interface TypeIconProps {
  type: WorkItemType;
  priority?: PriorityType;
  size?: 'sm' | 'md' | 'lg';
}

const iconComponents = {
  epic: Folder,
  feature: Target,
  story: FileText,
  task: List,
  bug: AlertCircle,
  spike: Zap,
  research: Circle,
};

export default function TypeIcon({ type, priority, size = 'md' }: TypeIconProps) {
  const IconComponent = iconComponents[type] || Circle;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const className = `${sizeClasses[size]} ${priority ? getPriorityColor(priority) : 'text-gray-500 dark:text-gray-400'}`;

  return <IconComponent className={className} />;
}