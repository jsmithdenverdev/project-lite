import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ProjectData } from '../schemas';
import { indexedDBService, type DBProject } from '../services/indexedDB';

export interface MultiProjectState {
  // Project list management
  projects: DBProject[];
  activeProjectId: string | null;
  currentProjectData: ProjectData | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  isProjectListOpen: boolean;
  
  // Migration state
  isMigrating: boolean;
  hasMigrated: boolean;
}

export type MultiProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: DBProject[] }
  | { type: 'SET_ACTIVE_PROJECT'; payload: { id: string; data: ProjectData } }
  | { type: 'SET_CURRENT_PROJECT_DATA'; payload: ProjectData }
  | { type: 'CLEAR_ACTIVE_PROJECT' }
  | { type: 'ADD_PROJECT'; payload: DBProject }
  | { type: 'UPDATE_PROJECT'; payload: DBProject }
  | { type: 'REMOVE_PROJECT'; payload: string }
  | { type: 'TOGGLE_PROJECT_LIST' }
  | { type: 'SET_PROJECT_LIST_OPEN'; payload: boolean }
  | { type: 'SET_MIGRATING'; payload: boolean }
  | { type: 'SET_MIGRATED'; payload: boolean };

const initialState: MultiProjectState = {
  projects: [],
  activeProjectId: null,
  currentProjectData: null,
  isLoading: false,
  error: null,
  isProjectListOpen: false,
  isMigrating: false,
  hasMigrated: false,
};

function multiProjectReducer(state: MultiProjectState, action: MultiProjectAction): MultiProjectState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'SET_ACTIVE_PROJECT':
      return {
        ...state,
        activeProjectId: action.payload.id,
        currentProjectData: action.payload.data,
        isLoading: false,
        error: null,
      };
    
    case 'SET_CURRENT_PROJECT_DATA':
      return { ...state, currentProjectData: action.payload };
    
    case 'CLEAR_ACTIVE_PROJECT':
      return {
        ...state,
        activeProjectId: null,
        currentProjectData: null,
      };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    
    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        activeProjectId: state.activeProjectId === action.payload ? null : state.activeProjectId,
        currentProjectData: state.activeProjectId === action.payload ? null : state.currentProjectData,
      };
    
    case 'TOGGLE_PROJECT_LIST':
      return { ...state, isProjectListOpen: !state.isProjectListOpen };
    
    case 'SET_PROJECT_LIST_OPEN':
      return { ...state, isProjectListOpen: action.payload };
    
    case 'SET_MIGRATING':
      return { ...state, isMigrating: action.payload };
    
    case 'SET_MIGRATED':
      return { ...state, hasMigrated: action.payload };
    
    default:
      return state;
  }
}

const MultiProjectContext = createContext<{
  state: MultiProjectState;
  dispatch: React.Dispatch<MultiProjectAction>;
  actions: {
    loadProjects: () => Promise<void>;
    createProject: (projectData: ProjectData, name?: string) => Promise<string>;
    switchToProject: (projectId: string) => Promise<void>;
    updateCurrentProject: (projectData: ProjectData) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    migrateFromOldStorage: () => Promise<void>;
  };
} | null>(null);

export function MultiProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(multiProjectReducer, initialState);

  // Actions
  const actions = {
    loadProjects: async (): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const projects = await indexedDBService.getAllProjects();
        dispatch({ type: 'SET_PROJECTS', payload: projects });
        
        // Check if there's an active project and load it
        const activeProject = projects.find(p => p.isActive);
        if (activeProject) {
          const projectData = await indexedDBService.getProject(activeProject.id);
          if (projectData) {
            dispatch({ type: 'SET_ACTIVE_PROJECT', payload: { id: activeProject.id, data: projectData } });
          }
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load projects' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    createProject: async (projectData: ProjectData, name?: string): Promise<string> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const projectDataWithName = name ? {
          ...projectData,
          project: { ...projectData.project, name }
        } : projectData;

        const projectId = await indexedDBService.createProject(projectDataWithName);
        
        // Add to local state
        const now = new Date().toISOString();
        const dbProject: DBProject = {
          ...projectDataWithName.project,
          id: projectId,
          lastAccessed: now,
          isActive: false,
          version: 1
        };
        
        dispatch({ type: 'ADD_PROJECT', payload: dbProject });
        return projectId;
      } catch (error) {
        console.error('Failed to create project:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create project' });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    switchToProject: async (projectId: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Set as active in database
        await indexedDBService.setActiveProject(projectId);
        
        // Load project data
        const projectData = await indexedDBService.getProject(projectId);
        if (!projectData) throw new Error('Project not found');
        
        // Update local state
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: { id: projectId, data: projectData } });
        
        // Reload projects list to ensure we have the latest data
        const allProjects = await indexedDBService.getAllProjects();
        dispatch({ type: 'SET_PROJECTS', payload: allProjects });
      } catch (error) {
        console.error('Failed to switch project:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to switch project' });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    updateCurrentProject: async (projectData: ProjectData): Promise<void> => {
      if (!state.activeProjectId) throw new Error('No active project');
      
      try {
        await indexedDBService.updateProject(state.activeProjectId, projectData);
        
        // Update local state
        dispatch({ type: 'SET_CURRENT_PROJECT_DATA', payload: projectData });
        
        // Update project in projects list
        const updatedProject: DBProject = {
          ...projectData.project,
          id: state.activeProjectId,
          lastAccessed: new Date().toISOString(),
          isActive: true,
          version: state.projects.find(p => p.id === state.activeProjectId)?.version || 1
        };
        dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      } catch (error) {
        console.error('Failed to update project:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update project' });
        throw error;
      }
    },

    deleteProject: async (projectId: string): Promise<void> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await indexedDBService.deleteProject(projectId);
        dispatch({ type: 'REMOVE_PROJECT', payload: projectId });
      } catch (error) {
        console.error('Failed to delete project:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete project' });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    migrateFromOldStorage: async (): Promise<void> => {
      dispatch({ type: 'SET_MIGRATING', payload: true });
      try {
        await indexedDBService.migrateFromLocalStorage();
        dispatch({ type: 'SET_MIGRATED', payload: true });
        
        // Reload projects after migration
        await actions.loadProjects();
      } catch (error) {
        console.error('Migration failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Migration failed' });
      } finally {
        dispatch({ type: 'SET_MIGRATING', payload: false });
      }
    },
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      // Check if we need to migrate
      const hasOldData = localStorage.getItem('project-pulse-data');
      if (hasOldData) {
        await actions.migrateFromOldStorage();
      } else {
        await actions.loadProjects();
      }
    };

    initialize().catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MultiProjectContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </MultiProjectContext.Provider>
  );
}

export function useMultiProject() {
  const context = useContext(MultiProjectContext);
  if (!context) {
    throw new Error('useMultiProject must be used within a MultiProjectProvider');
  }
  return context;
}