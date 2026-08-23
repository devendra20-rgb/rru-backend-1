'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Car, Shield, Gauge, Fuel, Cog, Users, Info, CheckCircle2, Palette, Sparkles, Ruler
} from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { costToOwnService } from '@/services/costToOwn.service';
import type { Vehicle } from '@/types/vehicle';
import type { CostToOwnBreakdown } from '@/types/cost';
import { formatPrice } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from './vdp.module.css';

type VdpTab = 'overview' | 'cost-to-own' | 'specifications';

export default function VehicleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [cost, setCost] = useState<CostToOwnBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VdpTab>('overview');

  useEffect(() => {
    if (slug) {
      vehiclesService.getBySlug(slug).then((v) => {
        if (v) {
          setVehicle(v);
          if (v.priceFrom) {
            costToOwnService.calculate({
              vehiclePrice: v.priceFrom,
              annualMileageKm: 15000,
              ownershipYears: 3,
              fuelType: v.fuelType?.toLowerCase() || 'petrol',
            }).then(setCost).catch(console.error);
          }
        }
        setLoading(false);
      }).catch(() => setLoading(false));

      vehiclesService.getAll({ limit: 20 }).then(setAllVehicles).catch(console.error);
    }
  }, [slug]);

  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return allVehicles
      .filter(
        (v) =>
          v._id !== vehicle._id &&
          (v.bodyType === vehicle.bodyType || v.fuelType === vehicle.fuelType)
      )
      .slice(0, 4);
  }, [vehicle, allVehicles]);

  if (loading) {
    return (
      <div className={styles.vdpPage}>
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          Loading vehicle details...
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className={styles.vdpPage}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href="/new-cars">New Cars</Link>
          <ChevronRight size={12} />
          <span>Not Found</span>
        </div>
        <h1 style={{ marginTop: 40, textAlign: 'center' }}>Vehicle not found</h1>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 8 }}>
          The vehicle you are looking for does not exist or has been removed.
        </p>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/new-cars" className="btn-primary">
            Browse All Cars
          </Link>
        </div>
      </div>
    );
  }

  const costLines = cost ? [
    { label: 'Finance / depreciation', value: cost.monthly.financeDepreciation },
    { label: 'Insurance', value: cost.monthly.insurance, note: 'comprehensive' },
    { label: 'Fuel', value: cost.monthly.fuel, note: `${cost.assumptions.fuelPrice} AED/L` },
    { label: 'Servicing & maintenance', value: cost.monthly.servicing },
    { label: 'Tyres', value: cost.monthly.tyres, note: 'amortised' },
    { label: 'Registration & testing', value: cost.monthly.registration },
    { label: 'Salik / tolls', value: cost.monthly.tolls, note: '4/day' },
  ] : [];

  const tabs: { key: VdpTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'cost-to-own', label: 'Cost to Own' },
    { key: 'specifications', label: 'Specifications' },
  ];

  // Group features by category
  const groupedFeatures: Record<string, typeof vehicle.features> = {};
  if (vehicle.features && vehicle.features.length > 0) {
    vehicle.features.forEach((f) => {
      const cat = f.category ? f.category.charAt(0).toUpperCase() + f.category.slice(1) : 'General';
      if (!groupedFeatures[cat]) groupedFeatures[cat] = [];
      groupedFeatures[cat]!.push(f);
    });
  }

  const specs = vehicle.specifications;

  return (
    <div className={styles.vdpPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <Link href="/new-cars">New Cars</Link>
        <ChevronRight size={12} />
        <Link href={`/brands/${vehicle.brandSlug}`}>{vehicle.brand}</Link>
        <ChevronRight size={12} />
        <span>{vehicle.model}</span>
      </div>

      {/* Top Section: Gallery + Info */}
      <div className={styles.vdpTop}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.galleryMain}>
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              <div className={styles.galleryPlaceholder}>
                <Car size={48} />
                <span>VEHICLE IMAGE</span>
              </div>
            )}
            {vehicle.badges && vehicle.badges.length > 0 && (
              <div className={styles.galleryBadges}>
                {vehicle.badges.map((b) => (
                  <Badge key={b.label} label={b.label} type={b.type} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.infoBrand}>{vehicle.brand}</div>
          <h1 className={styles.infoTitle}>
            {vehicle.brand} {vehicle.model}
          </h1>
          <div className={styles.infoVariant}>
            {vehicle.variant} · {vehicle.year}
          </div>

          {/* Key Specs Strip */}
          <div className={styles.specsStrip}>
            <div className={styles.specItem}>
              <span className={styles.specItemValue}>{vehicle.year}</span>
              <span className={styles.specItemLabel}>Year</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specItemValue}>{vehicle.fuelType}</span>
              <span className={styles.specItemLabel}>Fuel</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specItemValue}>{vehicle.transmission}</span>
              <span className={styles.specItemLabel}>Gearbox</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specItemValue}>{vehicle.seats}</span>
              <span className={styles.specItemLabel}>Seats</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specItemValue}>{vehicle.engine?.power || '300 hp'}</span>
              <span className={styles.specItemLabel}>Power</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specItemValue}>{vehicle.drivetrain || 'AWD'}</span>
              <span className={styles.specItemLabel}>Drive</span>
            </div>
          </div>

          {/* Price */}
          <div className={styles.priceSection}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Starting from</span>
              <span className={styles.priceValue}>
                {formatPrice(vehicle.priceFrom || 0)}
              </span>
            </div>
            <div className={styles.priceMonthlyCost}>
              <span className={styles.priceMonthlyCostLabel}>
                Est. monthly ownership
              </span>
              <span className={styles.priceMonthlyCostValue}>
                {cost ? `AED ${cost.monthly.total.toLocaleString()}` : `${formatPrice(vehicle.costToOwnMonthly || 0)}`}/mo
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.vdpActions}>
            <Link href={`/compare?add=${vehicle.slug}`} className="btn-primary">
              Add to Compare
            </Link>
            <Link href={`/cost-to-own?vehicle=${vehicle.slug}`} className="btn-light">
              Full Cost Analysis
            </Link>
          </div>

          {/* Dealer Card */}
          <div className={styles.dealerCard}>
            <div className={styles.dealerAvatar}>
              <Shield size={20} />
            </div>
            <div className={styles.dealerInfo}>
              <div className={styles.dealerName}>
                {vehicle.dealerName || 'Official UAE Dealer Network'}
              </div>
              <div className={styles.dealerMeta}>
                <span className={styles.dealerVerified}>✓ Verified Dealer</span>
                <span>·</span>
                <span>Dubai & Abu Dhabi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsSection}>
        <div className={styles.vdpTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.vdpTab} ${activeTab === tab.key ? styles.vdpTabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Gauge size={16} className={styles.overviewCardIcon} />
                    Engine & Performance
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Engine</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.engine?.displacement} {vehicle.engine?.type}
                    </span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Cylinders</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.engine?.cylinders || '6'}
                    </span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Power</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.engine?.power || '300 hp'}
                    </span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Torque</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.engine?.torque || '400 Nm'}
                    </span>
                  </div>
                  {vehicle.performance?.acceleration0To100 && (
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewRowLabel}>0-100 km/h</span>
                      <span className={styles.overviewRowValue}>
                        {vehicle.performance.acceleration0To100}s
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Fuel size={16} className={styles.overviewCardIcon} />
                    Fuel & Efficiency
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Fuel Type</span>
                    <span className={styles.overviewRowValue}>{vehicle.fuelType}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Combined Economy</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.fuelConsumption?.combined || '9.5'} {vehicle.fuelConsumption?.unit || 'L/100km'}
                    </span>
                  </div>
                </div>

                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Cog size={16} className={styles.overviewCardIcon} />
                    Drivetrain
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Transmission</span>
                    <span className={styles.overviewRowValue}>{vehicle.transmission}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Drivetrain</span>
                    <span className={styles.overviewRowValue}>{vehicle.drivetrain || 'AWD'}</span>
                  </div>
                </div>

                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Users size={16} className={styles.overviewCardIcon} />
                    Dimensions & Practicality
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Body Type</span>
                    <span className={styles.overviewRowValue}>{vehicle.bodyType}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Seats</span>
                    <span className={styles.overviewRowValue}>{vehicle.seats}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Doors</span>
                    <span className={styles.overviewRowValue}>{vehicle.doors || 5}</span>
                  </div>
                </div>
              </div>

              {/* COLORS SECTION */}
              {vehicle.colors && vehicle.colors.length > 0 && (
                <div className={styles.overviewCard} style={{ gridColumn: '1 / -1' }}>
                  <h3 className={styles.overviewCardTitle}>
                    <Palette size={16} className={styles.overviewCardIcon} />
                    Available Exterior & Interior Colors ({vehicle.colors.length})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
                    {vehicle.colors.map((color, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: color.hexCode || '#4A4A4A', border: '1px solid rgba(0,0,0,0.2)' }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--deep)' }}>{color.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'capitalize' }}>{color.type || 'exterior'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEATURES SECTION */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className={styles.overviewCard} style={{ gridColumn: '1 / -1' }}>
                  <h3 className={styles.overviewCardTitle}>
                    <Sparkles size={16} className={styles.overviewCardIcon} />
                    Standard Features & Equipment ({vehicle.features.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 14 }}>
                    {Object.entries(groupedFeatures).map(([cat, feats]) => (
                      <div key={cat} style={{ background: 'var(--white)', padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--petrol)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{cat}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {feats?.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--deep)' }}>
                              <CheckCircle2 size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                              <span>{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COST TO OWN TAB */}
          {activeTab === 'cost-to-own' && cost && (
            <div className={styles.costPanel}>
              <div className={styles.costHeader}>
                <div className={styles.costHeaderVehicle}>
                  {vehicle.brand} {vehicle.model} {vehicle.variant} · UAE
                </div>
                <div className={styles.costHeaderBig}>
                  AED {cost.monthly.total.toLocaleString()}
                  <span className={styles.costHeaderUnit}> / month</span>
                </div>
                <div className={styles.costHeaderLabel}>Estimated ownership cost</div>
              </div>

              <div className={styles.costDash} />

              {costLines.map((line) => (
                <div key={line.label} className={styles.costLine}>
                  <span className={styles.costLineLabel}>
                    {line.label}
                    {line.note && (
                      <span className={styles.costLineNote}>{line.note}</span>
                    )}
                  </span>
                  <span className={styles.costLineValue}>
                    AED {line.value.toLocaleString()}
                  </span>
                </div>
              ))}

              <div className={styles.costTotalLine}>
                <span>Monthly total</span>
                <span>AED {cost.monthly.total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* SPECIFICATIONS TAB */}
          {activeTab === 'specifications' && (
            <div className={styles.overviewGrid}>
              <div className={styles.overviewCard}>
                <h3 className={styles.overviewCardTitle}>
                  <Info size={16} className={styles.overviewCardIcon} />
                  General
                </h3>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Brand</span>
                  <span className={styles.overviewRowValue}>{vehicle.brand}</span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Model</span>
                  <span className={styles.overviewRowValue}>{vehicle.model}</span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Variant</span>
                  <span className={styles.overviewRowValue}>{vehicle.variant}</span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Year</span>
                  <span className={styles.overviewRowValue}>{vehicle.year}</span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Body Type</span>
                  <span className={styles.overviewRowValue}>{vehicle.bodyType}</span>
                </div>
              </div>

              {specs?.performance && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Gauge size={16} className={styles.overviewCardIcon} />
                    Performance
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Top Speed</span>
                    <span className={styles.overviewRowValue}>{specs.performance.topSpeedKph} km/h</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>0-100 km/h</span>
                    <span className={styles.overviewRowValue}>{specs.performance.acceleration0To100Kph}s</span>
                  </div>
                </div>
              )}

              {specs?.dimensions && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Ruler size={16} className={styles.overviewCardIcon} />
                    Dimensions & Weight
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Length</span>
                    <span className={styles.overviewRowValue}>{specs.dimensions.lengthMm} mm</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Width</span>
                    <span className={styles.overviewRowValue}>{specs.dimensions.widthMm} mm</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Height</span>
                    <span className={styles.overviewRowValue}>{specs.dimensions.heightMm} mm</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Wheelbase</span>
                    <span className={styles.overviewRowValue}>{specs.dimensions.wheelbaseMm} mm</span>
                  </div>
                  {specs.weight?.kerbWeightKg && (
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewRowLabel}>Kerb Weight</span>
                      <span className={styles.overviewRowValue}>{specs.weight.kerbWeightKg} kg</span>
                    </div>
                  )}
                </div>
              )}

              {specs?.capacity && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Users size={16} className={styles.overviewCardIcon} />
                    Capacity & Storage
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Boot Space</span>
                    <span className={styles.overviewRowValue}>{specs.capacity.bootSpaceLitres} Litres</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Fuel Tank</span>
                    <span className={styles.overviewRowValue}>{specs.capacity.fuelTankLitres} Litres</span>
                  </div>
                </div>
              )}

              {specs?.fuel && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Fuel size={16} className={styles.overviewCardIcon} />
                    Fuel Consumption
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Combined</span>
                    <span className={styles.overviewRowValue}>{specs.fuel.fuelEconomyCombined} {specs.fuel.economyUnit}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>City</span>
                    <span className={styles.overviewRowValue}>{specs.fuel.fuelEconomyCity} {specs.fuel.economyUnit}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Highway</span>
                    <span className={styles.overviewRowValue}>{specs.fuel.fuelEconomyHighway} {specs.fuel.economyUnit}</span>
                  </div>
                </div>
              )}

              {specs?.safety && (
                <div className={styles.overviewCard}>
                  <h3 className={styles.overviewCardTitle}>
                    <Shield size={16} className={styles.overviewCardIcon} />
                    Safety & Protection
                  </h3>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Airbags</span>
                    <span className={styles.overviewRowValue}>{specs.safety.airbags} Airbags</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>ABS</span>
                    <span className={styles.overviewRowValue}>{specs.safety.abs ? 'Yes' : 'No'}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Traction Control</span>
                    <span className={styles.overviewRowValue}>{specs.safety.tractionControl ? 'Yes' : 'No'}</span>
                  </div>
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Stability Control</span>
                    <span className={styles.overviewRowValue}>{specs.safety.stabilityControl ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Cars */}
      {similarVehicles.length > 0 && (
        <div className={styles.similarSection}>
          <h2 className={styles.similarTitle}>Similar Cars You Might Like</h2>
          <div className={styles.similarGrid}>
            {similarVehicles.map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
