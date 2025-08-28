import { ProjectDashboard } from "./pages";
import ErrorBoundary from "./ErrorBoundary";
import { ProjectProvider } from "./context/ProjectContext";

export default function App() {
  return (
    <ErrorBoundary>
      <ProjectProvider>
        <ProjectDashboard />
      </ProjectProvider>
    </ErrorBoundary>
  );
}
