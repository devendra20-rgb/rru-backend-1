'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Wrench, Snowflake, Settings, Search, CheckCircle2, Shield } from 'lucide-react';
import styles from './service.module.css';

const serviceTypes = [
  { id: 'periodic', name: 'Periodic Minor Service', est: 'From AED 350', desc: 'Oil, filter, 45-point health check' },
  { id: 'major', name: 'Major Scheduled Service', est: 'From AED 750', desc: 'Spark plugs, fluid flush, brake inspection' },
  { id: 'ac', name: 'AC Performance & Sanitization', est: 'From AED 220', desc: 'Gas recharge, cabin filter, condenser check' },
  { id: 'inspection', name: 'Pre-Purchase Inspection', est: 'From AED 450', desc: 'Comprehensive 150-point report with paint scan' },
];

export default function BookServicePage() {
  const [selectedService, setSelectedService] = useState('periodic');
  const [carBrand, setCarBrand] = useState('Toyota');
  const [carModel, setCarModel] = useState('Land Cruiser');
  const [city, setCity] = useState('Dubai');
  const [date, setDate] = useState('2026-08-20');
  const [submitted, setSubmitted] = useState(false);

  const currentSvc = serviceTypes.find((s) => s.id === selectedService) || serviceTypes[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>Book a Service</span>
      </div>

      <h1 className={styles.pageTitle}>Book Certified Car Service</h1>
      <p className={styles.pageSubtitle}>
        Transparent upfront pricing, certified technicians, and verified service centers across the UAE.
      </p>

      {submitted ? (
        <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center', background: 'var(--white)', padding: 40, borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)' }}>
          <CheckCircle2 size={48} color="var(--green)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 8 }}>Booking Requested!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
            Your appointment for <strong>{carBrand} {carModel}</strong> ({currentSvc.name}) in <strong>{city}</strong> on <strong>{date}</strong> has been received. Our concierge will confirm via WhatsApp shortly.
          </p>
          <button className="btn-primary" onClick={() => setSubmitted(false)}>
            Book Another Service
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.serviceLayout}>
          <div className={styles.bookingForm}>
            {/* Step 1: Select Service */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <Wrench size={18} /> 1. Select Service Package
              </h3>
              <div className={styles.serviceTypeGrid}>
                {serviceTypes.map((svc) => (
                  <div
                    key={svc.id}
                    className={`${styles.serviceTypeCard} ${selectedService === svc.id ? styles.serviceTypeCardActive : ''}`}
                    onClick={() => setSelectedService(svc.id)}
                  >
                    <div className={styles.serviceTypeIcon}>
                      {svc.id === 'ac' ? <Snowflake size={18} /> : svc.id === 'inspection' ? <Search size={18} /> : <Wrench size={18} />}
                    </div>
                    <div>
                      <div className={styles.serviceTypeName}>{svc.name}</div>
                      <div className={styles.serviceTypeEst}>{svc.est}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Car Details */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <Settings size={18} /> 2. Vehicle Information
              </h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Make / Brand</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={carBrand}
                    onChange={(e) => setCarBrand(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Model & Year</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Location & Time */}
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                <Shield size={18} /> 3. Schedule & Contact
              </h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Emirate / City</label>
                  <select
                    className={styles.inputControl}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                  </select>
                </div>
                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>Preferred Date</label>
                  <input
                    type="date"
                    className={styles.inputControl}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Booking Summary</h3>
            <div className={styles.summaryRow}>
              <span>Service</span>
              <strong>{currentSvc.name}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Vehicle</span>
              <strong>{carBrand} {carModel}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Location</span>
              <strong>{city}, UAE</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Date</span>
              <strong>{date}</strong>
            </div>
            <div className={styles.summaryTotal}>
              <span>Estimated Cost</span>
              <span style={{ color: 'var(--amber-dark)' }}>{currentSvc.est}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
              ✓ Transparent pricing. Pay at the service center after job completion.
            </p>
            <button type="submit" className={`btn-primary ${styles.summarySubmit}`}>
              Confirm Booking Request
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
