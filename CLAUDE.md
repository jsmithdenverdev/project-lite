# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - TypeScript compilation and production build 
- `pnpm lint` - Run ESLint for code quality checks
- `pnpm preview` - Preview production build locally

Use `pnpm` as the package manager (not npm/yarn) as indicated by the lock file and workspace configuration.

## Project Architecture

This is a React + TypeScript project using Vite for build tooling and SWC for fast transpilation. The project is configured as a pnpm workspace.

### Core Structure

- **Single Page Application**: The app renders a `ProjectDashboard` component with tabbed interface
- **Project Management Tool**: Designed to load, edit, and manage JSON project data with hierarchical work items
- **File-based Workflow**: Supports JSON file upload/download with real-time synchronization
- **Schema-driven**: Zod schemas provide runtime validation and compile-time types

### Key Components

- `Dashboard.tsx` - Main component with tabbed interface (Metadata and Project tabs)
- **Metadata Tab**: File upload/download, JSON editor, project data management
- **Project Tab**: Hierarchical work item visualization and interaction
- Supports hierarchical work items (epics → features → stories → tasks)
- Interactive acceptance criteria tracking with checkboxes
- Status and priority visualization with color coding
- Real-time JSON synchronization when project data changes

### Data Model

The application expects JSON input following these key interfaces:
- `ProjectData` - Root structure containing project metadata and work items
- `WorkItem` - Individual tasks/stories/epics with hierarchical relationships via `parentId`
- `Project` - Top-level project information with status, priority, and metadata
- Support for effort estimation, dependencies, acceptance criteria, and custom fields

### UI Framework

- Pure React with hooks (useState, useMemo)
- Tailwind CSS with PostCSS and Autoprefixer for styling and vendor prefixes
- Lucide React icons for consistent iconography
- Responsive design with mobile-first grid layouts
- CSS imports handled through `src/index.css` with Tailwind directives

### State Management

- Component-level state using React hooks
- Tab-based navigation state (metadata vs project view)
- File handling state (upload, download, filename tracking)
- Expandable tree view state for work item hierarchy
- Real-time acceptance criteria completion tracking
- Bi-directional JSON synchronization (changes update JSON in memory)
- Zod schema validation with detailed error reporting
- Error boundary to prevent application crashes
- Defensive rendering to handle invalid data gracefully

### Schema Validation

- **Zod Integration**: All project data is validated using Zod schemas
- **Type Safety**: TypeScript types are inferred from Zod schemas (no duplicate type definitions)
- **Comprehensive Validation**: Validates all fields including enums, required fields, and data types
- **Detailed Error Messages**: Shows specific validation errors with field paths
- **Schema Location**: All schemas defined in `src/schemas.ts`

### File Operations

- **Upload**: JSON file upload with automatic parsing and schema validation
- **Save & Unload Project**: Export current project state to JSON file and reset application
- **Load from Text**: Parse and validate JSON from the direct text editor
- **Direct Editing**: Text editor for manual JSON manipulation with validation
- **Error Prevention**: Invalid data cannot be loaded, preventing app crashes