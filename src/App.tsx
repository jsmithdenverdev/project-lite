import { ProjectDashboard } from "./pages";
import ErrorBoundary from "./ErrorBoundary";
import { MultiProjectProvider } from "./context/MultiProjectContext";
import { ProviderErrorBoundary } from "./components/ProviderErrorBoundary";

export default function App() {
  return (
    <ProviderErrorBoundary>
      <MultiProjectProvider>
        <ErrorBoundary>
          <ProjectDashboard />
        </ErrorBoundary>
      </MultiProjectProvider>
    </ProviderErrorBoundary>
  );
}
