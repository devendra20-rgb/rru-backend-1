'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Car, Phone, MessageCircle, Mail,
  Gauge, Fuel, Cog, Calendar, Shield, Users,
  AlertTriangle, Info
} from 'lucide-react';
import { vehiclesMock } from '@/data/vehicles.mock';
import { costToOwnMock } from '@/data/homepage.mock';
import { formatPrice } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import VehicleCard from '@/components/ui/VehicleCard';
import styles from './vdp.module.css';

type VdpTab = 'overview' | 'cost-to-own' | 'specifications';

export default function VehicleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<VdpTab>('overview');

  const vehicle = vehiclesMock.find((v) => v.slug === slug);

  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    return vehiclesMock
      .filter(
        (v) =>
          v._id !== vehicle._id &&
          (v.bodyType === vehicle.bodyType || v.fuelType === vehicle.fuelType)
      )
      .slice(0, 4);
  }, [vehicle]);

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

  const cost = costToOwnMock; // Use the same mock for all vehicles for now

  const costLines = [
    { label: 'Finance / depreciation', value: cost.monthly.financeDepreciation },
    { label: 'Insurance', value: cost.monthly.insurance, note: 'comprehensive' },
    { label: 'Fuel', value: cost.monthly.fuel, note: `${cost.assumptions.fuelPrice} AED/L` },
    { label: 'Servicing & maintenance', value: cost.monthly.servicing },
    { label: 'Tyres', value: cost.monthly.tyres, note: 'amortised' },
    { label: 'Registration & testing', value: cost.monthly.registration },
    { label: 'Salik / tolls', value: cost.monthly.tolls, note: '4/day' },
  ];

  const tabs: { key: VdpTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'cost-to-own', label: 'Cost to Own' },
    { key: 'specifications', label: 'Specifications' },
  ];

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
            <div className={styles.galleryPlaceholder}>
              <Car size={48} />
              <span>VEHICLE IMAGE</span>
            </div>
            {vehicle.badges && vehicle.badges.length > 0 && (
              <div className={styles.galleryBadges}>
                {vehicle.badges.map((b) => (
                  <Badge key={b.label} label={b.label} type={b.type} />
                ))}
              </div>
            )}
          </div>
          <div className={styles.galleryThumbs}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`${styles.galleryThumb} ${i === 1 ? styles.galleryThumbActive : ''}`}
              >
                <Car size={16} />
              </div>
            ))}
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
              <span className={styles.specItemValue}>{vehicle.engine?.power || '—'}</span>
              <span className={styles.specItemLabel}>Power</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specItemValue}>{vehicle.drivetrain || '—'}</span>
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
                {formatPrice(vehicle.costToOwnMonthly || 0)}/mo
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
                {vehicle.dealerName || 'Al Futtaim Motors'}
              </div>
              <div className={styles.dealerMeta}>
                <span className={styles.dealerVerified}>✓ Verified</span>
                <span>·</span>
                <span>Dubai</span>
                <span>·</span>
                <span>Responds in 2h</span>
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
                    {vehicle.engine?.cylinders || '—'}
                  </span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Power</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.engine?.power || '—'}
                  </span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Torque</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.engine?.torque || '—'}
                  </span>
                </div>
                {vehicle.performance && (
                  <>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewRowLabel}>0-100 km/h</span>
                      <span className={styles.overviewRowValue}>
                        {vehicle.performance.acceleration0To100}s
                      </span>
                    </div>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewRowLabel}>Top Speed</span>
                      <span className={styles.overviewRowValue}>
                        {vehicle.performance.topSpeed} km/h
                      </span>
                    </div>
                  </>
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
                  <span className={styles.overviewRowLabel}>Combined</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.fuelConsumption?.combined || '—'} {vehicle.fuelConsumption?.unit}
                  </span>
                </div>
                {vehicle.fuelConsumption?.city && (
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>City</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.fuelConsumption.city} {vehicle.fuelConsumption.unit}
                    </span>
                  </div>
                )}
                {vehicle.fuelConsumption?.highway && (
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Highway</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.fuelConsumption.highway} {vehicle.fuelConsumption.unit}
                    </span>
                  </div>
                )}
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
                  <span className={styles.overviewRowValue}>{vehicle.drivetrain || '—'}</span>
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
                  <span className={styles.overviewRowValue}>{vehicle.doors || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* COST TO OWN TAB */}
          {activeTab === 'cost-to-own' && (
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

              {/* Hidden costs */}
              <div className={styles.costHidden}>
                <h3 className={styles.costHiddenTitle}>
                  <AlertTriangle size={16} />
                  One-time / hidden costs
                </h3>
                <div className={styles.costHiddenList}>
                  <div className={styles.costHiddenRow}>
                    <span>Registration transfer</span>
                    <span>AED {cost.hiddenCosts.registrationTransfer.toLocaleString()}</span>
                  </div>
                  <div className={styles.costHiddenRow}>
                    <span>Insurance (Year 1)</span>
                    <span>AED {cost.hiddenCosts.insuranceYear1.toLocaleString()}</span>
                  </div>
                  <div className={styles.costHiddenRow}>
                    <span>Number plate</span>
                    <span>AED {cost.hiddenCosts.numberPlate.toLocaleString()}</span>
                  </div>
                  {cost.hiddenCosts.bankProcessing && (
                    <div className={styles.costHiddenRow}>
                      <span>Bank processing</span>
                      <span>AED {cost.hiddenCosts.bankProcessing.toLocaleString()}</span>
                    </div>
                  )}
                  <div className={styles.costHiddenRow}>
                    <span style={{ fontWeight: 800 }}>Total one-time costs</span>
                    <span style={{ fontWeight: 800 }}>AED {cost.hiddenCosts.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Assumptions */}
              <div className={styles.costAssumptions}>
                <strong>Assumptions:</strong> Fuel price {cost.assumptions.fuelPrice} AED/L
                (as of {cost.assumptions.fuelPriceDate}). Insurance: {cost.assumptions.insuranceNote}.
                Depreciation: {cost.assumptions.depreciationNote}.
                Ownership period: {cost.ownershipYears} years at {cost.annualKm.toLocaleString()} km/year.
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
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Status</span>
                  <span className={styles.overviewRowValue} style={{ textTransform: 'capitalize' }}>
                    {vehicle.status}
                  </span>
                </div>
                {vehicle.isGccSpec && (
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>GCC Spec</span>
                    <span className={styles.overviewRowValue} style={{ color: 'var(--green)' }}>
                      ✓ Yes
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.overviewCard}>
                <h3 className={styles.overviewCardTitle}>
                  <Gauge size={16} className={styles.overviewCardIcon} />
                  Engine
                </h3>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Displacement</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.engine?.displacement || '—'}
                  </span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Type</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.engine?.type || '—'}
                  </span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Cylinders</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.engine?.cylinders || '—'}
                  </span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Power</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.engine?.power || '—'}
                  </span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Torque</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.engine?.torque || '—'}
                  </span>
                </div>
              </div>

              <div className={styles.overviewCard}>
                <h3 className={styles.overviewCardTitle}>
                  <Cog size={16} className={styles.overviewCardIcon} />
                  Transmission & Drive
                </h3>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Transmission</span>
                  <span className={styles.overviewRowValue}>{vehicle.transmission}</span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Drivetrain</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.drivetrain || '—'}
                  </span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Seats</span>
                  <span className={styles.overviewRowValue}>{vehicle.seats}</span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Doors</span>
                  <span className={styles.overviewRowValue}>{vehicle.doors || '—'}</span>
                </div>
              </div>

              <div className={styles.overviewCard}>
                <h3 className={styles.overviewCardTitle}>
                  <Fuel size={16} className={styles.overviewCardIcon} />
                  Fuel Economy
                </h3>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Fuel Type</span>
                  <span className={styles.overviewRowValue}>{vehicle.fuelType}</span>
                </div>
                <div className={styles.overviewRow}>
                  <span className={styles.overviewRowLabel}>Combined</span>
                  <span className={styles.overviewRowValue}>
                    {vehicle.fuelConsumption?.combined || '—'} {vehicle.fuelConsumption?.unit}
                  </span>
                </div>
                {vehicle.fuelConsumption?.city && (
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>City</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.fuelConsumption.city} {vehicle.fuelConsumption.unit}
                    </span>
                  </div>
                )}
                {vehicle.fuelConsumption?.highway && (
                  <div className={styles.overviewRow}>
                    <span className={styles.overviewRowLabel}>Highway</span>
                    <span className={styles.overviewRowValue}>
                      {vehicle.fuelConsumption.highway} {vehicle.fuelConsumption.unit}
                    </span>
                  </div>
                )}
              </div>
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
