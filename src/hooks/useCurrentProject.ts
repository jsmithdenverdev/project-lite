import { useMultiProject } from '../context/MultiProjectContext';

export function useCurrentProject() {
  const { state, actions } = useMultiProject();
  
  return {
    // State
    projects: state.projects,
    activeProjectId: state.activeProjectId,
    currentProjectData: state.currentProjectData,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions - direct pass-through to MultiProjectContext
    loadProjects: actions.loadProjects,
    createProject: actions.createProject,
    switchToProject: actions.switchToProject,
    updateCurrentProject: actions.updateCurrentProject,
    deleteProject: actions.deleteProject,
    
    // Enhanced actions with better naming
    createAndLoadProject: async (projectData: any, name?: string) => {
      const projectId = await actions.createProject(projectData, name);
      await actions.switchToProject(projectId);
      return projectId;
    },
    
    switchProject: actions.switchToProject,
    saveToMultiProject: actions.updateCurrentProject,
  };
}