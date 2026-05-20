import { listSavedEngagementSummaries, loadEngagementState } from "./persistence";

export const listSavedEngagements = listSavedEngagementSummaries;
export const loadSavedEngagement = loadEngagementState;

export async function upsertSavedEngagement() {
  return undefined;
}
