import { Link } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import type { AppState } from "../lib/types";

interface HomePageProps {
  state: AppState;
}

export function HomePage({ state }: HomePageProps) {
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
          detail="Local progress is persisted in the browser for this MVP."
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
    </section>
  );
}
