'use client';

import { useState, useRef, useEffect, useId } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Users,
  Wallet,
  Zap,
  GitCompare,
  Fuel,
  ShieldCheck,
  RotateCcw,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';
import { AI_BOT_NAME } from '@/lib/constants';
import styles from './ai.module.css';

interface VehicleSuggestion {
  name: string;
  price: string;
  note?: string;
  href: string;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  vehicles?: VehicleSuggestion[];
  source?: string;
  assumptions?: string;
}

interface StarterPrompt {
  id: string;
  label: string;
  query: string;
  hint: string;
  icon: typeof Users;
}

const starterPrompts: StarterPrompt[] = [
  {
    id: 'family',
    label: 'Family SUV',
    query: '7-seater under AED 150k for family use',
    hint: 'Space, safety, budget',
    icon: Users,
  },
  {
    id: 'budget',
    label: 'Tight budget',
    query: 'Best cars under AED 100k in UAE',
    hint: 'Starting price first',
    icon: Wallet,
  },
  {
    id: 'ev',
    label: 'Go electric',
    query: 'Best EV or hybrid for Dubai commuting',
    hint: 'Fuel & charging',
    icon: Zap,
  },
  {
    id: 'compare',
    label: 'Help me choose',
    query: 'Compare Land Cruiser vs Patrol for daily use',
    hint: 'Side-by-side fit',
    icon: GitCompare,
  },
  {
    id: 'running',
    label: 'Low running cost',
    query: 'Cheapest car to run daily in UAE',
    hint: 'Ownership reality',
    icon: Fuel,
  },
];

