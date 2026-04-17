import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CustomerTab from "@/components/CustomerTab/CustomerTab";
import SpecialistTab from "@/components/SpecialistTab/SpecialistTab";
import { briefCreated, taskFinished, aiApplied, fileUploaded } from "@/redux/slices/workflowSlice";
import { logout } from "@/redux/slices/authSlice";
import { canAccessCustomerTab } from "@/globals/auth";
import type { RootState, AppDispatch } from "@/redux/store";
import type { BriefType } from "@/globals/types";
import styles from "./HomePage.module.css";

const ROLE_LABELS: Record<string, string> = {
  customer: "Заказчик",
  layout: "Верстальщик",
  editor: "Редактор",
  designer: "Дизайнер",
};

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.currentUser)!;
  const { briefs, specialists } = useSelector((state: RootState) => state.workflow);

  const hasCustomerTab = canAccessCustomerTab(user.role);
  const [tab, setTab] = useState<"client" | "specialist">(
    hasCustomerTab ? "client" : "specialist",
  );

  function handleLogout() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  function handleCreateBrief(type: BriefType, topic: string, audience: string, deadline: string) {
    dispatch(briefCreated({ type, topic, audience, deadline }));
  }

  function handleFinishTask(briefId: number, subId: number, mode: "ai" | "manual") {
    dispatch(taskFinished({ briefId, subId, mode }));
  }

  function handleApplyAI(briefId: number, subId: number, command: string) {
    dispatch(aiApplied({ briefId, subId, command }));
  }

  function handleUploadFile(briefId: number, subId: number, filename: string) {
    dispatch(fileUploaded({ briefId, subId, filename }));
  }

  const pendingCount = briefs.reduce(
    (acc, b) => acc + b.subtasks.filter((s) => s.status === "pending").length,
    0,
  );

  const specialistTabContent = (
    <SpecialistTab
      briefs={briefs}
      specialists={specialists}
      onFinish={handleFinishTask}
      onApplyAI={handleApplyAI}
      onUploadFile={handleUploadFile}
    />
  );

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <span className={styles.logo}>WorkFlow PoC</span>

        {hasCustomerTab && (
          <nav className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "client" ? styles.tabActive : ""}`}
              onClick={() => setTab("client")}
            >
              Заказчик
            </button>
            <button
              className={`${styles.tab} ${tab === "specialist" ? styles.tabActive : ""}`}
              onClick={() => setTab("specialist")}
            >
              Специалист
              {pendingCount > 0 && (
                <span className={styles.tabBadge}>{pendingCount}</span>
              )}
            </button>
          </nav>
        )}

        <div className={styles.topBarRight}>
          {specialists.map((s) => (
            <span key={s.id} className={styles.specLoad} title={s.name}>
              {s.name.split(" ")[0]}: {s.load}
            </span>
          ))}

          <div className={styles.userChip}>
            <span className={styles.userLogin}>{user.login}</span>
            <span className={styles.userRole}>{ROLE_LABELS[user.role]}</span>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Выйти"
          >
            ↩
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {hasCustomerTab ? (
          tab === "client" ? (
            <CustomerTab
              briefs={briefs}
              specialists={specialists}
              onCreate={handleCreateBrief}
            />
          ) : (
            specialistTabContent
          )
        ) : (
          specialistTabContent
        )}
      </div>
    </div>
  );
}
