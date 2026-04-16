import { useState } from 'react';
import Badge from '@/components/Badge/Badge';
import { TYPE_LABELS, ROLE_ICON } from '@/globals/constants';
import { specName } from '@/globals/logic';
import type { BriefType } from '@/globals/types';
import type { CustomerTabProps } from './CustomerTab.types';
import styles from './CustomerTab.module.css';

export default function CustomerTab({ briefs, specialists, onCreate }: CustomerTabProps) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailBriefId, setDetailBriefId] = useState<number | null>(null);

  // New brief form state
  const [fType, setFType] = useState<BriefType>('article');
  const [fTopic, setFTopic] = useState('');
  const [fAudience, setFAudience] = useState('');
  const [fDeadline, setFDeadline] = useState('2026-07-01');

  const detailBrief = briefs.find(b => b.id === detailBriefId) ?? null;

  function handleCreate() {
    if (!fTopic.trim()) return;
    onCreate(fType, fTopic.trim(), fAudience.trim() || 'Широкая аудитория', fDeadline);
    setShowNewModal(false);
    setFTopic('');
    setFAudience('');
  }

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h2 className={styles.title}>Мои брифы</h2>
        <button className={styles.btnPrimary} onClick={() => setShowNewModal(true)}>
          + Новый бриф
        </button>
      </div>

      {/* ── Brief grid ── */}
      {briefs.length === 0 ? (
        <div className={styles.empty}>Нет брифов. Создайте первый.</div>
      ) : (
        <div className={styles.grid}>
          {briefs.map(brief => {
            const doneCount = brief.subtasks.filter(s => s.status === 'done').length;
            const total = brief.subtasks.length;
            return (
              <div key={brief.id} className={styles.card} onClick={() => setDetailBriefId(brief.id)}>
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    <span className={styles.typeLabel}>{TYPE_LABELS[brief.type]}</span>
                    <h3 className={styles.cardTitle}>{brief.topic}</h3>
                    <p className={styles.cardMeta}>ЦА: {brief.audience} · до {brief.deadline}</p>
                  </div>
                  <Badge variant={brief.status === 'done' ? 'green' : 'orange'}>
                    {brief.status === 'done' ? 'Готов' : 'В работе'}
                  </Badge>
                </div>

                <div className={styles.progress}>
                  <span className={styles.progressText}>{doneCount}/{total} подзадач</span>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: total ? `${(doneCount / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className={styles.dots}>
                  {brief.subtasks.map(sub => (
                    <span
                      key={sub.id}
                      title={`${sub.description}: ${sub.status === 'done' ? 'выполнена' : 'в работе'}`}
                      className={`${styles.dot} ${sub.status === 'done' ? styles.dotDone : styles.dotPending}`}
                    >
                      {sub.status === 'done' ? '✓' : ROLE_ICON[sub.role]}
                    </span>
                  ))}
                </div>

                {brief.finalPublication && (
                  <div className={styles.pubBanner}>✅ Публикация готова</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── New Brief Modal ── */}
      {showNewModal && (
        <div className={styles.backdrop} onMouseDown={() => setShowNewModal(false)}>
          <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Создание брифа</h3>
              <button className={styles.modalClose} onClick={() => setShowNewModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>Тип контента</label>
              <select
                className={styles.select}
                value={fType}
                onChange={e => setFType(e.target.value as BriefType)}
              >
                <option value="article">Статья</option>
                <option value="banner">Баннер</option>
                <option value="video">Видео</option>
                <option value="email">Email</option>
              </select>

              <label className={styles.label}>Тема / описание</label>
              <input
                className={styles.input}
                placeholder="О чём контент..."
                value={fTopic}
                onChange={e => setFTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />

              <label className={styles.label}>Целевая аудитория</label>
              <input
                className={styles.input}
                placeholder="Кому адресован контент..."
                value={fAudience}
                onChange={e => setFAudience(e.target.value)}
              />

              <label className={styles.label}>Дедлайн</label>
              <input
                className={styles.input}
                type="date"
                value={fDeadline}
                onChange={e => setFDeadline(e.target.value)}
              />

              <button
                className={styles.btnPrimary}
                style={{ width: '100%', marginTop: '0.25rem' }}
                onClick={handleCreate}
                disabled={!fTopic.trim()}
              >
                Отправить бриф → AI декомпозиция
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Brief Detail Modal ── */}
      {detailBrief && (
        <div className={styles.backdrop} onMouseDown={() => setDetailBriefId(null)}>
          <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{detailBrief.topic}</h3>
              <button className={styles.modalClose} onClick={() => setDetailBriefId(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailMeta}>
                {[
                  ['Тип', TYPE_LABELS[detailBrief.type]],
                  ['Аудитория', detailBrief.audience],
                  ['Дедлайн', detailBrief.deadline],
                ].map(([label, value]) => (
                  <div key={label} className={styles.detailMetaItem}>
                    <span className={styles.detailMetaLabel}>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
                <div className={styles.detailMetaItem}>
                  <span className={styles.detailMetaLabel}>Статус</span>
                  <Badge variant={detailBrief.status === 'done' ? 'green' : 'orange'}>
                    {detailBrief.status === 'done' ? 'Готов' : 'В работе'}
                  </Badge>
                </div>
              </div>

              <hr className={styles.divider} />

              <h4 className={styles.subheading}>Подзадачи</h4>
              <div className={styles.subtaskList}>
                {detailBrief.subtasks.map(sub => (
                  <div key={sub.id} className={styles.subtaskItem}>
                    <span className={styles.subtaskIcon}>{ROLE_ICON[sub.role]}</span>
                    <div className={styles.subtaskBody}>
                      <div className={styles.subtaskTitle}>{sub.description}</div>
                      <div className={styles.subtaskMeta}>
                        {specName(specialists, sub.assignee)}
                        {sub.mode ? ` · ${sub.mode === 'ai' ? 'AI' : 'Ручной'}` : ''}
                      </div>
                    </div>
                    <Badge variant={sub.status === 'done' ? 'green' : 'blue'}>
                      {sub.status === 'done' ? 'Готово' : 'В работе'}
                    </Badge>
                  </div>
                ))}
              </div>

              {detailBrief.finalPublication && (
                <div className={styles.pubBlock}>
                  <strong>Публикация собрана:</strong>
                  <pre className={styles.pubText}>{detailBrief.finalPublication}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
