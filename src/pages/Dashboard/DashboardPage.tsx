import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Section } from '../../components/layout/Section';
import {
  SimulationSession,
  loadSessions,
  deleteSession,
  clearSessions,
  exportSessionsCSV,
} from '../../engine/core/SessionTracker';

type SortField = 'date' | 'evacRate' | 'duration' | 'fps' | 'stress';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SimulationSession[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [filterScenario, setFilterScenario] = useState<string>('all');

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const handleClear = () => {
    if (!window.confirm('Clear all session data? This cannot be undone.')) return;
    clearSessions();
    setSessions([]);
  };

  const handleDelete = useCallback((id: string) => {
    deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleExportCSV = () => {
    const csv = exportSessionsCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crowdflow_sessions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get unique scenario names for filter
  const scenarioNames = [...new Set(sessions.map(s => s.presetName))];

  // Filter
  const filtered = filterScenario === 'all'
    ? sessions
    : sessions.filter(s => s.presetName === filterScenario);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'date': return b.startTime - a.startTime;
      case 'evacRate': {
        const rA = a.initialAgents > 0 ? a.agentsExited / a.initialAgents : 0;
        const rB = b.initialAgents > 0 ? b.agentsExited / b.initialAgents : 0;
        return rB - rA;
      }
      case 'duration': return b.durationMs - a.durationMs;
      case 'fps': return b.averageFps - a.averageFps;
      case 'stress': return b.peakStress - a.peakStress;
      default: return 0;
    }
  });

  const totalRuns = sessions.length;
  const totalExited = sessions.reduce((sum, s) => sum + s.agentsExited, 0);
  const totalSimulated = sessions.reduce((sum, s) => sum + s.initialAgents, 0);
  const avgEvacRate = totalSimulated > 0 ? ((totalExited / totalSimulated) * 100).toFixed(1) : '0';
  const avgFps = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.averageFps, 0) / sessions.length).toFixed(0)
    : '0';
  const completedRuns = sessions.filter(s => s.evacuationComplete).length;
  const avgStress = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.averageStress, 0) / sessions.length * 100).toFixed(0)
    : '0';
  const totalTimeMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);

  return (
    <PageLayout>
      <Section>
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-white/30 uppercase tracking-widest">Live Data</span>
          </div>
          <h1 className="text-6xl font-black mb-5 tracking-tight">
            Simulation <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-white/35 text-lg font-light max-w-2xl">
            Real performance data from your simulation runs. Every metric here comes from
            actual sessions — no premade data.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-6 opacity-20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-white/20">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white/40 mb-3">No sessions recorded yet</h2>
            <p className="text-sm text-white/25 mb-8 max-w-md mx-auto">
              Run a simulation in the Simulator page — press Play, let it run for a few seconds,
              then Pause or Reset. Your session data will appear here automatically.
            </p>
            <Link
              to="/simulator"
              className="inline-flex items-center h-11 px-8 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-sm font-medium ring-1 ring-cyan-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
            >
              Go to Simulator
            </Link>
          </div>
        ) : (
          <>
            {/* Overview stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <BigStat label="Total Runs" value={totalRuns} color="from-cyan-500/10" />
              <BigStat label="Agents Evacuated" value={totalExited.toLocaleString()} color="from-emerald-500/10" />
              <BigStat label="Evacuation Rate" value={`${avgEvacRate}%`} color="from-blue-500/10" />
              <BigStat label="Avg FPS" value={avgFps} color="from-purple-500/10" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <BigStat label="Completed Evacuations" value={completedRuns} color="from-emerald-500/10" />
              <BigStat label="Total Sim Time" value={formatDuration(totalTimeMs)} color="from-orange-500/10" />
              <BigStat label="Avg Stress" value={`${avgStress}%`} color="from-red-500/10" />
              <BigStat label="Total Agents Spawned" value={totalSimulated.toLocaleString()} color="from-cyan-500/10" />
            </div>

            {/* Per-scenario breakdown */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-white/60 mb-4">By Scenario</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {getScenarioBreakdown(sessions).map(s => (
                  <div key={s.presetId} className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-white/60">{s.presetName}</span>
                      <span className="text-[10px] text-white/20 font-mono">{s.runs} runs</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <MiniStat label="Evacuation Rate" value={`${s.evacuationRate.toFixed(0)}%`} />
                      <MiniStat label="Avg Duration" value={formatDuration(s.avgDuration)} />
                      <MiniStat label="Peak Stress" value={`${(s.avgPeakStress * 100).toFixed(0)}%`} />
                      <MiniStat label="Avg FPS" value={s.avgFps.toFixed(0)} />
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500/50 to-emerald-500/50"
                        style={{ width: `${Math.min(100, s.evacuationRate)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session history */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-bold text-white/60">Run History</h2>
                <div className="flex items-center gap-3">
                  {/* Filter by scenario */}
                  <select
                    value={filterScenario}
                    onChange={e => setFilterScenario(e.target.value)}
                    className="h-8 px-3 rounded-lg border border-white/[0.06] text-[11px] text-white/50 focus:outline-none focus:border-cyan-500/30 transition-colors cursor-pointer"
                    style={{ backgroundColor: '#0c0b1a' }}
                  >
                    <option value="all" style={{ backgroundColor: '#0c0b1a', color: '#ccc' }}>All Scenarios</option>
                    {scenarioNames.map(name => (
                      <option key={name} value={name} style={{ backgroundColor: '#0c0b1a', color: '#ccc' }}>{name}</option>
                    ))}
                  </select>
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortField)}
                    className="h-8 px-3 rounded-lg border border-white/[0.06] text-[11px] text-white/50 focus:outline-none focus:border-cyan-500/30 transition-colors cursor-pointer"
                    style={{ backgroundColor: '#0c0b1a' }}
                  >
                    <option value="date" style={{ backgroundColor: '#0c0b1a', color: '#ccc' }}>Sort: Latest</option>
                    <option value="evacRate" style={{ backgroundColor: '#0c0b1a', color: '#ccc' }}>Sort: Evac Rate</option>
                    <option value="duration" style={{ backgroundColor: '#0c0b1a', color: '#ccc' }}>Sort: Duration</option>
                    <option value="fps" style={{ backgroundColor: '#0c0b1a', color: '#ccc' }}>Sort: FPS</option>
                    <option value="stress" style={{ backgroundColor: '#0c0b1a', color: '#ccc' }}>Sort: Stress</option>
                  </select>
                  {/* Export CSV */}
                  <button
                    onClick={handleExportCSV}
                    className="h-8 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/40 hover:text-cyan-400 hover:border-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2v6M3 6l3 3 3-3M2 10h8" />
                    </svg>
                    Export CSV
                  </button>
                  {/* Clear all */}
                  <button
                    onClick={handleClear}
                    className="text-[11px] text-white/20 hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-white/15 mb-2">
                Showing {sorted.length} of {sessions.length} sessions
              </div>

              <div className="space-y-2">
                {sorted.map(session => (
                  <SessionRow key={session.id} session={session} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </>
        )}
      </Section>
    </PageLayout>
  );
}

function BigStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.04] bg-gradient-to-br ${color} to-transparent p-5`}>
      <div className="text-2xl font-bold font-mono text-white/80 mb-1">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/25">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-mono text-white/50">{value}</div>
      <div className="text-[9px] text-white/20">{label}</div>
    </div>
  );
}

function SessionRow({ session, onDelete }: { session: SimulationSession; onDelete: (id: string) => void }) {
  const evacRate = session.initialAgents > 0
    ? ((session.agentsExited / session.initialAgents) * 100).toFixed(0)
    : '0';

  return (
    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.03] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/60 truncate">{session.presetName}</span>
          {session.evacuationComplete && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">COMPLETE</span>
          )}
          {session.panicModeUsed && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">PANIC</span>
          )}
        </div>
        <div className="text-[10px] text-white/20 mt-0.5">
          {new Date(session.startTime).toLocaleString()}
        </div>
      </div>
      <div className="flex items-center gap-5 text-xs font-mono">
        <div className="text-center">
          <div className="text-white/50">{session.agentsExited}/{session.initialAgents}</div>
          <div className="text-[8px] text-white/15">exited</div>
        </div>
        <div className="text-center">
          <div className="text-white/50">{evacRate}%</div>
          <div className="text-[8px] text-white/15">rate</div>
        </div>
        <div className="text-center">
          <div className="text-white/50">{formatDuration(session.durationMs)}</div>
          <div className="text-[8px] text-white/15">time</div>
        </div>
        <div className="text-center">
          <div className={`${session.averageFps < 30 ? 'text-red-400' : 'text-white/50'}`}>
            {session.averageFps.toFixed(0)}
          </div>
          <div className="text-[8px] text-white/15">fps</div>
        </div>
        {/* Stress bar */}
        <div className="w-16">
          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className={`h-full rounded-full ${
                session.peakStress > 0.6 ? 'bg-red-500/50' : session.peakStress > 0.3 ? 'bg-orange-500/50' : 'bg-cyan-500/50'
              }`}
              style={{ width: `${session.peakStress * 100}%` }}
            />
          </div>
          <div className="text-[8px] text-white/15 text-center mt-0.5">stress</div>
        </div>
        {/* Delete button */}
        <button
          onClick={() => onDelete(session.id)}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete session"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = Math.floor(secs % 60);
  return `${mins}m ${remainSecs}s`;
}

