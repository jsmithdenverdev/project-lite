import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { WorkItemHierarchy } from '../components/WorkItemHierarchy';
import { CreateWorkItemForm } from '../components/CreateWorkItemForm';
import { ProjectSelector } from '../components/ProjectSelector';
import { NewProjectModal } from '../components/NewProjectModal';
import { InitialProjectModal } from '../components/InitialProjectModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useMultiProject } from '../context/MultiProjectContext';
import type { WorkItem, WorkItemStatus, Priority } from '../schemas';

export default function ProjectDashboard() {
  const { 
    state: multiProjectState, 
    actions: multiProjectActions 
  } = useMultiProject();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);
  const [newItemData, setNewItemData] = useState<Partial<WorkItem>>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [editFormData, setEditFormData] = useState<Record<string, Partial<WorkItem>>>({});
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [childrenToDelete, setChildrenToDelete] = useState<WorkItem[]>([]);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [parentForChild, setParentForChild] = useState<string | null>(null);

  const {
    activeProjectId,
    currentProjectData,
    isLoading
  } = multiProjectState;

  // Show initial modal when there's no active project and loading is complete
  useEffect(() => {
    if (!isLoading && !activeProjectId && !currentProjectData && !showNewProjectModal) {
      setShowInitialModal(true);
    } else {
      setShowInitialModal(false);
    }
  }, [isLoading, activeProjectId, currentProjectData, showNewProjectModal]);

  // Auto-save project data to IndexedDB when it changes
  useEffect(() => {
    if (currentProjectData && activeProjectId) {
      const saveTimeout = setTimeout(async () => {
        try {
          await multiProjectActions.updateCurrentProject(currentProjectData);
        } catch (error) {
          console.error('Failed to auto-save project:', error);
        }
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(saveTimeout);
    }
  }, [currentProjectData, activeProjectId, multiProjectActions]);

  // Work Item Handlers
  const handleCreateNewItem = () => {
    setNewItemData({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      type: 'story',
      status: 'backlog' as WorkItemStatus,
      priority: 'medium' as Priority,
      tags: [],
      acceptanceCriteria: []
    });
    setIsCreatingNewItem(true);
  };

  const handleSaveNewItem = async () => {
    if (!currentProjectData || !newItemData.title?.trim()) return;

    const newItem: WorkItem = {
      id: newItemData.id || crypto.randomUUID(),
      title: newItemData.title.trim(),
      description: newItemData.description || '',
      type: newItemData.type || 'story',
      status: newItemData.status || 'backlog',
      priority: newItemData.priority || 'medium',
      tags: newItemData.tags || [],
      acceptanceCriteria: newItemData.acceptanceCriteria || [],
      parentId: newItemData.parentId,
      estimatedEffort: newItemData.estimatedEffort,
      dependencies: newItemData.dependencies || [],
      customFields: newItemData.customFields || {}
    };

    const updatedProjectData = {
      ...currentProjectData,
      workItems: [...currentProjectData.workItems, newItem],
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString(),
        totalWorkItems: currentProjectData.workItems.length + 1
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
    setIsCreatingNewItem(false);
    setNewItemData({});
  };

  const handleCancelCreateNewItem = () => {
    setIsCreatingNewItem(false);
    setNewItemData({});
  };

  const handleUpdateNewItemField = (field: keyof WorkItem, value: any) => {
    setNewItemData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleToggleEdit = (itemId: string) => {
    if (editingItems.has(itemId)) {
      setEditingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } else {
      const item = currentProjectData?.workItems.find(i => i.id === itemId);
      if (item) {
        setEditFormData(prev => ({ ...prev, [itemId]: { ...item } }));
        setEditingItems(prev => new Set(prev).add(itemId));
      }
    }
  };

  const handleSaveItem = async (itemId: string) => {
    if (!currentProjectData) return;

    const editedItem = editFormData[itemId];
    if (!editedItem) return;

    const updatedWorkItems = currentProjectData.workItems.map(item =>
      item.id === itemId ? { ...item, ...editedItem } : item
    );

    const updatedProjectData = {
      ...currentProjectData,
      workItems: updatedWorkItems,
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
    handleToggleEdit(itemId);
  };

  // Helper function to find all descendants of a work item
  const findAllChildren = (parentId: string, workItems: WorkItem[]): WorkItem[] => {
    const children: WorkItem[] = [];
    const directChildren = workItems.filter(item => item.parentId === parentId);
    
    for (const child of directChildren) {
      children.push(child);
      // Recursively find children of this child
      children.push(...findAllChildren(child.id, workItems));
    }
    
    return children;
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!currentProjectData) return;

    const children = findAllChildren(itemId, currentProjectData.workItems);
    
    if (children.length > 0) {
      // Show confirmation modal for cascading delete
      setItemToDelete(itemId);
      setChildrenToDelete(children);
      setShowDeleteConfirm(true);
    } else {
      // Direct delete for items without children
      await performDelete(itemId);
    }
  };

  const performDelete = async (itemId: string) => {
    if (!currentProjectData) return;

    const children = findAllChildren(itemId, currentProjectData.workItems);
    const idsToDelete = new Set([itemId, ...children.map(child => child.id)]);
    
    const updatedWorkItems = currentProjectData.workItems.filter(item => !idsToDelete.has(item.id));

    const updatedProjectData = {
      ...currentProjectData,
      workItems: updatedWorkItems,
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString(),
        totalWorkItems: updatedWorkItems.length
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
  };

  const confirmCascadingDelete = async () => {
    if (itemToDelete) {
      await performDelete(itemToDelete);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setChildrenToDelete([]);
    }
  };

  const handleAddChild = (parentId: string) => {
    setParentForChild(parentId);
    setNewItemData({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      type: 'story',
      status: 'backlog' as WorkItemStatus,
      priority: 'medium' as Priority,
      tags: [],
      acceptanceCriteria: [],
      parentId: parentId
    });
    setIsCreatingChild(true);
    setIsCreatingNewItem(false); // Make sure regular create form is closed
  };

  const handleSaveChildItem = async () => {
    if (!currentProjectData || !newItemData.title?.trim()) return;

    const newItem: WorkItem = {
      id: newItemData.id || crypto.randomUUID(),
      title: newItemData.title.trim(),
      description: newItemData.description || '',
      type: newItemData.type || 'story',
      status: newItemData.status || 'backlog',
      priority: newItemData.priority || 'medium',
      tags: newItemData.tags || [],
      acceptanceCriteria: newItemData.acceptanceCriteria || [],
      parentId: newItemData.parentId,
      estimatedEffort: newItemData.estimatedEffort,
      dependencies: newItemData.dependencies || [],
      customFields: newItemData.customFields || {}
    };

    const updatedProjectData = {
      ...currentProjectData,
      workItems: [...currentProjectData.workItems, newItem],
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString(),
        totalWorkItems: currentProjectData.workItems.length + 1
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
    
    // Auto-expand the parent to show the new child
    if (newItem.parentId) {
      setExpandedItems(prev => new Set(prev).add(newItem.parentId!));
    }
    
    setIsCreatingChild(false);
    setParentForChild(null);
    setNewItemData({});
  };

  const handleCancelChildCreation = () => {
    setIsCreatingChild(false);
    setParentForChild(null);
    setNewItemData({});
  };

  const handleUpdateField = (itemId: string, field: keyof WorkItem, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handleAddTag = async (itemId: string, tag: string) => {
    if (!currentProjectData) return;

    const updatedWorkItems = currentProjectData.workItems.map(item => {
      if (item.id === itemId) {
        const currentTags = item.tags || [];
        if (!currentTags.includes(tag)) {
          return {
            ...item,
            tags: [...currentTags, tag]
          };
        }
      }
      return item;
    });

    const updatedProjectData = {
      ...currentProjectData,
      workItems: updatedWorkItems,
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
  };

  const handleRemoveTag = async (itemId: string, tagIndex: number) => {
    if (!currentProjectData) return;

    const updatedWorkItems = currentProjectData.workItems.map(item => {
      if (item.id === itemId) {
        const currentTags = item.tags || [];
        return {
          ...item,
          tags: currentTags.filter((_, i) => i !== tagIndex)
        };
      }
      return item;
    });

    const updatedProjectData = {
      ...currentProjectData,
      workItems: updatedWorkItems,
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
  };

  const handleAddAcceptanceCriteria = async (itemId: string, description: string) => {
    if (!currentProjectData) return;

    const updatedWorkItems = currentProjectData.workItems.map(item => {
      if (item.id === itemId) {
        const currentCriteria = item.acceptanceCriteria || [];
        return {
          ...item,
          acceptanceCriteria: [
            ...currentCriteria,
            { id: crypto.randomUUID(), description: description, completed: false }
          ]
        };
      }
      return item;
    });

    const updatedProjectData = {
      ...currentProjectData,
      workItems: updatedWorkItems,
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
  };

  const handleRemoveAcceptanceCriteria = async (itemId: string, criteriaIndex: number) => {
    if (!currentProjectData) return;

    const updatedWorkItems = currentProjectData.workItems.map(item => {
      if (item.id === itemId) {
        const currentCriteria = item.acceptanceCriteria || [];
        return {
          ...item,
          acceptanceCriteria: currentCriteria.filter((_, i) => i !== criteriaIndex)
        };
      }
      return item;
    });

    const updatedProjectData = {
      ...currentProjectData,
      workItems: updatedWorkItems,
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
  };

  const handleToggleAcceptanceCriteria = async (itemId: string, criteriaIndex: number, completed: boolean) => {
    if (!currentProjectData) return;

    const updatedWorkItems = currentProjectData.workItems.map(item => {
      if (item.id === itemId) {
        const currentCriteria = item.acceptanceCriteria || [];
        const updatedCriteria = currentCriteria.map((criteria, i) =>
          i === criteriaIndex ? { ...criteria, completed: completed } : criteria
        );
        return {
          ...item,
          acceptanceCriteria: updatedCriteria
        };
      }
      return item;
    });

    const updatedProjectData = {
      ...currentProjectData,
      workItems: updatedWorkItems,
      metadata: {
        ...currentProjectData.metadata,
        lastUpdated: new Date().toISOString()
      }
    };

    await multiProjectActions.updateCurrentProject(updatedProjectData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Project Lite</h1>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty state - show initial modal
  if (!currentProjectData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <InitialProjectModal
          isOpen={showInitialModal}
          onClose={() => setShowInitialModal(false)}
        />
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Project Lite</h1>
            <p className="text-gray-600 dark:text-gray-400">Ready to start</p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with active project
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Project Lite
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <ProjectSelector className="flex-1" />
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              type="button"
              title="New Project"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex md:justify-between md:items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Project Lite
            </h1>
            <ProjectSelector />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Project Metadata */}
        <div className="mb-6">
          <ProjectCard
            project={currentProjectData.project}
            metadata={{
              ...currentProjectData.metadata,
              totalWorkItems: currentProjectData.workItems.length,
              completedWorkItems: currentProjectData.workItems.filter(item => item.status === 'done').length,
            }}
            isEditing={isEditingProject}
            editData={currentProjectData.project}
            onEdit={() => setIsEditingProject(true)}
            onSave={async () => {
              await multiProjectActions.updateCurrentProject(currentProjectData);
              setIsEditingProject(false);
            }}
            onCancel={() => setIsEditingProject(false)}
            onUpdateField={(field: string, value: any) => {
              // Update project field logic would go here
              console.log('Project field update:', field, value);
            }}
          />
        </div>

        {/* Work Items Section */}
        <div className="space-y-6">
          {/* Add Work Item Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Work Items</h2>
            <button
              onClick={handleCreateNewItem}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>Add Work Item</span>
            </button>
          </div>

          {/* Create New Item Form */}
          {isCreatingNewItem && (
            <CreateWorkItemForm
              newItemData={newItemData}
              availableParents={currentProjectData.workItems}
              onUpdateField={handleUpdateNewItemField}
              onSave={handleSaveNewItem}
              onCancel={handleCancelCreateNewItem}
            />
          )}

          {/* Create Child Item Form */}
          {isCreatingChild && parentForChild && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  Add Child Item
                </h3>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  to "{currentProjectData.workItems.find(item => item.id === parentForChild)?.title}"
                </span>
              </div>
              <CreateWorkItemForm
                newItemData={newItemData}
                availableParents={currentProjectData.workItems}
                onUpdateField={handleUpdateNewItemField}
                onSave={handleSaveChildItem}
                onCancel={handleCancelChildCreation}
                hideParentSelector={true}
              />
            </div>
          )}

          {/* Work Items Hierarchy */}
          <WorkItemHierarchy
            workItems={currentProjectData.workItems}
            expandedItems={expandedItems}
            editingItems={editingItems}
            editFormData={editFormData}
            onToggleExpanded={handleToggleExpanded}
            onToggleEdit={handleToggleEdit}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onUpdateField={handleUpdateField}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onAddAcceptanceCriteria={handleAddAcceptanceCriteria}
            onRemoveAcceptanceCriteria={handleRemoveAcceptanceCriteria}
            onToggleAcceptanceCriteria={handleToggleAcceptanceCriteria}
            onAddChild={handleAddChild}
          />
        </div>

        {/* New Project Modal */}
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={() => {
            setShowNewProjectModal(false);
          }}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmCascadingDelete}
          title="Delete Work Item"
          message={
            itemToDelete && currentProjectData ? (
              <>
                <p>
                  Are you sure you want to delete <strong>"{currentProjectData.workItems.find(item => item.id === itemToDelete)?.title}"</strong>?
                </p>
                {childrenToDelete.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 mt-2">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      ⚠️ This will also delete {childrenToDelete.length} child item{childrenToDelete.length !== 1 ? 's' : ''}:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 ml-4 list-disc max-h-32 overflow-y-auto">
                      {childrenToDelete.map(child => (
                        <li key={child.id}>{child.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This action cannot be undone.
                </p>
              </>
            ) : 'Are you sure you want to delete this work item?'
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}