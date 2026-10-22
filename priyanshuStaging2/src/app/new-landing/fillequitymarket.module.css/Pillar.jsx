'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './pillar.module.css';
// import Image from 'next/image';
const TOTAL_STEPS = 5; // 0-5 for animations, 6 to continue

const CONTENT = [
  {
    title: "We back ambitious companies with public-market discipline at every stage",
    bullets: [
      "Margin of safety with valuation comfort",
      "High-integrity promoters in sunrise sectors",
      "Clean, scalable business models built for growth",
      "Audit Ready systems with a compliance-first mindset"
    ],
    rightTitle: "Ambitious Companies",
    rightSubtitle: "",
    // rightTagline: "We don’t chase mandates. We curate companies ready for public-market scrutiny."
  },
  {
    title: "Access to long-term, aligned capital built for sustained growth.",
    bullets: [
      "15,000+ UHNIs, Family Offices & AIFs",
      "Participation across VC, PE and public markets",
      "Sector-agnostic, long-term investor base",
      "Patient capital built from VC to SME/Main-Board IPOs",
    ],
    rightTitle: "Patient Investors",
    // rightSubtitle: "(Serious Investors Only)",
    // rightTagline: "This is conviction capital that understands growth cycles and governance."
  },
  {
    title: "A fully compliant fundraising process, delivered with SEBI-registered partners.",
    bullets: [
      "SEBI-Registered Merchant Banks & AIFs",
      "Capital structuring across equity and convertibles",
      "Regulatory Documentation and Statutory Filings",
      "Securing Committed Investors Early to Build Market Credibility, with Ongoing Listing Support",
    ],
    rightImage: "/pillarlogo.svg",
    rightTitle: "Institution Grade Execution",
    // rightSubtitle: "(Institution-Grade Delivery)",
    // rightTagline: "Built for scrutiny. Built for scale."
  },
  {
    title: "Where Companies, Capital, and Execution Converge",
    bullets: [
      "PrEqt sits at the intersection of credible companies, serious capital, and institution-grade execution—creating a seamless pathway from private growth to public markets. <br/> We don’t just enable fundraising. <br/> We simplify investment banking."
    ],
  }
];

