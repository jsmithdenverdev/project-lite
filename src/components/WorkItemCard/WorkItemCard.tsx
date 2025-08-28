import { 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  Target 
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { TypeIcon } from '../TypeIcon';
import { EditWorkItemForm } from '../EditWorkItemForm';
import type { WorkItemCardProps } from './types';

export default function WorkItemCard({
  item,
  depth,
  hasChildren,
  isExpanded,
  isEditing,
  editData: _editData,
  availableParents: _availableParents = [],
  onToggleExpanded,
  onToggleEdit,
  onSave,
  onDelete,
  onUpdateField: _onUpdateField,
  onAddTag: _onAddTag,
  onRemoveTag: _onRemoveTag,
  onAddAcceptanceCriteria: _onAddAcceptanceCriteria,
  onRemoveAcceptanceCriteria: _onRemoveAcceptanceCriteria,
  onToggleAcceptanceCriteria: _onToggleAcceptanceCriteria,
}: WorkItemCardProps) {
  // Defensive checks to prevent crashes
  if (!item || !item.id || !item.title) {
    return (
      <div key="invalid-item" className="text-red-500 text-sm p-2">
        Invalid work item data
      </div>
    );
  }
  
  const marginLeft = depth * 24;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {hasChildren && (
            <button
              onClick={onToggleExpanded}
              className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="flex items-center space-x-2 mt-1">
            <TypeIcon type={item.type} priority={item.priority} />
            <StatusBadge status={item.status} size="sm" />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <EditWorkItemForm
                editData={_editData || item}
                availableParents={_availableParents}
                onUpdateField={_onUpdateField}
              />
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {item.assignee && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{item.assignee}</span>
                    </div>
                  )}

                  {item.estimatedEffort && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {item.estimatedEffort.value} {item.estimatedEffort.unit}
                      </span>
                    </div>
                  )}

                  {item.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {item.priority && (
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span className="capitalize">{item.priority}</span>
                    </div>
                  )}
                </div>

                {/* Tags - simplified for now */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Acceptance Criteria - simplified for now */}
                {item.acceptanceCriteria && item.acceptanceCriteria.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Acceptance Criteria ({item.acceptanceCriteria.filter(ac => ac.completed).length}/{item.acceptanceCriteria.length})
                    </h4>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onToggleEdit}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
            type="button"
            title={isEditing ? "Cancel edit" : "Edit item"}
          >
            {isEditing ? (
              <X className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
          </button>
          {isEditing && (
            <>
              <button
                onClick={onDelete}
                className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                type="button"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onSave}
                className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
                type="button"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}