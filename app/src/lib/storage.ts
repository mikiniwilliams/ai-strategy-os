import { initialState } from "./defaults";
import type { AppState } from "./types";

const STORAGE_KEY = "ai-strategy-os-state";

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return initialState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return initialState;
  }

  try {
    return { ...initialState, ...JSON.parse(raw) } as AppState;
  } catch {
    return initialState;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
