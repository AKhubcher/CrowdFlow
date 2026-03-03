interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: number;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const speeds = [0.25, 0.5, 1, 2, 4];

export function PlaybackControls({
  isPlaying, speed, onTogglePlay, onStepForward, onReset, onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex-1 h-10 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            isPlaying
              ? 'bg-white/10 text-white/80 hover:bg-white/15'
              : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 ring-1 ring-cyan-500/20'
          }`}
        >
          {isPlaying ? (
            <><PauseIcon /> Pause</>
          ) : (
            <><PlayIcon /> Play</>
          )}
        </button>
        <button
          onClick={onStepForward}
          disabled={isPlaying}
          className="h-10 w-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 disabled:opacity-20 transition-all flex items-center justify-center"
          title="Step forward (.)"
        >
          <StepIcon />
        </button>
        <button
          onClick={onReset}
          className="h-10 w-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 transition-all flex items-center justify-center"
          title="Reset (R)"
        >
          <ResetIcon />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-widest w-10 font-medium">Speed</span>
        <div className="flex gap-1 flex-1">
          {speeds.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`flex-1 h-7 rounded-lg text-[11px] font-mono transition-all ${
                speed === s
                  ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/20'
                  : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06] hover:text-white/50'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <polygon points="2,1 11,6 2,11" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="1" width="3" height="10" rx="0.5" />
      <rect x="7" y="1" width="3" height="10" rx="0.5" />
    </svg>
  );
}

function StepIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <polygon points="2,2 9,7 2,12" />
      <rect x="10" y="2" width="2" height="10" rx="0.5" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 7a5 5 0 1 1 1.5 3.5" />
      <polyline points="2,4 2,7.5 5.5,7.5" />
    </svg>
  );
}
