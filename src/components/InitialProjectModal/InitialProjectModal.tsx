import { useState, useRef } from 'react';
import { FolderOpen, Upload, Plus, Sparkles } from 'lucide-react';
import { Modal } from '../Modal';
import { ProjectSelector } from '../ProjectSelector';
import { NewProjectModal } from '../NewProjectModal';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { ProjectDataSchema, type ProjectData } from '../../schemas';

interface InitialProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectLoaded?: (data: ProjectData, filename: string) => void;
}

export function InitialProjectModal({ isOpen, onClose }: InitialProjectModalProps) {
  const { projects, createAndLoadProject } = useCurrentProject();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasExistingProjects = projects.length > 0;

  const handleCreateNew = () => {
    setShowNewProjectModal(true);
  };

  const handleImportClick = () => {
    setError('');
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const rawData = JSON.parse(content);
      const validationResult = ProjectDataSchema.safeParse(rawData);
      
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join('\n');
        setError(`Schema validation failed:\n${errorMessages}`);
        return;
      }
      
      await createAndLoadProject(validationResult.data, file.name);
      onClose();
    } catch (e) {
      setError(`Invalid JSON format: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProjectCreated = () => {
    setShowNewProjectModal(false);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={hasExistingProjects ? onClose : undefined} // Only allow closing if there are existing projects
        title="Welcome to Project Lite" 
        size="lg"
      >
        <div className="space-y-8">
          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Import Error</h4>
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap overflow-x-auto">{error}</pre>
            </div>
          )}
          {/* Welcome Message */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {hasExistingProjects ? 'Choose Your Next Step' : 'Get Started with Your First Project'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {hasExistingProjects 
                ? 'Open an existing project or start something new.'
                : 'Create a new project from scratch or import an existing one.'
              }
            </p>
          </div>

          {/* Project Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Open Existing Project - Only show if there are projects */}
            {hasExistingProjects && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Open Existing Project
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Continue with one of your {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ProjectSelector />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Select a project to continue working
                </p>
              </div>
            )}

            {/* Create New Project */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Create New Project
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start fresh with a guided setup
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                type="button"
              >
                Create New Project
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Set up project details, type, and initial configuration
              </p>
            </div>

            {/* Import from File */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Import Project
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload JSON file from your computer
                  </p>
                </div>
              </div>
              <button
                onClick={handleImportClick}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                type="button"
              >
                Import from File
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Load an existing project from a JSON file
              </p>
            </div>

          </div>

          {/* Quick Actions */}
          {hasExistingProjects && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  You have {projects.length} project{projects.length !== 1 ? 's' : ''} saved locally
                </span>
                <button
                  onClick={onClose}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  type="button"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Sub-modals */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
}