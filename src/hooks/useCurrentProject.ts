import { useCallback, useEffect } from 'react';
import { useMultiProject } from '../context/MultiProjectContext';
import { useProjectContext } from '../context/ProjectContext';
import type { ProjectData } from '../schemas';

export function useCurrentProject() {
  const { state: multiProjectState, actions: multiProjectActions } = useMultiProject();
  const { state: projectState, dispatch: projectDispatch } = useProjectContext();

  // Sync multi-project data to project context when active project changes
  useEffect(() => {
    if (multiProjectState.currentProjectData) {
      syncToProjectContext(multiProjectState.currentProjectData);
    } else if (multiProjectState.activeProjectId === null) {
      syncToProjectContext(null);
    }
  }, [multiProjectState.currentProjectData, multiProjectState.activeProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync current project data from multi-project to single project context
  const syncToProjectContext = useCallback((projectData: ProjectData | null) => {
    if (projectData) {
      projectDispatch({ 
        type: 'LOAD_CACHED_DATA', 
        payload: { 
          data: projectData, 
          fileName: projectData.project.name 
        } 
      });
    } else {
      projectDispatch({ type: 'CLEAR_PROJECT_DATA' });
    }
  }, [projectDispatch]);

  // Save changes from project context back to multi-project storage
  const saveToMultiProject = useCallback(async (projectData: ProjectData) => {
    if (multiProjectState.activeProjectId) {
      try {
        await multiProjectActions.updateCurrentProject(projectData);
      } catch (error) {
        console.error('Failed to save to multi-project storage:', error);
        throw error;
      }
    }
  }, [multiProjectState.activeProjectId, multiProjectActions]);

  // Enhanced project actions that work with both contexts
  const enhancedActions = {
    // Load a project by switching to it
    loadProject: async (projectId: string) => {
      await multiProjectActions.switchToProject(projectId);
      const projectData = multiProjectState.currentProjectData;
      syncToProjectContext(projectData);
    },

    // Create new project and switch to it
    createAndLoadProject: async (projectData: ProjectData, name?: string) => {
      const projectId = await multiProjectActions.createProject(projectData, name);
      await multiProjectActions.switchToProject(projectId);
      syncToProjectContext(multiProjectState.currentProjectData);
      return projectId;
    },

    // Save current project data
    saveCurrentProject: async () => {
      if (projectState.projectData) {
        await saveToMultiProject(projectState.projectData);
      }
    },

    // Switch to different project
    switchProject: async (projectId: string) => {
      // Save current changes first if needed
      if (projectState.hasUnsavedChanges && projectState.projectData) {
        await saveToMultiProject(projectState.projectData);
      }
      
      await multiProjectActions.switchToProject(projectId);
      syncToProjectContext(multiProjectState.currentProjectData);
    },

    // Clear current project
    clearProject: () => {
      syncToProjectContext(null);
    },

    // Delete project
    deleteProject: async (projectId: string) => {
      await multiProjectActions.deleteProject(projectId);
      
      // If we deleted the active project, clear it
      if (projectId === multiProjectState.activeProjectId) {
        syncToProjectContext(null);
      }
    },
  };

  return {
    // State
    projects: multiProjectState.projects,
    activeProjectId: multiProjectState.activeProjectId,
    currentProjectData: projectState.projectData,
    isLoading: multiProjectState.isLoading,
    error: multiProjectState.error,
    hasUnsavedChanges: projectState.hasUnsavedChanges,
    
    // Actions
    ...enhancedActions,
    
    // Direct access to project context for compatibility
    projectState,
    projectDispatch,
    
    // Direct access to multi-project context
    multiProjectState,
    multiProjectActions,
    
    // Utility functions
    syncToProjectContext,
    saveToMultiProject,
  };
}