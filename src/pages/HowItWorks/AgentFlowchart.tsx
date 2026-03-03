export function AgentFlowchart() {
  const steps = [
    { label: 'Sense', desc: 'Query spatial grid for nearby agents, walls, hazards', color: 'border-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: 'Plan', desc: 'Read flow field direction, select target exit', color: 'border-accent-blue', bg: 'bg-accent-blue/10' },
    { label: 'Steer', desc: 'Combine 7 weighted steering forces', color: 'border-accent-purple', bg: 'bg-accent-purple/10' },
    { label: 'Move', desc: 'Apply force, clamp velocity, integrate position', color: 'border-accent-green', bg: 'bg-accent-green/10' },
    { label: 'Collide', desc: 'Resolve overlaps with agents and walls', color: 'border-accent-orange', bg: 'bg-accent-orange/10' },
    { label: 'React', desc: 'Update stress, color, state (frozen/exiting)', color: 'border-accent-pink', bg: 'bg-accent-pink/10' },
  ];

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-accent-green mb-4">Agent Update Loop</h3>
      <p className="text-sm text-white/40 mb-6">
        Every physics tick, each agent follows this pipeline:
      </p>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${step.bg} border ${step.color} flex items-center justify-center text-xs font-mono font-bold text-white/70`}>
              {i + 1}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-white/70">{step.label}</span>
              <span className="text-xs text-white/30 ml-2">{step.desc}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="text-white/10 text-xs">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
