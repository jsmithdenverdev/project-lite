import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ProjectData, WorkItem } from '../schemas';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';

// State Interface
export interface ProjectState {
  // Project data
  projectData: ProjectData | null;
  fileName: string;
  isLoadedFromCache: boolean;

  // Work Items UI state
  expandedItems: Set<string>;
  editingItems: Set<string>;
  editFormData: Record<string, Partial<WorkItem>>;

  // Project editing
  isEditingProject: boolean;
  editProjectData: Partial<ProjectData['project']>;

  // New item creation
  isCreatingNewItem: boolean;
  newItemData: Partial<WorkItem>;

  // Modals
  showImportModal: boolean;
  showSwitchProjectConfirm: boolean;
  showDeleteConfirm: boolean;
  itemToDelete: string | null;
}

// Action Types
export type ProjectAction =
  // Project actions
  | { type: 'SET_PROJECT_DATA'; payload: { data: ProjectData; fileName: string } }
  | { type: 'CLEAR_PROJECT_DATA' }
  | { type: 'SET_CACHE_LOADED'; payload: boolean }
  
  // Work item UI actions
  | { type: 'TOGGLE_EXPANDED'; payload: string }
  | { type: 'SET_EDITING'; payload: { itemId: string; editing: boolean } }
  | { type: 'UPDATE_EDIT_FORM'; payload: { itemId: string; field: keyof WorkItem; value: any } }
  | { type: 'CLEAR_EDIT_FORM'; payload: string }
  | { type: 'SAVE_EDIT_ITEM'; payload: string }
  | { type: 'ADD_TAG'; payload: { itemId: string; tag: string } }
  | { type: 'REMOVE_TAG'; payload: { itemId: string; tagIndex: number } }
  | { type: 'ADD_ACCEPTANCE_CRITERIA'; payload: { itemId: string; description: string } }
  | { type: 'REMOVE_ACCEPTANCE_CRITERIA'; payload: { itemId: string; criteriaIndex: number } }
  | { type: 'DELETE_WORK_ITEM'; payload: string }
  
  // Project editing actions
  | { type: 'SET_PROJECT_EDITING'; payload: boolean }
  | { type: 'UPDATE_PROJECT_EDIT'; payload: { field: keyof ProjectData['project']; value: any } }
  | { type: 'SAVE_PROJECT_CHANGES' }
  
  // New item actions
  | { type: 'SET_CREATING_ITEM'; payload: boolean }
  | { type: 'UPDATE_NEW_ITEM'; payload: { field: keyof WorkItem; value: any } }
  | { type: 'ADD_NEW_ITEM' }
  
  // Modal actions
  | { type: 'SET_MODAL'; payload: { modal: keyof Pick<ProjectState, 'showImportModal' | 'showSwitchProjectConfirm' | 'showDeleteConfirm'>; show: boolean } }
  | { type: 'TOGGLE_IMPORT_MODAL' }
  | { type: 'TOGGLE_DELETE_CONFIRM' }
  | { type: 'SET_DELETE_ITEM'; payload: string | null };

// Initial State
const initialState: ProjectState = {
  projectData: null,
  fileName: '',
  isLoadedFromCache: false,
  
  expandedItems: new Set(),
  editingItems: new Set(),
  editFormData: {},
  
  isEditingProject: false,
  editProjectData: {},
  
  isCreatingNewItem: false,
  newItemData: {},
  
  showImportModal: true,
  showSwitchProjectConfirm: false,
  showDeleteConfirm: false,
  itemToDelete: null,
};

