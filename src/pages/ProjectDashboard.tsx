import { Modal } from '../components/Modal';
import ProjectImportModal from '../components/ProjectImportModal';
import { ProjectCard } from '../components/ProjectCard';
import { WorkItemHierarchy } from '../components/WorkItemHierarchy';
import { CreateWorkItemForm } from '../components/CreateWorkItemForm';
import { useProjectContext } from '../context/ProjectContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ProjectDashboard() {
  const { state, dispatch } = useProjectContext();
  const {
    projectData,
    fileName,
    isLoadedFromCache,
    expandedItems,
    editingItems,
    editFormData,
    isCreatingNewItem,
    newItemData,
    itemToDelete,
    showDeleteConfirm,
    showImportModal,
    isEditingProject,
    editProjectData,
  } = state;

  const { clearStorage } = useLocalStorage();
  

  const handleProjectLoaded = (data: import('../schemas').ProjectData, filename: string): void => {
    dispatch({ type: 'SET_PROJECT_DATA', payload: { data, fileName: filename } });
  };

  const handleUnload = (): void => {
    if (projectData) {
      // Download the file first
      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "project-data.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Clear localStorage to allow loading different project
      clearStorage();
      
      // Reset state and show import modal
      dispatch({ type: 'CLEAR_PROJECT_DATA' });
    }
  };

  const handleToggleExpanded = (itemId: string): void => {
    dispatch({ type: 'TOGGLE_EXPANDED', payload: itemId });
  };

  const handleToggleEdit = (itemId: string): void => {
    const isCurrentlyEditing = editingItems.has(itemId);
    dispatch({ type: 'SET_EDITING', payload: { itemId, editing: !isCurrentlyEditing } });
  };

  const handleUpdateField = (itemId: string, field: keyof import('../schemas').WorkItem, value: import('../schemas').WorkItem[keyof import('../schemas').WorkItem]): void => {
    dispatch({ type: 'UPDATE_EDIT_FORM', payload: { itemId, field, value } });
  };

  const handleSaveItem = (itemId: string): void => {
    dispatch({ type: 'SAVE_EDIT_ITEM', payload: itemId });
  };

  const handleDeleteItem = (itemId: string): void => {
    dispatch({ type: 'SET_DELETE_ITEM', payload: itemId });
    dispatch({ type: 'TOGGLE_DELETE_CONFIRM' });
  };

  const handleAddTag = (itemId: string, tag: string): void => {
    // TODO: Implement add tag logic
    console.log('Add tag:', itemId, tag);
  };

  const handleRemoveTag = (itemId: string, tagIndex: number): void => {
    // TODO: Implement remove tag logic
    console.log('Remove tag:', itemId, tagIndex);
  };

  const handleAddAcceptanceCriteria = (itemId: string, description: string): void => {
    // TODO: Implement add acceptance criteria logic
    console.log('Add acceptance criteria:', itemId, description);
  };

  const handleRemoveAcceptanceCriteria = (itemId: string, criteriaIndex: number): void => {
    // TODO: Implement remove acceptance criteria logic
    console.log('Remove acceptance criteria:', itemId, criteriaIndex);
  };

  const handleToggleAcceptanceCriteria = (itemId: string, criteriaIndex: number, completed: boolean): void => {
    if (!projectData) return;

    const updatedWorkItems = projectData.workItems.map((item) => {
      if (item.id === itemId && item.acceptanceCriteria) {
        const updatedCriteria = [...item.acceptanceCriteria];
        updatedCriteria[criteriaIndex] = {
          ...updatedCriteria[criteriaIndex],
          completed,
        };
        return { ...item, acceptanceCriteria: updatedCriteria };
      }
      return item;
    });

    dispatch({ type: 'SET_PROJECT_DATA', payload: {
      data: {
        ...projectData,
        workItems: updatedWorkItems,
      },
      fileName
    }});
  };

  const handleStartCreateNewItem = (): void => {
    dispatch({ type: 'SET_CREATING_ITEM', payload: true });
  };

  const handleCancelCreateNewItem = (): void => {
    dispatch({ type: 'SET_CREATING_ITEM', payload: false });
  };

  const handleSaveNewItem = (): void => {
    dispatch({ type: 'ADD_NEW_ITEM' });
  };

  const handleUpdateNewItemField = (field: keyof import('../schemas').WorkItem, value: import('../schemas').WorkItem[keyof import('../schemas').WorkItem]): void => {
    dispatch({ type: 'UPDATE_NEW_ITEM', payload: { field, value } });
  };

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Modal
          isOpen={showImportModal}
          onClose={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
          title="Welcome to Project Pulse"
          size="lg"
        >
          <ProjectImportModal 
            isOpen={showImportModal}
            onProjectLoaded={handleProjectLoaded}
            onClose={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
          />
        </Modal>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Pulse</h1>
            <p className="text-gray-600 dark:text-gray-400">Load a project to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Cached data notification */}
      {isLoadedFromCache && (
        <div className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Loaded cached project: {fileName}</span>
            <button
              onClick={() => dispatch({ type: 'SET_CACHE_LOADED', payload: false })}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Project Pulse
            </h1>
            {fileName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {fileName}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              type="button"
            >
              Load Project
            </button>
            <button
              onClick={handleUnload}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              type="button"
            >
              Save & Unload Project
            </button>
          </div>
        </div>

        {/* Project Metadata */}
        <div className="mb-6">
          <ProjectCard
            project={projectData.project}
            metadata={{
              ...projectData.metadata,
              totalWorkItems: projectData.workItems.length,
              completedWorkItems: projectData.workItems.filter(item => item.status === 'done').length,
            }}
            isEditing={isEditingProject}
            editData={editProjectData}
            onEdit={() => dispatch({ type: 'SET_PROJECT_EDITING', payload: true })}
            onSave={() => {
              dispatch({ type: 'SAVE_PROJECT_CHANGES' });
            }}
            onCancel={() => dispatch({ type: 'SET_PROJECT_EDITING', payload: false })}
            onUpdateField={(field, value) => dispatch({ type: 'UPDATE_PROJECT_EDIT', payload: { field, value } })}
          />
        </div>

        {/* Work Items Section */}
        <div className="space-y-6">
          {/* Add Work Item Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Work Items
            </h3>
            <button
              onClick={handleStartCreateNewItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              type="button"
            >
              <span>Add Work Item</span>
            </button>
          </div>

          {/* Create New Item Form */}
          {isCreatingNewItem && (
            <CreateWorkItemForm
              newItemData={newItemData}
              availableParents={projectData.workItems || []}
              onUpdateField={handleUpdateNewItemField}
              onSave={handleSaveNewItem}
              onCancel={handleCancelCreateNewItem}
            />
          )}

          {/* Work Items Hierarchy */}
          <WorkItemHierarchy
            workItems={projectData.workItems || []}
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

        {/* Modals */}
        <Modal
          isOpen={showImportModal}
          onClose={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
          title="Import Project"
          size="lg"
        >
          <ProjectImportModal 
            isOpen={showImportModal}
            onProjectLoaded={handleProjectLoaded}
            onClose={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => dispatch({ type: 'TOGGLE_DELETE_CONFIRM' })}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this work item? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_DELETE_CONFIRM' })}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (itemToDelete) {
                    // TODO: Implement actual delete logic
                    console.log('Delete item:', itemToDelete);
                    dispatch({ type: 'SET_DELETE_ITEM', payload: null });
                    dispatch({ type: 'TOGGLE_DELETE_CONFIRM' });
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}