export default function Pillar() {
  const sectionRef = useRef(null);
  const [step, setStep] = useState(0);
  const lastStepRef = useRef(0);
  const isLockedRef = useRef(false);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';

    const onScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionHeight = rect.height - viewportHeight;

      // Section scroll progress (0 → 1)
      const progress = Math.min(
        Math.max(-rect.top / sectionHeight, 0),
        1
      );

      const rawStep = Math.min(Math.floor(progress * TOTAL_STEPS), TOTAL_STEPS - 1);
      const currentStep = lastStepRef.current;

      // --- 1. LOCK ENFORCEMENT ---
      // If we are locked, we MUST NOT allow the scroll position to drift past the current step.
      // We force the scroll position to remain at the start of the locked step.
      if (isLockedRef.current) {
        // Calculate where the scroll SHOULD be for the current locked step.
        // Progress for step N start = N / TOTAL_STEPS
        const lockedStepProgress = (currentStep + 0.05) / TOTAL_STEPS;

        // Calculate absolute scroll Y position for that progress
        const elementTop = window.scrollY + rect.top;
        const targetScrollY = elementTop + (lockedStepProgress * sectionHeight);

        // Force reset. Using 'instant' to fight momentum aggressively.
        if (Math.abs(window.scrollY - targetScrollY) > 5) {
          window.scrollTo({
            top: targetScrollY,
            behavior: "instant"
          });
        }
        return; // STOP PROCESSING
      }

      // --- 2. STEP TRANSITION LOGIC ---
      let nextStep = rawStep;

      // Prevent Step Skipping (Forward): Only allow +1 increment
      if (rawStep > currentStep + 1) {
        nextStep = currentStep + 1;

        const targetProgress = (nextStep + 0.05) / TOTAL_STEPS;
        const elementTop = window.scrollY + rect.top;
        const targetScrollY = elementTop + (targetProgress * sectionHeight);

        window.scrollTo({
          top: targetScrollY,
          behavior: "instant"
        });
      }

      // Prevent Step Skipping (Backward): Only allow -1 decrement
      if (rawStep < currentStep - 1) {
        nextStep = currentStep - 1;

        // For backward, we also snap to the start of the step (or maybe end? no, start is uniform)
        const targetProgress = (nextStep + 0.05) / TOTAL_STEPS;
        const elementTop = window.scrollY + rect.top;
        const targetScrollY = elementTop + (targetProgress * sectionHeight);

        window.scrollTo({
          top: targetScrollY,
          behavior: "instant"
        });
      }

      // --- 3. LOCK TRIGGER ---
      // Lock on transition to restricted steps (0, 1, 2, 3, 4) in ANY direction.
      // E.g. 5->4 (Back to Exec), 4->3 (Back to Inv), 1->0 (Back to Title).
      // Also 0->1, 1->2...
      // Exception: 4->5 (Final) is allowed without lock (locked only if coming from >5 but that's impossible).
      if (nextStep !== currentStep && nextStep <= 4) {
        isLockedRef.current = true;
        // intentionally NOT hiding overflow ("dont hide it")

        // Update state immediately before locking
        setStep(nextStep);
        lastStepRef.current = nextStep;

        setTimeout(() => {
          isLockedRef.current = false;
        }, 600);

        return;
      }

      // Normal state update if not locking/locked
      if (nextStep !== currentStep) {
        setStep(nextStep);
        lastStepRef.current = nextStep;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: false });
    onScroll(); // Initial check
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.sticky}>
        <div className={styles.horizonalLine}></div>
        {/* LEFT CONTENT */}
        <div className={styles.left}>
          <div className={`${styles.initialTitleOverlay} ${step === 0 ? styles.visible : styles.hidden}`}>
            <h2>
              PrEqt is Built on<br /> 3 Core Pillars.<br />
              <span className={styles.subTitle}>Ambitious Companies.<br  /> Patient Investors.<br /> Institution Grade Execution.</span>
            </h2>
          </div>
          {CONTENT.map((content, index) => {
            const stepIndex = index + 1; // Step 1, 2, 3, 4
            // Show content starting from step 1. 
            // CONTENT[0, 1, 2] active at their steps, CONTENT[3] stays active for step 4 and 5.
            const isActive = (index < 3 && step === stepIndex) || (index === 3 && step >= 4);
            const isVisible = step >= stepIndex;

            return (
              <div
                key={index}
                className={`${styles.textBlock} ${isActive ? styles.active : ''} ${isVisible ? styles.visible : ''}`}
              >
                <h2>{content.title}</h2>
                <ul className={`${styles.bullets} ${index === 3 ? styles.summaryBullets : ''}`}>
                  {content.bullets.map((bullet, i) => (
                    <li key={i}>
                      {bullet.split(/<br\s*\/?>/).map((line, lineIdx) => (
                        <React.Fragment key={lineIdx}>
                          {line}
                          {lineIdx < bullet.split(/<br\s*\/?>/).length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* RIGHT PILLARS WITH TEXT */}
        <div className={styles.right}>
          {/* Sticky Header Title */}
          <div className={`${styles.stickyHeaderTitle} ${step >= 1 ? styles.visible : styles.hidden}`}>
            <h2>
              PrEqt is Built on 3 Core Pillars. <br />
              <span className={styles.stickySubTitle}>Ambitious Companies. Patient Investors. Institution Grade Execution.</span>
            </h2>
          </div>

          {[1, 3, 2].map(i => {
            const pillarStep = i;
            const contentIndex = i - 1; // 0, 1, 2 for CONTENT array

            let pillarState = 'hide';
            let isTextVisible = false;

            if (step === 0) {
              // Step 0: Initial title state
              pillarState = i <= 3 ? 'static' : 'hide';
              isTextVisible = false;
            } else if (step >= 1 && step <= 3) {
              // Steps 1-3: Pillar Animation (1: Comp, 2: Inv, 3: Exec)
              if (step === pillarStep && i <= 3) {
                pillarState = 'show';
                isTextVisible = true;
              } else if (step > pillarStep && i <= 3) {
                pillarState = 'downFade';
                isTextVisible = false;
              } else if (step < pillarStep && i <= 3) {
                pillarState = 'fade';
                isTextVisible = false;
              } else {
                pillarState = 'hide';
                isTextVisible = false;
              }
            } else if (step >= 4) {
              // Final Step (4 and 5)
              if (i === 1 || i === 2) {
                pillarState = 'finalDown';
              } else if (i === 3) {
                pillarState = 'show';
              } else {
                pillarState = 'hide';
              }
              // Text visible for all 3
              isTextVisible = i <= 3;
            }

            return (
              <div key={i} className={styles.pillarWrapper}>
                <img
                  src="/pillar.png"
                  alt="pillar"
                  className={`${styles.pillar} ${styles[pillarState]}`}
                />

                {/* <Image
                src="/pillar.png"
                alt="pillar"
                width={206}
                height={422}
                sizes="(max-width: 768px) 56px, 112px"
                className={`${styles.pillar} ${styles[pillarState]}`}
                loading="lazy"
               /> */}

                
                {contentIndex < CONTENT.length && (
                  <div className={`${styles.pillarText} ${isTextVisible ? styles.textShow : styles.textHide} ${step >= 4 && (i === 1 || i === 2) ? styles.textDown : ''}`}>
                    {CONTENT[contentIndex].rightImage && (
                      <img src={CONTENT[contentIndex].rightImage} alt="pillar logo" className={styles.pillarImage} width={144} height={45}/>
                    )}
                    {/* <div className={styles.tagline}>{CONTENT[contentIndex].rightTagline}</div> */}
                    <h3 className={styles.pillarTitle}>{CONTENT[contentIndex].rightTitle}</h3>
                    <p className={styles.pillarSubtitle}>{CONTENT[contentIndex].rightSubtitle}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.featuresContainerlines}></div>

      </div>
    </section>
  );
}
