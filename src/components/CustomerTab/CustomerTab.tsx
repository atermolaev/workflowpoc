import { useState, useRef, useCallback } from 'react';
import Badge from '@/components/Badge/Badge';
import { TYPE_LABELS, ROLE_ICON } from '@/globals/constants';
import { specName } from '@/globals/logic';
import type { CustomerTabProps } from './CustomerTab.types';
import styles from './CustomerTab.module.css';

/* ── Helpers ── */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CustomerTab({ briefs, specialists, onCreate }: CustomerTabProps) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailBriefId, setDetailBriefId] = useState<number | null>(null);

  /* ── New brief form ── */
  const [fDeadline, setFDeadline] = useState('2026-07-01');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detailBrief = briefs.find(b => b.id === detailBriefId) ?? null;

  /* ── Modal open/close ── */
  function openModal() {
    setFiles([]);
    setIsDragging(false);
    setShowNewModal(true);
  }

  function closeModal() {
    setShowNewModal(false);
    setFiles([]);
    setIsDragging(false);
  }

  /* ── Form submit ── */
  function handleCreate() {
    if (!files.length) return;
    const topic = files.map(f => f.name).join(', ');
    onCreate('article', topic, 'Широкая аудитория', fDeadline);
    closeModal();
  }

  /* ── Drag & drop handlers ── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only leave if pointer actually left the zone (not just entered a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) setFiles(prev => [...prev, ...dropped]);
  }, []);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length) setFiles(prev => [...prev, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h2 className={styles.title}>Мои брифы</h2>
        <button className={styles.btnPrimary} onClick={openModal}>
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
        <div className={styles.backdrop} onMouseDown={closeModal}>
          <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Создание брифа</h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>

              {/* ── Drop zone ── */}
              <label className={styles.label}>Файлы брифа</label>
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''} ${files.length ? styles.dropZoneHasFiles : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label="Загрузить файлы"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className={styles.fileInputHidden}
                  onChange={handleFileInputChange}
                  tabIndex={-1}
                />

                {isDragging ? (
                  <div className={styles.dropZoneContent}>
                    <span className={styles.dropIcon}>⬇</span>
                    <span className={styles.dropText}>Отпустите для загрузки</span>
                  </div>
                ) : (
                  <div className={styles.dropZoneContent}>
                    <span className={styles.dropIcon}>📎</span>
                    <span className={styles.dropText}>
                      Перетащите файлы сюда
                    </span>
                    <span className={styles.dropHint}>или нажмите для выбора</span>
                  </div>
                )}
              </div>

              {/* ── File list ── */}
              {files.length > 0 && (
                <div className={styles.fileList}>
                  {files.map((file, i) => (
                    <div key={i} className={styles.fileItem}>
                      <span className={styles.fileIcon}>📄</span>
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{formatSize(file.size)}</span>
                      </div>
                      <button
                        className={styles.fileRemove}
                        onClick={e => { e.stopPropagation(); removeFile(i); }}
                        title="Удалить"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Deadline ── */}
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
                disabled={!files.length}
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
