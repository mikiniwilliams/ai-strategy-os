import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Create engagement", to: "/engagement/new" },
  { label: "Discovery", to: "/discovery" },
  { label: "Readiness", to: "/readiness" },
  { label: "Use-case priority", to: "/prioritization" },
  { label: "Roadmap", to: "/roadmap" },
  { label: "Export", to: "/export" }
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="eyebrow">AI Strategy OS</span>
          <h1>Consulting workflow for AI strategy engagements</h1>
          <p>Capture client context, score readiness, prioritize value, and ship a client-ready output.</p>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
