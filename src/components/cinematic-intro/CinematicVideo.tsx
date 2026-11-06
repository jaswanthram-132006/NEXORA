"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./cinematic-intro.module.css";

const DESKTOP_VIDEO = "/videos/NEXORA_Liquid_Metal_Desktop_16x9.mp4";
const MOBILE_VIDEO = "/videos/NEXORA_Liquid_Metal_Mobile_9x16.mp4";

interface CinematicVideoProps {
  onFadeStart: () => void;
  onComplete: () => void;
  onProgress: (progress: number) => void;
}

export default function CinematicVideo({
  onFadeStart,
  onComplete,
  onProgress,
}: CinematicVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>(DESKTOP_VIDEO);
  const fadeTriggeredRef = useRef<boolean>(false);
  const completedRef = useRef<boolean>(false);

  // Check mobile viewport using matchMedia
  const getIsMobile = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  }, []);

  useEffect(() => {
    // Initial detection
    const isMobileInitial = getIsMobile();
    setVideoSrc(isMobileInitial ? MOBILE_VIDEO : DESKTOP_VIDEO);

    const mql = window.matchMedia("(max-width: 767px)");

    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isMobile = "matches" in e ? e.matches : mql.matches;
      const targetSrc = isMobile ? MOBILE_VIDEO : DESKTOP_VIDEO;
      setVideoSrc((prev) => {
        if (prev !== targetSrc) {
          return targetSrc;
        }
        return prev;
      });
    };

    // Modern and fallback listeners for orientation & resize
    if (mql.addEventListener) {
      mql.addEventListener("change", handleMediaChange);
    } else {
      mql.addListener(handleMediaChange);
    }

    const handleResize = () => {
      handleMediaChange(mql);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handleMediaChange);
      } else {
        mql.removeListener(handleMediaChange);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [getIsMobile]);

  // Handle autoplay attempt whenever videoSrc is set or mounted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If autoplay is completely rejected or blocked, reveal homepage immediately
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      });
    }
  }, [videoSrc, onComplete]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const progress = Math.min(video.currentTime / video.duration, 1.0);
    onProgress(progress);

    // Smoothly initiate fade-out ~0.65s before playback finishes
    const remainingTime = video.duration - video.currentTime;
    if (remainingTime <= 0.65 && !fadeTriggeredRef.current) {
      fadeTriggeredRef.current = true;
      onFadeStart();
    }
  };

  const handleEnded = () => {
    if (!fadeTriggeredRef.current) {
      fadeTriggeredRef.current = true;
      onFadeStart();
    }
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  const handleError = () => {
    // If the video file fails to load, gracefully reveal homepage immediately
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  return (
    <div className={styles.videoWrapper}>
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        className={styles.video}
        autoPlay
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
      />
    </div>
  );
}

