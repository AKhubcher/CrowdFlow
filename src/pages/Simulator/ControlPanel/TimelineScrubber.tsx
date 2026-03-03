interface TimelineScrubberProps {
  snapshotCount: number;
  currentIndex: number;
  onScrub: (index: number) => void;
  currentTick: number;
}

export function TimelineScrubber({ snapshotCount, currentIndex, onScrub, currentTick }: TimelineScrubberProps) {
  if (snapshotCount === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Timeline</span>
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.02]">
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <span className="text-[11px] text-white/20">Play to start recording</span>
        </div>
      </div>
    );
  }

  const progress = snapshotCount > 1 ? currentIndex / (snapshotCount - 1) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Timeline</span>
        <span className="text-[10px] text-white/20 font-mono">t={currentTick}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={snapshotCount - 1}
          value={currentIndex}
          onChange={e => onScrub(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-white/[0.06] cursor-pointer relative z-10
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(6,182,212,0.4)]
            [&::-webkit-slider-thumb]:border-0"
        />
        {/* Progress fill indicator */}
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-gradient-to-r from-cyan-500/30 to-cyan-500/10 pointer-events-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[8px] text-white/15 font-mono">
        <span>0s</span>
        <span>{currentIndex + 1}/{snapshotCount}</span>
        <span>{snapshotCount}s</span>
      </div>
    </div>
  );
}
