import { useState } from "react";
import { Field } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import type { DiscoveryForm } from "../lib/types";

interface DiscoveryPageProps {
  discovery: DiscoveryForm;
  onSave: (discovery: DiscoveryForm) => void;
}

export function DiscoveryPage({ discovery, onSave }: DiscoveryPageProps) {
  const [form, setForm] = useState(discovery);
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.businessGoal || !form.primaryChallenge || !form.successMetric) {
      setMessage("Business goal, primary challenge, and success metric are required.");
      return;
    }

    onSave(form);
    setMessage("Discovery inputs saved.");
  }

  return (
    <section>
      <PageHeader
        eyebrow="Step 2"
        title="Discovery questionnaire"
        description="Capture the minimum strategy inputs needed to estimate readiness and prioritize use cases."
      />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <Field label="Primary business goal" required hint="What outcome matters most for this client?">
          <input value={form.businessGoal} onChange={(event) => setForm({ ...form, businessGoal: event.target.value })} />
        </Field>

        <Field label="Transformation thesis" hint="What role should AI play in the business?">
          <textarea
            value={form.transformationThesis}
            onChange={(event) => setForm({ ...form, transformationThesis: event.target.value })}
          />
        </Field>

        <Field label="Primary challenge" required>
          <textarea
            value={form.primaryChallenge}
            onChange={(event) => setForm({ ...form, primaryChallenge: event.target.value })}
          />
        </Field>

        <Field label="Current AI maturity">
          <select
            value={form.currentAiMaturity}
            onChange={(event) =>
              setForm({ ...form, currentAiMaturity: event.target.value as DiscoveryForm["currentAiMaturity"] })
            }
          >
            <option value="nascent">Nascent</option>
            <option value="piloting">Piloting</option>
            <option value="scaling">Scaling</option>
          </select>
        </Field>

        <Field label="Data environment">
          <select
            value={form.dataEnvironment}
            onChange={(event) =>
              setForm({ ...form, dataEnvironment: event.target.value as DiscoveryForm["dataEnvironment"] })
            }
          >
            <option value="fragmented">Fragmented</option>
            <option value="developing">Developing</option>
            <option value="strong">Strong</option>
          </select>
        </Field>

        <Field label="Process discipline">
          <select
            value={form.processDiscipline}
            onChange={(event) =>
              setForm({ ...form, processDiscipline: event.target.value as DiscoveryForm["processDiscipline"] })
            }
          >
            <option value="manual">Mostly manual</option>
            <option value="mixed">Mixed</option>
            <option value="structured">Structured</option>
          </select>
        </Field>

        <Field label="Team readiness">
          <select
            value={form.teamReadiness}
            onChange={(event) =>
              setForm({ ...form, teamReadiness: event.target.value as DiscoveryForm["teamReadiness"] })
            }
          >
            <option value="hesitant">Hesitant</option>
            <option value="curious">Curious</option>
            <option value="committed">Committed</option>
          </select>
        </Field>

        <Field label="Budget horizon">
          <select
            value={form.budgetHorizon}
            onChange={(event) =>
              setForm({ ...form, budgetHorizon: event.target.value as DiscoveryForm["budgetHorizon"] })
            }
          >
            <option value="limited">Limited</option>
            <option value="moderate">Moderate</option>
            <option value="funded">Funded</option>
          </select>
        </Field>

        <Field label="Success metric" required>
          <input value={form.successMetric} onChange={(event) => setForm({ ...form, successMetric: event.target.value })} />
        </Field>

        <Field label="Constraints">
          <textarea value={form.constraints} onChange={(event) => setForm({ ...form, constraints: event.target.value })} />
        </Field>

        {message ? <p className="form-note">{message}</p> : null}

        <div className="form-actions">
          <button className="button button-primary" type="submit">
            Save discovery
          </button>
        </div>
      </form>
    </section>
  );
}
