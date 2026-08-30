/** Display helpers shared by server and client components. */

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function durationToSeconds(input: string): number {
  const parts = input.split(':').map(Number);
  if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

export function secondsToDuration(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

export function pacePerMile(distanceMi: number, durationSeconds: number): string {
  if (!distanceMi) return '—';
  const per = durationSeconds / distanceMi;
  return `${Math.floor(per / 60)}:${String(Math.round(per % 60)).padStart(2, '0')} /mi`;
}

export function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
    when: d.toLocaleDateString('en-US', { weekday: 'short' }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
