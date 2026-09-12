'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  Car,
  Shield,
  Gauge,
  Fuel,
  Users,
  CheckCircle2,
  Circle,
  XCircle,
  Palette,
  Sparkles,
  RotateCw,
  Camera,
  Search,
} from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { costToOwnService } from '@/services/costToOwn.service';
import type { Vehicle } from '@/types/vehicle';
import type { CostToOwnBreakdown } from '@/types/cost';
import { formatPrice } from '@/lib/utils';
import {
  FEATURE_CATEGORY_ORDER,
  formatFeatureCategory,
} from '@/lib/vehicleNormalize';
import Badge from '@/components/ui/Badge';
import { useCompare } from '@/hooks/useCompare';
import VehicleCard from '@/components/ui/VehicleCard';
import Car360Viewer from '@/components/ui/Car360Viewer';
import styles from './vdp.module.css';

type VdpTab = 'overview' | 'features' | 'cost-to-own' | 'specifications';
type ViewMode = '360' | 'photos';
type FeatureAvailFilter = 'all' | 'standard' | 'optional';

function SpecRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className={styles.specsRow}>
      <span>{label}</span>
      <span>{display}</span>
    </div>
  );
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addToCompare, isInCompare } = useCompare();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [cost, setCost] = useState<CostToOwnBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VdpTab>('overview');

  const [viewMode, setViewMode] = useState<ViewMode>('360');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  const [featureQuery, setFeatureQuery] = useState('');
  const [featureAvail, setFeatureAvail] = useState<FeatureAvailFilter>('all');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);

    vehiclesService
      .getBySlug(slug)
      .then((v) => {
        if (cancelled) return;
        if (v) {
          setVehicle(v);
          if (v.priceFrom) {
            costToOwnService
              .calculate({
                vehiclePrice: v.priceFrom,
                annualMileageKm: 15000,
                ownershipYears: 3,
                fuelType: v.fuelType?.toLowerCase().replace(/[\s-]+/g, '_') || 'petrol',
              })
              .then((c) => {
                if (!cancelled) setCost(c);
              })
              .catch(console.error);
          }
        } else {
          setVehicle(null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    vehiclesService.getAllPages().then((list) => {
      if (!cancelled) setAllVehicles(list);
    }).catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const frames360 = useMemo(() => {
    if (!vehicle?.mediaItems) return [];
    let items = vehicle.mediaItems.filter((m) => m.angleTag === '360-frame');
    if (selectedColorId) {
      const colorSpecific = items.filter((m) => m.colorId === selectedColorId);
      if (colorSpecific.length > 0) items = colorSpecific;
    }
    return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((m) => m.url);
  }, [vehicle, selectedColorId]);

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
          (v.bodyType === vehicle.bodyType || v.fuelType === vehicle.fuelType),
      )
      .slice(0, 4);
  }, [vehicle, allVehicles]);

  const selectedColorName = useMemo(() => {
    if (!vehicle?.colors || !selectedColorId) return null;
    const c = vehicle.colors.find((x: any) => (x._id || x.id) === selectedColorId);
    return c?.name || null;
  }, [vehicle, selectedColorId]);

  const equippedFeatures = useMemo(() => {
    return (vehicle?.features || []).filter(
      (f) => (f.availability || 'standard').toLowerCase() !== 'unavailable',
    );
  }, [vehicle]);

  const groupedFeatures = useMemo(() => {
    const groups: Record<string, typeof equippedFeatures> = {};
    equippedFeatures.forEach((f) => {
      const key = (f.category || 'other').toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(f);
    });
    return groups;
  }, [equippedFeatures]);

  const orderedCategories = useMemo(() => {
    const keys = Object.keys(groupedFeatures);
    return keys.sort((a, b) => {
      const ia = FEATURE_CATEGORY_ORDER.indexOf(a as (typeof FEATURE_CATEGORY_ORDER)[number]);
      const ib = FEATURE_CATEGORY_ORDER.indexOf(b as (typeof FEATURE_CATEGORY_ORDER)[number]);
      const sa = ia === -1 ? 999 : ia;
      const sb = ib === -1 ? 999 : ib;
      if (sa !== sb) return sa - sb;
      return a.localeCompare(b);
    });
  }, [groupedFeatures]);

  const filteredFeatureCategories = useMemo(() => {
    const q = featureQuery.trim().toLowerCase();
    return orderedCategories
      .map((cat) => {
        const list = (groupedFeatures[cat] || []).filter((f) => {
          const avail = (f.availability || 'standard').toLowerCase();
          if (featureAvail === 'standard' && avail !== 'standard') return false;
          if (featureAvail === 'optional' && avail !== 'optional') return false;
          if (q && !f.name.toLowerCase().includes(q) && !(f.value || '').toLowerCase().includes(q)) {
            return false;
          }
          return true;
        });
        return { cat, list };
      })
      .filter((g) => g.list.length > 0);
  }, [orderedCategories, groupedFeatures, featureQuery, featureAvail]);

  const featureStats = useMemo(() => {
    const standard = equippedFeatures.filter(
      (f) => (f.availability || 'standard').toLowerCase() === 'standard',
    ).length;
    const optional = equippedFeatures.filter(
      (f) => (f.availability || '').toLowerCase() === 'optional',
    ).length;
    return { total: equippedFeatures.length, standard, optional };
  }, [equippedFeatures]);

  const highlightFeatures = useMemo(() => {
    const preferred = ['safety', 'comfort', 'infotainment', 'exterior'];
    const picks: typeof equippedFeatures = [];
    for (const cat of preferred) {
      const standards = (groupedFeatures[cat] || []).filter(
        (f) => (f.availability || 'standard').toLowerCase() === 'standard',
      );
      picks.push(...standards.slice(0, 2));
      if (picks.length >= 8) break;
    }
    if (picks.length < 8) {
      for (const f of equippedFeatures) {
        if (picks.length >= 8) break;
        if (!picks.includes(f) && (f.availability || 'standard').toLowerCase() === 'standard') {
          picks.push(f);
        }
      }
    }
    return picks.slice(0, 8);
  }, [equippedFeatures, groupedFeatures]);

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

  const costLines = cost
    ? [
        { label: 'Finance / depreciation', value: cost.monthly.financeDepreciation },
        { label: 'Insurance', value: cost.monthly.insurance, note: 'comprehensive' },
        { label: 'Fuel', value: cost.monthly.fuel, note: `${cost.assumptions.fuelPrice} AED/L` },
        { label: 'Servicing & maintenance', value: cost.monthly.servicing },
        { label: 'Tyres', value: cost.monthly.tyres, note: 'amortised' },
        { label: 'Registration & testing', value: cost.monthly.registration },
        { label: 'Salik / tolls', value: cost.monthly.tolls, note: '4/day' },
      ]
    : [];

  const tabs: { key: VdpTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    {
      key: 'features',
      label: featureStats.total > 0 ? `Features (${featureStats.total})` : 'Features',
    },
    { key: 'cost-to-own', label: 'Cost to Own' },
    { key: 'specifications', label: 'Specifications' },
  ];

  const specs = vehicle.specifications;
  const currentPhoto = photoGallery[activePhotoIndex] || photoGallery[0];

  const topSpeed = specs?.performance?.topSpeedKph ?? vehicle.performance?.topSpeed;
  const accel = specs?.performance?.acceleration0To100Kph ?? vehicle.performance?.acceleration0To100;
  const fuelEconomy = vehicle.fuelConsumption?.combined ?? specs?.fuel?.fuelEconomyCombined;
  const fuelUnit = vehicle.fuelConsumption?.unit ?? specs?.fuel?.economyUnit ?? 'L/100km';

  return (
    <div className={styles.vdpPage}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <Link href="/new-cars">New Cars</Link>
        <ChevronRight size={12} />
        <Link href={`/brands/${vehicle.brandSlug}`}>{vehicle.brand}</Link>
        <ChevronRight size={12} />
        <span>{vehicle.model}</span>
      </div>

      <div className={styles.vdpTop}>
        <div className={styles.gallery}>
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
            {vehicle.badges && vehicle.badges.length > 0 && (
              <div className={styles.galleryBadgesHeader}>
                {vehicle.badges.map((b) => (
                  <Badge key={b.label} label={b.label} type={b.type} />
                ))}
              </div>
            )}
          </div>

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

          {vehicle.colors && vehicle.colors.length > 0 && (
            <div className={styles.vdpColorBar}>
              <div className={styles.vdpColorTitle}>
                <Palette size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                <span>
                  Exterior Color
                  {selectedColorName ? `: ${selectedColorName}` : ''}
                </span>
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

        <div className={styles.infoPanel}>
          <div className={styles.infoBrand}>{vehicle.brand}</div>
          <h1 className={styles.infoTitle}>
            {vehicle.brand} {vehicle.model}
          </h1>
          <div className={styles.infoVariant}>
            {vehicle.variant} · {vehicle.year}
            {vehicle.bodyType ? ` · ${vehicle.bodyType}` : ''}
          </div>
          {(vehicle.shortDescription || vehicle.description) && (
            <p className={styles.infoDesc}>
              {vehicle.shortDescription || vehicle.description}
            </p>
          )}

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
            {vehicle.engine?.power && (
              <div className={styles.specItem}>
                <span className={styles.specItemValue}>{vehicle.engine.power}</span>
                <span className={styles.specItemLabel}>Power</span>
              </div>
            )}
            {vehicle.drivetrain && (
              <div className={styles.specItem}>
                <span className={styles.specItemValue}>{vehicle.drivetrain}</span>
                <span className={styles.specItemLabel}>Drive</span>
              </div>
            )}
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Starting from</span>
              <span className={styles.priceValue}>
                {vehicle.priceFrom != null
                  ? formatPrice(vehicle.priceFrom, vehicle.currency)
                  : 'Price on request'}
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

          <div className={styles.vdpActions}>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => {
                addToCompare(vehicle.slug);
                router.push('/compare');
              }}
            >
              {isInCompare(vehicle.slug) ? '✓ In Compare List' : 'Add to Compare'}
            </button>
            <button
              type="button"
              className="btn-light"
              style={{ flex: 1 }}
              onClick={() => setActiveTab('cost-to-own')}
            >
              Full Cost Analysis
            </button>
          </div>

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

      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.tabPane}>
            <h2 className={styles.sectionTitle}>Overview</h2>

            <div className={styles.specsGrid}>
              {topSpeed != null && (
                <div className={styles.specBox}>
                  <Gauge size={20} />
                  <div>
                    <div className={styles.specBoxLabel}>Top Speed</div>
                    <div className={styles.specBoxValue}>{topSpeed} km/h</div>
                  </div>
                </div>
              )}
              {accel != null && (
                <div className={styles.specBox}>
                  <Sparkles size={20} />
                  <div>
                    <div className={styles.specBoxLabel}>0-100 km/h</div>
                    <div className={styles.specBoxValue}>{accel}s</div>
                  </div>
                </div>
              )}
              {fuelEconomy != null && (
                <div className={styles.specBox}>
                  <Fuel size={20} />
                  <div>
                    <div className={styles.specBoxLabel}>Fuel Economy</div>
                    <div className={styles.specBoxValue}>
                      {fuelEconomy} {fuelUnit}
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.specBox}>
                <Users size={20} />
                <div>
                  <div className={styles.specBoxLabel}>Seating</div>
                  <div className={styles.specBoxValue}>{vehicle.seats} Passengers</div>
                </div>
              </div>
            </div>

            {highlightFeatures.length > 0 ? (
              <div className={styles.featuresSection}>
                <div className={styles.featuresSectionHeader}>
                  <h3 className={styles.subSectionTitle}>Key Features</h3>
                  <button
                    type="button"
                    className={styles.featuresViewAll}
                    onClick={() => setActiveTab('features')}
                  >
                    View all {featureStats.total} features
                  </button>
                </div>
                <ul className={styles.featureHighlightList}>
                  {highlightFeatures.map((f, idx) => (
                    <li key={`${f.name}-${idx}`}>
                      <CheckCircle2 size={14} className={styles.featureCheckIcon} />
                      <span>{f.name}</span>
                      {f.value ? <span className={styles.featureVal}>({f.value})</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className={styles.featuresEmpty}>
                Feature list for this variant is being catalogued. Check back soon.
              </div>
            )}
          </div>
        )}

        {activeTab === 'features' && (
          <div className={styles.tabPane}>
            <div className={styles.featuresToolbar}>
              <div>
                <h2 className={styles.sectionTitle} style={{ marginBottom: 6 }}>
                  Equipped Features
                </h2>
                <p className={styles.sectionDesc}>
                  {featureStats.total} listed · {featureStats.standard} standard
                  {featureStats.optional > 0 ? ` · ${featureStats.optional} optional` : ''}
                </p>
              </div>
              <div className={styles.featuresControls}>
                <div className={styles.featureSearch}>
                  <Search size={14} />
                  <input
                    type="search"
                    placeholder="Search features..."
                    value={featureQuery}
                    onChange={(e) => setFeatureQuery(e.target.value)}
                  />
                </div>
                <div className={styles.featureAvailChips}>
                  {([
                    ['all', 'All'],
                    ['standard', 'Standard'],
                    ['optional', 'Optional'],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.featureAvailChip} ${featureAvail === key ? styles.featureAvailChipActive : ''}`}
                      onClick={() => setFeatureAvail(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredFeatureCategories.length > 0 ? (
              <div className={styles.featuresGrid}>
                {filteredFeatureCategories.map(({ cat, list }) => (
                  <div key={cat} className={styles.featureCategoryBox}>
                    <div className={styles.featureCategoryTitle}>
                      <span>{formatFeatureCategory(cat)}</span>
                      <span className={styles.featureCategoryCount}>{list.length}</span>
                    </div>
                    <ul className={styles.featureList}>
                      {list.map((f, idx) => {
                        const avail = (f.availability || 'standard').toLowerCase();
                        const isOptional = avail === 'optional';
                        return (
                          <li key={`${f.name}-${idx}`}>
                            {isOptional ? (
                              <Circle size={14} className={styles.featureOptionalIcon} />
                            ) : (
                              <CheckCircle2 size={14} className={styles.featureCheckIcon} />
                            )}
                            <span className={styles.featureName}>{f.name}</span>
                            {f.value ? <span className={styles.featureVal}>{f.value}</span> : null}
                            <span
                              className={`${styles.featureBadge} ${isOptional ? styles.featureBadgeOptional : styles.featureBadgeStandard}`}
                            >
                              {isOptional ? 'Optional' : 'Standard'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.featuresEmpty}>
                {equippedFeatures.length === 0 ? (
                  <>
                    <XCircle size={20} />
                    <span>No features catalogued for this vehicle yet.</span>
                  </>
                ) : (
                  <span>No features match your search or filter.</span>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cost-to-own' && (
          <div className={styles.tabPane}>
            <h2 className={styles.sectionTitle}>Cost to Own Breakdown</h2>
            <p className={styles.sectionDesc}>
              Estimated total cost of ownership including depreciation, insurance, fuel, and
              servicing for 3 years (15,000 km/yr).
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
                    {formatPrice(cost.totalOverPeriod, vehicle.currency)} over {cost.ownershipYears}{' '}
                    years
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
              <div style={{ color: 'var(--muted)' }}>
                {vehicle.priceFrom
                  ? 'Calculating cost to own breakdown...'
                  : 'Cost estimate needs a listed starting price.'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className={styles.tabPane}>
            <h2 className={styles.sectionTitle}>Technical Specifications</h2>

            <div className={styles.specsTable}>
              {(vehicle.engine || topSpeed != null || accel != null) && (
                <div className={styles.specsGroup}>
                  <div className={styles.specsGroupHeader}>Engine &amp; Performance</div>
                  <SpecRow label="Displacement" value={vehicle.engine?.displacement} />
                  <SpecRow label="Engine Type" value={vehicle.engine?.type} />
                  <SpecRow label="Cylinders" value={vehicle.engine?.cylinders} />
                  <SpecRow label="Power" value={vehicle.engine?.power} />
                  <SpecRow label="Torque" value={vehicle.engine?.torque} />
                  <SpecRow label="Top Speed" value={topSpeed != null ? `${topSpeed} km/h` : undefined} />
                  <SpecRow label="0-100 km/h" value={accel != null ? `${accel}s` : undefined} />
                </div>
              )}

              <div className={styles.specsGroup}>
                <div className={styles.specsGroupHeader}>Transmission &amp; Drivetrain</div>
                <SpecRow label="Transmission" value={vehicle.transmission} />
                <SpecRow label="Drivetrain" value={vehicle.drivetrain} />
                <SpecRow label="Fuel Type" value={vehicle.fuelType} />
                <SpecRow label="Body Type" value={vehicle.bodyType} />
                <SpecRow label="Seating" value={vehicle.seats} />
                <SpecRow label="Doors" value={vehicle.doors} />
              </div>

              {(specs?.dimensions || specs?.capacity) && (
                <div className={styles.specsGroup}>
                  <div className={styles.specsGroupHeader}>Dimensions &amp; Capacity</div>
                  <SpecRow label="Length" value={specs?.dimensions?.lengthMm ? `${specs.dimensions.lengthMm} mm` : undefined} />
                  <SpecRow label="Width" value={specs?.dimensions?.widthMm ? `${specs.dimensions.widthMm} mm` : undefined} />
                  <SpecRow label="Height" value={specs?.dimensions?.heightMm ? `${specs.dimensions.heightMm} mm` : undefined} />
                  <SpecRow label="Wheelbase" value={specs?.dimensions?.wheelbaseMm ? `${specs.dimensions.wheelbaseMm} mm` : undefined} />
                  <SpecRow label="Boot Space" value={specs?.capacity?.bootSpaceLitres ? `${specs.capacity.bootSpaceLitres} L` : undefined} />
                  <SpecRow label="Fuel Tank" value={specs?.capacity?.fuelTankLitres ? `${specs.capacity.fuelTankLitres} L` : undefined} />
                  <SpecRow label="Kerb Weight" value={specs?.weight?.kerbWeightKg ? `${specs.weight.kerbWeightKg} kg` : undefined} />
                </div>
              )}

              {(fuelEconomy != null || specs?.fuel) && (
                <div className={styles.specsGroup}>
                  <div className={styles.specsGroupHeader}>Fuel Economy</div>
                  <SpecRow
                    label="Combined"
                    value={
                      (fuelEconomy ?? specs?.fuel?.fuelEconomyCombined) != null
                        ? `${fuelEconomy ?? specs?.fuel?.fuelEconomyCombined} ${fuelUnit}`
                        : undefined
                    }
                  />
                  <SpecRow
                    label="City"
                    value={
                      specs?.fuel?.fuelEconomyCity != null
                        ? `${specs.fuel.fuelEconomyCity} ${fuelUnit}`
                        : undefined
                    }
                  />
                  <SpecRow
                    label="Highway"
                    value={
                      specs?.fuel?.fuelEconomyHighway != null
                        ? `${specs.fuel.fuelEconomyHighway} ${fuelUnit}`
                        : undefined
                    }
                  />
                </div>
              )}

              {specs?.safety && (
                <div className={styles.specsGroup}>
                  <div className={styles.specsGroupHeader}>Safety</div>
                  <SpecRow label="Airbags" value={specs.safety.airbags} />
                  <SpecRow label="ABS" value={specs.safety.abs} />
                  <SpecRow label="Traction Control" value={specs.safety.tractionControl} />
                  <SpecRow label="Stability Control" value={specs.safety.stabilityControl} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
