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
import { initialState } from "./lib/defaults";
import { generateAIArtifact } from "./lib/aiClient";
import { validateAIArtifact } from "./lib/aiSchemas";
import type {
  AIArtifactContent,
  AIArtifactKind,
  AIArtifactRecord,
  DiscoverySummaryArtifact,
  ExportExecutiveSummaryArtifact,
  ReadinessNarrativeArtifact,
  RoadmapDraftArtifact,
  UseCaseAssistantArtifact
} from "./lib/aiTypes";
import {
  listSavedEngagementSummaries,
  loadEngagementState,
  loadLatestEngagementState,
  mergeStateWithDefaults,
  saveAIArtifact as saveAIArtifactRecord,
  saveDiscovery as saveDiscoveryRecord,
  saveEngagement as saveEngagementRecord,
  saveExportSummary as saveExportSummaryRecord,
  saveReadiness as saveReadinessRecord,
  saveRoadmap as saveRoadmapRecord,
  saveUseCases as saveUseCasesRecord
} from "./lib/persistence";
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

function buildExecutiveSummarySection(artifact: AIArtifactContent) {
  if (!("executiveSummary" in artifact) || !("recommendation" in artifact) || !("nextSteps" in artifact)) {
    return "";
  }

  return `## AI Executive Summary
${artifact.executiveSummary}

Recommendation: ${artifact.recommendation}

Next steps:
${artifact.nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}
`;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [savedEngagements, setSavedEngagements] = useState<SavedEngagementSummary[]>([]);
  const [isLoadingSavedEngagements, setIsLoadingSavedEngagements] = useState(false);
  const [auth, setAuth] = useState<AuthStatus>({
    email: null,
    isLoading: isSupabaseConfigured,
    isAuthenticated: false
  });
  const [syncStatus, setSyncStatus] = useState(
    isSupabaseConfigured ? "Cloud sync available. Sign in to enable it." : "Supabase is not configured. Using local fallback."
  );
  const [isFallbackMode, setIsFallbackMode] = useState(!isSupabaseConfigured);
  const [aiLoading, setAiLoading] = useState<Partial<Record<AIArtifactKind, boolean>>>({});
  const [aiErrors, setAiErrors] = useState<Partial<Record<AIArtifactKind, string>>>({});
  const hasHydratedRemoteList = useRef(false);
  const hasAttemptedRemoteHydration = useRef(false);
  const discoveryArtifact = state.aiArtifacts.discovery_summary as AIArtifactRecord<DiscoverySummaryArtifact> | undefined;
  const readinessArtifact = state.aiArtifacts.readiness_narrative as AIArtifactRecord<ReadinessNarrativeArtifact> | undefined;
  const useCaseArtifact = state.aiArtifacts.use_case_assistant as AIArtifactRecord<UseCaseAssistantArtifact> | undefined;
  const roadmapArtifact = state.aiArtifacts.roadmap_draft as AIArtifactRecord<RoadmapDraftArtifact> | undefined;
  const exportArtifact = state.aiArtifacts.export_executive_summary as AIArtifactRecord<ExportExecutiveSummaryArtifact> | undefined;

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
      setSyncStatus(email ? `Signed in as ${email}. Supabase is the active source of truth.` : "Cloud sync available. Sign in to enable it.");
      setIsFallbackMode(false);
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
      setSyncStatus(email ? `Signed in as ${email}. Supabase is the active source of truth.` : "Cloud sync available. Sign in to enable it.");
      setIsFallbackMode(false);
      hasHydratedRemoteList.current = false;
      hasAttemptedRemoteHydration.current = false;
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    if (auth.isLoading || !auth.isAuthenticated) {
      setIsLoadingSavedEngagements(false);
      return;
    }

    setIsLoadingSavedEngagements(true);
    hasHydratedRemoteList.current = true;

    void listSavedEngagementSummaries()
      .then((engagements) => {
        setSavedEngagements(engagements);
        setIsFallbackMode(false);
        if (!hasAttemptedRemoteHydration.current && !state.engagement) {
          hasAttemptedRemoteHydration.current = true;

          return loadLatestEngagementState().then((nextState) => {
            if (nextState) {
              setState(mergeStateWithDefaults(nextState));
              setSyncStatus(`Loaded "${nextState.engagement?.projectName ?? "latest engagement"}" from Supabase.`);
            } else {
              setSyncStatus("Supabase is connected. Start a new engagement or load a saved one.");
            }
          });
        }

        setSyncStatus(`Loaded ${engagements.length} Supabase engagement${engagements.length === 1 ? "" : "s"}.`);
      })
      .catch(() => {
        setIsFallbackMode(true);
        setSyncStatus("Supabase could not load saved data. Using local fallback for this session.");
      })
      .finally(() => {
        setIsLoadingSavedEngagements(false);
      });
  }, [auth.isAuthenticated, auth.isLoading, state.engagement]);

  async function persistStep(
    runRemoteSave: () => Promise<void>,
    fallbackMessage: string,
    successMessage: string
  ) {
    if (!isSupabaseConfigured || !auth.isAuthenticated) {
      setIsFallbackMode(true);
      setSyncStatus(fallbackMessage);
      return;
    }

    setSyncStatus("Saving to Supabase…");

    try {
      await runRemoteSave();
      setIsFallbackMode(false);
      setSyncStatus(successMessage);
      const engagements = await listSavedEngagementSummaries();
      setSavedEngagements(engagements);
    } catch {
      setIsFallbackMode(true);
      setSyncStatus(`${fallbackMessage} Supabase is temporarily unavailable.`);
    }
  }

  async function persistAIArtifact(artifact: AIArtifactRecord) {
    if (!state.engagement) {
      return artifact;
    }

    let savedArtifact = artifact;

    await persistStep(
      async () => {
        const row = await saveAIArtifactRecord(state.engagement!.id, artifact);
        savedArtifact = {
          ...artifact,
          id: row.id,
          generatedAt: row.updated_at,
          version: row.version_number,
          regenerationGroupId: row.regeneration_group_id,
          parentArtifactId: row.parent_artifact_id,
          versionCount: (artifact.versionCount ?? 0) + 1
        };
      },
      "AI draft saved locally as fallback.",
      "AI draft saved to Supabase."
    );

    return savedArtifact;
  }

  async function generateAssist(kind: AIArtifactKind) {
    setAiLoading((current) => ({ ...current, [kind]: true }));
    setAiErrors((current) => ({ ...current, [kind]: "" }));

    try {
      const artifact = validateAIArtifact(kind, await generateAIArtifact(kind, state));
      const nextRecord: AIArtifactRecord = {
        kind,
        raw: artifact,
        editable: artifact,
        status: "draft",
        generatedAt: new Date().toISOString(),
        version: (state.aiArtifacts[kind]?.version ?? 0) + 1,
        regenerationGroupId: state.aiArtifacts[kind]?.regenerationGroupId ?? crypto.randomUUID(),
        parentArtifactId: state.aiArtifacts[kind]?.id ?? null,
        versionCount: (state.aiArtifacts[kind]?.versionCount ?? 0) + 1
      };

      const persistedArtifact = await persistAIArtifact(nextRecord);

      setState((current) => ({
        ...current,
        aiArtifacts: {
          ...current.aiArtifacts,
          [kind]: persistedArtifact
        }
      }));
    } catch (error) {
      setAiErrors((current) => ({
        ...current,
        [kind]: error instanceof Error ? error.message : "AI generation failed."
      }));
    } finally {
      setAiLoading((current) => ({ ...current, [kind]: false }));
    }
  }

  async function acceptAssist(kind: AIArtifactKind) {
    const artifact = state.aiArtifacts[kind];

    if (!artifact) {
      return;
    }

    const nextArtifact: AIArtifactRecord = {
      ...artifact,
      editable: artifact.raw,
      status: "accepted",
      version: artifact.version + 1,
      parentArtifactId: artifact.id ?? null,
      versionCount: (artifact.versionCount ?? artifact.version) + 1
    };

    const persistedArtifact = await persistAIArtifact(nextArtifact);

    setState((current) => {
      const nextState: AppState = {
        ...current,
        aiArtifacts: {
          ...current.aiArtifacts,
          [kind]: persistedArtifact
        }
      };

      if (kind === "export_executive_summary" && current.exportSummary) {
        nextState.exportSummary = {
          ...current.exportSummary,
          content: `${buildExecutiveSummarySection(persistedArtifact.editable)}\n${current.exportSummary.content}`.trim(),
          updatedAt: new Date().toISOString()
        };
      }

      return nextState;
    });
  }

  async function editAssist(kind: AIArtifactKind, editable: AIArtifactContent) {
    const artifact = state.aiArtifacts[kind];

    if (!artifact) {
      return;
    }

    const nextArtifact: AIArtifactRecord = {
      ...artifact,
      editable: validateAIArtifact(kind, editable),
      status: "edited",
      version: artifact.version + 1,
      parentArtifactId: artifact.id ?? null,
      versionCount: (artifact.versionCount ?? artifact.version) + 1
    };

    const persistedArtifact = await persistAIArtifact(nextArtifact);

    setState((current) => ({
      ...current,
      aiArtifacts: {
        ...current.aiArtifacts,
        [kind]: persistedArtifact
      }
    }));
  }

  async function updateEngagement(engagement: Engagement) {
    setState((current) => ({ ...current, engagement }));
    await persistStep(
      async () => {
        await saveEngagementRecord(engagement);
      },
      `Saved "${engagement.projectName}" locally as fallback.`,
      `Saved "${engagement.projectName}" to Supabase.`
    );
  }

  async function updateDiscovery(discovery: DiscoveryForm) {
    const engagementId = state.engagement?.id;
    const nextState = {
      ...state,
      discovery,
      readiness: null,
      useCases: [],
      roadmap: [],
      exportSummary: null,
      aiArtifacts: {}
    };

    setState(nextState);

    if (!engagementId) {
      setIsFallbackMode(true);
      setSyncStatus("Create an engagement first. Discovery is stored locally for now.");
      return;
    }

    await persistStep(
      async () => {
        await saveDiscoveryRecord(engagementId, discovery);
      },
      "Discovery saved locally as fallback.",
      "Discovery saved to Supabase."
    );
  }

  async function refreshReadiness() {
    const nextReadiness = buildReadinessAssessment(state.discovery);
    setState((current) => ({
      ...current,
      readiness: nextReadiness,
      useCases: [],
      roadmap: [],
      exportSummary: null,
      aiArtifacts: {
        ...current.aiArtifacts,
        readiness_narrative: undefined,
        use_case_assistant: undefined,
        roadmap_draft: undefined,
        export_executive_summary: undefined
      }
    }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Readiness generated locally. Create an engagement to sync it.");
      return;
    }

    await persistStep(
      async () => {
        await saveReadinessRecord(state.engagement!.id, nextReadiness);
      },
      "Readiness generated and saved locally as fallback.",
      "Readiness assessment saved to Supabase."
    );
  }

  async function updateReadiness(readiness: ReadinessAssessment) {
    setState((current) => ({
      ...current,
      readiness,
      exportSummary: null,
      aiArtifacts: {
        ...current.aiArtifacts,
        readiness_narrative: undefined,
        use_case_assistant: undefined,
        roadmap_draft: undefined,
        export_executive_summary: undefined
      }
    }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Readiness edits are stored locally until an engagement is available.");
      return;
    }

    await persistStep(
      async () => {
        await saveReadinessRecord(state.engagement!.id, readiness);
      },
      "Readiness edits saved locally as fallback.",
      "Readiness assessment updated in Supabase."
    );
  }

  async function refreshUseCases() {
    const readiness = state.readiness ?? buildReadinessAssessment(state.discovery);
    const nextUseCases = buildPrioritizedUseCases(state.discovery, readiness);

    setState((current) => ({
      ...current,
      readiness,
      useCases: nextUseCases,
      roadmap: [],
      exportSummary: null,
      aiArtifacts: {
        ...current.aiArtifacts,
        use_case_assistant: undefined,
        roadmap_draft: undefined,
        export_executive_summary: undefined
      }
    }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Use cases generated locally. Create an engagement to sync them.");
      return;
    }

    await persistStep(
      async () => {
        await saveReadinessRecord(state.engagement!.id, readiness);
        await saveUseCasesRecord(state.engagement!.id, nextUseCases);
      },
      "Use cases saved locally as fallback.",
      "Use-case prioritization saved to Supabase."
    );
  }

  async function updateUseCases(useCases: UseCase[]) {
    const rankedUseCases = [...useCases].sort((a, b) => b.score - a.score);
    setState((current) => ({
      ...current,
      useCases: rankedUseCases,
      exportSummary: null,
      aiArtifacts: {
        ...current.aiArtifacts,
        roadmap_draft: undefined,
        export_executive_summary: undefined
      }
    }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Use-case edits are stored locally until an engagement is available.");
      return;
    }

    await persistStep(
      async () => {
        await saveUseCasesRecord(state.engagement!.id, rankedUseCases);
      },
      "Use-case edits saved locally as fallback.",
      "Use-case prioritization updated in Supabase."
    );
  }

  async function refreshRoadmap() {
    const nextRoadmap = buildRoadmap(state.useCases, state.engagement);
    setState((current) => ({
      ...current,
      roadmap: nextRoadmap,
      exportSummary: null,
      aiArtifacts: {
        ...current.aiArtifacts,
        roadmap_draft: undefined,
        export_executive_summary: undefined
      }
    }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Roadmap generated locally. Create an engagement to sync it.");
      return;
    }

    await persistStep(
      async () => {
        await saveRoadmapRecord(state.engagement!.id, nextRoadmap);
      },
      "Roadmap saved locally as fallback.",
      "Roadmap saved to Supabase."
    );
  }

  async function updateRoadmap(roadmap: RoadmapItem[]) {
    setState((current) => ({
      ...current,
      roadmap,
      exportSummary: null,
      aiArtifacts: {
        ...current.aiArtifacts,
        export_executive_summary: undefined
      }
    }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Roadmap edits are stored locally until an engagement is available.");
      return;
    }

    await persistStep(
      async () => {
        await saveRoadmapRecord(state.engagement!.id, roadmap);
      },
      "Roadmap edits saved locally as fallback.",
      "Roadmap updated in Supabase."
    );
  }

  async function refreshExport() {
    const nextExportSummary = buildExportSummary(
      state.engagement,
      state.discovery,
      state.readiness,
      state.useCases,
      state.roadmap
    );

    setState((current) => ({
      ...current,
      exportSummary: nextExportSummary,
      aiArtifacts: {
        ...current.aiArtifacts,
        export_executive_summary: undefined
      }
    }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Export summary generated locally. Create an engagement to sync it.");
      return;
    }

    await persistStep(
      async () => {
        await saveExportSummaryRecord(state.engagement!.id, nextExportSummary);
      },
      "Export summary saved locally as fallback.",
      "Export summary saved to Supabase."
    );
  }

  async function updateExportSummary(exportSummary: ExportSummary) {
    setState((current) => ({ ...current, exportSummary }));

    if (!state.engagement) {
      setIsFallbackMode(true);
      setSyncStatus("Export edits are stored locally until an engagement is available.");
      return;
    }

    await persistStep(
      async () => {
        await saveExportSummaryRecord(state.engagement!.id, exportSummary);
      },
      "Export summary edits saved locally as fallback.",
      "Export summary updated in Supabase."
    );
  }

  function resetDemoData() {
    setState(initialState);
    setSyncStatus("Reset the in-browser working state.");
  }

  function handleLoadEngagement(id: string) {
    if (!isSupabaseConfigured || !auth.isAuthenticated) {
      return;
    }

    setSyncStatus("Loading engagement from Supabase…");

    void loadEngagementState(id)
      .then((nextState) => {
        if (!nextState) {
          setSyncStatus("That engagement could not be found in Supabase.");
          return;
        }

        setState(mergeStateWithDefaults(nextState));
        setIsFallbackMode(false);
        setSyncStatus(`Loaded "${nextState.engagement?.projectName ?? "engagement"}" from Supabase.`);
      })
      .catch(() => {
        setIsFallbackMode(true);
        setSyncStatus("The app could not load that engagement from Supabase. Local fallback is still active.");
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
    setIsFallbackMode(true);
    setSyncStatus("Signed out. Local fallback mode is still available.");
  }

  return (
    <AppLayout>
      <div className="topbar">
        <p>
          {syncStatus}
          {isFallbackMode ? " Fallback mode is using local browser storage." : ""}
        </p>
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
          element={<CreateEngagementPage key={state.engagement?.id ?? "new"} engagement={state.engagement} onSave={updateEngagement} />}
        />
        <Route
          path="/discovery"
          element={
            <DiscoveryPage
              key={state.engagement?.id ?? "discovery"}
              discovery={state.discovery}
              onSave={updateDiscovery}
              aiArtifact={discoveryArtifact}
              isAiLoading={Boolean(aiLoading.discovery_summary)}
              aiError={aiErrors.discovery_summary ?? ""}
              onGenerateAi={() => void generateAssist("discovery_summary")}
              onAcceptAi={() => void acceptAssist("discovery_summary")}
              onEditAi={(value) => void editAssist("discovery_summary", value)}
            />
          }
        />
        <Route
          path="/readiness"
          element={
            <ReadinessPage
              readiness={state.readiness}
              onRegenerate={refreshReadiness}
              onUpdate={updateReadiness}
              aiArtifact={readinessArtifact}
              isAiLoading={Boolean(aiLoading.readiness_narrative)}
              aiError={aiErrors.readiness_narrative ?? ""}
              onGenerateAi={() => void generateAssist("readiness_narrative")}
              onAcceptAi={() => void acceptAssist("readiness_narrative")}
              onEditAi={(value) => void editAssist("readiness_narrative", value)}
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
              aiArtifact={useCaseArtifact}
              isAiLoading={Boolean(aiLoading.use_case_assistant)}
              aiError={aiErrors.use_case_assistant ?? ""}
              onGenerateAi={() => void generateAssist("use_case_assistant")}
              onAcceptAi={() => void acceptAssist("use_case_assistant")}
              onEditAi={(value) => void editAssist("use_case_assistant", value)}
            />
          }
        />
        <Route
          path="/roadmap"
          element={
            <RoadmapPage
              roadmap={state.roadmap}
              onRegenerate={refreshRoadmap}
              onUpdate={updateRoadmap}
              aiArtifact={roadmapArtifact}
              isAiLoading={Boolean(aiLoading.roadmap_draft)}
              aiError={aiErrors.roadmap_draft ?? ""}
              onGenerateAi={() => void generateAssist("roadmap_draft")}
              onAcceptAi={() => void acceptAssist("roadmap_draft")}
              onEditAi={(value) => void editAssist("roadmap_draft", value)}
            />
          }
        />
        <Route
          path="/export"
          element={
            <ExportPage
              exportSummary={state.exportSummary}
              onRegenerate={refreshExport}
              onUpdate={updateExportSummary}
              aiArtifact={exportArtifact}
              isAiLoading={Boolean(aiLoading.export_executive_summary)}
              aiError={aiErrors.export_executive_summary ?? ""}
              onGenerateAi={() => void generateAssist("export_executive_summary")}
              onAcceptAi={() => void acceptAssist("export_executive_summary")}
              onEditAi={(value) => void editAssist("export_executive_summary", value)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
