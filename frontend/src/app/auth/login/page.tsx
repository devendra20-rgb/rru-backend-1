'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/auth/auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [country, setCountry] = useState('Dubai');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login redirect
    router.push('/');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <Link href="/" className={styles.authLogo}>
          ride<span>roundup</span>
        </Link>
        <h1 className={styles.authTitle}>Welcome back</h1>
        <p className={styles.authSubtitle}>
          Sign in to save comparisons, view saved vehicles, and track ownership costs.
        </p>

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Country / Region</label>
            <select
              className={styles.formInput}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="Dubai">Dubai (UAE)</option>
              <option value="Abu Dhabi" disabled>Abu Dhabi (Coming Soon)</option>
              <option value="Sharjah" disabled>Sharjah (Coming Soon)</option>
              <option value="Ajman" disabled>Ajman (Coming Soon)</option>
              <option value="Ras Al Khaimah" disabled>Ras Al Khaimah (Coming Soon)</option>
              <option value="Saudi Arabia" disabled>Saudi Arabia (Coming Soon)</option>
              <option value="Qatar" disabled>Qatar (Coming Soon)</option>
              <option value="Kuwait" disabled>Kuwait (Coming Soon)</option>
              <option value="Oman" disabled>Oman (Coming Soon)</option>
              <option value="Bahrain" disabled>Bahrain (Coming Soon)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email address</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              className={styles.formInput}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formExtra}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a href="#" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign In
          </button>
        </form>

        <div className={styles.authFooter}>
          Don&apos;t have an account? <Link href="/auth/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
