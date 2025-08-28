import React, { useState } from 'react';
import { Upload, X, Plus, FileText } from 'lucide-react';
import { ProjectDataSchema, type ProjectData } from '../schemas';

interface ProjectImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectLoaded: (data: ProjectData, filename: string) => void;
}

const ProjectImportModal: React.FC<ProjectImportModalProps> = ({ isOpen, onClose, onProjectLoaded }) => {
  const [activeView, setActiveView] = useState<'choose' | 'upload' | 'text' | 'create'>('choose');
  const [jsonInput, setJsonInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const rawData = JSON.parse(content);
          const validationResult = ProjectDataSchema.safeParse(rawData);
          
          if (!validationResult.success) {
            const errorMessages = validationResult.error.issues.map(
              (err) => `${err.path.join('.')}: ${err.message}`
            ).join('\n');
            setError(`Schema validation failed:\n${errorMessages}`);
            return;
          }
          
          onProjectLoaded(validationResult.data, file.name);
          onClose();
        } catch (e) {
          setError(`Invalid JSON format: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTextImport = (): void => {
    try {
      const rawData = JSON.parse(jsonInput);
      const validationResult = ProjectDataSchema.safeParse(rawData);
      
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join('\n');
        setError(`Schema validation failed:\n${errorMessages}`);
        return;
      }
      
      onProjectLoaded(validationResult.data, 'imported-project.json');
      onClose();
    } catch (e) {
      setError(`Invalid JSON format: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleCreateNew = (): void => {
    const newProject: ProjectData = {
      project: {
        id: `proj-${Date.now()}`,
        name: "New Project",
        description: "A new project created from scratch",
        type: "software",
        status: "backlog",
        priority: "medium",
        createdDate: new Date().toISOString(),
      },
      workItems: [],
      metadata: {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        totalWorkItems: 0,
        completedWorkItems: 0,
      }
    };
    
    onProjectLoaded(newProject, 'new-project.json');
    onClose();
  };

  const resetState = () => {
    setError("");
    setJsonInput("");
    setFileName("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {activeView === 'choose' && 'Load or Create Project'}
            {activeView === 'upload' && 'Upload Project File'}
            {activeView === 'text' && 'Import from Text'}
            {activeView === 'create' && 'Create New Project'}
          </h2>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Error</h4>
            <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap overflow-x-auto">{error}</pre>
          </div>
        )}

        {activeView === 'choose' && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose how you'd like to get started with your project:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveView('upload')}
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
              >
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Upload File</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload a JSON project file from your computer
                </p>
              </button>

              <button
                onClick={() => setActiveView('text')}
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
              >
                <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Import Text</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paste JSON data directly into a text editor
                </p>
              </button>

              <button
                onClick={() => setActiveView('create')}
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
              >
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Create New</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start with a blank project template
                </p>
              </button>
            </div>
          </div>
        )}

        {activeView === 'upload' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('choose')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4"
            >
              ← Back to options
            </button>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {fileName && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Selected: {fileName}</p>
              )}
            </div>
          </div>
        )}

        {activeView === 'text' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('choose')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4"
            >
              ← Back to options
            </button>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste JSON Data
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your project JSON here..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleTextImport}
                disabled={!jsonInput.trim()}
                className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>Import Project</span>
              </button>
            </div>
          </div>
        )}

        {activeView === 'create' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('choose')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4"
            >
              ← Back to options
            </button>
            
            <div className="text-center py-8">
              <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Create New Project
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will create a blank project template that you can start customizing right away.
              </p>
              
              <button
                onClick={handleCreateNew}
                className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectImportModal;