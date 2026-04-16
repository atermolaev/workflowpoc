import type { CurrentUser, UserRole } from './types';

/* ── Storage keys ── */
const SESSION_KEY = 'workflow_poc_user';
const USERS_KEY   = 'workflow_poc_users';

/* ── Users registry ─────────────────────────────────────────────────────── */
interface StoredUser {
  login: string;
  password: string;
  role: UserRole;
}

function loadUsers(): Record<string, StoredUser> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, StoredUser>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Регистрирует нового пользователя. Возвращает false если логин уже занят. */
export function registerUser(login: string, password: string, role: UserRole): boolean {
  const users = loadUsers();
  if (users[login]) return false;
  users[login] = { login, password, role };
  saveUsers(users);
  return true;
}

/**
 * Проверяет учётные данные и, если они верны, сохраняет сессию.
 * Возвращает CurrentUser при успехе или null при ошибке.
 */
export function loginUser(login: string, password: string): CurrentUser | null {
  const users = loadUsers();
  const user = users[login];
  if (!user || user.password !== password) return null;
  const current: CurrentUser = { login: user.login, role: user.role };
  saveCurrentUser(current);
  return current;
}

/* ── Session ─────────────────────────────────────────────────────────────── */
export function loadCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: CurrentUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

/* ── Access control ──────────────────────────────────────────────────────── */
/** Заказчик видит обе вкладки; специалисты — только свою */
export function canAccessCustomerTab(role: UserRole): boolean {
  return role === 'customer';
}
