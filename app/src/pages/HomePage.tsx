import { AuthPanel } from "../components/AuthPanel";
import { Link } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import type { AppState, AuthStatus, SavedEngagementSummary } from "../lib/types";

interface HomePageProps {
  state: AppState;
  savedEngagements: SavedEngagementSummary[];
  onLoadEngagement: (id: string) => void;
  cloudEnabled: boolean;
  isLoadingSavedEngagements: boolean;
  auth: AuthStatus;
  onSignIn: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function HomePage({
  state,
  savedEngagements,
  onLoadEngagement,
  cloudEnabled,
  isLoadingSavedEngagements,
  auth,
  onSignIn,
  onSignOut
}: HomePageProps) {
  const completedSteps = [
    state.engagement ? "Engagement created" : null,
    state.discovery.businessGoal ? "Discovery captured" : null,
    state.readiness ? "Readiness generated" : null,
    state.useCases.length ? "Use cases prioritized" : null,
    state.roadmap.length ? "Roadmap drafted" : null,
    state.exportSummary ? "Export ready" : null
  ].filter(Boolean);

  return (
    <section className="home-page">
      <div className="hero-card">
        <div>
          <span className="eyebrow">Strategy workflow</span>
          <h2>Turn messy client discovery into an AI roadmap in one working session.</h2>
          <p>
            AI Strategy OS gives consultants a structured path from engagement setup through discovery,
            readiness scoring, use-case prioritization, and exportable recommendations.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to="/engagement/new">
            Start new engagement
          </Link>
          <Link className="button button-secondary" to="/discovery">
            Continue workflow
          </Link>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Workflow coverage" value="6 screens" detail="Built for the MVP consultant journey." />
        <MetricCard
          label="Prioritization depth"
          value={`${Math.max(state.useCases.length, 5)} use cases`}
          detail="Generates and ranks at least five AI opportunities."
        />
        <MetricCard
          label="Current progress"
          value={`${completedSteps.length}/6`}
          detail={cloudEnabled ? "Progress syncs to Supabase when available, with local fallback." : "Progress is stored locally until Supabase is enabled."}
        />
      </div>

      <div className="two-column">
        <article className="panel">
          <h3>Core flow</h3>
          <ol className="clean-list ordered">
            <li>Create an engagement and capture the client context.</li>
            <li>Complete a guided discovery questionnaire.</li>
            <li>Review the generated readiness score and recommendations.</li>
            <li>Edit a ranked use-case list and a simple 90-day roadmap.</li>
            <li>Export a client-ready summary to copy or download.</li>
          </ol>
        </article>

        <article className="panel">
          <h3>Current engagement</h3>
          <dl className="definition-list">
            <div>
              <dt>Project</dt>
              <dd>{state.engagement?.projectName ?? "No engagement yet"}</dd>
            </div>
            <div>
              <dt>Client</dt>
              <dd>{state.engagement?.clientName ?? "Not set"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{state.engagement?.status ?? "Draft"}</dd>
            </div>
          </dl>
        </article>
      </div>

      {cloudEnabled ? <AuthPanel auth={auth} onSignIn={onSignIn} onSignOut={onSignOut} /> : null}

      <article className="panel">
        <div className="split-row">
          <div>
            <h3>Saved engagements</h3>
            <p>
              {cloudEnabled
                ? "Supabase-backed workflow records are protected by user authentication and row-level access."
                : "Add Supabase env vars to unlock cloud-saved engagements."}
            </p>
          </div>
        </div>

        {!cloudEnabled ? (
          <p className="form-note">
            Configure `VITE_SUPABASE_URL` and either `VITE_SUPABASE_PUBLISHABLE_KEY` or
            `VITE_SUPABASE_ANON_KEY` to enable cloud persistence.
          </p>
        ) : !auth.isAuthenticated ? (
          <p className="form-note">Sign in above to view and load your cloud-saved engagements.</p>
        ) : isLoadingSavedEngagements ? (
          <p className="form-note">Loading saved engagements…</p>
        ) : savedEngagements.length ? (
          <div className="saved-engagements">
            {savedEngagements.map((engagement) => (
              <div className="saved-engagement-row" key={engagement.id}>
                <div>
                  <strong>{engagement.projectName}</strong>
                  <p>
                    {engagement.clientName} · {engagement.status} · Updated{" "}
                    {new Date(engagement.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => onLoadEngagement(engagement.id)}
                  type="button"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="form-note">No saved engagements yet. Create one and it will sync automatically.</p>
        )}
      </article>
    </section>
  );
}