// Reducer
export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT_DATA':
      return {
        ...state,
        projectData: action.payload.data,
        fileName: action.payload.fileName,
        // Auto-expand epics on load
        expandedItems: new Set(
          action.payload.data.workItems
            ?.filter(item => item.type === 'epic')
            .map(item => item.id) || []
        ),
      };

    case 'CLEAR_PROJECT_DATA':
      return {
        ...initialState,
        showImportModal: true,
      };

    case 'SET_CACHE_LOADED':
      return { ...state, isLoadedFromCache: action.payload };

    case 'TOGGLE_EXPANDED': {
      const newExpanded = new Set(state.expandedItems);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedItems: newExpanded };
    }

    case 'SET_EDITING': {
      const newEditingItems = new Set(state.editingItems);
      const { itemId, editing } = action.payload;
      
      if (editing) {
        newEditingItems.add(itemId);
        // Initialize edit form data
        const item = state.projectData?.workItems.find(w => w.id === itemId);
        return {
          ...state,
          editingItems: newEditingItems,
          editFormData: item ? { ...state.editFormData, [itemId]: { ...item } } : state.editFormData,
        };
      } else {
        newEditingItems.delete(itemId);
        const newFormData = { ...state.editFormData };
        delete newFormData[itemId];
        return {
          ...state,
          editingItems: newEditingItems,
          editFormData: newFormData,
        };
      }
    }

    case 'UPDATE_EDIT_FORM':
      return {
        ...state,
        editFormData: {
          ...state.editFormData,
          [action.payload.itemId]: {
            ...state.editFormData[action.payload.itemId],
            [action.payload.field]: action.payload.value,
          },
        },
      };

    case 'CLEAR_EDIT_FORM': {
      const newFormData = { ...state.editFormData };
      delete newFormData[action.payload];
      return { ...state, editFormData: newFormData };
    }

    case 'SAVE_EDIT_ITEM': {
      const itemId = action.payload;
      const editData = state.editFormData[itemId];
      
      if (!state.projectData || !editData) {
        return state;
      }

      const updatedWorkItems = state.projectData.workItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            ...editData,
            updatedDate: new Date().toISOString(),
          };
        }
        return item;
      });

      const newEditingItems = new Set(state.editingItems);
      newEditingItems.delete(itemId);

      const newEditFormData = { ...state.editFormData };
      delete newEditFormData[itemId];

      return {
        ...state,
        projectData: {
          ...state.projectData,
          workItems: updatedWorkItems,
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
        editingItems: newEditingItems,
        editFormData: newEditFormData,
      };
    }

    case 'SET_PROJECT_EDITING':
      return {
        ...state,
        isEditingProject: action.payload,
        editProjectData: action.payload && state.projectData
          ? { ...state.projectData.project }
          : {},
      };

    case 'UPDATE_PROJECT_EDIT':
      return {
        ...state,
        editProjectData: {
          ...state.editProjectData,
          [action.payload.field]: action.payload.value,
        },
      };

    case 'SAVE_PROJECT_CHANGES':
      if (!state.projectData || !state.editProjectData) return state;
      return {
        ...state,
        projectData: {
          ...state.projectData,
          project: {
            ...state.projectData.project,
            ...state.editProjectData,
          },
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
        isEditingProject: false,
        editProjectData: {},
      };

    case 'SET_CREATING_ITEM':
      return {
        ...state,
        isCreatingNewItem: action.payload,
        newItemData: action.payload ? {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          title: '',
          description: '',
          type: 'task',
          status: 'backlog',
          priority: 'medium',
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        } : {},
      };

    case 'UPDATE_NEW_ITEM':
      return {
        ...state,
        newItemData: {
          ...state.newItemData,
          [action.payload.field]: action.payload.value,
        },
      };

    case 'ADD_NEW_ITEM': {
      if (!state.projectData || !state.newItemData.title?.trim() || !state.newItemData.id) {
        return state;
      }

      const newItem: WorkItem = {
        id: state.newItemData.id,
        title: state.newItemData.title.trim(),
        description: state.newItemData.description || "",
        type: state.newItemData.type || "task",
        status: state.newItemData.status || "backlog",
        priority: state.newItemData.priority || "medium",
        parentId: state.newItemData.parentId,
        estimatedEffort: state.newItemData.estimatedEffort,
        assignee: state.newItemData.assignee,
        reporter: state.newItemData.reporter,
        createdDate: state.newItemData.createdDate || new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        startDate: state.newItemData.startDate,
        dueDate: state.newItemData.dueDate,
        tags: state.newItemData.tags || [],
        acceptanceCriteria: state.newItemData.acceptanceCriteria || [],
        dependencies: state.newItemData.dependencies,
        customFields: state.newItemData.customFields,
      };

      return {
        ...state,
        projectData: {
          ...state.projectData,
          workItems: [...state.projectData.workItems, newItem],
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
        isCreatingNewItem: false,
        newItemData: {},
      };
    }

    case 'SET_MODAL':
      return {
        ...state,
        [action.payload.modal]: action.payload.show,
      };

    case 'SET_DELETE_ITEM':
      return {
        ...state,
        itemToDelete: action.payload,
      };

    case 'TOGGLE_IMPORT_MODAL':
      return {
        ...state,
        showImportModal: !state.showImportModal,
      };

    case 'TOGGLE_DELETE_CONFIRM':
      return {
        ...state,
        showDeleteConfirm: !state.showDeleteConfirm,
      };

    case 'ADD_TAG': {
      const { itemId, tag } = action.payload;
      if (!state.projectData || !tag.trim()) return state;

      const updatedWorkItems = state.projectData.workItems.map(item => {
        if (item.id === itemId) {
          const currentTags = item.tags || [];
          return {
            ...item,
            tags: [...currentTags, tag.trim()],
            updatedDate: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...state,
        projectData: {
          ...state.projectData,
          workItems: updatedWorkItems,
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
      };
    }

    case 'REMOVE_TAG': {
      const { itemId, tagIndex } = action.payload;
      if (!state.projectData) return state;

      const updatedWorkItems = state.projectData.workItems.map(item => {
        if (item.id === itemId && item.tags) {
          const updatedTags = item.tags.filter((_, index) => index !== tagIndex);
          return {
            ...item,
            tags: updatedTags,
            updatedDate: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...state,
        projectData: {
          ...state.projectData,
          workItems: updatedWorkItems,
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
      };
    }

    case 'ADD_ACCEPTANCE_CRITERIA': {
      const { itemId, description } = action.payload;
      if (!state.projectData || !description.trim()) return state;

      const updatedWorkItems = state.projectData.workItems.map(item => {
        if (item.id === itemId) {
          const currentCriteria = item.acceptanceCriteria || [];
          const newCriteria = {
            id: `ac-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            description: description.trim(),
            completed: false,
          };
          return {
            ...item,
            acceptanceCriteria: [...currentCriteria, newCriteria],
            updatedDate: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...state,
        projectData: {
          ...state.projectData,
          workItems: updatedWorkItems,
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
      };
    }

    case 'REMOVE_ACCEPTANCE_CRITERIA': {
      const { itemId, criteriaIndex } = action.payload;
      if (!state.projectData) return state;

      const updatedWorkItems = state.projectData.workItems.map(item => {
        if (item.id === itemId && item.acceptanceCriteria) {
          const updatedCriteria = item.acceptanceCriteria.filter((_, index) => index !== criteriaIndex);
          return {
            ...item,
            acceptanceCriteria: updatedCriteria,
            updatedDate: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...state,
        projectData: {
          ...state.projectData,
          workItems: updatedWorkItems,
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
      };
    }

    case 'DELETE_WORK_ITEM': {
      const itemId = action.payload;
      if (!state.projectData) return state;

      // Remove the item and any children that have this item as parent
      const updatedWorkItems = state.projectData.workItems.filter(item => {
        return item.id !== itemId && item.parentId !== itemId;
      });

      return {
        ...state,
        projectData: {
          ...state.projectData,
          workItems: updatedWorkItems,
          metadata: {
            ...state.projectData.metadata,
            lastUpdated: new Date().toISOString(),
          },
        },
        // Clean up any UI state for deleted items
        editingItems: new Set(Array.from(state.editingItems).filter(id => id !== itemId)),
        editFormData: Object.fromEntries(
          Object.entries(state.editFormData).filter(([key]) => key !== itemId)
        ),
        expandedItems: new Set(Array.from(state.expandedItems).filter(id => id !== itemId)),
        itemToDelete: null,
        showDeleteConfirm: false,
      };
    }

    default:
      return state;
  }
}

// Context
const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | null>(null);

// Provider
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { loadFromStorage, saveToStorage } = useLocalStorage();

  // Load cached data on mount
  useEffect(() => {
    const { data, filename } = loadFromStorage();
    if (data) {
      dispatch({ type: 'SET_PROJECT_DATA', payload: { data, fileName: filename } });
      dispatch({ type: 'SET_CACHE_LOADED', payload: true });
      dispatch({ type: 'TOGGLE_IMPORT_MODAL' }); // Hide the import modal
      
      // Show cache notification briefly
      setTimeout(() => dispatch({ type: 'SET_CACHE_LOADED', payload: false }), 3000);
    }
  }, [loadFromStorage]);

  // Auto-save to localStorage with debouncing (500ms delay)
  useDebounce(
    () => {
      if (state.projectData && state.fileName) {
        saveToStorage(state.projectData, state.fileName);
      }
    },
    500, // 500ms delay
    [state.projectData, state.fileName, saveToStorage]
  );

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

// Hook
export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}