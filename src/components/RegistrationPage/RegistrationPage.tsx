import { useState } from 'react';
import type { UserRole, RegistrationFormData } from './RegistrationPage.types';
import styles from './RegistrationPage.module.css';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'customer',  label: 'Заказчик' },
  { value: 'layout',    label: 'Верстальщик' },
  { value: 'editor',    label: 'Редактор' },
  { value: 'designer',  label: 'Дизайнер' },
];

export default function RegistrationPage() {
  const [form, setForm] = useState<RegistrationFormData>({
    login: '',
    password: '',
    role: 'customer',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Регистрация:', form);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Создание аккаунта</h1>
          <p className={styles.subtitle}>WorkFlow PoC</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login">Логин</label>
            <input
              id="login"
              className={styles.input}
              type="text"
              placeholder="Введите логин"
              value={form.login}
              onChange={e => setForm(prev => ({ ...prev, login: e.target.value }))}
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Пароль</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder="Введите пароль"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="role">Роль</label>
            <select
              id="role"
              className={styles.select}
              value={form.role}
              onChange={e => setForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className={styles.submit}
            type="submit"
            disabled={!form.login.trim() || !form.password.trim()}
          >
            Создать аккаунт
          </button>
        </form>
      </div>
    </div>
  );
}
