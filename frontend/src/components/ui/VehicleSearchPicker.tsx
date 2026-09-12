'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Car, Loader2, Search, X } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';
import { formatPrice, resolveMediaUrl } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle';
import styles from './VehicleSearchPicker.module.css';

interface VehicleSearchPickerProps {
  excludeSlugs?: string[];
  onSelect: (slug: string) => void;
  placeholder?: string;
  /** Optional seed list shown before the user searches (already fetched). */
  initialVehicles?: Vehicle[];
}

export default function VehicleSearchPicker({
  excludeSlugs = [],
  onSelect,
  placeholder = 'Search brand, model, or variant…',
  initialVehicles = [],
}: VehicleSearchPickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const excluded = useMemo(() => new Set(excludeSlugs), [excludeSlugs]);

  const filterOutSelected = useCallback(
    (list: Vehicle[]) => list.filter((v) => !excluded.has(v.slug)),
    [excluded],
  );

  useEffect(() => {
    if (!open) return;

    const id = ++requestIdRef.current;
    setLoading(true);

    const run = async () => {
      try {
        let list: Vehicle[];
        if (!debouncedQuery) {
          list =
            initialVehicles.length > 0
              ? initialVehicles.slice(0, 40)
              : await vehiclesService.getAll({ limit: 100 });
        } else {
          list = await vehiclesService.search(debouncedQuery, 40);
        }
        if (requestIdRef.current !== id) return;
        setResults(filterOutSelected(list));
        setHighlight(0);
      } catch {
        if (requestIdRef.current !== id) return;
        setResults([]);
      } finally {
        if (requestIdRef.current === id) setLoading(false);
      }
    };

    run();
  }, [debouncedQuery, open, initialVehicles, filterOutSelected]);

  const visibleResults = useMemo(() => filterOutSelected(results), [results, filterOutSelected]);

  const choose = (vehicle: Vehicle) => {
    onSelect(vehicle.slug);
    setQuery('');
    setDebouncedQuery('');
    setOpen(false);
    setHighlight(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(0, visibleResults.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = visibleResults[highlight];
      if (chosen) choose(chosen);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.inputWrap}>
        <Search size={16} className={styles.searchIcon} aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className={styles.input}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              inputRef.current?.focus();
              setOpen(true);
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className={styles.dropdown} id={listboxId} role="listbox">
          {loading && (
            <div className={styles.statusRow}>
              <Loader2 size={14} className={styles.spinner} />
              Searching vehicles…
            </div>
          )}

          {!loading && visibleResults.length === 0 && (
            <div className={styles.statusRow}>
              {debouncedQuery
                ? `No vehicles found for “${debouncedQuery}”`
                : 'No vehicles available to add'}
            </div>
          )}

          {!loading &&
            visibleResults.map((vehicle, idx) => (
              <button
                key={vehicle._id || vehicle.slug}
                type="button"
                role="option"
                aria-selected={idx === highlight}
                className={`${styles.option} ${idx === highlight ? styles.optionActive : ''}`}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => choose(vehicle)}
              >
                <div className={styles.optionThumb}>
                  {vehicle.imageUrl ? (
                    <img src={resolveMediaUrl(vehicle.imageUrl)} alt="" />
                  ) : (
                    <Car size={18} color="#94a3b8" />
                  )}
                </div>
                <div className={styles.optionBody}>
                  <div className={styles.optionTitle}>
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className={styles.optionMeta}>
                    {[vehicle.variant, vehicle.year, vehicle.fuelType].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {vehicle.priceFrom ? (
                  <div className={styles.optionPrice}>{formatPrice(vehicle.priceFrom)}</div>
                ) : null}
              </button>
            ))}

          {!loading && !debouncedQuery && visibleResults.length > 0 && (
            <div className={styles.hintRow}>Type a brand or model to search the full catalog</div>
          )}
        </div>
      )}
    </div>
  );
}
