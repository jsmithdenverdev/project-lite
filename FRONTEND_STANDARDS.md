# Frontend Standards and Patterns

This document captures the React and TypeScript patterns, preferences, and coding idioms established in the Project Lite codebase. Use these standards to maintain consistency across frontend projects.

## 1. Project Setup and Build Tools

### Package Manager
- **Use pnpm** exclusively (not npm or yarn)
- Leverage pnpm workspaces for monorepo structures
- Lock file: `pnpm-lock.yaml` must be committed

### Build Configuration
```typescript
// vite.config.ts pattern
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  // Minimal configuration - rely on Vite defaults
});
```

### Essential Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## 2. TypeScript Configuration

### Strict Settings (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true
  }
}
```

### Type Patterns with Zod

**Schema-First Development**: Define Zod schemas as the single source of truth for both runtime validation and TypeScript types.

```typescript
// schemas.ts - Define schemas first
import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'active', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  tags: z.array(z.string()).optional(),
});

// Infer types from schemas - no duplicate definitions
export type Item = z.infer<typeof ItemSchema>;

// Use safeParse for validation
const result = ItemSchema.safeParse(data);
if (result.success) {
  // result.data is typed as Item
} else {
  // result.error contains validation details
}
```

### Type Import Convention
```typescript
// Always use type-only imports for types
import type { Item, Project } from './schemas';
import { ItemSchema } from './schemas'; // Runtime imports separate
```

## 3. React Patterns

### Component Structure
**Use functional components exclusively** (except for error boundaries):

```typescript
// ComponentName.tsx
interface ComponentNameProps {
  // Required props first
  item: Item;
  onSave: (item: Item) => void;
  // Optional props with defaults
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
}

export default function ComponentName({ 
  item, 
  onSave, 
  size = 'md',
  showActions = true 
}: ComponentNameProps) {
  // Component logic
  return <div>...</div>;
}
```

### State Management Patterns

```typescript
// Prefer specific state variables over single object
const [isLoading, setIsLoading] = useState(false);
const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

// Immutable state updates
setExpandedItems(prev => {
  const newSet = new Set(prev);
  newSet.has(id) ? newSet.delete(id) : newSet.add(id);
  return newSet;
});

// useMemo for expensive computations
const processedData = useMemo(() => {
  if (!data) return [];
  return data.filter(item => item.active).sort((a, b) => a.order - b.order);
}, [data]);
```

### Context Pattern
```typescript
// Context + Reducer + Custom Hook pattern
const MyContext = createContext<ContextType | null>(null);

export function MyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <MyContext.Provider value={{ state, dispatch }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
```

### Event Handlers
```typescript
// Naming convention: handle + Action
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // async logic
};

// Props convention: on + Action
interface Props {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}
```

## 4. Styling with Tailwind CSS

### Configuration
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'class' for manual control
  theme: {
    extend: {
      // Custom extensions only when necessary
    },
  },
  plugins: [],
}
```

### Class Patterns
```typescript
// Mobile-first responsive design
<div className="w-full md:w-1/2 lg:w-1/3">

// Dark mode support
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// Conditional classes
<button className={`
  px-4 py-2 rounded
  ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}
  hover:opacity-90 transition-opacity
`}>

// Never use arbitrary values unless absolutely necessary
// Bad: w-[123px]
// Good: w-32 (use closest Tailwind class)
```

## 5. Data Validation with Zod

### Schema Patterns
```typescript
// Nested schemas
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  address: AddressSchema.optional(),
  roles: z.array(z.enum(['admin', 'user', 'guest'])),
});

// Validation with detailed errors
const validate = (data: unknown) => {
  const result = UserSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(
      issue => `${issue.path.join('.')}: ${issue.message}`
    );
    throw new Error(errors.join('\n'));
  }
  return result.data;
};
```

## 6. Error Handling

### Error Boundaries
```typescript
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Defensive Programming
```typescript
// Always validate data before rendering
const renderItem = (item: Item | null): JSX.Element => {
  if (!item?.id || !item?.title) {
    return <div className="text-red-500">Invalid item data</div>;
  }
  
  return <ItemCard item={item} />;
};

// Use optional chaining and nullish coalescing
const value = data?.items?.find(i => i.id === id)?.value ?? defaultValue;
```

## 7. File and Code Organization

### Directory Structure
```
src/
  components/
    ComponentName/
      ComponentName.tsx      # Main component
      types.ts              # Component-specific types
      index.ts              # Barrel export
  hooks/
    useCustomHook.ts        # Custom hooks
  utils/
    helpers.ts              # Utility functions
  schemas.ts                # Zod schemas and types
  App.tsx
  main.tsx
```

### Import Order
```typescript
// 1. React imports
import { useState, useEffect, useMemo } from 'react';

// 2. Third-party libraries
import { z } from 'zod';
import { Plus, Edit3 } from 'lucide-react';

// 3. Internal components
import { Button } from '../Button';
import { Modal } from '../Modal';

// 4. Utils and helpers
import { formatDate } from '../../utils/helpers';

// 5. Types (always as type imports)
import type { Item, Project } from '../../schemas';
```

### Export Patterns
```typescript
// Default export for components
export default function ComponentName() {}

// Named exports for utilities
export { helperFunction, CONSTANTS };

// Barrel exports in index.ts
export { default as ComponentName } from './ComponentName';
export * from './types';
```

## 8. Component Composition

### Container and Presentational Pattern
```typescript
// Container component (handles logic)
function ItemListContainer() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState('');
  
  const filteredItems = useMemo(() => 
    items.filter(item => item.title.includes(filter)),
    [items, filter]
  );
  
  return <ItemList items={filteredItems} onFilterChange={setFilter} />;
}

