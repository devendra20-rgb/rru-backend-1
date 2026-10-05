'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, Check, ArrowRight, RotateCcw, ShieldCheck, Zap, Car } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import type { Vehicle } from '@/types/vehicle';
import { formatPrice } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import Skeleton from '@/components/ui/Skeleton';
import styles from './matchmaker.module.css';

const USAGE_OPTIONS = [
  { id: 'commute', title: 'Daily Commute', desc: 'Fuel efficient, compact, easy city driving & parking', icon: '🚗' },
  { id: 'family', title: 'Family & Trips', desc: 'Spacious 7+ seater, maximum safety & large boot space', icon: '👨‍👩‍👧‍👦' },
  { id: 'offroad', title: 'Off-Road & Dune', desc: '4x4 / AWD SUV with high power & ground clearance', icon: '🏞️' },
  { id: 'luxury', title: 'Luxury & Tech', desc: 'Executive comfort, cutting-edge tech & status', icon: '💎' },
];

const BUDGET_OPTIONS = [
  { id: 'budget-1', label: 'Under AED 1,500 / mo', minPrice: 0, maxPrice: 120000 },
  { id: 'budget-2', label: 'AED 1,500 – 3,000 / mo', minPrice: 100000, maxPrice: 220000 },
  { id: 'budget-3', label: 'AED 3,000 – 5,000 / mo', minPrice: 200000, maxPrice: 380000 },
  { id: 'budget-4', label: 'AED 5,000+ / mo', minPrice: 350000, maxPrice: Infinity },
];

const FUEL_OPTIONS = [
  { id: 'any', label: 'Any Powertrain', desc: 'Show best overall matches' },
  { id: 'hybrid-ev', label: 'Electric & Hybrid (EV)', desc: 'Lowest fuel costs & eco-friendly' },
  { id: 'petrol', label: 'Petrol', desc: 'Traditional performance & easy refueling' },
];

function CarMatchImage({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#94a3b8' }}>
        <Car size={42} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      className={styles.cardImg}
      onError={() => setHasError(true)}
    />
  );
}

