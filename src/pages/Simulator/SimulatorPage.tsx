import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { InteractionMode, VisualizationOverlay, PresetScenario } from '../../engine/core/types';
import { createWorld, addWall, addExit, addHazard, addAttractor } from '../../engine/core/World';
import { createAgent } from '../../engine/core/Agent';
import { useSimulation } from '../../bridge/useSimulation';
import { useSimulationStats } from '../../bridge/useSimulationStats';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { SnapshotManager } from '../../engine/snapshot/SnapshotManager';
import { SimulationSession, loadSessions, saveSessions, saveCustomScenario, loadCustomScenarios } from '../../engine/core/SessionTracker';
import { presets, roomEvacuation } from '../../presets';
import { ControlPanel } from './ControlPanel/ControlPanel';
import { SimCanvas } from './SimCanvas';
import { AnalyticsOverlay } from './AnalyticsOverlay';

function buildWorldFromPreset(preset: PresetScenario) {
  const world = createWorld(preset.worldWidth, preset.worldHeight);
  for (const a of preset.agents) {
    world.agents.push(createAgent(a.x, a.y, a.vx ?? 0, a.vy ?? 0));
  }
  for (const w of preset.walls) {
    addWall(world, w.ax, w.ay, w.bx, w.by);
  }
  for (const e of preset.exits) {
    addExit(world, e.ax, e.ay, e.bx, e.by);
  }
  if (preset.hazards) {
    for (const h of preset.hazards) {
      addHazard(world, h.x, h.y, h.radius, h.intensity);
    }
  }
  if (preset.attractors) {
    for (const a of preset.attractors) {
      addAttractor(world, a.x, a.y, a.radius, a.strength);
    }
  }
  return world;
}

function getInitialPreset(presetId?: string): PresetScenario {
  if (presetId) {
    // Check built-in presets first
    const found = presets.find(p => p.id === presetId);
    if (found) return found;
    // Check custom scenarios from localStorage
    const custom = loadCustomScenarios().find(s => s.id === presetId);
    if (custom) return custom;
  }
  return roomEvacuation;
}