function buildResponse(query: string): Omit<Message, 'id' | 'role'> {
  const q = query.toLowerCase();

  if (q.includes('land cruiser') || q.includes('patrol') || q.includes('compare')) {
    return {
      content:
        'For daily UAE driving, both are strong full-size SUVs — Patrol usually wins on presence and V8 feel; Land Cruiser leans toward long-haul durability. Here are close catalog matches to explore next:',
      vehicles: [
        {
          name: 'Nissan Patrol LE Platinum V8',
          price: 'AED 340,000',
          note: '8 seats · petrol',
          href: '/new-cars?search=patrol',
        },
        {
          name: 'Toyota Land Cruiser GXR V6',
          price: 'AED 335,000',
          note: '7 seats · petrol',
          href: '/new-cars?search=land%20cruiser',
        },
        {
          name: 'Toyota Land Cruiser VXR',
          price: 'AED 390,000',
          note: 'Higher trim',
          href: '/new-cars?search=land%20cruiser',
        },
      ],
      source: 'Based on RideRoundUp UAE catalog · active listings',
      assumptions: 'Assumed: daily use, GCC preference, no off-road specialty requirement.',
    };
  }

  if (q.includes('ev') || q.includes('electric') || q.includes('hybrid')) {
    return {
      content:
        'If you want lower fuel spend in Dubai traffic, start with these electric and hybrid options from the current catalog:',
      vehicles: [
        {
          name: 'Tesla Model Y Long Range AWD',
          price: 'AED 195,000',
          note: 'Electric · 5 seats',
          href: '/new-cars?fuelType=Electric',
        },
        {
          name: 'Toyota Camry 2.5L Hybrid XLE',
          price: 'AED 125,000',
          note: 'Hybrid · sedan',
          href: '/new-cars?fuelType=Hybrid',
        },
        {
          name: 'Hyundai Tucson 2.0L GDI',
          price: 'AED 115,000',
          note: 'Efficient petrol SUV',
          href: '/new-cars?search=tucson',
        },
      ],
      source: 'Based on RideRoundUp UAE catalog · fuel filters applied',
      assumptions: 'Assumed: commuting focus, home/work charging access optional.',
    };
  }

  if (q.includes('100') || q.includes('budget') || q.includes('cheap') || q.includes('under')) {
    return {
      content:
        'Here are accessible starting points under a tighter UAE budget — prices are catalog starting figures:',
      vehicles: [
        {
          name: 'Hyundai Creta 1.5L Smart',
          price: 'AED 79,000',
          note: 'SUV · 5 seats',
          href: '/new-cars?maxPrice=100000',
        },
        {
          name: 'Kia Sportage 2.0L EX AWD',
          price: 'AED 99,000',
          note: 'Under 100k band',
          href: '/new-cars?maxPrice=100000',
        },
        {
          name: 'Hyundai Tucson 2.0L GDI',
          price: 'AED 115,000',
          note: 'Slightly above 100k',
          href: '/new-cars?search=tucson',
        },
      ],
      source: 'Based on RideRoundUp UAE catalog · verified pricing where available',
      assumptions: 'Assumed: new cars only, GCC spec preferred, city + highway mix.',
    };
  }

  return {
    content:
      'Based on what you asked, these are strong matches from the UAE market. Open any car to see features, specs, and ownership cost:',
    vehicles: [
      {
        name: 'Hyundai Creta 1.5L Smart',
        price: 'AED 79,000',
        note: 'Compact SUV',
        href: '/new-cars?search=creta',
      },
      {
        name: 'Kia Sportage 2.0L EX AWD',
        price: 'AED 99,000',
        note: 'Family-friendly',
        href: '/new-cars?search=sportage',
      },
      {
        name: 'Toyota Prado TXL 2.4L',
        price: 'AED 220,000',
        note: '7 seats',
        href: '/new-cars?search=prado',
      },
    ],
    source: 'Based on RideRoundUp UAE catalog · active listings',
    assumptions: 'Assumed: Family use, daily commute, GCC spec preferred.',
  };
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();
  const hasChat = messages.length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    window.setTimeout(() => {
      const resp = buildResponse(query);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: resp.content,
        vehicles: resp.vehicles,
        source: resp.source,
        assumptions: resp.assumptions,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.aiPage}>
      <div className={styles.shell}>
        {/* Side context — desktop */}
        <aside className={styles.sideRail} aria-label="About RideIQ">
          <div className={styles.brandMark}>
            <span className={styles.brandIcon} aria-hidden>
              <Sparkles size={18} />
            </span>
            <div>
              <div className={styles.brandName}>{AI_BOT_NAME}</div>
              <div className={styles.brandTag}>Automotive assistant</div>
            </div>
          </div>

          <p className={styles.sideCopy}>
            Ask in plain language — budget, seats, fuel, or compare two cars. I&apos;ll point you to
            verified UAE listings on RideRoundUp.
          </p>

          <ul className={styles.trustList}>
            <li>
              <ShieldCheck size={15} aria-hidden />
              UAE catalog pricing
            </li>
            <li>
              <MessageSquare size={15} aria-hidden />
              Plain-language answers
            </li>
            <li>
              <ArrowUpRight size={15} aria-hidden />
              Jump straight into Explore
            </li>
          </ul>

          {hasChat && (
            <button type="button" className={styles.newChatBtn} onClick={resetChat}>
              <RotateCcw size={14} aria-hidden />
              New conversation
            </button>
          )}
        </aside>

        {/* Main chat column */}
        <section className={styles.mainColumn}>
          <header className={styles.topBar}>
            <div className={styles.topBarLeft}>
              <span className={styles.mobileBrandIcon} aria-hidden>
                <Sparkles size={16} />
              </span>
              <div>
                <h1 className={styles.pageTitle}>Ask {AI_BOT_NAME}</h1>
                <p className={styles.pageSubtitle}>Find the right car with clearer ownership context</p>
              </div>
            </div>
            {hasChat && (
              <button type="button" className={styles.newChatBtnMobile} onClick={resetChat}>
                <RotateCcw size={14} aria-hidden />
                New
              </button>
            )}
          </header>

          <div className={styles.chatArea} role="log" aria-live="polite" aria-relevant="additions">
            {!hasChat && (
              <div className={styles.welcome}>
                <div className={styles.welcomeHero}>
                  <div className={styles.welcomeBadge}>
                    <Sparkles size={14} aria-hidden />
                    Powered by RideRoundUp data
                  </div>
                  <h2 className={styles.welcomeTitle}>
                    What are you looking for?
                  </h2>
                  <p className={styles.welcomeDesc}>
                    Start with a goal below, or type your own question — like you&apos;d ask a
                    knowledgeable friend at a showroom.
                  </p>
                </div>

                <div className={styles.promptGrid}>
                  {starterPrompts.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={styles.promptCard}
                        style={{ animationDelay: `${idx * 60}ms` }}
                        onClick={() => handleSend(p.query)}
                      >
                        <span className={styles.promptIcon} aria-hidden>
                          <Icon size={18} />
                        </span>
                        <span className={styles.promptText}>
                          <span className={styles.promptLabel}>{p.label}</span>
                          <span className={styles.promptHint}>{p.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className={`${styles.msgRow} ${styles.msgEnter}`}>
                  <div className={styles.msgUserBubble}>{msg.content}</div>
                </div>
              ) : (
                <div key={msg.id} className={`${styles.msgBotRow} ${styles.msgEnter}`}>
                  <div className={styles.botAvatar} aria-hidden>
                    <Sparkles size={14} />
                  </div>
                  <div className={styles.msgBot}>
                    <p className={styles.msgBotText}>{msg.content}</p>

                    {msg.vehicles && msg.vehicles.length > 0 && (
                      <div className={styles.vehicleList}>
                        {msg.vehicles.map((v) => (
                          <Link key={v.name} href={v.href} className={styles.vehicleCard}>
                            <div className={styles.vehicleMain}>
                              <span className={styles.vehicleName}>{v.name}</span>
                              {v.note && <span className={styles.vehicleNote}>{v.note}</span>}
                            </div>
                            <div className={styles.vehicleMeta}>
                              <span className={styles.vehiclePrice}>{v.price}</span>
                              <ArrowUpRight size={14} aria-hidden />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {msg.assumptions && (
                      <div className={styles.msgAssumptions}>{msg.assumptions}</div>
                    )}
                    {msg.source && <div className={styles.msgSource}>{msg.source}</div>}
                  </div>
                </div>
              ),
            )}

            {isTyping && (
              <div className={styles.msgBotRow}>
                <div className={styles.botAvatar} aria-hidden>
                  <Sparkles size={14} />
                </div>
                <div className={styles.typing} aria-label={`${AI_BOT_NAME} is typing`}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className={styles.composerWrap}>
            {hasChat && (
              <div className={styles.quickRow}>
                {starterPrompts.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.quickChip}
                    onClick={() => handleSend(p.query)}
                    disabled={isTyping}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <form
              className={styles.composer}
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <label htmlFor={inputId} className={styles.srOnly}>
                Ask {AI_BOT_NAME} about cars
              </label>
              <textarea
                id={inputId}
                ref={inputRef}
                className={styles.composerInput}
                placeholder='e.g. “7 seater under AED 150k for school runs”'
                value={input}
                rows={1}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={isTyping || !input.trim()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
            <p className={styles.composerHint}>
              Enter to send · Shift+Enter for a new line · Suggestions open Explore listings
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
