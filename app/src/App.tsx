import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CreateEngagementPage } from "./pages/CreateEngagementPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { ExportPage } from "./pages/ExportPage";
import { HomePage } from "./pages/HomePage";
import { PrioritizationPage } from "./pages/PrioritizationPage";
import { ReadinessPage } from "./pages/ReadinessPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { listSavedEngagements, loadSavedEngagement, upsertSavedEngagement } from "./lib/cloudStorage";
import { initialState } from "./lib/defaults";
import { buildExportSummary, buildPrioritizedUseCases, buildReadinessAssessment, buildRoadmap } from "./lib/strategyEngine";
import { loadState, saveState } from "./lib/storage";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type {
  AppState,
  AuthStatus,
  DiscoveryForm,
  Engagement,
  ExportSummary,
  ReadinessAssessment,
  RoadmapItem,
  SavedEngagementSummary,
  UseCase
} from "./lib/types";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [savedEngagements, setSavedEngagements] = useState<SavedEngagementSummary[]>([]);
  const [isLoadingSavedEngagements, setIsLoadingSavedEngagements] = useState(isSupabaseConfigured);
  const [auth, setAuth] = useState<AuthStatus>({
    email: null,
    isLoading: isSupabaseConfigured,
    isAuthenticated: false
  });
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? "Cloud sync available. Sign in to enable it." : "Local-only mode.");
  const hasHydratedRemoteList = useRef(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email ?? null;
      setAuth({
        email,
        isLoading: false,
        isAuthenticated: Boolean(data.session?.user)
      });
      setSyncStatus(email ? `Signed in as ${email}. Cloud sync enabled.` : "Cloud sync available. Sign in to enable it.");
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null;
      setAuth({
        email,
        isLoading: false,
        isAuthenticated: Boolean(session?.user)
      });
      setSyncStatus(email ? `Signed in as ${email}. Cloud sync enabled.` : "Cloud sync available. Sign in to enable it.");
      hasHydratedRemoteList.current = false;
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || hasHydratedRemoteList.current) {
      return;
    }

    if (auth.isLoading || !auth.isAuthenticated) {
      setIsLoadingSavedEngagements(false);
      return;
    }

    hasHydratedRemoteList.current = true;
    setIsLoadingSavedEngagements(true);

    void listSavedEngagements()
      .then((engagements) => {
        setSavedEngagements(engagements);
        setSyncStatus(`Loaded ${engagements.length} cloud engagement${engagements.length === 1 ? "" : "s"}.`);
      })
      .catch(() => {
        setSyncStatus("Supabase auth is active, but the app could not load your saved engagements.");
      })
      .finally(() => {
        setIsLoadingSavedEngagements(false);
      });
  }, [auth.isAuthenticated, auth.isLoading]);

  useEffect(() => {
    if (!isSupabaseConfigured || !state.engagement || !auth.isAuthenticated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void upsertSavedEngagement(state)
        .then(() => {
          setSyncStatus(`Synced "${state.engagement?.projectName}" to Supabase.`);
          return listSavedEngagements();
        })
        .then((engagements) => {
          setSavedEngagements(engagements);
        })
        .catch(() => {
          setSyncStatus("Supabase sync failed. Local browser storage is still active.");
        });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [auth.isAuthenticated, state]);

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

  function handleLoadEngagement(id: string) {
    if (!isSupabaseConfigured || !auth.isAuthenticated) {
      return;
    }

    setSyncStatus("Loading engagement from Supabase…");

    void loadSavedEngagement(id)
      .then((nextState) => {
        if (!nextState) {
          setSyncStatus("That engagement could not be found in Supabase.");
          return;
        }

        setState(nextState);
        setSyncStatus(`Loaded "${nextState.engagement?.projectName ?? "engagement"}" from Supabase.`);
      })
      .catch(() => {
        setSyncStatus("The app could not load that engagement from Supabase.");
      });
  }

  async function handleSignIn(email: string) {
    if (!supabase) {
      return;
    }

    setAuth((current) => ({ ...current, isLoading: true }));
    setSyncStatus("Sending Supabase sign-in link…");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    setAuth((current) => ({ ...current, isLoading: false }));

    if (error) {
      setSyncStatus("Supabase could not send the sign-in link. Check your Auth settings and try again.");
      throw error;
    }

    setSyncStatus(`Magic link sent to ${email}.`);
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSavedEngagements([]);
    setSyncStatus("Signed out. Local browser mode is still available.");
  }

  return (
    <AppLayout>
      <div className="topbar">
        <p>{syncStatus}</p>
        <button className="button button-ghost" onClick={resetDemoData} type="button">
          Reset local data
        </button>
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              state={state}
              savedEngagements={savedEngagements}
              onLoadEngagement={handleLoadEngagement}
              cloudEnabled={isSupabaseConfigured}
              isLoadingSavedEngagements={isLoadingSavedEngagements}
              auth={auth}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
            />
          }
        />
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
