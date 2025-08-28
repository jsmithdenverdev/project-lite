import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/Modal';
import ProjectImportModal from '../components/ProjectImportModal';
import { ProjectCard } from '../components/ProjectCard';
import { WorkItemHierarchy } from '../components/WorkItemHierarchy';
import { CreateWorkItemForm } from '../components/CreateWorkItemForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ProjectSelector } from '../components/ProjectSelector';
import { NewProjectModal } from '../components/NewProjectModal';
import { useProjectContext } from '../context/ProjectContext';
import { useCurrentProject } from '../hooks/useCurrentProject';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

export default function ProjectDashboard() {
  const { state, dispatch } = useProjectContext();
  const { 
    projects, 
    activeProjectId, 
    isLoading: multiProjectLoading,
    saveToMultiProject,
    createAndLoadProject
  } = useCurrentProject();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
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

  const { hasUnsavedChanges, executeWithConfirmation, confirmAction, cancelAction, showConfirmation } = useUnsavedChanges();
  
  // Auto-save project data to IndexedDB when it changes
  useEffect(() => {
    if (projectData && activeProjectId && hasUnsavedChanges) {
      const saveTimeout = setTimeout(async () => {
        try {
          await saveToMultiProject(projectData);
        } catch (error) {
          console.error('Failed to auto-save project:', error);
        }
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(saveTimeout);
    }
  }, [projectData, activeProjectId, hasUnsavedChanges, saveToMultiProject]);
  

  const handleProjectLoaded = (data: import('../schemas').ProjectData, filename: string): void => {
    const loadProject = async () => {
      // For multi-project context, we want to create a new project and switch to it
      try {
        await createAndLoadProject(data, filename);
        dispatch({ type: 'TOGGLE_IMPORT_MODAL' });
      } catch (error) {
        console.error('Failed to load project:', error);
        // Fallback to old behavior
        dispatch({ type: 'SET_PROJECT_DATA', payload: { data, fileName: filename } });
      }
    };
    
    executeWithConfirmation(loadProject);
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
    dispatch({ type: 'ADD_TAG', payload: { itemId, tag } });
  };

  const handleRemoveTag = (itemId: string, tagIndex: number): void => {
    dispatch({ type: 'REMOVE_TAG', payload: { itemId, tagIndex } });
  };

  const handleAddAcceptanceCriteria = (itemId: string, description: string): void => {
    dispatch({ type: 'ADD_ACCEPTANCE_CRITERIA', payload: { itemId, description } });
  };

  const handleRemoveAcceptanceCriteria = (itemId: string, criteriaIndex: number): void => {
    dispatch({ type: 'REMOVE_ACCEPTANCE_CRITERIA', payload: { itemId, criteriaIndex } });
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

  if (!projectData && !multiProjectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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
        
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={() => {
            setShowNewProjectModal(false);
          }}
        />
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to Project Pulse</h1>
            
            {projects.length === 0 ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Get started by creating your first project or importing an existing one.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    type="button"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Project</span>
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    type="button"
                  >
                    Import Project
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Select a project from the header to continue, or create a new one.
                </p>
                <ProjectSelector className="mx-auto mb-4 max-w-xs" />
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  type="button"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Project</span>
                </button>
              </>
            )}
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
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <span>Project Pulse</span>
              {hasUnsavedChanges && (
                <span className="text-orange-500 text-lg" title="You have unsaved changes">
                  ●
                </span>
              )}
            </h1>
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
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
            
            {!activeProjectId && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  type="button"
                >
                  Import Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex md:justify-between md:items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <span>Project Pulse</span>
              {hasUnsavedChanges && (
                <span className="text-orange-500 text-lg" title="You have unsaved changes">
                  ●
                </span>
              )}
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
            
            {!activeProjectId && (
              <button
                onClick={() => dispatch({ type: 'TOGGLE_IMPORT_MODAL' })}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                type="button"
              >
                Import Project
              </button>
            )}
          </div>
        </div>

        {/* Project Metadata */}
        {projectData && (
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
        )}

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
          {isCreatingNewItem && projectData && (
            <CreateWorkItemForm
              newItemData={newItemData}
              availableParents={projectData.workItems || []}
              onUpdateField={handleUpdateNewItemField}
              onSave={handleSaveNewItem}
              onCancel={handleCancelCreateNewItem}
            />
          )}

          {/* Work Items Hierarchy */}
          {projectData && (
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
          )}
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
                    dispatch({ type: 'DELETE_WORK_ITEM', payload: itemToDelete });
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

        {/* Unsaved Changes Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={cancelAction}
          onConfirm={confirmAction}
          title="Unsaved Changes"
          message="You have unsaved changes that will be lost. Are you sure you want to continue?"
          confirmText="Continue"
          cancelText="Cancel"
          variant="warning"
        />

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