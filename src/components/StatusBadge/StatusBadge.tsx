import type { StatusType } from '../../schemas';
import { getStatusColor } from '../../utils/workItemHelpers';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Default to 'backlog' if status is undefined or null
  const displayStatus = status || 'backlog';

  return (
    <span
      className={`rounded-full font-medium ${getStatusColor(displayStatus)} ${sizeClasses[size]}`}
    >
      {displayStatus.replace('_', ' ')}
    </span>
  );
}