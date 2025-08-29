# Project Lite

A modern, lightweight project management tool built with React and TypeScript that enables hierarchical work item tracking through an intuitive web interface.

## Overview

Project Lite is a single-page application designed to manage complex project structures with hierarchical work items (epics → features → stories → tasks). It provides real-time JSON synchronization, schema validation, and persistent storage through IndexedDB.

## Features

### Core Functionality
- **Multi-Project Management**: Create, switch between, and manage multiple projects with persistent storage
- **Hierarchical Work Items**: Support for nested work items with parent-child relationships
- **Real-time Validation**: Zod schema validation ensures data integrity
- **JSON Import/Export**: Load and save projects as JSON files for portability
- **Interactive Tracking**: Track acceptance criteria completion with checkboxes
- **Status Visualization**: Color-coded status badges and priority indicators

### Work Item Types
- Epic
- Feature  
- Story
- Task
- Bug
- Spike
- Research

### Project Management
- Create new projects with templates
- Import existing JSON project files
- Export projects for backup or sharing
- Auto-save functionality with IndexedDB persistence
- Project metadata tracking (creation date, owner, stakeholders)

## Tech Stack

### Frontend
- **React 19** - UI framework with hooks
- **TypeScript 5.8** - Type safety and developer experience
- **Tailwind CSS 4** - Utility-first styling with PostCSS
- **Lucide React** - Modern icon library

### Build & Development
- **Vite 7** - Fast build tool with HMR
- **SWC** - Rust-based transpiler for performance
- **pnpm** - Efficient package management
- **ESLint 9** - Code quality and consistency

### Data & Validation
- **Zod 4** - Runtime schema validation with TypeScript inference
- **IndexedDB** - Browser-based persistent storage

## Installation

### Prerequisites
- Node.js 18+ 
- pnpm 8+ (install via `npm install -g pnpm`)

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/project-lite.git
cd project-lite

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint
```

### Project Structure

```
project-lite/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Modal/         # Modal dialogs
│   │   ├── ProjectCard/   # Project display and editing
│   │   ├── WorkItemCard/  # Work item display
│   │   └── ...
│   ├── context/           # React context providers
│   │   ├── MultiProjectContext.tsx
│   │   └── ProjectContext.tsx
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   └── ProjectDashboard.tsx
│   ├── schemas.ts         # Zod schemas and types
│   ├── services/          # External services
│   │   └── indexedDB.ts   # Database operations
│   └── utils/             # Helper functions
├── public/                # Static assets
└── CLAUDE.md             # AI assistance guidelines
```

## Usage

### Creating a Project

1. Click "New Project" on the initial screen
2. Enter project details (name, description, type)
3. Select a template or start from scratch
4. Project is automatically saved to browser storage

### Importing Projects

1. Click "Import Existing Project"
2. Select a JSON file or paste JSON content
3. Data is validated against schemas
4. Invalid data shows detailed error messages

### Managing Work Items

1. Use the "+" button to create new work items
2. Set type, status, priority, and other attributes
3. Add acceptance criteria with checkboxes
4. Create child items for hierarchical organization
5. Track dependencies between items

### Exporting Data

1. Navigate to project view
2. Click "Save & Unload Project" 
3. JSON file downloads with current project state
4. File includes all work items and metadata

## Data Schema

The application uses strict Zod schemas for data validation:

### Project Structure
```typescript
{
  project: {
    id: string,
    name: string,
    description?: string,
    type: "software" | "infrastructure" | "design" | "research" | "physical" | "other",
    status: WorkItemStatus,
    priority: "low" | "medium" | "high" | "critical",
    createdDate: string,
    targetDate?: string,
    owner?: string,
    stakeholders?: string[]
  },
  workItems: WorkItem[],
  metadata?: {
    version?: string,
    lastUpdated?: string,
    totalWorkItems?: number,
    completedWorkItems?: number
  }
}
```

### Work Item Structure
```typescript
{
  id: string,
  title: string,
  description?: string,
  type: WorkItemType,
  status: "backlog" | "todo" | "in_progress" | "review" | "testing" | "done" | "blocked" | "cancelled",
  priority: Priority,
  parentId?: string,
  estimatedEffort?: {
    value: number,
    unit: "hours" | "days" | "weeks" | "months" | "story_points" | "t_shirt_size"
  },
  acceptanceCriteria?: [{
    description: string,
    completed: boolean
  }],
  dependencies?: [{
    type: "blocks" | "blocked_by" | "relates_to" | "duplicates" | "clones",
    targetId: string,
    description?: string
  }],
  tags?: string[],
  assignee?: string,
  reporter?: string,
  createdDate?: string,
  dueDate?: string,
  customFields?: Record<string, unknown>
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires IndexedDB support for persistent storage.

## Architecture Decisions

### State Management
- React Context API for global state
- Component-level state for UI interactions
- IndexedDB for persistent storage
- Auto-save with debouncing for performance

### Validation Strategy
- Runtime validation with Zod schemas
- TypeScript types inferred from schemas
- Comprehensive error messages for invalid data
- Defensive rendering to handle edge cases

### Performance Optimizations
- SWC for fast transpilation
- React.memo for expensive components
- Debounced auto-save operations
- Virtual scrolling for large work item lists (planned)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code conventions
- Add tests for new features
- Update documentation as needed
- Ensure all linting passes

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with Vite's React TypeScript template
- Icons provided by Lucide React
- Schema validation powered by Zod
- Styling with Tailwind CSS