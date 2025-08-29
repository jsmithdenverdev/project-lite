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
  Target,
  Minus,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { TypeIcon } from '../TypeIcon';
import { EditWorkItemForm } from '../EditWorkItemForm';
import { AddTagButton } from '../AddTagButton';
import { AddAcceptanceCriteriaButton } from '../AddAcceptanceCriteriaButton';
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
  onAddChild,
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
  
  // Use editData when editing, otherwise use original item
  const displayData = isEditing && _editData ? _editData : item;
  const displayTags = displayData.tags || [];
  const displayAcceptanceCriteria = displayData.acceptanceCriteria || [];

  return (
    <>
      {/* Mobile Layout - Flat with hierarchy indicators */}
      <div className="md:hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 mb-2">
        {/* Mobile hierarchy indicator */}
        {depth > 0 && (
          <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{'└─'.repeat(Math.min(depth, 3))}</span>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
              Level {depth + 1}
            </span>
          </div>
        )}
        
        {/* Mobile header with icons and actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button
                onClick={onToggleExpanded}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                type="button"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <TypeIcon type={item.type} priority={item.priority} />
            <StatusBadge status={item.status} size="sm" />
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && onAddChild && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild();
                }}
                className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
                type="button"
                title="Add child item"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
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

        {/* Mobile content */}
        <div>
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

              {/* Tags with interactive management */}
              <div className="mt-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {displayTags.length > 0 && displayTags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        {tag}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          _onRemoveTag(index);
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        type="button"
                        title="Remove tag"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <AddTagButton onAddTag={_onAddTag} />
              </div>

              {/* Acceptance Criteria with interactive management */}
              <div className="mt-3">
                {displayAcceptanceCriteria.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Acceptance Criteria ({displayAcceptanceCriteria.filter(ac => ac.completed).length}/{displayAcceptanceCriteria.length})
                    </h4>
                    <div className="space-y-2">
                      {displayAcceptanceCriteria.map((ac, index) => (
                        <div key={ac.id || index} className="flex items-start space-x-2 text-xs">
                          <input
                            type="checkbox"
                            checked={ac.completed || false}
                            onChange={(e) => _onToggleAcceptanceCriteria(index, e.target.checked)}
                            className="w-3 h-3 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 focus:ring-2 mt-0.5 flex-shrink-0"
                          />
                          <span
                            className={
                              ac.completed
                                ? "text-green-700 dark:text-green-400 italic line-through"
                                : "text-gray-600 dark:text-gray-300"
                            }
                          >
                            {ac.description}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              _onRemoveAcceptanceCriteria(index);
                            }}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                            type="button"
                            title="Remove acceptance criteria"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <AddAcceptanceCriteriaButton onAddCriteria={_onAddAcceptanceCriteria} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout - With original indentation */}
      <div 
        className="hidden md:flex md:items-start md:justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 mb-2"
        style={{ marginLeft: `${marginLeft}px` }}
      >
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

                {/* Tags with interactive management */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {displayTags.length > 0 && displayTags.map((tag, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                          {tag}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            _onRemoveTag(index);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          type="button"
                          title="Remove tag"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <AddTagButton onAddTag={_onAddTag} />
                </div>

                {/* Acceptance Criteria with interactive management */}
                <div className="mt-3">
                  {displayAcceptanceCriteria.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Acceptance Criteria ({displayAcceptanceCriteria.filter(ac => ac.completed).length}/{displayAcceptanceCriteria.length})
                      </h4>
                      <div className="space-y-2">
                        {displayAcceptanceCriteria.map((ac, index) => (
                          <div key={ac.id || index} className="flex items-start space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={ac.completed || false}
                              onChange={(e) => _onToggleAcceptanceCriteria(index, e.target.checked)}
                              className="w-3 h-3 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 focus:ring-2 mt-0.5 flex-shrink-0"
                            />
                            <span
                              className={
                                ac.completed
                                  ? "text-green-700 dark:text-green-400 italic line-through"
                                  : "text-gray-600 dark:text-gray-300"
                              }
                            >
                              {ac.description}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                _onRemoveAcceptanceCriteria(index);
                              }}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                              type="button"
                              title="Remove acceptance criteria"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <AddAcceptanceCriteriaButton onAddCriteria={_onAddAcceptanceCriteria} />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!isEditing && onAddChild && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild();
              }}
              className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
              type="button"
              title="Add child item"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
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
    </>
  );
}