export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

export function formatFps(n: number): string {
  return `${n} fps`;
}
