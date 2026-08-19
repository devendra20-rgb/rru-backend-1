'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot } from 'lucide-react';
import styles from './ai.module.css';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  vehicles?: { name: string; price: string }[];
  source?: string;
  assumptions?: string;
}

const suggestedQuestions = [
  '7-seater under AED 150k',
  'Best EV in UAE?',
  'Cheapest car to run daily',
  'SUV under 100k for family',
  'Compare Land Cruiser vs Patrol',
];

const demoResponses: Record<string, Omit<Message, 'id' | 'role'>> = {
  default: {
    content: 'Based on your query, here are some strong matches from the UAE market:',
    vehicles: [
      { name: 'Hyundai Creta 1.5L Smart', price: 'AED 64,900' },
      { name: 'Kia Sportage 2.0L MPI LX', price: 'AED 89,900' },
      { name: 'Hyundai Tucson 2.0L AWD', price: 'AED 99,900' },
    ],
    source: 'Based on UAE market data · verified Aug 2026',
    assumptions: 'Assumed: Family use, daily commute, GCC spec preferred.',
  },
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const resp = demoResponses.default;
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
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.aiPage}>
      {/* Header */}
      <div className={styles.aiHeader}>
        <h1 className={styles.aiTitle}>Ask RideIQ — AI Automotive Assistant</h1>
        <p className={styles.aiSubtitle}>
          Ask about cars like you&apos;d ask a friend. Powered by RideRoundUp verified vehicle data.
        </p>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.chatWelcome}>
            <div className={styles.chatWelcomeIcon}>
              <Bot size={28} />
            </div>
            <h2 className={styles.chatWelcomeTitle}>Hi, I&apos;m RideIQ! How can I help?</h2>
            <p className={styles.chatWelcomeDesc}>
              Tell me your budget, family size, fuel preference or use case.
              I&apos;ll find matching vehicles and show verified sources.
            </p>
            <div className={styles.suggestions}>
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  className={styles.suggestion}
                  onClick={() => handleSend(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className={styles.msgUser}>
              {msg.content}
            </div>
          ) : (
            <div key={msg.id} className={styles.msgBot}>
              <div className={styles.msgBotHeader}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
                {msg.content}
              </div>
              {msg.vehicles?.map((v) => (
                <div key={v.name} className={styles.msgBotVehicle}>
                  <span className={styles.msgBotVehicleName}>{v.name}</span>
                  <span className={styles.msgBotVehiclePrice}>{v.price}</span>
                </div>
              ))}
              {msg.assumptions && (
                <div className={styles.msgBotAssumptions}>
                  ⚠️ {msg.assumptions}
                </div>
              )}
              {msg.source && (
                <div className={styles.msgBotSource}>{msg.source}</div>
              )}
            </div>
          )
        )}

        {isTyping && (
          <div className={styles.typing}>
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className={styles.chatInputBar}>
        <div className={styles.chatInputInner}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder='Try: "7 seater under AED 150k"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="ai-chat-input"
          />
          <button
            className={styles.chatSendBtn}
            onClick={() => handleSend()}
            disabled={isTyping}
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
