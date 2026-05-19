export interface UseCaseTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export const useCaseCatalog: UseCaseTemplate[] = [
  {
    id: "proposal-copilot",
    name: "Proposal Copilot",
    description: "Draft tailored proposals, meeting recaps, and executive summaries from existing engagement notes.",
    tags: ["consulting", "sales", "knowledge"]
  },
  {
    id: "research-synthesis",
    name: "Research Synthesis Engine",
    description: "Condense market research, interviews, and reports into consultant-ready briefs.",
    tags: ["research", "analysis", "knowledge"]
  },
  {
    id: "meeting-intelligence",
    name: "Meeting Intelligence",
    description: "Turn discovery calls into action items, risk flags, and stakeholder sentiment snapshots.",
    tags: ["operations", "client-service", "knowledge"]
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation Triage",
    description: "Identify repetitive work and recommend automation candidates across core delivery processes.",
    tags: ["operations", "automation", "process"]
  },
  {
    id: "client-portal-assistant",
    name: "Client Portal Assistant",
    description: "Provide a secure-facing assistant for FAQs, deliverables, and project updates.",
    tags: ["client-service", "experience", "support"]
  },
  {
    id: "knowledge-search",
    name: "Knowledge Search Layer",
    description: "Help teams retrieve prior work, reusable frameworks, and point-of-view documents quickly.",
    tags: ["knowledge", "enablement", "efficiency"]
  }
];
