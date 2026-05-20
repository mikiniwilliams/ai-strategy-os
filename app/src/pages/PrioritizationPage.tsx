import { AIAssistPanel } from "../components/AIAssistPanel";
import { PageHeader } from "../components/PageHeader";
import type { AIArtifactRecord, UseCaseAssistantArtifact } from "../lib/aiTypes";
import type { UseCase } from "../lib/types";

interface PrioritizationPageProps {
  useCases: UseCase[];
  onRegenerate: () => void;
  onUpdate: (useCases: UseCase[]) => void;
  aiArtifact?: AIArtifactRecord<UseCaseAssistantArtifact>;
  isAiLoading: boolean;
  aiError: string;
  onGenerateAi: () => void;
  onAcceptAi: () => void;
  onEditAi: (artifact: UseCaseAssistantArtifact) => void;
}

export function PrioritizationPage({
  useCases,
  onRegenerate,
  onUpdate,
  aiArtifact,
  isAiLoading,
  aiError,
  onGenerateAi,
  onAcceptAi,
  onEditAi
}: PrioritizationPageProps) {
  if (!useCases.length) {
    return (
      <section>
        <PageHeader
          eyebrow="Step 4"
          title="Use-case prioritization"
          description="Generate a ranked set of AI opportunities after readiness is available."
        />
        <article className="panel empty-state">
          <p>Generate at least five use cases from the discovery and readiness inputs.</p>
          <button className="button button-primary" onClick={onRegenerate}>
            Generate prioritized use cases
          </button>
        </article>
      </section>
    );
  }

  function updateUseCase(index: number, field: keyof UseCase, value: string | number) {
    const nextUseCases = useCases.map((useCase, useCaseIndex) =>
      useCaseIndex === index ? { ...useCase, [field]: value } : useCase
    );

    onUpdate(nextUseCases.sort((a, b) => b.score - a.score));
  }

  return (
    <section>
      <PageHeader
        eyebrow="Step 4"
        title="Use-case prioritization"
        description="Edit the ranked opportunities before locking in the roadmap sequence."
      />

      <article className="panel stack-gap">
        <div className="split-row">
          <div>
            <h3>Ranked opportunities</h3>
            <p>Impact, feasibility, and overall score can all be tuned in place.</p>
          </div>
          <button className="button button-secondary" onClick={onRegenerate}>
            Refresh ranking
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Use case</th>
                <th>Impact</th>
                <th>Feasibility</th>
                <th>Score</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {useCases.map((useCase, index) => (
                <tr key={useCase.id}>
                  <td>
                    <input value={useCase.name} onChange={(event) => updateUseCase(index, "name", event.target.value)} />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={useCase.impact}
                      onChange={(event) => updateUseCase(index, "impact", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={useCase.feasibility}
                      onChange={(event) => updateUseCase(index, "feasibility", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={useCase.score}
                      onChange={(event) => updateUseCase(index, "score", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <textarea
                      value={useCase.rationale}
                      onChange={(event) => updateUseCase(index, "rationale", event.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <AIAssistPanel
        artifact={aiArtifact}
        kindLabel="AI use-case assistant"
        isLoading={isAiLoading}
        error={aiError}
        onGenerate={onGenerateAi}
        onAccept={onAcceptAi}
        onEdit={onEditAi}
      />
    </section>
  );
}
