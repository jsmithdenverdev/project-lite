import { useState } from 'react';
import { ChevronDown, FolderOpen, Calendar, User, Trash2, Download } from 'lucide-react';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { ConfirmationModal } from '../ConfirmationModal';
import type { DBProject } from '../../services/indexedDB';

interface ProjectSelectorProps {
  className?: string;
}

export function ProjectSelector({ className = '' }: ProjectSelectorProps) {
  const {
    projects,
    activeProjectId,
    currentProjectData,
    isLoading,
    switchProject,
    deleteProject
  } = useCurrentProject();

  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<DBProject | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  );

  const handleProjectSelect = async (projectId: string) => {
    if (projectId === activeProjectId) {
      setIsOpen(false);
      return;
    }

    try {
      await switchProject(projectId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch project:', error);
    }
  };

  const handleDeleteProject = (project: DBProject, event: React.MouseEvent) => {
    event.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      
      // If we deleted the active project, close the selector
      if (projectToDelete.id === activeProjectId) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleExportProject = async (project: DBProject, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      // If it's the active project, use current data, otherwise we need to fetch it
      let projectData = null;
      
      if (project.id === activeProjectId && currentProjectData) {
        projectData = currentProjectData;
      } else {
        // We need to get the project data from IndexedDB
        const { indexedDBService } = await import('../../services/indexedDB');
        projectData = await indexedDBService.getProject(project.id);
      }

      if (projectData) {
        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'backlog': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'todo': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'in_progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'review': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'testing': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'done': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'blocked': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'cancelled': 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (projects.length === 0 && !isLoading) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        No projects available
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px] md:min-w-[320px] justify-between"
          type="button"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2 flex-1 text-left">
            <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {activeProject ? activeProject.name : 'Select Project'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 md:right-auto mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto md:min-w-[400px]">
            {sortedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                  project.id === activeProjectId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {project.name}
                    </h4>
                    {project.id === activeProjectId && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                    
                    {project.owner && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{project.owner}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.lastAccessed)}</span>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={(e) => handleExportProject(project, e)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                    title="Export project"
                    type="button"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => handleDeleteProject(project, e)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    title="Delete project"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {sortedProjects.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                No projects available
              </div>
            )}
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={
          projectToDelete ? (
            <>
              <p>Are you sure you want to delete <strong>"{projectToDelete.name}"</strong>?</p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mt-2">
                <p className="text-sm text-red-800 dark:text-red-300">
                  ⚠️ This action cannot be undone. All work items and project data will be permanently deleted.
                </p>
                {projects.length === 1 && (
                  <p className="text-sm text-red-800 dark:text-red-300 mt-2">
                    🗑️ This is your last project. After deletion, you'll need to create or import a new project.
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Consider exporting the project first if you want to keep a backup.
              </p>
            </>
          ) : 'Are you sure you want to delete this project?'
        }
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}