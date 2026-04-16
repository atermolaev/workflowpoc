import type { Brief, Specialist } from '@/globals/types';

export interface SpecialistTabProps {
  briefs: Brief[];
  specialists: Specialist[];
  onFinish: (briefId: number, subId: number, mode: 'ai' | 'manual') => void;
  onApplyAI: (briefId: number, subId: number, command: string) => void;
  onUploadFile: (briefId: number, subId: number, filename: string) => void;
}

export interface ChatMsg {
  from: 'user' | 'ai';
  text: string;
}