// Presentational component (pure UI)
function ItemList({ items, onFilterChange }: ItemListProps) {
  return (
    <div>
      <input onChange={e => onFilterChange(e.target.value)} />
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}
```

### Compound Components
```typescript
// Parent component exports related sub-components
export default function Card({ children }: CardProps) {
  return <div className="rounded-lg border p-4">{children}</div>;
}

Card.Header = function CardHeader({ children }: CardHeaderProps) {
  return <div className="border-b pb-2 mb-2">{children}</div>;
};

Card.Body = function CardBody({ children }: CardBodyProps) {
  return <div>{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

## 9. Performance Optimization

### Memoization
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks passed to children
const handleClick = useCallback((id: string) => {
  dispatch({ type: 'SELECT', payload: id });
}, [dispatch]);

// Memoize components when needed
const MemoizedComponent = memo(ExpensiveComponent);
```

### Lazy Loading
```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

## 10. Code Style Guidelines

### Naming Conventions
- **Components**: PascalCase (`UserProfile`, `NavigationBar`)
- **Files**: Match component name (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useLocalStorage`)
- **Event handlers**: 'handle' prefix (`handleClick`, `handleSubmit`)
- **Props callbacks**: 'on' prefix (`onSave`, `onChange`)
- **Types/Interfaces**: PascalCase (`UserData`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)

### TypeScript Specifics
```typescript
// Prefer type inference where safe
const [state, setState] = useState(false); // boolean inferred

// Be explicit for complex types
const [data, setData] = useState<ComplexType | null>(null);

// Use discriminated unions for actions
type Action = 
  | { type: 'SET_DATA'; payload: Data }
  | { type: 'SET_ERROR'; payload: Error }
  | { type: 'RESET' };

// Prefer interfaces for component props
interface Props {
  // props definition
}

// Use types for unions and utility types
type Status = 'idle' | 'loading' | 'success' | 'error';
type PartialUser = Partial<User>;
```

### Comments
- **NO COMMENTS** unless explicitly necessary
- Code should be self-documenting through clear naming
- If a comment is needed, explain "why" not "what"

## 11. Forms and Inputs

### Controlled Components Only
```typescript
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const handleChange = (field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={handleChange('name')}
        className="w-full p-2 border rounded"
      />
    </form>
  );
}
```

### Form Validation
```typescript
// Use Zod for form validation
const FormSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

const handleSubmit = (data: unknown) => {
  const result = FormSchema.safeParse(data);
  if (!result.success) {
    setErrors(result.error.flatten());
    return;
  }
  // Process valid data
};
```

## 12. Icons and Assets

### Lucide React Icons
```typescript
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';

// Consistent sizing
<Plus className="w-4 h-4" />

// With text
<button className="flex items-center gap-2">
  <Save className="w-4 h-4" />
  <span>Save Changes</span>
</button>
```

## 13. Security Considerations

### Never Store Sensitive Data
```typescript
// Bad: Storing sensitive data in localStorage
localStorage.setItem('apiKey', key);

// Good: Use secure backend storage
// Only store non-sensitive session data client-side
```

### Input Sanitization
```typescript
// Always validate and sanitize user input
const sanitizedInput = DOMPurify.sanitize(userInput);

// Use Zod schemas for validation
const result = InputSchema.safeParse(userInput);
```

## 14. Testing Patterns

### Component Testing Structure
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('handles user interaction', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## 15. Dependency Management

### Core Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.24.1",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react-swc": "^3.7.2",
    "typescript": "~5.7.2",
    "vite": "^6.0.5",
    "tailwindcss": "^3.4.17",
    "eslint": "^9.17.0"
  }
}
```

### Adding Dependencies
- Always use `pnpm add` (not npm install)
- Prefer well-maintained, typed packages
- Check bundle size impact before adding
- Pin versions for production dependencies

## Example Component Following All Standards

```typescript
// src/components/TaskCard/TaskCard.tsx
import { useState, useMemo } from 'react';
import { Edit3, Trash2, Check } from 'lucide-react';
import type { Task } from '../../schemas';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  depth?: number;
}

export default function TaskCard({ 
  task, 
  onUpdate, 
  onDelete,
  depth = 0 
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  
  const statusColor = useMemo(() => {
    const colors = {
      pending: 'bg-gray-100 dark:bg-gray-800',
      active: 'bg-blue-100 dark:bg-blue-900',
      completed: 'bg-green-100 dark:bg-green-900',
    };
    return colors[task.status] || colors.pending;
  }, [task.status]);
  
  const handleSave = () => {
    if (!editedTitle.trim()) return;
    onUpdate({ ...task, title: editedTitle });
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };
  
  if (!task?.id || !task?.title) {
    return <div className="text-red-500 text-sm">Invalid task data</div>;
  }
  
  return (
    <div 
      className={`
        rounded-lg border p-4 ${statusColor}
        transition-colors hover:shadow-md
      `}
      style={{ marginLeft: `${depth * 24}px` }}
    >
      {isEditing ? (
        <input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full p-2 border rounded"
          autoFocus
        />
      ) : (
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{task.title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-white/20 rounded"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 hover:bg-red-500/20 rounded"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Usage Instructions

When starting a new frontend project:

1. Copy this document to your project
2. Set up the build tools and dependencies as specified
3. Configure TypeScript with the strict settings
4. Install and configure Tailwind CSS
5. Create the directory structure
6. Follow the patterns for all new components
7. Use Zod for all data validation needs
8. Maintain consistency with these standards

## Updates and Maintenance

This document should be updated when:
- New patterns are established and proven
- Better practices are discovered
- Technology choices change
- Team consensus on changes is reached

Last Updated: Based on Project Lite patterns (2025)