export default function CarMatchmakerPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [usage, setUsage] = useState<string>('commute');
  const [budget, setBudget] = useState<string>('budget-2');
  const [fuel, setFuel] = useState<string>('any');
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehiclesService.getAll().then((res) => {
      setAllVehicles(res || []);
      setLoading(false);
    }).catch(() => {
      setAllVehicles([]);
      setLoading(false);
    });
  }, []);

  const getMatchedVehicles = () => {
    if (!allVehicles || allVehicles.length === 0) return [];

    let list = [...allVehicles];

    // Filter by budget
    const budgetObj = BUDGET_OPTIONS.find((b) => b.id === budget);
    let budgetFiltered = [...list];
    if (budgetObj) {
      budgetFiltered = list.filter((v) => {
        const p = v.priceFrom || 0;
        if (p <= 0) return true; // Include On Request cars
        if (budgetObj.minPrice && p < budgetObj.minPrice) return false;
        if (budgetObj.maxPrice && budgetObj.maxPrice !== Infinity && p > budgetObj.maxPrice) return false;
        return true;
      });
    }

    if (budgetFiltered.length > 0) {
      list = budgetFiltered;
    }

    // Filter by fuel
    if (fuel === 'hybrid-ev') {
      const fuelFiltered = list.filter((v) => {
        const ft = (v.fuelType || '').toLowerCase();
        return ft.includes('hybrid') || ft.includes('electric') || ft.includes('ev');
      });
      if (fuelFiltered.length > 0) list = fuelFiltered;
    } else if (fuel === 'petrol') {
      const fuelFiltered = list.filter((v) => {
        const ft = (v.fuelType || '').toLowerCase();
        return ft.includes('petrol') || ft.includes('gasoline');
      });
      if (fuelFiltered.length > 0) list = fuelFiltered;
    }

    // Sort by relevance to usage
    if (usage === 'family') {
      list.sort((a, b) => (b.seats || 5) - (a.seats || 5));
    } else if (usage === 'offroad') {
      list.sort((a, b) => {
        const aOff = (a.bodyType === 'SUV' || (a.drivetrain || '').includes('4') || (a.drivetrain || '').includes('AWD')) ? 1 : 0;
        const bOff = (b.bodyType === 'SUV' || (b.drivetrain || '').includes('4') || (b.drivetrain || '').includes('AWD')) ? 1 : 0;
        return bOff - aOff;
      });
    } else if (usage === 'luxury') {
      list.sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
    } else {
      // Commute - sort by efficiency or lower price
      list.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
    }

    return list.slice(0, 3);
  };

  const matches = step === 4 ? getMatchedVehicles() : [];

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <span>Smart Car Matchmaker</span>
        </div>
        <div className={styles.heroTitleBox}>
          <span className={styles.heroBadge}>
            <Sparkles size={13} /> AI Powered Matcher
          </span>
          <h1 className={styles.title}>Find Your Ideal Car Match in 60 Seconds</h1>
          <p className={styles.subtitle}>
            Answer 3 quick preferences and our smart engine will calculate your highest-matching vehicles in the UAE.
          </p>
        </div>
      </div>

      {step < 4 ? (
        <div className={styles.card}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className={styles.stepHeader}>
            <span className={styles.stepCount}>Step {step} of 3</span>
            <h2 className={styles.questionTitle}>
              {step === 1 && 'What is your primary car usage?'}
              {step === 2 && 'What is your target monthly budget?'}
              {step === 3 && 'What is your preferred powertrain?'}
            </h2>
          </div>

          {step === 1 && (
            <div className={styles.optionsGrid}>
              {USAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.optionBtn} ${usage === opt.id ? styles.optionBtnActive : ''}`}
                  onClick={() => setUsage(opt.id)}
                >
                  <span className={styles.optIcon}>{opt.icon}</span>
                  <div>
                    <div className={styles.optTitle}>{opt.title}</div>
                    <div className={styles.optDesc}>{opt.desc}</div>
                  </div>
                  {usage === opt.id && <Check size={18} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className={styles.optionsGrid}>
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.optionBtn} ${budget === opt.id ? styles.optionBtnActive : ''}`}
                  onClick={() => setBudget(opt.id)}
                >
                  <span className={styles.optIcon}>💰</span>
                  <div>
                    <div className={styles.optTitle}>{opt.label}</div>
                  </div>
                  {budget === opt.id && <Check size={18} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className={styles.optionsGrid}>
              {FUEL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.optionBtn} ${fuel === opt.id ? styles.optionBtnActive : ''}`}
                  onClick={() => setFuel(opt.id)}
                >
                  <span className={styles.optIcon}>{opt.id === 'hybrid-ev' ? '⚡' : opt.id === 'petrol' ? '⛽' : '🔄'}</span>
                  <div>
                    <div className={styles.optTitle}>{opt.label}</div>
                    <div className={styles.optDesc}>{opt.desc}</div>
                  </div>
                  {fuel === opt.id && <Check size={18} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}

          <div className={styles.btnRow}>
            {step > 1 && (
              <button type="button" className={styles.backBtn} onClick={() => setStep((step - 1) as any)}>
                Back
              </button>
            )}
            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => setStep((step + 1) as any)}
            >
              <span>{step === 3 ? 'Calculate Matches' : 'Next Step'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>🎉 Your Top Recommended Matches</h2>
              <p className={styles.resultsSubtitle}>
                Based on your criteria ({USAGE_OPTIONS.find((u) => u.id === usage)?.title}, {BUDGET_OPTIONS.find((b) => b.id === budget)?.label}).
              </p>
            </div>
            <button type="button" className={styles.resetBtn} onClick={() => setStep(1)}>
              <RotateCcw size={14} /> Reset Quiz
            </button>
          </div>

          {loading ? (
            <Skeleton type="card" count={3} />
          ) : matches.length > 0 ? (
            <div className={styles.matchesGrid}>
              {matches.map((car, idx) => {
                const matchScore = 98 - idx * 4;
                const priceFormatted = car.priceFrom && car.priceFrom > 0 ? formatPrice(car.priceFrom) : 'On Request';
                const tcoFormatted = car.costToOwnMonthly && car.costToOwnMonthly > 0 ? `~${formatPrice(car.costToOwnMonthly)}/mo TCO` : null;

                return (
                  <div key={car._id || idx} className={styles.matchCard}>
                    <div className={styles.matchScoreTag}>
                      <Zap size={12} /> {matchScore}% Match
                    </div>
                    <div className={styles.cardImageWrapper}>
                      <CarMatchImage src={car.imageUrl} alt={car.model || 'Car match'} />
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.brandName}>{car.brand || 'Automobile'}</div>
                      <h3 className={styles.carName}>{car.model} {car.variant || ''}</h3>
                      <div className={styles.specBadges}>
                        <span>{car.year || 2026}</span> · <span>{car.bodyType || 'SUV/Sedan'}</span> · <span>{car.fuelType || 'Petrol'}</span> · <span>{car.seats ? `${car.seats} Seats` : '5 Seats'}</span>
                      </div>
                      <div className={styles.priceRow}>
                        <div>
                          <div className={styles.priceLabel}>Starting Price</div>
                          <div className={styles.priceValue}>{priceFormatted}</div>
                        </div>
                        {tcoFormatted && (
                          <div className={styles.tcoBadge}>
                            {tcoFormatted}
                          </div>
                        )}
                      </div>
                      <Link href={`/new-cars/${car.slug || '#'}`} className={styles.viewBtn}>
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noMatch}>
              <h3>No exact matches found</h3>
              <p>Try widening your budget or powertrain criteria to see available vehicles.</p>
              <button type="button" className={styles.resetBtn} onClick={() => setStep(1)}>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

