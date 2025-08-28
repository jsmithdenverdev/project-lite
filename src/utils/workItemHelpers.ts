import type { WorkItem, WorkItemWithChildren, StatusType, PriorityType, WorkItemType } from '../schemas';

// Helper function to get all descendant IDs to prevent circular dependencies
export function getDescendantIds(itemId: string, workItems: WorkItem[]): Set<string> {
  const descendants = new Set<string>();
  const findDescendants = (parentId: string) => {
    workItems.forEach(item => {
      if (item.parentId === parentId) {
        descendants.add(item.id);
        findDescendants(item.id); // Recursively find children
      }
    });
  };
  
  findDescendants(itemId);
  return descendants;
}

// Build hierarchical structure from flat work items array
export function buildWorkItemHierarchy(workItems: WorkItem[]): WorkItemWithChildren[] {
  if (!workItems || !Array.isArray(workItems)) return [];

  // Filter out invalid items
  const validItems = workItems.filter(
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
}

// Status color mapping
export function getStatusColor(status: StatusType): string {
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
}

// Priority color mapping
export function getPriorityColor(priority: PriorityType): string {
  const colors: Record<PriorityType, string> = {
    low: "text-gray-500 dark:text-gray-400",
    medium: "text-blue-500 dark:text-blue-400",
    high: "text-orange-500 dark:text-orange-400",
    critical: "text-red-500 dark:text-red-400",
  };
  return colors[priority] || "text-gray-500 dark:text-gray-400";
}

// Type icon mapping (returns class names for Lucide icons)
export function getTypeIconName(type: WorkItemType): string {
  const icons: Record<WorkItemType, string> = {
    epic: "Folder",
    feature: "Target",
    story: "FileText",
    task: "List",
    bug: "AlertCircle",
    spike: "Zap",
    research: "Circle",
  };
  return icons[type] || "Circle";
}

// Validate parent selection (prevent circular dependencies)
export function getValidParents(
  itemId: string | undefined, 
  allWorkItems: WorkItem[]
): WorkItem[] {
  if (!itemId) return allWorkItems; // New items can have any parent
  
  return allWorkItems.filter(parent => {
    if (parent.id === itemId) return false; // Can't be parent of itself
    
    const descendants = getDescendantIds(itemId, allWorkItems);
    return !descendants.has(parent.id); // Can't be parent of its own ancestor
  });
}

// Sort parents by type hierarchy for better UX
export function sortWorkItemsByHierarchy(workItems: WorkItem[]): WorkItem[] {
  const typeOrder: Record<WorkItemType, number> = {
    epic: 1,
    feature: 2,
    story: 3,
    task: 4,
    bug: 4,
    spike: 4,
    research: 4
  };

  return workItems.sort((a, b) => {
    const typeComparison = (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
    if (typeComparison !== 0) return typeComparison;
    return a.title.localeCompare(b.title);
  });
}