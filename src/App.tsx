import { ProjectDashboard } from "./pages";
import ErrorBoundary from "./ErrorBoundary";
import { ProjectProvider } from "./context/ProjectContext";
import { ProviderErrorBoundary } from "./components/ProviderErrorBoundary";

export default function App() {
  return (
    <ProviderErrorBoundary>
      <ProjectProvider>
        <ErrorBoundary>
          <ProjectDashboard />
        </ErrorBoundary>
      </ProjectProvider>
    </ProviderErrorBoundary>
  );
}
