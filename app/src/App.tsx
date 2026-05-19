import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CreateEngagementPage } from "./pages/CreateEngagementPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { ExportPage } from "./pages/ExportPage";
import { HomePage } from "./pages/HomePage";
import { PrioritizationPage } from "./pages/PrioritizationPage";
import { ReadinessPage } from "./pages/ReadinessPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { initialState } from "./lib/defaults";
import { buildExportSummary, buildPrioritizedUseCases, buildReadinessAssessment, buildRoadmap } from "./lib/strategyEngine";
import { loadState, saveState } from "./lib/storage";
import type { AppState, DiscoveryForm, Engagement, ExportSummary, ReadinessAssessment, RoadmapItem, UseCase } from "./lib/types";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  function updateEngagement(engagement: Engagement) {
    setState((current) => ({ ...current, engagement }));
  }

  function updateDiscovery(discovery: DiscoveryForm) {
    setState((current) => ({ ...current, discovery, readiness: null, useCases: [], roadmap: [], exportSummary: null }));
  }

  function refreshReadiness() {
    setState((current) => ({
      ...current,
      readiness: buildReadinessAssessment(current.discovery),
      useCases: [],
      roadmap: [],
      exportSummary: null
    }));
  }

  function updateReadiness(readiness: ReadinessAssessment) {
    setState((current) => ({ ...current, readiness, exportSummary: null }));
  }

  function refreshUseCases() {
    setState((current) => {
      const readiness = current.readiness ?? buildReadinessAssessment(current.discovery);

      return {
        ...current,
        readiness,
        useCases: buildPrioritizedUseCases(current.discovery, readiness),
        roadmap: [],
        exportSummary: null
      };
    });
  }

  function updateUseCases(useCases: UseCase[]) {
    setState((current) => ({ ...current, useCases, exportSummary: null }));
  }

  function refreshRoadmap() {
    setState((current) => ({
      ...current,
      roadmap: buildRoadmap(current.useCases, current.engagement),
      exportSummary: null
    }));
  }

  function updateRoadmap(roadmap: RoadmapItem[]) {
    setState((current) => ({ ...current, roadmap, exportSummary: null }));
  }

  function refreshExport() {
    setState((current) => ({
      ...current,
      exportSummary: buildExportSummary(
        current.engagement,
        current.discovery,
        current.readiness,
        current.useCases,
        current.roadmap
      )
    }));
  }

  function updateExportSummary(exportSummary: ExportSummary) {
    setState((current) => ({ ...current, exportSummary }));
  }

  function resetDemoData() {
    setState(initialState);
  }

  return (
    <AppLayout>
      <div className="topbar">
        <p>Local MVP state is saved in browser storage only.</p>
        <button className="button button-ghost" onClick={resetDemoData} type="button">
          Reset local data
        </button>
      </div>

      <Routes>
        <Route path="/" element={<HomePage state={state} />} />
        <Route
          path="/engagement/new"
          element={<CreateEngagementPage engagement={state.engagement} onSave={updateEngagement} />}
        />
        <Route path="/discovery" element={<DiscoveryPage discovery={state.discovery} onSave={updateDiscovery} />} />
        <Route
          path="/readiness"
          element={
            <ReadinessPage
              readiness={state.readiness}
              onRegenerate={refreshReadiness}
              onUpdate={updateReadiness}
            />
          }
        />
        <Route
          path="/prioritization"
          element={
            <PrioritizationPage
              useCases={state.useCases}
              onRegenerate={refreshUseCases}
              onUpdate={updateUseCases}
            />
          }
        />
        <Route
          path="/roadmap"
          element={<RoadmapPage roadmap={state.roadmap} onRegenerate={refreshRoadmap} onUpdate={updateRoadmap} />}
        />
        <Route
          path="/export"
          element={
            <ExportPage
              exportSummary={state.exportSummary}
              onRegenerate={refreshExport}
              onUpdate={updateExportSummary}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
