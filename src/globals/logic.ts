import type { Role, Subtask, Brief, Specialist } from './types';

export function uid(): number {
  return Date.now() + Math.floor(Math.random() * 100_000);
}

function makeSub(briefId: number, role: Role, description: string, draft: string): Subtask {
  return {
    id: uid(),
    briefId,
    role,
    description,
    aiDraft: draft,
    status: 'pending',
    assignee: null,
    mode: null,
    files: [],
    versions: [draft],
  };
}

export function generateSubtasks(brief: Brief): Subtask[] {
  const { id, type, topic, audience } = brief;
  switch (type) {
    case 'article':
      return [
        makeSub(id, 'writer', 'Написать текст статьи',
          `## Введение\n\nСтатья о теме «${topic}» для аудитории: ${audience}.\n\n## Основная часть\n\nКлючевые тезисы и аргументы...\n\n## Заключение\n\nВыводы и призыв к действию.`),
        makeSub(id, 'designer', 'Создать иллюстрации',
          `Обложка и иллюстрации для статьи «${topic}».\nФормат: 1200×630 px, фирменный стиль.`),
        makeSub(id, 'layout', 'Вёрстка статьи',
          `HTML/CSS шаблон для «${topic}».\nАдаптив, тёмная тема, SEO-разметка.`),
      ];
    case 'banner':
      return [
        makeSub(id, 'writer', 'Текст для баннера',
          `Слоган по теме «${topic}»:\n«[Сильное утверждение]»\nCTA: «Узнать больше»`),
        makeSub(id, 'designer', 'Дизайн баннера',
          `Баннер 1200×600 для «${topic}».\nСтиль: минималистичный, фирменные цвета.`),
      ];
    case 'video':
      return [
        makeSub(id, 'writer', 'Сценарий видео',
          `Сценарий 30–60 сек о «${topic}».\nАудитория: ${audience}.\n\n[Кадр 1] Открытие\n[Кадр 2] Проблема\n[Кадр 3] Решение\n[CTA] Призыв`),
        makeSub(id, 'designer', 'Сториборд',
          `Раскадровка из 5 кадров для «${topic}».\nФормат: 16:9, 1920×1080.`),
        makeSub(id, 'layout', 'Монтаж видео',
          `Финальный монтаж «${topic}».\nДлительность: 30–60 сек, MP4.`),
      ];
    case 'email':
    default:
      return [
        makeSub(id, 'writer', 'Текст письма',
          `Тема: «${topic}»\nАудитория: ${audience}\n\nПриветствие...\nОсновной текст...\nCTA: «Узнать больше»`),
        makeSub(id, 'layout', 'Вёрстка email',
          `HTML email-шаблон для «${topic}».\nАдаптив, Outlook 2016+.`),
      ];
  }
}

export function assignToSpecialists(
  subs: Subtask[],
  specs: Specialist[],
): { subs: Subtask[]; specs: Specialist[] } {
  const newSpecs = specs.map(s => ({ ...s }));
  const newSubs = subs.map(sub => {
    if (sub.assignee) return sub;
    const candidates = newSpecs.filter(s => s.role === sub.role);
    if (!candidates.length) return sub;
    candidates.sort((a, b) => a.load - b.load);
    const chosen = candidates[0];
    chosen.load += 1;
    return { ...sub, assignee: chosen.id };
  });
  return { subs: newSubs, specs: newSpecs };
}

export function assembleIfDone(brief: Brief): Brief {
  if (brief.status === 'done' || !brief.subtasks.length) return brief;
  if (!brief.subtasks.every(s => s.status === 'done')) return brief;
  const pub =
    `Публикация «${brief.topic}» собрана из ${brief.subtasks.length} подзадач:\n` +
    brief.subtasks
      .map(s => `• ${s.description} — ${s.mode === 'ai' ? 'AI-режим' : 'Ручной'}`)
      .join('\n');
  return { ...brief, status: 'done', finalPublication: pub };
}

export function specName(specs: Specialist[], id: string | null): string {
  if (!id) return 'не назначен';
  return specs.find(s => s.id === id)?.name ?? 'не назначен';
}
