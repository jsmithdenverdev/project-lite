import { ProjectDashboard } from "./pages";
import ErrorBoundary from "./ErrorBoundary";
import { ProjectProvider } from "./context/ProjectContext";
import { MultiProjectProvider } from "./context/MultiProjectContext";
import { ProviderErrorBoundary } from "./components/ProviderErrorBoundary";

export default function App() {
  return (
    <ProviderErrorBoundary>
      <MultiProjectProvider>
        <ProjectProvider>
          <ErrorBoundary>
            <ProjectDashboard />
          </ErrorBoundary>
        </ProjectProvider>
      </MultiProjectProvider>
    </ProviderErrorBoundary>
  );
}
