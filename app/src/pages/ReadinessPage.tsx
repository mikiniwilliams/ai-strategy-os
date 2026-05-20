import { AIAssistPanel } from "../components/AIAssistPanel";
import { PageHeader } from "../components/PageHeader";
import type { AIArtifactRecord, ReadinessNarrativeArtifact } from "../lib/aiTypes";
import type { ReadinessAssessment } from "../lib/types";

interface ReadinessPageProps {
  readiness: ReadinessAssessment | null;
  onRegenerate: () => void;
  onUpdate: (assessment: ReadinessAssessment) => void;
  aiArtifact?: AIArtifactRecord<ReadinessNarrativeArtifact>;
  isAiLoading: boolean;
  aiError: string;
  onGenerateAi: () => void;
  onAcceptAi: () => void;
  onEditAi: (artifact: ReadinessNarrativeArtifact) => void;
}

export function ReadinessPage({
  readiness,
  onRegenerate,
  onUpdate,
  aiArtifact,
  isAiLoading,
  aiError,
  onGenerateAi,
  onAcceptAi,
  onEditAi
}: ReadinessPageProps) {
  if (!readiness) {
    return (
      <section>
        <PageHeader
          eyebrow="Step 3"
          title="Readiness assessment"
          description="Generate a readiness score after discovery has been captured."
        />
        <article className="panel empty-state">
          <p>Generate the first readiness assessment to unlock prioritization.</p>
          <button className="button button-primary" onClick={onRegenerate}>
            Generate readiness assessment
          </button>
        </article>
      </section>
    );
  }

  const assessment = readiness;

  function updateDimension(index: number, score: number) {
    const nextDimensions = assessment.dimensions.map((dimension, dimensionIndex) =>
      dimensionIndex === index ? { ...dimension, score } : dimension
    );
    const overallScore = Math.round(
      nextDimensions.reduce((sum, dimension) => sum + dimension.score, 0) / nextDimensions.length
    );

    onUpdate({ ...assessment, dimensions: nextDimensions, overallScore });
  }

  return (
    <section>
      <PageHeader
        eyebrow="Step 3"
        title="Readiness assessment"
        description="Review and edit the generated readiness view before moving into prioritization."
      />

      <div className="metrics-grid">
        <article className="metric-card accent-card">
          <span>Overall score</span>
          <strong>{assessment.overallScore}/100</strong>
          <p>{assessment.category}</p>
        </article>
        <article className="metric-card">
          <span>Recommendation posture</span>
          <strong>{assessment.recommendations.length} actions</strong>
          <p>Use these as the base narrative for the client recommendation.</p>
        </article>
      </div>

      <article className="panel stack-gap">
        <div className="split-row">
          <div>
            <h3>Dimension scores</h3>
            <p>Tune the generated inputs if the engagement team wants to override the default scoring.</p>
          </div>
          <button className="button button-secondary" onClick={onRegenerate}>
            Refresh from discovery
          </button>
        </div>

        {assessment.dimensions.map((dimension, index) => (
          <div className="dimension-row" key={dimension.label}>
            <div>
              <strong>{dimension.label}</strong>
              <p>{dimension.note}</p>
            </div>
            <div className="slider-wrap">
              <input
                type="range"
                min="0"
                max="100"
                value={dimension.score}
                onChange={(event) => updateDimension(index, Number(event.target.value))}
              />
              <span>{dimension.score}</span>
            </div>
          </div>
        ))}

        <label className="field">
          <span className="field-label">Executive summary</span>
          <textarea
            value={assessment.summary}
            onChange={(event) => onUpdate({ ...assessment, summary: event.target.value })}
          />
        </label>
      </article>

      <AIAssistPanel
        artifact={aiArtifact}
        kindLabel="AI readiness narrative"
        isLoading={isAiLoading}
        error={aiError}
        onGenerate={onGenerateAi}
        onAccept={onAcceptAi}
        onEdit={onEditAi}
      />
    </section>
  );
}
