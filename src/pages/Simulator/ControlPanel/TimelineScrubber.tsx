interface TimelineScrubberProps {
  snapshotCount: number;
  currentIndex: number;
  onScrub: (index: number) => void;
  currentTick: number;
}

export function TimelineScrubber({ snapshotCount, currentIndex, onScrub, currentTick }: TimelineScrubberProps) {
  if (snapshotCount === 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Timeline</span>
        <span className="text-[11px] text-white/30">No snapshots yet — play to record</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Timeline</span>
        <span className="text-[10px] text-white/30 font-mono">tick {currentTick}</span>
      </div>
      <input
        type="range"
        min={0}
        max={snapshotCount - 1}
        value={currentIndex}
        onChange={e => onScrub(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(6,182,212,0.5)]"
      />
      <div className="flex justify-between text-[9px] text-white/20 font-mono">
        <span>0</span>
        <span>{snapshotCount - 1}</span>
      </div>
    </div>
  );
}
