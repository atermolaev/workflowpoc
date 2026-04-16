import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '@/globals/auth';
import type { UserRole, RegistrationFormData } from './RegistrationPage.types';
import styles from './RegistrationPage.module.css';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Заказчик' },
  { value: 'layout',   label: 'Верстальщик' },
  { value: 'editor',   label: 'Редактор' },
  { value: 'designer', label: 'Дизайнер' },
];

export default function RegistrationPage() {
  const [form, setForm] = useState<RegistrationFormData>({
    login: '',
    password: '',
    role: 'customer',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = registerUser(form.login.trim(), form.password, form.role);
    if (!ok) {
      setError('Логин уже занят. Выберите другой.');
      return;
    }
    setError('');
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.success}>
            <span className={styles.successIcon}>✓</span>
            <h2 className={styles.successTitle}>Аккаунт создан</h2>
            <p className={styles.successText}>
              Логин <strong>{form.login}</strong> зарегистрирован как «{ROLE_OPTIONS.find(o => o.value === form.role)?.label}».
            </p>
            <Link to="/login" className={styles.loginLink}>
              Войти в систему →
            </Link>
          </div>
        </div>
      </div>
    );
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
            <label className={styles.label} htmlFor="reg-login">Логин</label>
            <input
              id="reg-login"
              className={styles.input}
              type="text"
              placeholder="Введите логин"
              value={form.login}
              onChange={e => { setError(''); setForm(prev => ({ ...prev, login: e.target.value })); }}
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-password">Пароль</label>
            <input
              id="reg-password"
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
            <label className={styles.label} htmlFor="reg-role">Роль</label>
            <select
              id="reg-role"
              className={styles.select}
              value={form.role}
              onChange={e => setForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.submit}
            type="submit"
            disabled={!form.login.trim() || !form.password.trim()}
          >
            Создать аккаунт
          </button>
        </form>

        <p className={styles.authLink}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className={styles.link}>Войти</Link>
        </p>
      </div>
    </div>
  );
}
