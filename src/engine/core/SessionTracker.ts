export interface SimulationSession {
  id: string;
  presetName: string;
  presetId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  initialAgents: number;
  agentsExited: number;
  agentsRemaining: number;
  peakStress: number;
  averageStress: number;
  averageFps: number;
  totalTicks: number;
  panicModeUsed: boolean;
  evacuationComplete: boolean;
}

const STORAGE_KEY = 'crowdflow_sessions';

export function saveSessions(sessions: SimulationSession[]): void {
  try {
    // Keep only last 50 sessions
    const trimmed = sessions.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadSessions(): SimulationSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SimulationSession[];
  } catch {
    return [];
  }
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
