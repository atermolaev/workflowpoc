import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadState } from '@/globals/state';
import { uid, generateSubtasks, assignToSpecialists } from '@/globals/logic';
import type { AppState, BriefType, Brief, Specialist, Subtask } from '@/globals/types';

const workflowSlice = createSlice({
  name: 'workflow',
  initialState: loadState() as AppState,
  reducers: {
    briefCreated(
      state,
      action: PayloadAction<{ type: BriefType; topic: string; audience: string; deadline: string }>,
    ) {
      const { type, topic, audience, deadline } = action.payload;
      const brief: Brief = {
        id: uid(),
        type,
        topic,
        audience,
        deadline,
        status: 'processing',
        subtasks: [],
        finalPublication: null,
      };
      const rawSubs = generateSubtasks(brief);
      const { subs, specs } = assignToSpecialists(rawSubs, state.specialists as Specialist[]);
      brief.subtasks = subs;
      state.briefs.unshift(brief as any);
      state.specialists = specs as any;
    },

    taskFinished(
      state,
      action: PayloadAction<{ briefId: number; subId: number; mode: 'ai' | 'manual' }>,
    ) {
      const { briefId, subId, mode } = action.payload;
      const brief = state.briefs.find(b => b.id === briefId);
      if (!brief) return;
      const sub = brief.subtasks.find(s => s.id === subId);
      if (!sub || sub.status === 'done') return;
      const spec = state.specialists.find(sp => sp.id === sub.assignee);
      if (spec) spec.load = Math.max(0, spec.load - 1);
      sub.status = 'done';
      sub.mode = mode;
      if (brief.subtasks.every(s => s.status === 'done') && brief.subtasks.length > 0) {
        brief.finalPublication =
          `Публикация «${brief.topic}» собрана из ${brief.subtasks.length} подзадач:\n` +
          brief.subtasks
            .map(s => `• ${s.description} — ${s.mode === 'ai' ? 'AI-режим' : 'Ручной'}`)
            .join('\n');
        brief.status = 'done';
      }
    },

    aiApplied(
      state,
      action: PayloadAction<{ briefId: number; subId: number; command: string }>,
    ) {
      const { briefId, subId, command } = action.payload;
      const sub = state.briefs
        .find(b => b.id === briefId)
        ?.subtasks.find(s => s.id === subId) as Subtask | undefined;
      if (!sub) return;
      const newDraft = sub.aiDraft + `\n\n---\n[AI по команде: «${command}»] → правка применена.`;
      sub.aiDraft = newDraft;
      sub.versions.push(newDraft);
    },

    fileUploaded(
      state,
      action: PayloadAction<{ briefId: number; subId: number; filename: string }>,
    ) {
      const { briefId, subId, filename } = action.payload;
      const sub = state.briefs
        .find(b => b.id === briefId)
        ?.subtasks.find(s => s.id === subId) as Subtask | undefined;
      if (!sub) return;
      sub.files.push(filename);
    },
  },
});

export const { briefCreated, taskFinished, aiApplied, fileUploaded } = workflowSlice.actions;
export default workflowSlice.reducer;
