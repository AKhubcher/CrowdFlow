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
          className="flex-1 h-9 rounded-lg bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan font-medium text-sm transition-colors flex items-center justify-center gap-2"
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
          className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 disabled:opacity-30 transition-colors flex items-center justify-center"
          title="Step forward (.)"
        >
          <StepIcon />
        </button>
        <button
          onClick={onReset}
          className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors flex items-center justify-center"
          title="Reset (R)"
        >
          <ResetIcon />
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/40 uppercase tracking-wider w-10">Speed</span>
        <div className="flex gap-1 flex-1">
          {speeds.map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`flex-1 h-6 rounded text-[11px] font-mono transition-colors ${
                speed === s
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
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
