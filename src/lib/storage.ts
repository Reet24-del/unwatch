import { sessionSchema, type SavedSession } from '../../shared/domain';
const KEY = 'unwatch.sessions.v1';
export function readSessions(): SavedSession[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .flatMap((item) => {
        const parsed = sessionSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
      .slice(0, 20);
  } catch {
    return [];
  }
}
export function writeSessions(sessions: SavedSession[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, 20)));
  } catch {
    throw new Error(
      'Your browser could not save this session. Free some storage or use a normal browsing window.',
    );
  }
}