export default function SimulatorPage() {
  const location = useLocation();
  const locationPresetId = (location.state as { presetId?: string })?.presetId;
  const initialPreset = useMemo(() => getInitialPreset(locationPresetId), [locationPresetId]);

  const { controller, reset } = useSimulation(buildWorldFromPreset(initialPreset));
  const stats = useSimulationStats(controller);
  const snapshotMgr = useRef(new SnapshotManager());

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<InteractionMode>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState(initialPreset.id);
  const [overlays, setOverlays] = useState<Set<VisualizationOverlay>>(new Set());
  const [panicMode, setPanicMode] = useState(false);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [snapshotIndex, setSnapshotIndex] = useState(0);

  // Resizable panel
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('crowdflow_panel_width');
    return saved ? Math.max(220, Math.min(480, Number(saved))) : 288;
  });
  const resizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(220, Math.min(480, containerRect.right - ev.clientX));
      setPanelWidth(newWidth);
    };

    const onUp = () => {
      resizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setPanelWidth(w => { localStorage.setItem('crowdflow_panel_width', String(w)); return w; });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  // Re-fit camera when panel width changes
  useEffect(() => {
    if (!controller) return;
    const timer = setTimeout(() => {
      controller.fitCameraToWorld();
      controller.renderer.environmentLayer.forceRedraw();
      controller.renderOnce();
    }, 50);
    return () => clearTimeout(timer);
  }, [panelWidth, controller]);

  // Apply preset from navigation state (e.g. from Scenarios page)
  const appliedPresetRef = useRef<string | null>(null);
  useEffect(() => {
    if (locationPresetId && controller && locationPresetId !== appliedPresetRef.current) {
      appliedPresetRef.current = locationPresetId;
      const preset = getInitialPreset(locationPresetId);
      setActivePreset(preset.id);
      reset(buildWorldFromPreset(preset));
    }
  }, [locationPresetId, controller, reset]);

  // Session tracking for dashboard
  const sessionStart = useRef(0);
  const initialAgentCount = useRef(0);
  const peakStress = useRef(0);
  const stressSum = useRef(0);
  const stressSamples = useRef(0);
  const fpsSum = useRef(0);
  const fpsSamples = useRef(0);
  const latestStats = useRef(stats);
  latestStats.current = stats;

  const saveCurrentSession = useCallback(() => {
    if (!controller || sessionStart.current === 0) return;
    const now = Date.now();
    const world = controller.getWorld();
    const sessions = loadSessions();
    const preset = presets.find(p => p.id === activePreset);
    const session: SimulationSession = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      presetName: preset?.name || activePreset,
      presetId: activePreset,
      startTime: sessionStart.current,
      endTime: now,
      durationMs: now - sessionStart.current,
      initialAgents: initialAgentCount.current,
      agentsExited: stats.exitedCount,
      agentsRemaining: world.agents.length,
      peakStress: peakStress.current,
      averageStress: stressSamples.current > 0 ? stressSum.current / stressSamples.current : 0,
      averageFps: fpsSamples.current > 0 ? fpsSum.current / fpsSamples.current : 0,
      totalTicks: world.tick,
      panicModeUsed: panicMode,
      evacuationComplete: world.agents.length === 0 && stats.exitedCount > 0,
    };
    if (session.durationMs > 2000 && session.initialAgents > 0) {
      sessions.push(session);
      saveSessions(sessions);
    }
    sessionStart.current = 0;
  }, [controller, activePreset, stats, panicMode]);

  // Track peak stress and FPS during playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const s = latestStats.current;
      if (s.averageStress > peakStress.current) peakStress.current = s.averageStress;
      stressSum.current += s.averageStress;
      stressSamples.current++;
      fpsSum.current += s.fps;
      fpsSamples.current++;
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Snapshot capture interval
  useEffect(() => {
    if (!isPlaying || !controller) return;
    const interval = setInterval(() => {
      snapshotMgr.current.capture(controller.getWorld());
      setSnapshotCount(snapshotMgr.current.getCount());
      setSnapshotIndex(snapshotMgr.current.getCount() - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, controller]);

  const togglePlay = useCallback(() => {
    if (!controller) return;
    if (isPlaying) {
      controller.stop();
      saveCurrentSession();
    } else {
      if (sessionStart.current === 0) {
        sessionStart.current = Date.now();
        initialAgentCount.current = controller.getWorld().agents.length;
        peakStress.current = 0;
        stressSum.current = 0;
        stressSamples.current = 0;
        fpsSum.current = 0;
        fpsSamples.current = 0;
      }
      controller.start();
    }
    setIsPlaying(!isPlaying);
  }, [controller, isPlaying, saveCurrentSession]);

  const stepForward = useCallback(() => {
    if (!controller || isPlaying) return;
    controller.stepOnce();
  }, [controller, isPlaying]);

  const handleReset = useCallback(() => {
    if (!controller) return;
    controller.stop();
    saveCurrentSession();
    setIsPlaying(false);
    setPanicMode(false);
    const preset = presets.find(p => p.id === activePreset);
    if (preset) {
      reset(buildWorldFromPreset(preset));
    }
    snapshotMgr.current.clear();
    setSnapshotCount(0);
    setSnapshotIndex(0);
    sessionStart.current = 0;
  }, [controller, reset, activePreset, saveCurrentSession]);

  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    controller?.setSpeed(s);
  }, [controller]);

  const handlePresetSelect = useCallback((preset: PresetScenario) => {
    if (!controller) return;
    controller.stop();
    saveCurrentSession();
    setIsPlaying(false);
    setPanicMode(false);
    setActivePreset(preset.id);
    reset(buildWorldFromPreset(preset));
    snapshotMgr.current.clear();
    setSnapshotCount(0);
    setSnapshotIndex(0);
    sessionStart.current = 0;
  }, [controller, reset, saveCurrentSession]);

  const handleToggleOverlay = useCallback((overlay: VisualizationOverlay) => {
    setOverlays(prev => {
      const next = new Set(prev);
      if (next.has(overlay)) next.delete(overlay);
      else next.add(overlay);
      return next;
    });
  }, []);

  // Apply overlay settings to renderer
  useEffect(() => {
    if (!controller) return;
    controller.renderer.heatmap.setEnabled(overlays.has('heatmap'));
    controller.renderer.flowFieldLayer.setEnabled(overlays.has('flowField'));
    controller.renderer.trails.setEnabled(overlays.has('trails'));
    controller.renderer.agentLayer.setShowVelocityVectors(overlays.has('velocityVectors'));
    controller.renderer.gridLayer.setEnabled(overlays.has('grid'));
  }, [controller, overlays]);

  const handleTogglePanic = useCallback(() => {
    if (!controller) return;
    const newPanic = !panicMode;
    setPanicMode(newPanic);
    controller.getWorld().panicMode = newPanic;
  }, [controller, panicMode]);

  const handleSpawnBatch = useCallback((count: number) => {
    if (!controller) return;
    const world = controller.getWorld();
    for (let i = 0; i < count; i++) {
      const x = 50 + Math.random() * (world.width - 100);
      const y = 50 + Math.random() * (world.height - 100);
      world.agents.push(createAgent(x, y));
    }
  }, [controller]);

  const handleClearAgents = useCallback(() => {
    if (!controller) return;
    controller.getWorld().agents.length = 0;
  }, [controller]);

  const handleScrubTimeline = useCallback((index: number) => {
    if (!controller) return;
    controller.stop();
    setIsPlaying(false);
    snapshotMgr.current.restore(index, controller.getWorld());
    setSnapshotIndex(index);
    setSnapshotCount(snapshotMgr.current.getCount());
    controller.renderer.environmentLayer.forceRedraw();
    controller.renderer.render(controller.engine.world, controller.engine.flowField);
  }, [controller]);

  const handleSaveLayout = useCallback(() => {
    if (!controller) return;
    const world = controller.getWorld();
    const name = `Custom ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    const id = `custom_${Date.now()}`;

    const scenario: import('../../engine/core/types').PresetScenario = {
      id,
      name,
      description: `Custom layout with ${world.agents.length} agents, ${world.walls.length} walls, ${world.exits.length} exits.`,
      icon: '🎨',
      agents: world.agents.map(a => ({ x: a.position.x, y: a.position.y, vx: a.velocity.x, vy: a.velocity.y })),
      walls: world.walls.map(w => ({ ax: w.ax, ay: w.ay, bx: w.bx, by: w.by })),
      exits: world.exits.map(e => ({ ax: e.ax, ay: e.ay, bx: e.bx, by: e.by })),
      hazards: world.hazards.map(h => ({ x: h.x, y: h.y, radius: h.radius, intensity: h.intensity })),
      attractors: world.attractors.map(a => ({ x: a.x, y: a.y, radius: a.radius, strength: a.strength })),
      worldWidth: world.width,
      worldHeight: world.height,
    };

    saveCustomScenario(scenario);
    setActivePreset(id);
    showToast(`Layout saved as "${name}"`);
  }, [controller]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const shortcutHandlers = useMemo(() => ({
    togglePlay,
    setMode,
    currentMode: mode,
    stepForward,
    resetSim: handleReset,
  }), [togglePlay, mode, stepForward, handleReset]);

  useKeyboardShortcuts(shortcutHandlers);

  if (!controller) return null;

  const modeLabels: Record<string, string> = {
    select: 'Select',
    addAgent: 'Place Agents',
    addWall: 'Draw Wall',
    addExit: 'Draw Exit',
    addHazard: 'Place Hazard',
    addAttractor: 'Place Attractor',
    erase: 'Erase',
  };

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Top bar + analytics */}
      <div className="flex-shrink-0 border-b border-white/[0.04] bg-surface-950/90 backdrop-blur-xl">
        <div className="h-11 flex items-center px-4">
          <Link to="/" className="text-sm font-bold text-gradient mr-3 hover:opacity-80 transition-opacity">CrowdFlow</Link>
          <div className="w-px h-4 bg-white/[0.06] mr-3" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isPlaying ? 'bg-emerald-400' : 'bg-white/20'}`} />
            <span className={isPlaying ? 'text-emerald-400/70' : 'text-white/30'}>{isPlaying ? 'Running' : 'Paused'}</span>
          </div>
          <div className="mx-4 flex-1">
            <AnalyticsOverlay stats={stats} isPlaying={isPlaying} />
          </div>
          <div className="flex items-center gap-5">
            <Link to="/scenarios" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">
              Scenarios
            </Link>
            <Link to="/how-it-works" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">
              How It Works
            </Link>
            <Link to="/dashboard" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">
              Dashboard
            </Link>
            <Link to="/about" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div ref={containerRef} className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <SimCanvas controller={controller} mode={mode} />
          {/* Mode indicator */}
          <div className="absolute bottom-3 left-3 bg-surface-950/60 backdrop-blur-xl rounded-lg px-3 py-1.5 border border-white/[0.04] pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-white/25 font-medium">
              {mode ? modeLabels[mode] : 'Move'}
            </span>
          </div>
          {/* Keyboard hints */}
          <div className="absolute bottom-3 right-3 bg-surface-950/40 backdrop-blur-xl rounded-lg px-2.5 py-1.5 border border-white/[0.04] pointer-events-none">
            <span className="text-[9px] text-white/15 font-mono">
              Space: Play/Pause | Scroll: Zoom | RMB: Pan | Del: Delete | Ctrl+C/V: Copy/Paste
            </span>
          </div>
        </div>
        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="w-1.5 flex-shrink-0 cursor-col-resize relative group hover:bg-cyan-500/20 active:bg-cyan-500/30 transition-colors"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-white/10 group-hover:bg-cyan-400/50 transition-colors" />
        </div>
        <ControlPanel
          width={panelWidth}
          isPlaying={isPlaying}
          speed={speed}
          mode={mode}
          activePreset={activePreset}
          overlays={overlays}
          panicMode={panicMode}
          stats={stats}
          snapshotCount={snapshotCount}
          snapshotIndex={snapshotIndex}
          onTogglePlay={togglePlay}
          onStepForward={stepForward}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onModeChange={setMode}
          onPresetSelect={handlePresetSelect}
          onToggleOverlay={handleToggleOverlay}
          onTogglePanic={handleTogglePanic}
          onSpawnBatch={handleSpawnBatch}
          onClearAgents={handleClearAgents}
          onScrubTimeline={handleScrubTimeline}
          onSaveLayout={handleSaveLayout}
        />
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="glass-strong rounded-xl px-5 py-3 border border-emerald-500/20 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-400 flex-shrink-0">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-white/70">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
