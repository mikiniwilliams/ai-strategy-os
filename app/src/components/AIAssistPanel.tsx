import type { ReactNode } from "react";
import type { AIArtifactContent, AIArtifactKind, AIArtifactRecord } from "../lib/aiTypes";

interface AIAssistPanelProps<T extends AIArtifactContent> {
  artifact?: AIArtifactRecord<T>;
  kindLabel: string;
  isLoading: boolean;
  error: string;
  onGenerate: () => void;
  onAccept: () => void;
  onEdit: (nextValue: T) => void;
}

function renderValue(value: unknown, onChange: (nextValue: unknown) => void, pathKey: string): ReactNode {
  if (Array.isArray(value)) {
    return (
      <div className="ai-list-block">
        {value.map((item, index) => (
          <textarea
            key={`${pathKey}-${index}`}
            value={typeof item === "string" ? item : JSON.stringify(item)}
            onChange={(event) => {
              const next = [...value];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
        ))}
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="ai-object-grid">
        {Object.entries(value).map(([key, childValue]) => (
          <label className="field" key={`${pathKey}-${key}`}>
            <span className="field-label">{key.replace(/([A-Z])/g, " $1")}</span>
            {renderValue(
              childValue,
              (nextChildValue) =>
                onChange({
                  ...(value as Record<string, unknown>),
                  [key]: nextChildValue
                }),
              `${pathKey}-${key}`
            )}
          </label>
        ))}
      </div>
    );
  }

  return (
    <textarea
      value={typeof value === "string" ? value : String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function AIAssistPanel<T extends AIArtifactContent>({
  artifact,
  kindLabel,
  isLoading,
  error,
  onGenerate,
  onAccept,
  onEdit
}: AIAssistPanelProps<T>) {
  return (
    <article className="panel stack-gap ai-panel">
      <div className="split-row">
        <div>
          <h3>{kindLabel}</h3>
          <p>AI suggestions are optional, editable, and stored separately from the deterministic workflow data.</p>
          {artifact ? (
            <p className="form-note">
              Version {artifact.version}
              {artifact.versionCount ? ` of ${artifact.versionCount}` : ""}
              {" · "}
              {artifact.status}
            </p>
          ) : null}
        </div>
        <div className="form-actions">
          <button className="button button-secondary" onClick={onGenerate} type="button">
            {artifact ? "Regenerate" : "Generate"}
          </button>
          {artifact ? (
            <button className="button button-primary" onClick={onAccept} type="button">
              Accept
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? <p className="form-note">Generating AI draft…</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {artifact ? (
        <div className="ai-edit-surface">
          {renderValue(artifact.editable, (nextValue) => onEdit(nextValue as T), "ai-artifact")}
        </div>
      ) : (
        <p className="form-note">Generate an AI draft when you want help sharpening the client narrative.</p>
      )}
    </article>
  );
}
