import type { AppState, Brief } from './types';
import { DEFAULT_SPECIALISTS } from './constants';
import { uid, generateSubtasks, assignToSpecialists } from './logic';

export const STORAGE_KEY = 'workflow_poc_v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed.specialists?.length) {
        parsed.specialists = DEFAULT_SPECIALISTS.map(s => ({ ...s }));
      }
      // migration: ensure versions field exists on older saved subtasks
      parsed.briefs.forEach(b =>
        b.subtasks.forEach(s => { if (!s.versions) s.versions = [s.aiDraft]; }),
      );
      return parsed;
    }
  } catch (_) { /* ignore corrupt data */ }

  // Build demo state for first launch
  const specs = DEFAULT_SPECIALISTS.map(s => ({ ...s }));
  const demoBrief: Brief = {
    id: uid(),
    type: 'article',
    topic: 'Налоговые льготы для ИП',
    audience: 'ИП, бухгалтеры',
    deadline: '2026-06-01',
    status: 'processing',
    subtasks: [],
    finalPublication: null,
  };
  const rawSubs = generateSubtasks(demoBrief);
  const { subs, specs: updatedSpecs } = assignToSpecialists(rawSubs, specs);
  demoBrief.subtasks = subs;
  return { briefs: [demoBrief], specialists: updatedSpecs };
}

export function persistState(st: AppState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch (_) { /* ignore */ }
}
