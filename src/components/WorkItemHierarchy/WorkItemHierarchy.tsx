import { useMemo } from 'react';
import { WorkItemCard } from '../WorkItemCard';
import type { WorkItemHierarchyProps, WorkItemWithChildren } from './types';

export default function WorkItemHierarchy({
  workItems,
  expandedItems,
  editingItems,
  editFormData,
  onToggleExpanded,
  onToggleEdit,
  onSaveItem,
  onDeleteItem,
  onUpdateField,
  onAddTag,
  onRemoveTag,
  onAddAcceptanceCriteria,
  onRemoveAcceptanceCriteria,
  onToggleAcceptanceCriteria,
  onAddChild,
}: WorkItemHierarchyProps) {
  const workItemHierarchy = useMemo((): WorkItemWithChildren[] => {
    if (!workItems || !Array.isArray(workItems)) return [];

    // Filter out invalid items
    const validItems = workItems.filter(
      (item) => item && item.id && item.title
    );
    
    if (validItems.length === 0) return [];

    const itemMap = new Map<string, WorkItemWithChildren>(
      validItems.map((item) => [item.id, { ...item, children: [] }])
    );
    const rootItems: WorkItemWithChildren[] = [];

    validItems.forEach((item) => {
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId);
        const child = itemMap.get(item.id);
        if (parent && child) {
          parent.children.push(child);
        }
      } else {
        const rootItem = itemMap.get(item.id);
        if (rootItem) {
          rootItems.push(rootItem);
        }
      }
    });

    return rootItems;
  }, [workItems]);

  const renderWorkItem = (
    item: WorkItemWithChildren,
    depth: number = 0
  ) => {
    // Defensive checks to prevent crashes
    if (!item || !item.id || !item.title) {
      return <div key="invalid-item" className="text-red-500 text-sm p-2">Invalid work item data</div>;
    }
    
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isEditing = editingItems.has(item.id);

    return (
      <div key={item.id} className="mb-2">
        <WorkItemCard
          item={item}
          depth={depth}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          isEditing={isEditing}
          editData={editFormData[item.id]}
          availableParents={workItems}
          onToggleExpanded={() => onToggleExpanded(item.id)}
          onToggleEdit={() => onToggleEdit(item.id)}
          onSave={() => onSaveItem(item.id)}
          onDelete={() => onDeleteItem(item.id)}
          onUpdateField={(field, value) => onUpdateField(item.id, field, value)}
          onAddTag={(tag) => onAddTag(item.id, tag)}
          onRemoveTag={(tagIndex) => onRemoveTag(item.id, tagIndex)}
          onAddAcceptanceCriteria={(description) => onAddAcceptanceCriteria(item.id, description)}
          onRemoveAcceptanceCriteria={(criteriaIndex) => onRemoveAcceptanceCriteria(item.id, criteriaIndex)}
          onToggleAcceptanceCriteria={(criteriaIndex, completed) => onToggleAcceptanceCriteria(item.id, criteriaIndex, completed)}
          onAddChild={onAddChild ? () => onAddChild(item.id) : undefined}
        />

        {/* Render children recursively */}
        {hasChildren && isExpanded && (
          <div>
            {item.children.map((child) => renderWorkItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {workItemHierarchy.map((item) => renderWorkItem(item))}
    </div>
  );
}