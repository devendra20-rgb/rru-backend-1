'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Car, Shield, Gauge, Fuel, Cog, Users, Info, CheckCircle2, Palette, Sparkles, Ruler, RotateCw, Camera, LayoutGrid
} from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { costToOwnService } from '@/services/costToOwn.service';
import type { Vehicle, VehicleMedia } from '@/types/vehicle';
import type { CostToOwnBreakdown } from '@/types/cost';
import { formatPrice } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import VehicleCard from '@/components/ui/VehicleCard';
import Car360Viewer from '@/components/ui/Car360Viewer';
import styles from './vdp.module.css';

type VdpTab = 'overview' | 'cost-to-own' | 'specifications';
type ViewMode = '360' | 'photos' | 'interior';

export default function VehicleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [cost, setCost] = useState<CostToOwnBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VdpTab>('overview');

  // Gallery state
  const [viewMode, setViewMode] = useState<ViewMode>('360');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

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

  // Extract 360 rotation frames
  const frames360 = useMemo(() => {
    if (!vehicle?.mediaItems) return [];
    let items = vehicle.mediaItems.filter((m) => m.angleTag === '360-frame');
    if (selectedColorId) {
      const colorSpecific = items.filter((m) => m.colorId === selectedColorId);
      if (colorSpecific.length > 0) items = colorSpecific;
    }
    // Sort frames by sortOrder
    return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((m) => m.url);
  }, [vehicle, selectedColorId]);

  // Extract photo gallery items (excluding 360 frames)
  const photoGallery = useMemo(() => {
    if (!vehicle) return [];
    let items = (vehicle.mediaItems || []).filter((m) => m.angleTag !== '360-frame');
    if (selectedColorId) {
      const colorFiltered = items.filter((m) => !m.colorId || m.colorId === selectedColorId);
      if (colorFiltered.length > 0) items = colorFiltered;
    }
    if (items.length === 0 && vehicle.imageUrl) {
      return [{ url: vehicle.imageUrl, altText: `${vehicle.brand} ${vehicle.model}` }];
    }
    return items;
  }, [vehicle, selectedColorId]);

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

  const currentPhoto = photoGallery[activePhotoIndex] || photoGallery[0];

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
        {/* Main Gallery Container */}
        <div className={styles.gallery}>
          {/* Gallery View Mode Switcher Header */}
          <div className={styles.galleryHeader}>
            <div className={styles.modeTabs}>
              <button
                type="button"
                className={`${styles.modeBtn} ${viewMode === '360' ? styles.modeBtnActive : ''}`}
                onClick={() => setViewMode('360')}
              >
                <RotateCw size={14} style={{ color: 'var(--amber)' }} />
                <span>360° View</span>
              </button>

              <button
                type="button"
                className={`${styles.modeBtn} ${viewMode === 'photos' ? styles.modeBtnActive : ''}`}
                onClick={() => setViewMode('photos')}
              >
                <Camera size={14} />
                <span>Photos ({photoGallery.length})</span>
              </button>
            </div>

            {/* Badges */}
            {vehicle.badges && vehicle.badges.length > 0 && (
              <div className={styles.galleryBadgesHeader}>
                {vehicle.badges.map((b) => (
                  <Badge key={b.label} label={b.label} type={b.type} />
                ))}
              </div>
            )}
          </div>

          {/* Main Viewer Box */}
          <div className={styles.galleryMainBox}>
            {viewMode === '360' ? (
              <Car360Viewer
                frames={frames360.length > 0 ? frames360 : [vehicle.imageUrl || '']}
                vehicleName={`${vehicle.brand} ${vehicle.model}`}
                height={400}
              />
            ) : (
              <div className={styles.photoViewport}>
                {currentPhoto ? (
                  <img
                    key={currentPhoto.url}
                    src={currentPhoto.url}
                    alt={currentPhoto.altText || `${vehicle.brand} ${vehicle.model}`}
                    className={styles.mainPhotoImage}
                  />
                ) : (
                  <div className={styles.galleryPlaceholder}>
                    <Car size={48} />
                    <span>VEHICLE IMAGE</span>
                  </div>
                )}
                {currentPhoto?.angleTag && (
                  <div className={styles.photoAnglePill}>
                    {currentPhoto.angleTag.replace('-', ' ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Navigation Row */}
          {photoGallery.length > 1 && (
            <div className={styles.thumbnailRow}>
              {photoGallery.slice(0, 8).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.thumbBtn} ${viewMode === 'photos' && activePhotoIndex === idx ? styles.thumbBtnActive : ''}`}
                  onClick={() => {
                    setViewMode('photos');
                    setActivePhotoIndex(idx);
                  }}
                >
                  <img src={img.url} alt={img.altText || `Thumb ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Color Selector Swatches Bar */}
          {vehicle.colors && vehicle.colors.length > 0 && (
            <div className={styles.vdpColorBar}>
              <div className={styles.vdpColorTitle}>
                <Palette size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                <span>Select Exterior Color:</span>
              </div>
              <div className={styles.vdpColorSwatches}>
                <button
                  type="button"
                  className={`${styles.vdpColorBtn} ${!selectedColorId ? styles.vdpColorBtnActive : ''}`}
                  onClick={() => setSelectedColorId(null)}
                  title="All Colors"
                >
                  <span className={styles.vdpColorAllLabel}>All</span>
                </button>
                {vehicle.colors.map((c: any, idx: number) => {
                  const cId = c._id || c.id || null;
                  const isSelected = selectedColorId === cId;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.vdpColorBtn} ${isSelected ? styles.vdpColorBtnActive : ''}`}
                      onClick={() => setSelectedColorId(cId)}
                      title={c.name}
                    >
                      <span
                        className={styles.vdpColorDot}
                        style={{ backgroundColor: c.hexCode || '#ccc' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
                {formatPrice(vehicle.priceFrom || 0, vehicle.currency)}
              </span>
            </div>
            {cost && (
              <div className={styles.costEstimateRow}>
                <span>Est. monthly ownership</span>
                <span className={styles.costEstimateValue}>
                  {formatPrice(cost.monthly.total, vehicle.currency)}/mo
                </span>
              </div>
            )}
          </div>

          {/* CTA Actions */}
          <div className={styles.vdpActions}>
            <Link href="/compare" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>
              Add to Compare
            </Link>
            <button
              type="button"
              className="btn-light"
              style={{ flex: 1 }}
              onClick={() => setActiveTab('cost-to-own')}
            >
              Full Cost Analysis
            </button>
          </div>

          {/* Dealer card */}
          <div className={styles.dealerCard}>
            <Shield size={20} className={styles.dealerIcon} />
            <div>
              <div className={styles.dealerTitle}>Official UAE Dealer Network</div>
              <div className={styles.dealerSubtitle}>
                ✓ Verified Dealer · Dubai &amp; Abu Dhabi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNav}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tabBtn} ${activeTab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className={styles.tabPane}>
            <h2 className={styles.sectionTitle}>Overview &amp; Key Features</h2>

            {/* Quick Specs Grid */}
            <div className={styles.specsGrid}>
              <div className={styles.specBox}>
                <Gauge size={20} />
                <div>
                  <div className={styles.specBoxLabel}>Top Speed</div>
                  <div className={styles.specBoxValue}>
                    {specs?.performance?.topSpeedKph || vehicle.performance?.topSpeed || 210} km/h
                  </div>
                </div>
              </div>

              <div className={styles.specBox}>
                <Sparkles size={20} />
                <div>
                  <div className={styles.specBoxLabel}>0-100 km/h</div>
                  <div className={styles.specBoxValue}>
                    {specs?.performance?.acceleration0To100Kph || vehicle.performance?.acceleration0To100 || 6.5}s
                  </div>
                </div>
              </div>

              <div className={styles.specBox}>
                <Fuel size={20} />
                <div>
                  <div className={styles.specBoxLabel}>Fuel Economy</div>
                  <div className={styles.specBoxValue}>
                    {vehicle.fuelConsumption?.combined || 9.5} {vehicle.fuelConsumption?.unit || 'L/100km'}
                  </div>
                </div>
              </div>

              <div className={styles.specBox}>
                <Users size={20} />
                <div>
                  <div className={styles.specBoxLabel}>Seating</div>
                  <div className={styles.specBoxValue}>{vehicle.seats} Passengers</div>
                </div>
              </div>
            </div>

            {/* Features Grouped */}
            {Object.keys(groupedFeatures).length > 0 ? (
              <div className={styles.featuresSection}>
                <h3 className={styles.subSectionTitle}>Equipped Features</h3>
                <div className={styles.featuresGrid}>
                  {Object.entries(groupedFeatures).map(([cat, fList]) => (
                    <div key={cat} className={styles.featureCategoryBox}>
                      <div className={styles.featureCategoryTitle}>{cat}</div>
                      <ul className={styles.featureList}>
                        {(fList || []).map((f, idx) => (
                          <li key={idx}>
                            <CheckCircle2 size={14} className={styles.featureCheckIcon} />
                            <span>{f.name}</span>
                            {f.value && <span className={styles.featureVal}>({f.value})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.featuresSection}>
                <h3 className={styles.subSectionTitle}>Key Highlights</h3>
                <ul className={styles.featureList}>
                  <li>
                    <CheckCircle2 size={14} className={styles.featureCheckIcon} />
                    <span>Advanced Driver Assistance Package</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className={styles.featureCheckIcon} />
                    <span>GCC Climate Control System with Rear Vents</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className={styles.featureCheckIcon} />
                    <span>Full Digital Cockpit Display</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className={styles.featureCheckIcon} />
                    <span>Panoramic Sunroof &amp; Premium Audio</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* COST TO OWN TAB */}
        {activeTab === 'cost-to-own' && (
          <div className={styles.tabPane}>
            <h2 className={styles.sectionTitle}>Cost to Own Breakdown</h2>
            <p className={styles.sectionDesc}>
              Estimated total cost of ownership including depreciation, insurance, fuel, and servicing for 3 years (15,000 km/yr).
            </p>

            {cost ? (
              <div className={styles.costContainer}>
                <div className={styles.costTotalCard}>
                  <div className={styles.costTotalLabel}>Total Monthly Ownership</div>
                  <div className={styles.costTotalValue}>
                    {formatPrice(cost.monthly.total, vehicle.currency)}
                    <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 400 }}>/mo</span>
                  </div>
                  <div className={styles.costTotalAnnual}>
                    {formatPrice(cost.totalOverPeriod, vehicle.currency)} over {cost.ownershipYears} years
                  </div>
                </div>

                <div className={styles.costTable}>
                  <div className={styles.costTableHeader}>
                    <span>Expense Category</span>
                    <span style={{ textAlign: 'right' }}>Monthly Cost</span>
                  </div>
                  {costLines.map((line, idx) => (
                    <div key={idx} className={styles.costTableRow}>
                      <div>
                        <div className={styles.costCategoryName}>{line.label}</div>
                        {line.note && <div className={styles.costCategoryNote}>{line.note}</div>}
                      </div>
                      <div className={styles.costCategoryValue}>
                        {formatPrice(line.value, vehicle.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--muted)' }}>Calculating cost to own breakdown...</div>
            )}
          </div>
        )}

        {/* SPECIFICATIONS TAB */}
        {activeTab === 'specifications' && (
          <div className={styles.tabPane}>
            <h2 className={styles.sectionTitle}>Technical Specifications</h2>

            <div className={styles.specsTable}>
              {vehicle.engine && (
                <div className={styles.specsGroup}>
                  <div className={styles.specsGroupHeader}>Engine &amp; Performance</div>
                  <div className={styles.specsRow}>
                    <span>Displacement</span>
                    <span>{vehicle.engine.displacement}</span>
                  </div>
                  <div className={styles.specsRow}>
                    <span>Engine Type</span>
                    <span>{vehicle.engine.type}</span>
                  </div>
                  <div className={styles.specsRow}>
                    <span>Power</span>
                    <span>{vehicle.engine.power}</span>
                  </div>
                  <div className={styles.specsRow}>
                    <span>Torque</span>
                    <span>{vehicle.engine.torque}</span>
                  </div>
                  <div className={styles.specsRow}>
                    <span>Top Speed</span>
                    <span>{specs?.performance?.topSpeedKph || vehicle.performance?.topSpeed || 210} km/h</span>
                  </div>
                  <div className={styles.specsRow}>
                    <span>0-100 km/h</span>
                    <span>{specs?.performance?.acceleration0To100Kph || vehicle.performance?.acceleration0To100 || 6.5}s</span>
                  </div>
                </div>
              )}

              <div className={styles.specsGroup}>
                <div className={styles.specsGroupHeader}>Transmission &amp; Drivetrain</div>
                <div className={styles.specsRow}>
                  <span>Transmission</span>
                  <span>{vehicle.transmission}</span>
                </div>
                <div className={styles.specsRow}>
                  <span>Drivetrain</span>
                  <span>{vehicle.drivetrain}</span>
                </div>
                <div className={styles.specsRow}>
                  <span>Fuel Type</span>
                  <span>{vehicle.fuelType}</span>
                </div>
              </div>

              {specs?.dimensions && (
                <div className={styles.specsGroup}>
                  <div className={styles.specsGroupHeader}>Dimensions &amp; Capacity</div>
                  {specs.dimensions.lengthMm && (
                    <div className={styles.specsRow}>
                      <span>Length</span>
                      <span>{specs.dimensions.lengthMm} mm</span>
                    </div>
                  )}
                  {specs.dimensions.widthMm && (
                    <div className={styles.specsRow}>
                      <span>Width</span>
                      <span>{specs.dimensions.widthMm} mm</span>
                    </div>
                  )}
                  {specs.dimensions.heightMm && (
                    <div className={styles.specsRow}>
                      <span>Height</span>
                      <span>{specs.dimensions.heightMm} mm</span>
                    </div>
                  )}
                  {specs.capacity?.bootSpaceLitres && (
                    <div className={styles.specsRow}>
                      <span>Boot Space</span>
                      <span>{specs.capacity.bootSpaceLitres} L</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Similar Vehicles Carousel Section */}
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
