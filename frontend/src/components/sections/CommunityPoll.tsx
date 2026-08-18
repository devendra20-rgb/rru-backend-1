'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pollMock } from '@/data/homepage.mock';
import { percentage } from '@/lib/utils';
import { Check, Flame } from 'lucide-react';
import styles from './sections.module.css';

export default function CommunityPoll() {
  const [votesA, setVotesA] = useState(pollMock.optionA.votes);
  const [votesB, setVotesB] = useState(pollMock.optionB.votes);
  const [userVoted, setUserVoted] = useState<'A' | 'B' | null>(null);

  // Check existing vote from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rru_poll_${pollMock._id}`);
      if (saved === 'A' || saved === 'B') {
        setUserVoted(saved);
      }
    } catch {
      // ignore in SSR
    }
  }, []);

  const handleVote = (option: 'A' | 'B') => {
    if (userVoted) return; // Prevent double voting

    if (option === 'A') {
      setVotesA((prev) => prev + 1);
      setUserVoted('A');
    } else {
      setVotesB((prev) => prev + 1);
      setUserVoted('B');
    }

    try {
      localStorage.setItem(`rru_poll_${pollMock._id}`, option);
    } catch {
      // ignore
    }
  };

  const total = votesA + votesB;
  const pctA = percentage(votesA, total);
  const pctB = 100 - pctA;

  return (
    <section className={styles.poll} id="community-poll">
      <div className={styles.pollGrid}>
        <div>
          <div className={`eyebrow ${styles.pollEyebrow}`}>
            <Flame size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            LIGHTWEIGHT ENGAGEMENT
          </div>
          <h2 className={styles.pollTitle}>Which one would you pick?</h2>
          <p className={styles.pollDesc}>
            A simple recurring interaction keeps the homepage alive and
            naturally funnels users into comparison pages.
          </p>
          <Link href="/compare" className="btn-light" style={{ fontSize: 12, padding: '8px 16px' }}>
            Compare Land Cruiser vs Patrol →
          </Link>
        </div>

        <div className={styles.pollBox}>
          <h3 className={styles.pollQuestion}>{pollMock.title}</h3>
          <div className={styles.pollVotes}>
            <span>
              {pollMock.optionA.label} · {pctA}% {userVoted === 'A' && '✓ (Your pick)'}
            </span>
            <span>
              {pollMock.optionB.label} · {pctB}% {userVoted === 'B' && '✓ (Your pick)'}
            </span>
          </div>

          <div className={styles.pollBar}>
            <i className={styles.pollBarFill} style={{ width: `${pctA}%` }} />
          </div>

          <div className={styles.pollBtns}>
            <button
              type="button"
              className={styles.voteBtn}
              style={{
                borderColor: userVoted === 'A' ? 'var(--petrol)' : undefined,
                background: userVoted === 'A' ? 'var(--mist)' : undefined,
                fontWeight: userVoted === 'A' ? 900 : 700,
              }}
              onClick={() => handleVote('A')}
            >
              {userVoted === 'A' && <Check size={13} style={{ display: 'inline', marginRight: 4 }} />}
              Vote Land Cruiser
            </button>

            <button
              type="button"
              className={styles.voteBtn}
              style={{
                borderColor: userVoted === 'B' ? 'var(--petrol)' : undefined,
                background: userVoted === 'B' ? 'var(--mist)' : undefined,
                fontWeight: userVoted === 'B' ? 900 : 700,
              }}
              onClick={() => handleVote('B')}
            >
              {userVoted === 'B' && <Check size={13} style={{ display: 'inline', marginRight: 4 }} />}
              Vote Patrol
            </button>
          </div>

          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, textAlign: 'center' }}>
            {total.toLocaleString()} total verified votes recorded
          </div>
        </div>
      </div>
    </section>
  );
}
