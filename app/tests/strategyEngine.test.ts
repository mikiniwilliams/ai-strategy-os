import { describe, expect, it } from "vitest";
import { buildPrioritizedUseCases, buildReadinessAssessment, buildRoadmap } from "../src/lib/strategyEngine";
import { defaultDiscovery } from "../src/lib/defaults";

describe("strategyEngine", () => {
  it("builds a readiness score from discovery inputs", () => {
    const readiness = buildReadinessAssessment({
      ...defaultDiscovery,
      businessGoal: "Improve delivery margin",
      primaryChallenge: "Too many manual workflows",
      successMetric: "10% faster project delivery",
      currentAiMaturity: "piloting",
      dataEnvironment: "developing",
      processDiscipline: "mixed",
      teamReadiness: "curious",
      budgetHorizon: "moderate"
    });

    expect(readiness.overallScore).toBeGreaterThan(50);
    expect(readiness.dimensions).toHaveLength(5);
  });

  it("ranks at least five use cases", () => {
    const readiness = buildReadinessAssessment({
      ...defaultDiscovery,
      businessGoal: "Speed up consulting delivery",
      primaryChallenge: "Researchers spend too much time synthesizing reports",
      successMetric: "Save 6 hours per project"
    });

    const useCases = buildPrioritizedUseCases(defaultDiscovery, readiness);

    expect(useCases.length).toBeGreaterThanOrEqual(5);
    expect(useCases[0].score).toBeGreaterThanOrEqual(useCases[1].score);
  });

  it("creates a three-phase roadmap", () => {
    const readiness = buildReadinessAssessment({
      ...defaultDiscovery,
      businessGoal: "Improve client service",
      primaryChallenge: "Knowledge is fragmented",
      successMetric: "Reduce time to insight"
    });
    const useCases = buildPrioritizedUseCases(defaultDiscovery, readiness);
    const roadmap = buildRoadmap(useCases, null);

    expect(roadmap).toHaveLength(3);
    expect(roadmap[0].timeline).toContain("0-30");
  });
});
