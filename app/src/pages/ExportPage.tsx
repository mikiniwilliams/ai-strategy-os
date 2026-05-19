import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { ExportSummary } from "../lib/types";

interface ExportPageProps {
  exportSummary: ExportSummary | null;
  onRegenerate: () => void;
  onUpdate: (summary: ExportSummary) => void;
}

export function ExportPage({ exportSummary, onRegenerate, onUpdate }: ExportPageProps) {
  const [status, setStatus] = useState("");

  const filename = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10);
    return `ai-strategy-summary-${stamp}.txt`;
  }, []);

  if (!exportSummary) {
    return (
      <section>
        <PageHeader
          eyebrow="Step 6"
          title="Export summary"
          description="Generate a final client-ready summary that can be copied or downloaded."
        />
        <article className="panel empty-state">
          <p>The final deliverable becomes available after the roadmap is in place.</p>
          <button className="button button-primary" onClick={onRegenerate}>
            Generate export summary
          </button>
        </article>
      </section>
    );
  }

  const summary = exportSummary;

  function handleCopy() {
    navigator.clipboard.writeText(summary.content);
    setStatus("Summary copied to clipboard.");
  }

  function handleDownload() {
    const blob = new Blob([summary.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Summary downloaded.");
  }

  return (
    <section>
      <PageHeader
        eyebrow="Step 6"
        title="Export summary"
        description="Make final edits, then copy or download the deliverable."
      />

      <article className="panel stack-gap">
        <div className="split-row">
          <div>
            <h3>Client-ready output</h3>
            <p>Keep this editable for the MVP so consultants can tailor the final narrative.</p>
          </div>
          <button className="button button-secondary" onClick={onRegenerate}>
            Refresh from current data
          </button>
        </div>

        <textarea
          className="export-textarea"
          value={summary.content}
          onChange={(event) =>
            onUpdate({ content: event.target.value, updatedAt: new Date().toISOString() })
          }
        />

        <div className="form-actions">
          <button className="button button-primary" onClick={handleCopy} type="button">
            Copy summary
          </button>
          <button className="button button-secondary" onClick={handleDownload} type="button">
            Download .txt
          </button>
        </div>

        {status ? <p className="form-note">{status}</p> : null}
      </article>
    </section>
  );
}