interface ScenarioBreakdown {
  presetId: string;
  presetName: string;
  runs: number;
  evacuationRate: number;
  avgDuration: number;
  avgPeakStress: number;
  avgFps: number;
}

function getScenarioBreakdown(sessions: SimulationSession[]): ScenarioBreakdown[] {
  const map = new Map<string, SimulationSession[]>();
  for (const s of sessions) {
    const arr = map.get(s.presetId) || [];
    arr.push(s);
    map.set(s.presetId, arr);
  }

  const results: ScenarioBreakdown[] = [];
  for (const [presetId, arr] of map) {
    const totalInitial = arr.reduce((s, x) => s + x.initialAgents, 0);
    const totalExited = arr.reduce((s, x) => s + x.agentsExited, 0);
    results.push({
      presetId,
      presetName: arr[0].presetName,
      runs: arr.length,
      evacuationRate: totalInitial > 0 ? (totalExited / totalInitial) * 100 : 0,
      avgDuration: arr.reduce((s, x) => s + x.durationMs, 0) / arr.length,
      avgPeakStress: arr.reduce((s, x) => s + x.peakStress, 0) / arr.length,
      avgFps: arr.reduce((s, x) => s + x.averageFps, 0) / arr.length,
    });
  }
  return results.sort((a, b) => b.runs - a.runs);
}
