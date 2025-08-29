import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { WorkItemHierarchy } from '../components/WorkItemHierarchy';
import { CreateWorkItemForm } from '../components/CreateWorkItemForm';
import { ProjectSelector } from '../components/ProjectSelector';
import { NewProjectModal } from '../components/NewProjectModal';
import { InitialProjectModal } from '../components/InitialProjectModal';
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

  const handleDeleteItem = async (itemId: string) => {
    if (!currentProjectData) return;

    const updatedWorkItems = currentProjectData.workItems.filter(item => item.id !== itemId);

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

  const handleUpdateField = (itemId: string, field: keyof WorkItem, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handleAddTag = (itemId: string, tag: string) => {
    const currentTags = editFormData[itemId]?.tags || [];
    if (!currentTags.includes(tag)) {
      handleUpdateField(itemId, 'tags', [...currentTags, tag]);
    }
  };

  const handleRemoveTag = (itemId: string, tagIndex: number) => {
    const currentTags = editFormData[itemId]?.tags || [];
    handleUpdateField(itemId, 'tags', currentTags.filter((_, i) => i !== tagIndex));
  };

  const handleAddAcceptanceCriteria = (itemId: string) => {
    const currentCriteria = editFormData[itemId]?.acceptanceCriteria || [];
    handleUpdateField(itemId, 'acceptanceCriteria', [
      ...currentCriteria,
      { id: crypto.randomUUID(), text: '', completed: false }
    ]);
  };

  const handleRemoveAcceptanceCriteria = (itemId: string, criteriaIndex: number) => {
    const currentCriteria = editFormData[itemId]?.acceptanceCriteria || [];
    handleUpdateField(itemId, 'acceptanceCriteria', 
      currentCriteria.filter((_, i) => i !== criteriaIndex)
    );
  };

  const handleToggleAcceptanceCriteria = (itemId: string, criteriaIndex: number) => {
    const currentCriteria = editFormData[itemId]?.acceptanceCriteria || [];
    const updatedCriteria = currentCriteria.map((criteria, i) =>
      i === criteriaIndex ? { ...criteria, completed: !criteria.completed } : criteria
    );
    handleUpdateField(itemId, 'acceptanceCriteria', updatedCriteria);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Project Pulse</h1>
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
            <h1 className="text-3xl font-bold mb-4">Project Pulse</h1>
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
              Project Pulse
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
              Project Pulse
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
      </div>
    </div>
  );
}