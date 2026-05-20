import { AIAssistPanel } from "../components/AIAssistPanel";
import { PageHeader } from "../components/PageHeader";
import type { AIArtifactRecord, RoadmapDraftArtifact } from "../lib/aiTypes";
import type { RoadmapItem } from "../lib/types";

interface RoadmapPageProps {
  roadmap: RoadmapItem[];
  onRegenerate: () => void;
  onUpdate: (roadmap: RoadmapItem[]) => void;
  aiArtifact?: AIArtifactRecord<RoadmapDraftArtifact>;
  isAiLoading: boolean;
  aiError: string;
  onGenerateAi: () => void;
  onAcceptAi: () => void;
  onEditAi: (artifact: RoadmapDraftArtifact) => void;
}

export function RoadmapPage({
  roadmap,
  onRegenerate,
  onUpdate,
  aiArtifact,
  isAiLoading,
  aiError,
  onGenerateAi,
  onAcceptAi,
  onEditAi
}: RoadmapPageProps) {
  if (!roadmap.length) {
    return (
      <section>
        <PageHeader
          eyebrow="Step 5"
          title="Roadmap output"
          description="Generate a simple 90-day roadmap after the use cases have been prioritized."
        />
        <article className="panel empty-state">
          <p>Create a lightweight roadmap that can be refined before export.</p>
          <button className="button button-primary" onClick={onRegenerate}>
            Generate roadmap
          </button>
        </article>
      </section>
    );
  }

  function updateItem(index: number, field: keyof RoadmapItem, value: string) {
    const nextRoadmap = roadmap.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    );

    onUpdate(nextRoadmap);
  }

  return (
    <section>
      <PageHeader
        eyebrow="Step 5"
        title="Roadmap output"
        description="Edit the generated roadmap so the recommendation matches the engagement narrative."
      />

      <article className="panel stack-gap">
        <div className="split-row">
          <div>
            <h3>90-day roadmap</h3>
            <p>Three phases keep the MVP recommendation concrete without turning into a full PMO artifact.</p>
          </div>
          <button className="button button-secondary" onClick={onRegenerate}>
            Refresh roadmap
          </button>
        </div>

        {roadmap.map((item, index) => (
          <div className="roadmap-card" key={item.id}>
            <div className="roadmap-meta">
              <input value={item.phase} onChange={(event) => updateItem(index, "phase", event.target.value)} />
              <input value={item.timeline} onChange={(event) => updateItem(index, "timeline", event.target.value)} />
            </div>
            <textarea value={item.objective} onChange={(event) => updateItem(index, "objective", event.target.value)} />
            <textarea
              value={item.deliverables}
              onChange={(event) => updateItem(index, "deliverables", event.target.value)}
            />
          </div>
        ))}
      </article>

      <AIAssistPanel
        artifact={aiArtifact}
        kindLabel="AI roadmap draft"
        isLoading={isAiLoading}
        error={aiError}
        onGenerate={onGenerateAi}
        onAccept={onAcceptAi}
        onEdit={onEditAi}
      />
    </section>
  );
}
