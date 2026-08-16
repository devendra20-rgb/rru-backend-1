'use client';

import { pollMock } from '@/data/homepage.mock';
import { percentage } from '@/lib/utils';
import styles from './sections.module.css';

export default function CommunityPoll() {
  const poll = pollMock;
  const pctA = percentage(poll.optionA.votes, poll.totalVotes);

  return (
    <section className={styles.poll} id="community-poll">
      <div className={styles.pollGrid}>
        <div>
          <div className={`eyebrow ${styles.pollEyebrow}`}>
            LIGHTWEIGHT ENGAGEMENT
          </div>
          <h2 className={styles.pollTitle}>Which one would you pick?</h2>
          <p className={styles.pollDesc}>
            A simple recurring interaction keeps the homepage alive and
            naturally funnels users into comparison pages.
          </p>
        </div>

        <div className={styles.pollBox}>
          <h3 className={styles.pollQuestion}>{poll.title}</h3>
          <div className={styles.pollVotes}>
            <span>{poll.optionA.label} · {pctA}%</span>
            <span>{poll.optionB.label} · {100 - pctA}%</span>
          </div>
          <div className={styles.pollBar}>
            <i className={styles.pollBarFill} style={{ width: `${pctA}%` }} />
          </div>
          <div className={styles.pollBtns}>
            <button className={styles.voteBtn}>
              Vote {poll.optionA.label.split(' ').pop()}
            </button>
            <button className={styles.voteBtn}>
              Vote {poll.optionB.label.split(' ').pop()}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
