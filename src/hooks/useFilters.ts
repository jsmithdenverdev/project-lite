import { useState, useMemo, useEffect, useCallback } from 'react';
import type { FilterValue, FilterOptions, FilterState, WorkItem, WorkItemWithChildren } from '../schemas';

interface UseFiltersProps {
  workItems?: WorkItem[];
  projectId?: string | null;
}

interface UseFiltersReturn {
  filterState: FilterState;
  addFilter: (filter: FilterValue) => void;
  removeFilter: (filterId: string) => void;
  clearAllFilters: () => void;
  filteredWorkItems: WorkItemWithChildren[];
}

const FILTER_STORAGE_PREFIX = 'project-lite-filters-';

export function useFilters({ workItems = [], projectId }: UseFiltersProps): UseFiltersReturn {
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Define available filter options
  const availableFilters: FilterOptions[] = useMemo(() => [
    {
      type: 'status',
      label: 'Status',
      options: [
        { value: 'backlog', label: 'Backlog', color: 'bg-gray-100 text-gray-700' },
        { value: 'todo', label: 'Todo', color: 'bg-blue-100 text-blue-700' },
        { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
        { value: 'review', label: 'Review', color: 'bg-purple-100 text-purple-700' },
        { value: 'testing', label: 'Testing', color: 'bg-orange-100 text-orange-700' },
        { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
        { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-700' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-500' }
      ]
    },
    {
      type: 'type',
      label: 'Type',
      options: [
        { value: 'epic', label: 'Epic' },
        { value: 'feature', label: 'Feature' },
        { value: 'story', label: 'Story' },
        { value: 'task', label: 'Task' },
        { value: 'bug', label: 'Bug' },
        { value: 'spike', label: 'Spike' },
        { value: 'research', label: 'Research' }
      ]
    },
    {
      type: 'priority',
      label: 'Priority',
      options: [
        { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
        { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
        { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' }
      ]
    },
    {
      type: 'tags',
      label: 'Tags',
      options: Array.from(
        new Set(workItems.flatMap(item => item.tags || []))
      ).map(tag => ({ value: tag, label: tag }))
    }
  ], [workItems]);

  // Load filters from localStorage when project changes
  useEffect(() => {
    if (!projectId) {
      setActiveFilters([]);
      setIsInitialized(true);
      return;
    }

    try {
      const storageKey = `${FILTER_STORAGE_PREFIX}${projectId}`;
      const savedFilters = localStorage.getItem(storageKey);
      
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        // Validate that saved filters are still valid
        if (Array.isArray(parsed)) {
          setActiveFilters(parsed);
        }
      } else {
        setActiveFilters([]);
      }
    } catch (error) {
      console.warn('Failed to load saved filters:', error);
      setActiveFilters([]);
    }
    
    setIsInitialized(true);
  }, [projectId]);

  // Save filters to localStorage when they change
  useEffect(() => {
    if (!isInitialized || !projectId) return;

    try {
      const storageKey = `${FILTER_STORAGE_PREFIX}${projectId}`;
      
      if (activeFilters.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(activeFilters));
      } else {
        // Clear saved filters when all filters are removed
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn('Failed to save filters:', error);
    }
  }, [activeFilters, projectId, isInitialized]);

  const filterState: FilterState = {
    activeFilters,
    availableFilters
  };

  const addFilter = useCallback((filter: FilterValue) => {
    setActiveFilters(prev => {
      // Prevent duplicate filters
      const isDuplicate = prev.some(f => 
        f.type === filter.type && 
        f.value === filter.value
      );
      
      if (isDuplicate) return prev;
      
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Build hierarchical structure with filtering
  const filteredWorkItems = useMemo((): WorkItemWithChildren[] => {
    if (!workItems || !Array.isArray(workItems)) return [];

    // Filter out invalid items
    const validItems = workItems.filter(
      (item) => item && item.id && item.title
    );
    
    if (validItems.length === 0) return [];

    // Build full hierarchy first
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

    // Apply filters recursively while preserving hierarchy
    const applyFilters = (items: WorkItemWithChildren[]): WorkItemWithChildren[] => {
      if (activeFilters.length === 0) return items;
      
      return items.filter(item => {
        // Recursively filter children first
        const filteredChildren = applyFilters(item.children);
        
        // Check if item matches all active filters
        const matchesFilters = activeFilters.every(filter => {
          switch (filter.type) {
            case 'status':
              return item.status === filter.value;
            case 'type':
              return item.type === filter.value;
            case 'priority':
              return item.priority === filter.value;
            case 'tags':
              return item.tags?.includes(filter.value as string) || false;
            case 'assignee':
              return item.assignee === filter.value;
            default:
              return false;
          }
        });
        
        // Keep item if:
        // 1. It matches all filters, OR
        // 2. It has children that match filters (to preserve hierarchy)
        const hasMatchingChildren = filteredChildren.length > 0;
        
        if (matchesFilters || hasMatchingChildren) {
          // Update the item's children with filtered results
          return {
            ...item,
            children: filteredChildren
          };
        }
        
        return false;
      }).filter(Boolean) as WorkItemWithChildren[];
    };

    return applyFilters(rootItems);
  }, [workItems, activeFilters]);

  return {
    filterState,
    addFilter,
    removeFilter,
    clearAllFilters,
    filteredWorkItems
  };
}