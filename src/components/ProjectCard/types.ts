import type { ProjectData, PriorityType, EstimatedEffort } from '../../schemas';

export interface ProjectCardProps {
  project: ProjectData['project'];
  metadata?: ProjectData['metadata'];
  isEditing: boolean;
  editData: Partial<ProjectData['project']>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdateField: (field: keyof ProjectData['project'], value: any) => void;
}

export interface ProjectCardEditProps {
  editData: Partial<ProjectData['project']>;
  onUpdateField: (field: keyof ProjectData['project'], value: any) => void;
}

export interface ProjectStatsProps {
  totalItems: number;
  completedItems: number;
  estimatedEffort?: EstimatedEffort;
  priority: PriorityType;
}