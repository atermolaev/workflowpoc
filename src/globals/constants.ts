import type { Specialist, Role, BriefType } from './types';

export const DEFAULT_SPECIALISTS: Specialist[] = [
  { id: 'writer1',   name: 'Анна (писатель)',     role: 'writer',   load: 0 },
  { id: 'designer1', name: 'Олег (дизайнер)',     role: 'designer', load: 0 },
  { id: 'layout1',   name: 'Илья (верстальщик)', role: 'layout',   load: 0 },
];

export const TYPE_LABELS: Record<BriefType, string> = {
  article: 'Статья',
  banner:  'Баннер',
  video:   'Видео',
  email:   'Email',
};

export const ROLE_ICON: Record<Role, string> = {
  writer:   '✍️',
  designer: '🎨',
  layout:   '📐',
};
