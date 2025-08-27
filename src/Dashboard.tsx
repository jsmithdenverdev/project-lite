import React, { useState, useMemo, useEffect, type JSX } from "react";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Circle,
  Target,
  Folder,
  FileText,
  List,
  Zap,
  Upload,
  Download,
  Settings,
  Layout,
} from "lucide-react";
import {
  ProjectDataSchema,
  type ProjectData,
  type WorkItemWithChildren,
  type StatusType,
  type PriorityType,
  type WorkItemType,
} from "./schemas";


const ProjectDashboard: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"metadata" | "project">("metadata");
  const [fileName, setFileName] = useState<string>("");

  // Update JSON input whenever project data changes
  useEffect(() => {
    if (projectData) {
      setJsonInput(JSON.stringify(projectData, null, 2));
    }
  }, [projectData]);

  const parseJson = (): void => {
    try {
      const rawData = JSON.parse(jsonInput);
      const validationResult = ProjectDataSchema.safeParse(rawData);
      
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join('\n');
        setError(`Schema validation failed:\n${errorMessages}`);
        setProjectData(null);
        return;
      }
      
      const parsed = validationResult.data;
      setProjectData(parsed);
      setError("");
      // Auto-expand epics on load
      const epics =
        parsed.workItems
          ?.filter((item) => item.type === "epic")
          .map((item) => item.id) || [];
      setExpandedItems(new Set(epics));
    } catch (e) {
      setError(`Invalid JSON format: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setProjectData(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
        try {
          const rawData = JSON.parse(content);
          const validationResult = ProjectDataSchema.safeParse(rawData);
          
          if (!validationResult.success) {
            const errorMessages = validationResult.error.issues.map(
              (err) => `${err.path.join('.')}: ${err.message}`
            ).join('\n');
            setError(`Schema validation failed in uploaded file:\n${errorMessages}`);
            setProjectData(null);
            return;
          }
          
          const parsed = validationResult.data;
          setProjectData(parsed);
          setError("");
          // Auto-expand epics on load
          const epics =
            parsed.workItems
              ?.filter((item) => item.type === "epic")
              .map((item) => item.id) || [];
          setExpandedItems(new Set(epics));
        } catch (e) {
          setError(`Invalid JSON format in uploaded file: ${e instanceof Error ? e.message : 'Unknown error'}`);
          setProjectData(null);
        }
      };
      reader.readAsText(file);
    }
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
      
      // Then clear the application state
      setProjectData(null);
      setJsonInput("");
      setFileName("");
      setError("");
      setExpandedItems(new Set());
    }
  };

  const toggleExpanded = (itemId: string): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleAcceptanceCriteria = (
    workItemId: string,
    criteriaIndex: number,
    completed: boolean
  ): void => {
    if (!projectData) return;

    const updatedWorkItems = projectData.workItems.map((item) => {
      if (item.id === workItemId && item.acceptanceCriteria) {
        const updatedCriteria = [...item.acceptanceCriteria];
        updatedCriteria[criteriaIndex] = {
          ...updatedCriteria[criteriaIndex],
          completed,
        };
        return { ...item, acceptanceCriteria: updatedCriteria };
      }
      return item;
    });

    setProjectData({
      ...projectData,
      workItems: updatedWorkItems,
    });
  };

  const getStatusColor = (status: StatusType): string => {
    const colors: Record<StatusType, string> = {
      backlog: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      todo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      review: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      testing: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      blocked: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
    };
    return colors[status] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  const getPriorityColor = (priority: PriorityType): string => {
    const colors: Record<PriorityType, string> = {
      low: "text-gray-500 dark:text-gray-400",
      medium: "text-blue-500 dark:text-blue-400",
      high: "text-orange-500 dark:text-orange-400",
      critical: "text-red-500 dark:text-red-400",
    };
    return colors[priority] || "text-gray-500 dark:text-gray-400";
  };

  const getTypeIcon = (type: WorkItemType): JSX.Element => {
    const icons: Record<WorkItemType, JSX.Element> = {
      epic: <Folder className="w-4 h-4" />,
      feature: <Target className="w-4 h-4" />,
      story: <FileText className="w-4 h-4" />,
      task: <List className="w-4 h-4" />,
      bug: <AlertCircle className="w-4 h-4" />,
      spike: <Zap className="w-4 h-4" />,
      research: <Circle className="w-4 h-4" />,
    };
    return icons[type] || <Circle className="w-4 h-4" />;
  };

  const workItemHierarchy = useMemo((): WorkItemWithChildren[] => {
    if (!projectData?.workItems || !Array.isArray(projectData.workItems)) return [];

    // Filter out invalid items
    const validItems = projectData.workItems.filter(
      (item) => item && item.id && item.title
    );
    
    if (validItems.length === 0) return [];

    const itemMap = new Map<string, WorkItemWithChildren>(
      validItems.map((item) => [item.id, { ...item, children: [] }])
    );
    const rootItems: WorkItemWithChildren[] = [];

    validItems.forEach((item) => {
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId);
        const child = itemMap.get(item.id);
        if (parent && child) {
          parent.children.push(child);
        }
      } else {
        const rootItem = itemMap.get(item.id);
        if (rootItem) {
          rootItems.push(rootItem);
        }
      }
    });

    return rootItems;
  }, [projectData]);

  const renderWorkItem = (
    item: WorkItemWithChildren,
    depth: number = 0
  ): JSX.Element => {
    // Defensive checks to prevent crashes
    if (!item || !item.id || !item.title) {
      return <div key="invalid-item" className="text-red-500 text-sm p-2">Invalid work item data</div>;
    }
    
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const marginLeft = depth * 24;

    return (
      <div key={item.id} className="mb-2">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          style={{ marginLeft: `${marginLeft}px` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  type="button"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}

              <div className="flex items-center space-x-2 mt-1">
                <span className={getPriorityColor(item.priority)}>
                  {getTypeIcon(item.type)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {item.assignee && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{item.assignee}</span>
                    </div>
                  )}

                  {item.estimatedEffort && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {item.estimatedEffort.value} {item.estimatedEffort.unit}
                      </span>
                    </div>
                  )}

                  {item.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {item.priority && (
                    <div
                      className={`flex items-center space-x-1 ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      <Target className="w-3 h-3" />
                      <span className="capitalize">{item.priority}</span>
                    </div>
                  )}
                </div>

                {item.acceptanceCriteria &&
                  item.acceptanceCriteria.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Acceptance Criteria
                      </h4>
                      <div className="space-y-1">
                        {item.acceptanceCriteria.map((ac, index) => (
                          <div
                            key={ac.id || index}
                            className="flex items-start space-x-2 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={ac.completed || false}
                              onChange={(e) =>
                                toggleAcceptanceCriteria(
                                  item.id,
                                  index,
                                  e.target.checked
                                )
                              }
                              className="w-3 h-3 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 focus:ring-2 mt-0.5 flex-shrink-0"
                            />
                            <span
                              className={
                                ac.completed
                                  ? "text-green-700 dark:text-green-400 italic"
                                  : "text-gray-600 dark:text-gray-300"
                              }
                            >
                              {ac.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {item.children.map((child) => renderWorkItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };


  const renderMetadataTab = (): JSX.Element => (
    <div className="space-y-6">
      {/* Validation Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Validation Error</h4>
          <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap overflow-x-auto">{error}</pre>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Load Project Data
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload JSON File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {fileName && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loaded: {fileName}</p>
            )}
          </div>
          {projectData && (
            <button
              onClick={handleUnload}
              type="button"
              className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Save & Unload Project</span>
            </button>
          )}
        </div>
      </div>

      {/* JSON Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Direct JSON Editor
        </h2>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your project JSON here..."
          className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={parseJson}
          type="button"
          className="mt-3 flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          <Upload className="w-4 h-4" />
          <span>Load from Text</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Project Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Load, edit, and manage your project data with enhanced file handling
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("metadata")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "metadata"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                type="button"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Metadata</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("project")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "project"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                } ${!projectData ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!projectData}
                type="button"
              >
                <div className="flex items-center space-x-2">
                  <Layout className="w-4 h-4" />
                  <span>Project</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "metadata" ? (
          renderMetadataTab()
        ) : (
          <div className="space-y-6">
            {projectData && (
              <>
                {/* Project Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {projectData.project.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {projectData.project.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        projectData.project.status
                      )}`}
                    >
                      {projectData.project.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {projectData.metadata?.totalWorkItems || 0}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {projectData.metadata?.completedWorkItems || 0}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {projectData.project.estimatedEffort?.value || 0}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Est.{" "}
                        {projectData.project.estimatedEffort?.unit || "hours"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${getPriorityColor(
                          projectData.project.priority
                        )}`}
                      >
                        {projectData.project.priority?.toUpperCase() || "MED"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Priority</div>
                    </div>
                  </div>

                  {projectData.project.tags &&
                    projectData.project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {projectData.project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

                {/* Work Items */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Work Items
                  </h2>
                  {workItemHierarchy.length > 0 ? (
                    workItemHierarchy.map((item) => renderWorkItem(item))
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No work items found in the project data.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
