export type Role = 'writer' | 'designer' | 'layout';
export type BriefType = 'article' | 'banner' | 'video' | 'email';

export interface Specialist {
  id: string;
  name: string;
  role: Role;
  load: number;
}

export interface Subtask {
  id: number;
  briefId: number;
  role: Role;
  description: string;
  aiDraft: string;
  status: 'pending' | 'done';
  assignee: string | null;
  mode: 'ai' | 'manual' | null;
  files: string[];
  versions: string[];
}

export interface Brief {
  id: number;
  type: BriefType;
  topic: string;
  audience: string;
  deadline: string;
  status: 'processing' | 'done';
  subtasks: Subtask[];
  finalPublication: string | null;
}

export interface AppState {
  briefs: Brief[];
  specialists: Specialist[];
}
