import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerTab from '@/components/CustomerTab/CustomerTab';
import SpecialistTab from '@/components/SpecialistTab/SpecialistTab';
import { loadState, persistState } from '@/globals/state';
import { uid, generateSubtasks, assignToSpecialists, assembleIfDone } from '@/globals/logic';
import { loadCurrentUser, clearCurrentUser, canAccessCustomerTab } from '@/globals/auth';
import type { AppState, BriefType, Brief } from '@/globals/types';
import styles from './HomePage.module.css';

const ROLE_LABELS: Record<string, string> = {
  customer: 'Заказчик',
  layout:   'Верстальщик',
  editor:   'Редактор',
  designer: 'Дизайнер',
};

export default function HomePage() {
  const navigate = useNavigate();
  const user = loadCurrentUser()!; // guaranteed by ProtectedRoute
  const hasCustomerTab = canAccessCustomerTab(user.role);

  const [tab, setTab] = useState<'client' | 'specialist'>(
    hasCustomerTab ? 'client' : 'specialist',
  );
  const [appState, setAppState] = useState<AppState>(loadState);

  useEffect(() => { persistState(appState); }, [appState]);

  function handleLogout() {
    clearCurrentUser();
    navigate('/registration', { replace: true });
  }

  /* ── State mutators ── */
  function createBrief(type: BriefType, topic: string, audience: string, deadline: string) {
    setAppState(prev => {
      const brief: Brief = {
        id: uid(), type, topic, audience, deadline,
        status: 'processing', subtasks: [], finalPublication: null,
      };
      const rawSubs = generateSubtasks(brief);
      const { subs, specs } = assignToSpecialists(rawSubs, prev.specialists);
      brief.subtasks = subs;
      return { briefs: [brief, ...prev.briefs], specialists: specs };
    });
  }

  function finishTask(briefId: number, subId: number, mode: 'ai' | 'manual') {
    setAppState(prev => {
      const newSpecs = prev.specialists.map(s => ({ ...s }));
      const newBriefs = prev.briefs.map(b => {
        if (b.id !== briefId) return b;
        const newSubs = b.subtasks.map(s => {
          if (s.id !== subId || s.status === 'done') return s;
          const sp = newSpecs.find(x => x.id === s.assignee);
          if (sp) sp.load = Math.max(0, sp.load - 1);
          return { ...s, status: 'done' as const, mode };
        });
        return assembleIfDone({ ...b, subtasks: newSubs });
      });
      return { briefs: newBriefs, specialists: newSpecs };
    });
  }

  function applyAI(briefId: number, subId: number, command: string) {
    setAppState(prev => ({
      ...prev,
      briefs: prev.briefs.map(b => {
        if (b.id !== briefId) return b;
        return {
          ...b,
          subtasks: b.subtasks.map(s => {
            if (s.id !== subId) return s;
            const newDraft = s.aiDraft + `\n\n---\n[AI по команде: «${command}»] → правка применена.`;
            return { ...s, aiDraft: newDraft, versions: [...s.versions, newDraft] };
          }),
        };
      }),
    }));
  }

  function uploadFile(briefId: number, subId: number, filename: string) {
    setAppState(prev => ({
      ...prev,
      briefs: prev.briefs.map(b => {
        if (b.id !== briefId) return b;
        return {
          ...b,
          subtasks: b.subtasks.map(s =>
            s.id !== subId ? s : { ...s, files: [...s.files, filename] },
          ),
        };
      }),
    }));
  }

  const pendingCount = appState.briefs.reduce(
    (acc, b) => acc + b.subtasks.filter(s => s.status === 'pending').length, 0,
  );

  const specialistTabContent = (
    <SpecialistTab
      briefs={appState.briefs}
      specialists={appState.specialists}
      onFinish={finishTask}
      onApplyAI={applyAI}
      onUploadFile={uploadFile}
    />
  );

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <span className={styles.logo}>WorkFlow PoC</span>

        {/* Tab nav — only rendered when user has access to both tabs */}
        {hasCustomerTab && (
          <nav className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'client' ? styles.tabActive : ''}`}
              onClick={() => setTab('client')}
            >
              Заказчик
            </button>
            <button
              className={`${styles.tab} ${tab === 'specialist' ? styles.tabActive : ''}`}
              onClick={() => setTab('specialist')}
            >
              Специалист
              {pendingCount > 0 && (
                <span className={styles.tabBadge}>{pendingCount}</span>
              )}
            </button>
          </nav>
        )}

        <div className={styles.topBarRight}>
          {/* Specialist loads */}
          {appState.specialists.map(s => (
            <span key={s.id} className={styles.specLoad} title={s.name}>
              {s.name.split(' ')[0]}: {s.load}
            </span>
          ))}

          {/* Current user */}
          <div className={styles.userChip}>
            <span className={styles.userLogin}>{user.login}</span>
            <span className={styles.userRole}>{ROLE_LABELS[user.role]}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Выйти">
            ↩
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {hasCustomerTab ? (
          tab === 'client' ? (
            <CustomerTab
              briefs={appState.briefs}
              specialists={appState.specialists}
              onCreate={createBrief}
            />
          ) : specialistTabContent
        ) : (
          specialistTabContent
        )}
      </div>
    </div>
  );
}
