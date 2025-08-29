import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Filter, Plus, ChevronUp } from 'lucide-react';
import type { FilterValue, FilterOptions } from '../../schemas';

interface FilterBarProps {
  activeFilters: FilterValue[];
  availableFilters: FilterOptions[];
  onAddFilter: (filter: FilterValue) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearAllFilters: () => void;
  className?: string;
}

interface DropdownState {
  isOpen: boolean;
  selectedFilterType: string | null;
}

export default function FilterBar({
  activeFilters,
  availableFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAllFilters,
  className = ''
}: FilterBarProps) {
  const [dropdown, setDropdown] = useState<DropdownState>({ isOpen: false, selectedFilterType: null });
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdown({ isOpen: false, selectedFilterType: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterTypeSelect = (filterType: string) => {
    setDropdown({ isOpen: true, selectedFilterType: filterType });
  };

  const handleFilterValueSelect = (filterType: FilterOptions, value: string, label: string) => {
    // Check if this filter value is already active
    const isActive = activeFilters.some(
      filter => filter.type === filterType.type && filter.value === value
    );

    if (!isActive) {
      const newFilter: FilterValue = {
        id: crypto.randomUUID(),
        label: `${filterType.label}: ${label}`,
        value,
        type: filterType.type
      };
      onAddFilter(newFilter);
    }
    
    setDropdown({ isOpen: false, selectedFilterType: null });
  };

  const getFilterTypeColors = (filterType: string) => {
    switch (filterType) {
      case 'status':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800';
      case 'type':
        return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800';
      case 'priority':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800';
      case 'tags':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800';
      case 'assignee':
        return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';
    }
  };

  // Removed - no longer needed for simplified text-only dropdown

  const selectedFilterType = availableFilters.find(f => f.type === dropdown.selectedFilterType);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
              {activeFilters.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </h3>
          </div>
          
          {/* Mobile collapse toggle */}
          <button
            onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
            className="sm:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            type="button"
            aria-label={isMobileCollapsed ? 'Show filters' : 'Hide filters'}
          >
            {isMobileCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Clear All Button */}
        {activeFilters.length > 0 && (
          <button
            onClick={onClearAllFilters}
            className={`text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors ${
              isMobileCollapsed ? 'hidden sm:block' : ''
            }`}
            type="button"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Collapsible content wrapper for mobile */}
      <div className={`${isMobileCollapsed ? 'hidden sm:block' : ''}`}>
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((filter) => (
              <span
                key={filter.id}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${getFilterTypeColors(filter.type)}`}
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => onRemoveFilter(filter.id)}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                  type="button"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdown({ 
            isOpen: !dropdown.isOpen && !dropdown.selectedFilterType, 
            selectedFilterType: null 
          })}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          type="button"
        >
          <Plus className="w-4 h-4" />
          <span>Add filter</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${dropdown.isOpen ? 'rotate-180' : ''}`} />
        </button>

          {/* Dropdown Content */}
          {dropdown.isOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 md:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            {!dropdown.selectedFilterType ? (
              // Filter Type Selection
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                  Select filter type
                </div>
                {availableFilters.map((filterType) => (
                  <button
                    key={filterType.type}
                    onClick={() => handleFilterTypeSelect(filterType.type)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    type="button"
                  >
                    <span>{filterType.label}</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                ))}
              </div>
            ) : (
              // Filter Value Selection
              selectedFilterType && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {selectedFilterType.label}
                    </span>
                    <button
                      onClick={() => setDropdown({ isOpen: true, selectedFilterType: null })}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      type="button"
                    >
                      Back
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {selectedFilterType.options.map((option) => {
                      const isActive = activeFilters.some(
                        filter => filter.type === selectedFilterType.type && filter.value === option.value
                      );
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleFilterValueSelect(selectedFilterType, option.value, option.label)}
                          disabled={isActive}
                          className={`w-full text-left px-4 py-2.5 text-sm rounded-md transition-colors ${
                            isActive 
                              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          type="button"
                        >
                          {option.label}
                          {isActive && <span className="ml-2 text-xs text-gray-400">(active)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}