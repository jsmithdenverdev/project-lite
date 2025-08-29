import { Edit3, Save, X } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import ProjectCardEdit from './ProjectCardEdit';
import ProjectStats from './ProjectStats';
import type { ProjectCardProps } from './types';

export default function ProjectCard({
  project,
  metadata,
  isEditing,
  editData,
  onEdit,
  onSave,
  onCancel,
  onUpdateField,
}: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile header with actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {!isEditing && <StatusBadge status={project.status} />}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={isEditing ? onCancel : onEdit}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              type="button"
              title={isEditing ? "Cancel edit" : "Edit project"}
            >
              {isEditing ? (
                <X className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </button>
            
            {isEditing && (
              <button
                onClick={onSave}
                className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
                type="button"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile content */}
        <div className="mb-4">
          {isEditing ? (
            <ProjectCardEdit 
              editData={editData} 
              onUpdateField={onUpdateField}
              onSave={onSave}
            />
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {project.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {project.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:items-start md:justify-between mb-4">
        {isEditing ? (
          <ProjectCardEdit 
            editData={editData} 
            onUpdateField={onUpdateField}
            onSave={onSave}
          />
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {project.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {project.description}
            </p>
          </div>
        )}
        
        <div className="flex items-center space-x-3 ml-4">
          {!isEditing && (
            <StatusBadge status={project.status} />
          )}
          
          <button
            onClick={isEditing ? onCancel : onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
            type="button"
            title={isEditing ? "Cancel edit" : "Edit project"}
          >
            {isEditing ? (
              <X className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
          </button>
          
          {isEditing && (
            <button
              onClick={onSave}
              className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
              type="button"
              title="Save changes"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <ProjectStats
            totalItems={metadata?.totalWorkItems || 0}
            completedItems={metadata?.completedWorkItems || 0}
            estimatedEffort={project.estimatedEffort}
            priority={project.priority}
          />

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}