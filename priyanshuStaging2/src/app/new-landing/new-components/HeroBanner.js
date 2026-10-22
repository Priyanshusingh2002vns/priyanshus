"use client"
import React from 'react';
import styles from './herobanner.module.css';

export default function HeroBanner() {
  return (
    <section className={styles.heroBanner}>
      <video
        // src="/herovideo.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/thumbnailhero.webp"
        // preload="auto"
        preload="metadata"
        fetchPriority="high"
        className={styles.heroVideo}
      />

      <div className={styles.overlay} />

      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <h1 className={styles.heading}>
            Access To
            <br />
            High-Conviction
            <br />
            <span>Equity Market Deals</span>
          </h1>

          <p className={styles.subheading}>
            Skyon is built to streamline critical operations and enhance real-time
            collaboration across teams, no matter the distance or complexity.
          </p>

          <div className={styles.actions}>
            <button className={styles.primaryCta}>
              <span>Explore Live Deals</span>
              <span className={styles.ctaPlus}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <button className={styles.secondaryCta}>
              <span>Raise Capital Smarter</span>
              <span className={styles.ctaPlus}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>

          <div className={styles.featuresContainer}>
            <p className={styles.featuresTitle}>Everything you need to raise capital with confidence</p>
            <div className={styles.features}>
              <span>Verified Deals</span>
              <span>Secure Data Rooms</span>
              <span>Investor Network</span>
              <span>Pre-IPO &amp; IPO Access</span>
              <span>Real-Time Analytics</span>
              <span>Smart Tracking</span>
            </div>
          </div>



        </div>

        <div className={styles.featuresContainerlines}></div>




      </div>
      <div className={styles.right}>
        <div className={styles.qrCard}>
          <img src="/preqtqr.png" alt="qrcode" />
          <div className={styles.qrContent}>
            <p className={styles.qrTitle}>Because Great Deals Hate Delays</p>
            <p className={styles.qrSubtitle}>Download PrEqT App</p>
          </div>
        </div>
      </div>

      <button className={styles.scrollIndicator} aria-label="Scroll down">
        <span className={styles.scrollIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 12L12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </section>
  );
}