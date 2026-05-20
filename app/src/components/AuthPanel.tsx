import { useState } from "react";
import { Field } from "./Field";
import type { AuthStatus } from "../lib/types";

interface AuthPanelProps {
  auth: AuthStatus;
  onSignIn: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AuthPanel({ auth, onSignIn, onSignOut }: AuthPanelProps) {
  const [email, setEmail] = useState(auth.email ?? "");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Enter your email to enable secure cloud sync.");
      return;
    }

    await onSignIn(email);
    setMessage("Check your email for the sign-in link.");
  }

  return (
    <article className="panel stack-gap">
      <div className="split-row">
        <div>
          <h3>Secure cloud access</h3>
          <p>
            Supabase Auth is now required for cloud-saved engagements. Local browser mode still works if you
            are not signed in.
          </p>
        </div>
      </div>

      {auth.isAuthenticated ? (
        <div className="saved-engagement-row">
          <div>
            <strong>{auth.email}</strong>
            <p>Signed in for secure, user-scoped engagement storage.</p>
          </div>
          <button className="button button-secondary" onClick={() => void onSignOut()} type="button">
            Sign out
          </button>
        </div>
      ) : (
        <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
          <Field label="Work email" required hint="We use a Supabase magic link for the MVP.">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </Field>
          <div className="form-actions">
            <button className="button button-primary" disabled={auth.isLoading} type="submit">
              {auth.isLoading ? "Sending link…" : "Email me a sign-in link"}
            </button>
          </div>
          {message ? <p className="form-note">{message}</p> : null}
        </form>
      )}
    </article>
  );
}
