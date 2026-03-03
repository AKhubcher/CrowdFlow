import { useState } from 'react';

export function AgentFlowchart() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = [
    {
      label: 'Sense',
      desc: 'Query spatial grid for nearby agents, walls, hazards',
      color: 'border-accent-cyan',
      bg: 'bg-accent-cyan/10',
      glow: 'shadow-[0_0_12px_rgba(0,255,255,0.15)]',
      detail: 'Uses SpatialHashGrid.queryRadius() to find all agents within SEPARATION_RADIUS (25px) and ALIGNMENT_RADIUS (50px). Only checks agents in adjacent grid cells \u2014 O(k) per agent instead of O(n).',
      pseudo: `neighbors = grid.queryRadius(pos, radius)\nwalls = world.walls.filter(nearby)\nhazards = world.hazards.filter(nearby)`,
    },
    {
      label: 'Plan',
      desc: 'Read flow field direction, select target exit',
      color: 'border-accent-blue',
      bg: 'bg-accent-blue/10',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.15)]',
      detail: 'Reads the pre-computed BFS flow field to get the optimal direction toward the nearest exit. The flow field encodes shortest-path directions at every grid cell, so agents can navigate around corners without per-agent pathfinding.',
      pseudo: `dir = flowField.getDirection(pos.x, pos.y)\ntarget = pos + dir * lookahead\ngoalForce = seek(target)`,
    },
    {
      label: 'Steer',
      desc: 'Combine 7 weighted steering forces',
      color: 'border-accent-purple',
      bg: 'bg-accent-purple/10',
      glow: 'shadow-[0_0_12px_rgba(168,85,247,0.15)]',
      detail: 'Combines 7 weighted forces: goal seeking (1.0), separation (2.5), alignment (0.3), wall avoidance (3.0), hazard avoidance (4.0), attractor pull (0.5), and noise (stress-scaled). Final force is clamped to maxForce (0.15).',
      pseudo: `force = goal*1.0 + sep*2.5 + align*0.3\n     + wall*3.0 + hazard*4.0\n     + attract*0.5 + noise\nclamp(force, maxForce)`,
    },
    {
      label: 'Move',
      desc: 'Apply force, clamp velocity, integrate position',
      color: 'border-accent-green',
      bg: 'bg-accent-green/10',
      glow: 'shadow-[0_0_12px_rgba(34,197,94,0.15)]',
      detail: 'Applies steering force as acceleration (F/mass), updates velocity, clamps to maxSpeed (2.0 normal, 2.8 panic), then integrates position. Fixed 16.67ms timestep ensures deterministic behavior.',
      pseudo: `velocity += force / mass\nclamp(velocity, maxSpeed)\nposition += velocity`,
    },
    {
      label: 'Collide',
      desc: 'Resolve overlaps with agents and walls',
      color: 'border-accent-orange',
      bg: 'bg-accent-orange/10',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.15)]',
      detail: 'Position-based collision resolution. Overlapping agents are pushed apart equally along the overlap axis. Wall collision projects agents out of line segments and zeros the velocity component into the wall.',
      pseudo: `for each overlap:\n  push = (minDist - dist) / 2\n  a.pos += normal * push\n  b.pos -= normal * push\nresolveWalls(agent, walls)`,
    },
    {
      label: 'React',
      desc: 'Update stress, color, state (frozen/exiting)',
      color: 'border-accent-pink',
      bg: 'bg-accent-pink/10',
      glow: 'shadow-[0_0_12px_rgba(236,72,153,0.15)]',
      detail: 'Stress increases from density (>3 neighbors), hazard proximity, and panic mode. Decreases in open space and when making progress. At stress > 0.8, agents may freeze. Color shifts from cyan (calm) to red (panicked).',
      pseudo: `stress += density + hazard + panic\nstress -= openSpace + progress\ncolor = stressGradient(stress)\nif stress > 0.8: maybeFreeze()`,
    },
  ];

  const toggleStep = (index: number) => {
    setExpandedStep((prev) => (prev === index ? null : index));
  };

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-accent-green mb-1">Agent Update Loop</h3>
      <p className="text-sm text-white/40 mb-1">
        Every physics tick, each agent follows this pipeline:
      </p>
      <p className="text-xs text-white/20 italic mb-6">Click a step to explore</p>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => {
          const isExpanded = expandedStep === i;
          return (
            <div key={i} className="flex flex-col">
              {/* Step row */}
              <button
                type="button"
                onClick={() => toggleStep(i)}
                className={`flex items-center gap-3 w-full text-left rounded-lg px-2 py-1.5 -mx-2 transition-all duration-200 cursor-pointer
                  ${isExpanded
                    ? `${step.bg} border ${step.color} ${step.glow}`
                    : 'border border-transparent hover:bg-white/[0.03]'
                  }`}
              >
                <div
                  className={`w-8 h-8 shrink-0 rounded-lg ${step.bg} border ${step.color} flex items-center justify-center text-xs font-mono font-bold transition-colors duration-200
                    ${isExpanded ? 'text-white' : 'text-white/70'}`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium transition-colors duration-200 ${isExpanded ? 'text-white' : 'text-white/70'}`}>
                    {step.label}
                  </span>
                  <span className={`text-xs ml-2 transition-colors duration-200 ${isExpanded ? 'text-white/50' : 'text-white/30'}`}>
                    {step.desc}
                  </span>
                </div>
                <div
                  className={`text-white/30 text-xs shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  {i < steps.length - 1 ? (isExpanded ? '▲' : '▼') : (isExpanded ? '▲' : '')}
                </div>
              </button>

              {/* Expandable detail panel */}
              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                style={{ maxHeight: isExpanded ? '300px' : '0px' }}
              >
                <div className="pl-12 pr-2 pt-2 pb-3">
                  <p className="text-xs text-white/50 leading-relaxed mb-3">
                    {step.detail}
                  </p>
                  <pre className={`text-[11px] leading-relaxed font-mono ${step.bg} border ${step.color}/30 rounded-md px-3 py-2 text-white/60 overflow-x-auto`}>
                    {step.pseudo}
                  </pre>
                </div>
              </div>

              {/* Arrow between steps (only when not the last step and this step is not expanded) */}
              {i < steps.length - 1 && !isExpanded && (
                <div className="text-white/10 text-xs text-center">↓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
