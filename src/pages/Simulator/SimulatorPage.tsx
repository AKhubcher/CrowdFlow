import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { InteractionMode, VisualizationOverlay, PresetScenario } from '../../engine/core/types';
import { createWorld, addWall, addExit, addHazard, addAttractor } from '../../engine/core/World';
import { createAgent } from '../../engine/core/Agent';
import { useSimulation } from '../../bridge/useSimulation';
import { useSimulationStats } from '../../bridge/useSimulationStats';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { SnapshotManager } from '../../engine/snapshot/SnapshotManager';
import { SimulationSession, loadSessions, saveSessions } from '../../engine/core/SessionTracker';
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

export default function SimulatorPage() {
  const { controller, reset } = useSimulation(buildWorldFromPreset(roomEvacuation));
  const stats = useSimulationStats(controller);
  const snapshotMgr = useRef(new SnapshotManager());

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<InteractionMode>('addAgent');
  const [activePreset, setActivePreset] = useState('roomEvacuation');
  const [overlays, setOverlays] = useState<Set<VisualizationOverlay>>(new Set());
  const [panicMode, setPanicMode] = useState(false);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [snapshotIndex, setSnapshotIndex] = useState(0);

  // Session tracking for dashboard
  const sessionStart = useRef(0);
  const initialAgentCount = useRef(0);
  const peakStress = useRef(0);
  const stressSum = useRef(0);
  const stressSamples = useRef(0);
  const fpsSum = useRef(0);
  const fpsSamples = useRef(0);

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
    // Only save if session lasted > 2 seconds and had agents
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
      if (stats.averageStress > peakStress.current) peakStress.current = stats.averageStress;
      stressSum.current += stats.averageStress;
      stressSamples.current++;
      fpsSum.current += stats.fps;
      fpsSamples.current++;
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, stats]);

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
      // Start new session
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

  const shortcutHandlers = useMemo(() => ({
    togglePlay,
    setMode,
    stepForward,
    resetSim: handleReset,
  }), [togglePlay, stepForward, handleReset]);

  useKeyboardShortcuts(shortcutHandlers);

  if (!controller) return null;

  const modeLabels: Record<InteractionMode, string> = {
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
      {/* Top bar */}
      <div className="h-11 flex items-center px-4 border-b border-white/[0.04] bg-surface-950/90 backdrop-blur-xl flex-shrink-0">
        <Link to="/" className="text-sm font-bold text-gradient mr-3 hover:opacity-80 transition-opacity">CrowdFlow</Link>
        <div className="w-px h-4 bg-white/[0.06] mr-3" />
        <div className="flex items-center gap-1.5 text-[11px]">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isPlaying ? 'bg-emerald-400' : 'bg-white/20'}`} />
          <span className={isPlaying ? 'text-emerald-400/70' : 'text-white/30'}>{isPlaying ? 'Running' : 'Paused'}</span>
        </div>
        <div className="ml-auto flex items-center gap-5">
          <Link to="/dashboard" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">
            Dashboard
          </Link>
          <Link to="/scenarios" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">
            Scenarios
          </Link>
          <Link to="/how-it-works" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">
            How It Works
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <SimCanvas controller={controller} mode={mode} />
          <AnalyticsOverlay stats={stats} />
          {/* Mode indicator */}
          <div className="absolute bottom-3 left-3 bg-surface-950/60 backdrop-blur-xl rounded-lg px-3 py-1.5 border border-white/[0.04] pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-white/25 font-medium">
              {modeLabels[mode]}
            </span>
          </div>
          {/* Keyboard hints */}
          <div className="absolute bottom-3 right-3 bg-surface-950/40 backdrop-blur-xl rounded-lg px-2.5 py-1.5 border border-white/[0.04] pointer-events-none">
            <span className="text-[9px] text-white/15 font-mono">
              Space: Play/Pause | Scroll: Zoom | RMB: Pan
            </span>
          </div>
        </div>
        <ControlPanel
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
        />
      </div>
    </div>
  );
}
