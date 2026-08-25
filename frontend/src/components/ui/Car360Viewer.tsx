'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, Play, Pause, Compass, MoveHorizontal } from 'lucide-react';
import styles from './Car360Viewer.module.css';

interface Car360ViewerProps {
  frames: string[];
  vehicleName: string;
  height?: number | string;
  autoRotateInterval?: number; // ms per frame
}

export default function Car360Viewer({
  frames,
  vehicleName,
  height = 420,
  autoRotateInterval = 120,
}: Car360ViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const startXRef = useRef<number>(0);
  const startIndexRef = useRef<number>(0);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalFrames = frames.length || 1;

  // Preload all frames for smooth rotation without flickers
  useEffect(() => {
    let count = 0;
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        count++;
        setLoadedCount(count);
      };
      img.onerror = () => {
        count++;
        setLoadedCount(count);
      };
    });
  }, [frames]);

  // Handle auto rotation
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalFrames);
      }, autoRotateInterval);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalFrames, autoRotateInterval]);

  // Drag interaction logic
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setIsPlaying(false); // pause auto-rotation when user interacts
    startXRef.current = e.clientX;
    startIndexRef.current = currentIndex;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || totalFrames <= 1) return;

    const deltaX = e.clientX - startXRef.current;
    // 1 frame step per 14px drag distance
    const sensitivity = 14;
    const frameOffset = Math.floor(deltaX / sensitivity);

    let newIndex = (startIndexRef.current - frameOffset) % totalFrames;
    if (newIndex < 0) {
      newIndex += totalFrames;
    }

    setCurrentIndex(newIndex);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore if already released
      }
    }
  };

  const degrees = Math.round((currentIndex / totalFrames) * 360);

  const getCardinalDirection = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'Front (0°)';
    if (deg >= 22.5 && deg < 67.5) return 'Front Right (45°)';
    if (deg >= 67.5 && deg < 112.5) return 'Right Side (90°)';
    if (deg >= 112.5 && deg < 157.5) return 'Rear Right (135°)';
    if (deg >= 157.5 && deg < 202.5) return 'Rear (180°)';
    if (deg >= 202.5 && deg < 247.5) return 'Rear Left (225°)';
    if (deg >= 247.5 && deg < 292.5) return 'Left Side (270°)';
    return 'Front Left (315°)';
  };

  if (!frames || frames.length === 0) {
    return (
      <div className={styles.container} style={{ height }}>
        <div className={styles.noMedia}>No 360 frames available</div>
      </div>
    );
  }

  return (
    <div className={styles.viewerWrapper}>
      <div
        className={`${styles.container} ${isDragging ? styles.dragging : ''}`}
        style={{ height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Main Rotatable Frame */}
        <img
          src={frames[currentIndex]}
          alt={`${vehicleName} 360 angle view ${currentIndex + 1}`}
          className={styles.frameImage}
          draggable={false}
        />

        {/* 360° Badge Header */}
        <div className={styles.badge360}>
          <RotateCw className={styles.rotateIcon} size={15} />
          <span>360° Interactive View</span>
        </div>

        {/* Drag Hint */}
        {!isDragging && !isPlaying && (
          <div className={styles.dragHint}>
            <MoveHorizontal size={14} />
            <span>Drag to rotate</span>
          </div>
        )}

        {/* Compass Angle Badge */}
        <div className={styles.angleBadge}>
          <Compass size={12} style={{ marginRight: 4 }} />
          {getCardinalDirection(degrees)}
        </div>

        {/* Auto Rotate & Play Controls */}
        <div className={styles.controlsBar}>
          <button
            type="button"
            className={`${styles.controlBtn} ${isPlaying ? styles.controlBtnActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            title={isPlaying ? 'Pause Auto-Rotate' : 'Auto Rotate 360°'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 4 }}>
              {isPlaying ? 'Pause' : 'Auto Rotate'}
            </span>
          </button>

          {/* Slider scrubbing bar */}
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={currentIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentIndex(parseInt(e.target.value, 10));
            }}
            className={styles.frameSlider}
            onClick={(e) => e.stopPropagation()}
            title="Rotate Frame"
          />
        </div>
      </div>
    </div>
  );
}
