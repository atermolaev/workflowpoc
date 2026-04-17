import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '@/globals/auth';
import { setUser } from '@/redux/slices/authSlice';
import type { AppDispatch } from '@/redux/store';
import type { LoginFormData } from './LoginPage.types';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<LoginFormData>({ login: '', password: '' });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = loginUser(form.login.trim(), form.password);
    if (!user) {
      setError('Неверный логин или пароль.');
      return;
    }
    dispatch(setUser(user));
    navigate('/', { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Вход</h1>
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
              onChange={e => { setError(''); setForm(prev => ({ ...prev, login: e.target.value })); }}
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
              onChange={e => { setError(''); setForm(prev => ({ ...prev, password: e.target.value })); }}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.submit}
            type="submit"
            disabled={!form.login.trim() || !form.password.trim()}
          >
            Войти
          </button>
        </form>

        <p className={styles.authLink}>
          Нет аккаунта?{' '}
          <Link to="/registration" className={styles.link}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
