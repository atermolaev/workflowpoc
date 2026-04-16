import { useState, useEffect, useRef } from 'react';
import Badge from '@/components/Badge/Badge';
import { ROLE_ICON } from '@/globals/constants';
import { specName } from '@/globals/logic';
import type { SpecialistTabProps, ChatMsg } from './SpecialistTab.types';
import styles from './SpecialistTab.module.css';

export default function SpecialistTab({
  briefs,
  specialists,
  onFinish,
  onApplyAI,
  onUploadFile,
}: SpecialistTabProps) {
  // All pending tasks across all briefs, sorted by brief deadline
  const allTasks = briefs.flatMap(b =>
    b.subtasks
      .filter(s => s.status === 'pending')
      .map(s => ({ brief: b, sub: s })),
  );

  const [selectedId, setSelectedId] = useState<number | null>(
    allTasks.length ? allTasks[0].sub.id : null,
  );
  const [currentVersion, setCurrentVersion] = useState(0);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { from: 'ai', text: 'Напишите команду, чтобы изменить черновик.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = allTasks.find(t => t.sub.id === selectedId) ?? null;

  // Jump to latest version when AI creates a new one
  useEffect(() => {
    if (selected) setCurrentVersion(selected.sub.versions.length - 1);
  }, [selected?.sub.versions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  function selectTask(id: number) {
    setSelectedId(id);
    setChatMsgs([{ from: 'ai', text: 'Напишите команду, чтобы изменить черновик.' }]);
    setChatInput('');
  }

  function handleSendChat() {
    const cmd = chatInput.trim();
    if (!cmd || !selected) return;
    setChatMsgs(prev => [...prev, { from: 'user', text: cmd }]);
    onApplyAI(selected.brief.id, selected.sub.id, cmd);
    setChatMsgs(prev => [...prev, { from: 'ai', text: `✅ Применил: «${cmd}»` }]);
    setChatInput('');
  }

  function handleFileUpload() {
    if (!fileInputRef.current?.files?.length || !selected) return;
    const file = fileInputRef.current.files[0];
    onUploadFile(selected.brief.id, selected.sub.id, file.name);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDone() {
    if (!selected) return;
    const mode = selected.sub.files.length > 0 ? 'manual' : 'ai';
    onFinish(selected.brief.id, selected.sub.id, mode);
    const remaining = allTasks.filter(t => t.sub.id !== selected.sub.id);
    setSelectedId(remaining.length ? remaining[0].sub.id : null);
    setChatMsgs([{ from: 'ai', text: 'Напишите команду, чтобы изменить черновик.' }]);
  }

  const displayDraft = selected
    ? (selected.sub.versions[currentVersion] ?? selected.sub.aiDraft)
    : '';

  return (
    <div className={styles.layout}>
      {/* ── Left: task list ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>Мои задачи</h3>
          <span className={styles.sidebarCount}>{allTasks.length}</span>
        </div>

        {allTasks.length === 0 ? (
          <div className={styles.sidebarEmpty}>Нет активных задач</div>
        ) : (
          allTasks.map(({ brief, sub }, idx) => (
            <div
              key={sub.id}
              className={`${styles.taskItem} ${selectedId === sub.id ? styles.taskItemActive : ''}`}
              onClick={() => selectTask(sub.id)}
            >
              <div className={styles.taskItemTop}>
                <span className={styles.priority}>#{idx + 1}</span>
                <span>{ROLE_ICON[sub.role]}</span>
              </div>
              <div className={styles.taskItemTitle}>{sub.description}</div>
              <div className={styles.taskItemBrief}>{brief.topic}</div>
              <div className={styles.taskItemMeta}>
                <Badge variant="orange">В работе</Badge>
                <span className={styles.taskItemDeadline}>{brief.deadline}</span>
              </div>
            </div>
          ))
        )}
      </aside>

      {/* ── Center: task detail ── */}
      <main className={styles.detail}>
        {!selected ? (
          <p className={styles.emptyHint}>Выберите задачу из списка слева</p>
        ) : (
          <>
            {/* Header */}
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.detailBrief}>{selected.brief.topic}</span>
                <h2 className={styles.detailTitle}>
                  {ROLE_ICON[selected.sub.role]} {selected.sub.description}
                </h2>
                <span className={styles.detailAssignee}>
                  {specName(specialists, selected.sub.assignee)}
                </span>
              </div>
              <div className={styles.detailHeaderRight}>
                <Badge variant="orange">В работе</Badge>
                <span className={styles.detailDeadline}>до {selected.brief.deadline}</span>
              </div>
            </div>

            {/* Draft with version history */}
            <div className={styles.draftBlock}>
              <div className={styles.draftTopBar}>
                <span className={styles.draftLabel}>
                  AI-черновик · v{currentVersion + 1}.0
                </span>
                {selected.sub.versions.length > 1 && (
                  <div className={styles.versionList}>
                    {selected.sub.versions.map((_, i) => (
                      <button
                        key={i}
                        className={`${styles.versionBtn} ${currentVersion === i ? styles.versionBtnActive : ''}`}
                        onClick={() => setCurrentVersion(i)}
                      >
                        v{i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <pre className={styles.draftText}>{displayDraft}</pre>
            </div>

            {/* Manual file upload */}
            <div className={styles.manualPanel}>
              <span className={styles.manualLabel}>Ручной режим — загрузить файл</span>
              <div className={styles.manualRow}>
                <input ref={fileInputRef} type="file" className={styles.fileInput} />
                <button className={styles.btnSecondary} onClick={handleFileUpload}>
                  Загрузить
                </button>
              </div>
              {selected.sub.files.length > 0 && (
                <div className={styles.fileList}>
                  {selected.sub.files.map((f, i) => (
                    <span key={i} className={styles.fileItem}>✓ {f}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Done bar */}
            <div className={styles.doneBar}>
              <span className={styles.doneModeHint}>
                {selected.sub.files.length > 0 ? 'Режим: ручная загрузка' : 'Режим: AI-правки'}
              </span>
              <button className={styles.doneBtn} onClick={handleDone}>
                Готово
              </button>
            </div>
          </>
        )}
      </main>

      {/* ── Right: AI chat ── */}
      <aside className={styles.chat}>
        <h3 className={styles.chatTitle}>AI-помощник</h3>
        <div className={styles.chatMessages}>
          {chatMsgs.map((msg, i) => (
            <div key={i} className={msg.from === 'ai' ? styles.aiMsg : styles.userMsg}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className={styles.chatInputRow}>
          <input
            className={styles.chatInput}
            placeholder="например: сделай заголовок короче"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendChat()}
            disabled={!selected}
          />
          <button
            className={styles.chatSendBtn}
            onClick={handleSendChat}
            disabled={!selected || !chatInput.trim()}
          >
            ↑
          </button>
        </div>
        {!selected && (
          <p className={styles.chatHint}>Выберите задачу, чтобы работать с AI-помощником</p>
        )}
      </aside>
    </div>
  );
}
