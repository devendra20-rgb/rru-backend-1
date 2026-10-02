'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/auth/auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Dubai');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <Link href="/" className={styles.authLogo}>
          ride<span>roundup</span>
        </Link>
        <h1 className={styles.authTitle}>Create your account</h1>
        <p className={styles.authSubtitle}>
          Join RideRoundUp to discover cars and make transparent ownership decisions.
        </p>

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Full name</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Ahmad Al-Mansoor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <label className={styles.formLabel}>Country / Region</label>
            <select
              className={styles.formInput}
              value={city}
              onChange={(e) => setCity(e.target.value)}
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
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              className={styles.formInput}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} style={{ marginTop: 10 }}>
            Create Account
          </button>
        </form>

        <div className={styles.authFooter}>
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
