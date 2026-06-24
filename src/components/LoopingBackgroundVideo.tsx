"use client";

import { useEffect, useRef } from "react";
import styles from "./SiteChrome.module.css";

const backgroundVideoSrc =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4";

export default function LoopingBackgroundVideo() {
  const firstRef = useRef<HTMLVideoElement | null>(null);
  const secondRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videos = [firstRef.current, secondRef.current].filter(
      (video): video is HTMLVideoElement => Boolean(video),
    );

    const syncVideos = async () => {
      for (const [index, video] of videos.entries()) {
        try {
          video.currentTime = index === 0 ? 0 : 0.25;
          await video.play();
        } catch {
          // Autoplay may be blocked in some environments; the background still renders.
        }
      }
    };

    void syncVideos();
  }, []);

  return (
    <div className={styles.background} aria-hidden="true">
      <video
        ref={firstRef}
        className={`${styles.backgroundVideo} ${styles.backgroundVideoPrimary}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={backgroundVideoSrc} type="video/mp4" />
      </video>
      <video
        ref={secondRef}
        className={`${styles.backgroundVideo} ${styles.backgroundVideoSecondary}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={backgroundVideoSrc} type="video/mp4" />
      </video>
      <div className={styles.backgroundOverlay} />
    </div>
  );
}
