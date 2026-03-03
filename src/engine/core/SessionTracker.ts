import type { PresetScenario } from './types';

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
const CUSTOM_SCENARIOS_KEY = 'crowdflow_custom_scenarios';

// --- Session CRUD ---

export function saveSessions(sessions: SimulationSession[]): void {
  try {
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

export function deleteSession(id: string): void {
  const sessions = loadSessions().filter(s => s.id !== id);
  saveSessions(sessions);
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Custom Scenario CRUD ---

export function saveCustomScenario(scenario: PresetScenario): void {
  try {
    const existing = loadCustomScenarios();
    // Replace if same id, otherwise append
    const idx = existing.findIndex(s => s.id === scenario.id);
    if (idx >= 0) existing[idx] = scenario;
    else existing.push(scenario);
    localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(existing));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadCustomScenarios(): PresetScenario[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SCENARIOS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PresetScenario[];
  } catch {
    return [];
  }
}

export function deleteCustomScenario(id: string): void {
  const scenarios = loadCustomScenarios().filter(s => s.id !== id);
  localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(scenarios));
}

export function exportSessionsCSV(sessions: SimulationSession[]): string {
  const headers = [
    'Scenario', 'Date', 'Duration (s)', 'Initial Agents', 'Agents Exited',
    'Evacuation Rate (%)', 'Peak Stress', 'Avg Stress', 'Avg FPS', 'Ticks',
    'Panic Used', 'Evacuation Complete'
  ];
  const rows = sessions.map(s => [
    s.presetName,
    new Date(s.startTime).toISOString(),
    (s.durationMs / 1000).toFixed(1),
    s.initialAgents,
    s.agentsExited,
    s.initialAgents > 0 ? ((s.agentsExited / s.initialAgents) * 100).toFixed(1) : '0',
    (s.peakStress * 100).toFixed(1),
    (s.averageStress * 100).toFixed(1),
    s.averageFps.toFixed(0),
    s.totalTicks,
    s.panicModeUsed ? 'Yes' : 'No',
    s.evacuationComplete ? 'Yes' : 'No',
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
