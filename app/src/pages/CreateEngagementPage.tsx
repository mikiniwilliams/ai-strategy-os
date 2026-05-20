import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Field } from "../components/Field";
import type { Engagement } from "../lib/types";

interface CreateEngagementPageProps {
  engagement: Engagement | null;
  onSave: (engagement: Engagement) => void;
}

export function CreateEngagementPage({ engagement, onSave }: CreateEngagementPageProps) {
  const [form, setForm] = useState<Engagement>(
    engagement ?? {
      id: crypto.randomUUID(),
      projectName: "",
      clientName: "",
      sponsor: "",
      industry: "",
      status: "Draft",
      notes: "",
      createdAt: new Date().toISOString()
    }
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (engagement) {
      setForm(engagement);
    }
  }, [engagement]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.projectName || !form.clientName || !form.sponsor) {
      setError("Project name, client name, and executive sponsor are required.");
      return;
    }

    setError("");
    onSave(form);
  }

  return (
    <section>
      <PageHeader
        eyebrow="Step 1"
        title="Create engagement"
        description="Set the minimum client context needed to anchor the rest of the workflow."
      />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <Field label="Engagement name" required>
          <input
            value={form.projectName}
            onChange={(event) => setForm({ ...form, projectName: event.target.value })}
          />
        </Field>

        <Field label="Client name" required>
          <input
            value={form.clientName}
            onChange={(event) => setForm({ ...form, clientName: event.target.value })}
          />
        </Field>

        <Field label="Executive sponsor" required>
          <input value={form.sponsor} onChange={(event) => setForm({ ...form, sponsor: event.target.value })} />
        </Field>

        <Field label="Industry">
          <input value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} />
        </Field>

        <Field label="Status">
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option>Draft</option>
            <option>In discovery</option>
            <option>Recommendation ready</option>
          </select>
        </Field>

        <Field label="Notes">
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </Field>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="button button-primary" type="submit">
            Save engagement
          </button>
        </div>
      </form>
    </section>
  );
}
