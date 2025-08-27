import ProjectDashboard from "./Dashboard";
import ErrorBoundary from "./ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ProjectDashboard />
    </ErrorBoundary>
  );
}
