import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, required, hint, children }: FieldProps) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required ? <strong> *</strong> : null}
      </span>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {children}
    </label>
  );
}
