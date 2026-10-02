'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { api } from '@/lib/api';
import styles from './contact.module.css';

/* ── Types ──────────────────────────────────────────────────── */
type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const SUBJECTS = [
  { value: '', label: 'Select a subject' },
  { value: 'General Enquiry', label: 'General Enquiry' },
  { value: 'Website Issue', label: 'Website Issue' },
  { value: 'Car Information', label: 'Car Information' },
  { value: 'Dealer Enquiry', label: 'Dealer Enquiry' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Other', label: 'Other' },
];

/* ── Validation ─────────────────────────────────────────────── */
function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = 'Full name is required.';
  if (!data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!data.subject) errors.subject = 'Please select a subject.';
  if (!data.message.trim()) {
    errors.message = 'Message is required.';
  } else if (data.message.trim().length < 20) {
    errors.message = 'Message must be at least 20 characters.';
  }
  return errors;
}

/* ── Main component ─────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [formState, setFormState] = useState<FormState>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  /* field change */
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name as keyof FormData]) {
      setErrors(validate(next));
    }
  }

  /* blur — mark field as touched */
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(form));
  }

  /* submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = { name: true, email: true, subject: true, message: true };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormState('loading');
    setServerError(null);

    try {
      const res = await api.post<{ success: boolean; message?: string }>('/api/v1/contact', form);
      if (res.success) {
        setFormState('success');
      } else {
        setServerError(res.message || 'Failed to submit form. Please try again.');
        setFormState('error');
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while sending your message. Please try again later.');
      setFormState('error');
    }
  }

  function handleReset() {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setTouched({});
    setServerError(null);
    setFormState('idle');
  }

  /* ── Success state ── */
  if (formState === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.successPanel}>
            <div className={styles.successIcon}>
              <CheckCircle size={44} strokeWidth={1.75} />
            </div>
            <h2 className={styles.successTitle}>Message Sent Successfully!</h2>
            <p className={styles.successBody}>
              Thank you for reaching out to Ride Round UP. Our support team will review your enquiry and respond within 2 business days.
            </p>
            <button onClick={handleReset} className={styles.btnPrimary}>
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={14} />
          <span>Contact Us</span>
        </nav>

        {/* Page Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Have questions about a car, spotted a pricing discrepancy, or want to explore partnership opportunities? We are here to assist you.
          </p>
        </header>

        <div className={styles.layout}>
          {/* ── Left Column: Information & FAQ ── */}
          <aside className={styles.leftCol}>
            {/* Info Card */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardHeading}>Contact Information</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIconWrapper}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Response Time</div>
                    <div className={styles.infoValue}>Within 2 business days</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIconWrapper}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Working Hours</div>
                    <div className={styles.infoValue}>Sun – Thu, 9 AM – 6 PM GST</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIconWrapper}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Location</div>
                    <div className={styles.infoValue}>United Arab Emirates</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & FAQ Card */}
            <div className={styles.faqCard}>
              <div className={styles.faqHeader}>
                <HelpCircle size={24} className={styles.faqIcon} />
                <h3 className={styles.faqTitle}>Looking for Quick Answers?</h3>
              </div>
              <p className={styles.faqText}>
                Check out our comprehensive Help &amp; FAQ section for instant guidance on vehicle comparisons, specs, and dealer queries.
              </p>
              <Link href="/help" className={styles.faqBtn}>
                Visit Help &amp; FAQ →
              </Link>
            </div>
          </aside>

          {/* ── Right Column: Form Card ── */}
          <main className={styles.rightCol}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Send Us a Message</h2>
                <p className={styles.formSub}>
                  Fill out the details below and our team will respond shortly.
                </p>
              </div>

              <form
                id="contact-form"
                onSubmit={handleSubmit}
                className={styles.form}
                noValidate
              >
                {/* Full Name & Email Address */}
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="contact-name" className={styles.label}>
                      Full Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Ismael Ahmed"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`}
                      aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
                      aria-invalid={!!(errors.name && touched.name)}
                    />
                    {errors.name && touched.name && (
                      <span id="name-error" className={styles.errorText} role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="contact-email" className={styles.label}>
                      Email Address <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
                      aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                      aria-invalid={!!(errors.email && touched.email)}
                    />
                    {errors.email && touched.email && (
                      <span id="email-error" className={styles.errorText} role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className={styles.field}>
                  <label htmlFor="contact-subject" className={styles.label}>
                    Subject <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${styles.select} ${errors.subject && touched.subject ? styles.inputError : ''}`}
                    aria-describedby={errors.subject && touched.subject ? 'subject-error' : undefined}
                    aria-invalid={!!(errors.subject && touched.subject)}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value} disabled={s.value === ''}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && touched.subject && (
                    <span id="subject-error" className={styles.errorText} role="alert">
                      {errors.subject}
                    </span>
                  )}
                </div>

                {/* Message Textarea */}
                <div className={styles.field}>
                  <label htmlFor="contact-message" className={styles.label}>
                    Message <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    placeholder="Provide details about your query or feedback…"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${styles.textarea} ${errors.message && touched.message ? styles.inputError : ''}`}
                    aria-describedby={errors.message && touched.message ? 'message-error' : undefined}
                    aria-invalid={!!(errors.message && touched.message)}
                  />
                  <div className={styles.fieldFooter}>
                    {errors.message && touched.message ? (
                      <span id="message-error" className={styles.errorText} role="alert">
                        {errors.message}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className={`${styles.charCount} ${form.message.length > 1000 ? styles.charCountOver : ''}`}>
                      {form.message.length} / 1000
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="contact-submit"
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={formState === 'loading'}
                >
                  {formState === 'loading' ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Sending Message…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>

                {/* Server Error Alert */}
                {formState === 'error' && (
                  <div className={styles.submitError} role="alert">
                    <AlertCircle size={18} />
                    <span>
                      {serverError || 'Failed to send message. Please try again later.'}
                    </span>
                  </div>
                )}
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
