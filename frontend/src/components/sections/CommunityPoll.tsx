'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { percentage } from '@/lib/utils';
import { Check, Flame } from 'lucide-react';
import styles from './sections.module.css';

const DEFAULT_POLL = {
  _id: 'p1',
  title: 'Land Cruiser vs Patrol',
  optionA: { label: 'Toyota Land Cruiser', votes: 5400, vehicleSlug: 'toyota-land-cruiser-gxr-v6-2026' },
  optionB: { label: 'Nissan Patrol', votes: 4600, vehicleSlug: 'nissan-patrol-le-platinum-2026' },
};

export default function CommunityPoll() {
  const [votesA, setVotesA] = useState(DEFAULT_POLL.optionA.votes);
  const [votesB, setVotesB] = useState(DEFAULT_POLL.optionB.votes);
  const [userVoted, setUserVoted] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rru_poll_${DEFAULT_POLL._id}`);
      if (saved === 'A' || saved === 'B') {
        setUserVoted(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleVote = (option: 'A' | 'B') => {
    if (userVoted) return;

    if (option === 'A') {
      setVotesA((prev) => prev + 1);
      setUserVoted('A');
    } else {
      setVotesB((prev) => prev + 1);
      setUserVoted('B');
    }

    try {
      localStorage.setItem(`rru_poll_${DEFAULT_POLL._id}`, option);
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
          <h3 className={styles.pollQuestion}>{DEFAULT_POLL.title}</h3>
          <div className={styles.pollVotes}>
            <span>
              {DEFAULT_POLL.optionA.label} · {pctA}% {userVoted === 'A' && '✓ (Your pick)'}
            </span>
            <span>
              {DEFAULT_POLL.optionB.label} · {pctB}% {userVoted === 'B' && '✓ (Your pick)'}
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
