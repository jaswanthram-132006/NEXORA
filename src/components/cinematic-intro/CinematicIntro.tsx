"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import CinematicVideo from "./CinematicVideo";
import styles from "./cinematic-intro.module.css";

const SESSION_KEY = "nexora_intro_seen";

export interface CinematicIntroProps {
  /**
   * Force playback even if already seen in current session (useful for previewing).
   */
  forcePlay?: boolean;
  /**
   * Optional callback when intro completely finishes and unmounts.
   */
  onEnded?: () => void;
}

export default function CinematicIntro({
  forcePlay = false,
  onEnded,
}: CinematicIntroProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFinish = useCallback(() => {
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);

    // Save session flag so user doesn't see intro repeatedly on navigation
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Ignore storage errors in private/incognito modes
    }

    setIsFading(true);

    // After smooth fade duration, unmount completely from DOM
    cleanupTimerRef.current = setTimeout(() => {
      setIsActive(false);
      setIsFading(false);
      onEnded?.();
    }, 800);
  }, [onEnded]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  useEffect(() => {
    setMounted(true);

    // 1. Respect reduced-motion preferences
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion && !forcePlay) {
      return;
    }

    // 2. Check session storage flag
    let hasSeen = false;
    try {
      hasSeen = sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      hasSeen = false;
    }

    // Check optional URL parameter `?intro=1` for manual preview
    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const forceUrl = urlParams ? urlParams.get("intro") === "1" : false;

    if (!hasSeen || forcePlay || forceUrl) {
      setIsActive(true);
    }

    // 3. Listen for global replay event
    const handleReplayEvent = () => {
      setIsActive(true);
      setIsFading(false);
      setProgress(0);
    };

    window.addEventListener("nexora:replay-intro", handleReplayEvent);

    return () => {
      window.removeEventListener("nexora:replay-intro", handleReplayEvent);
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, [forcePlay]);

  // Keyboard shortcut for skipping (Esc / Space / Enter)
  useEffect(() => {
    if (!isActive || isFading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isFading, handleSkip]);

  // Do not render anything during SSR or when intro is completed
  if (!mounted || !isActive) {
    return null;
  }

  return (
    <div
      className={`${styles.container} ${isFading ? styles.isFading : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="NEXORA Cinematic Introduction"
    >
      {/* Responsive HTML5 Liquid Metal Video */}
      <CinematicVideo
        onFadeStart={() => setIsFading(true)}
        onComplete={handleFinish}
        onProgress={(p) => setProgress(p)}
      />

      {/* Atmospheric Cinema Overlays */}
      <div className={styles.vignette} />
      <div className={styles.letterboxTop} />
      <div className={styles.letterboxBottom} />

      {/* Minimal Skip Intro Control */}
      <button
        type="button"
        onClick={handleSkip}
        className={styles.skipButton}
        aria-label="Skip cinematic introduction (press Escape or Space)"
      >
        <span>Skip</span>
        <span className={styles.skipBadge}>Esc</span>
      </button>

      {/* Subtle Linear Timeline Progress Bar */}
      <div className={styles.progressTrack}>
        <div
          className={styles.progressBar}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
