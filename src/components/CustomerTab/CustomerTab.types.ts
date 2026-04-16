import type { Brief, Specialist, BriefType } from '@/globals/types';

export interface CustomerTabProps {
  briefs: Brief[];
  specialists: Specialist[];
  onCreate: (type: BriefType, topic: string, audience: string, deadline: string) => void;
}
