"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import styles from "./OurMobileApp.module.css";

export default function OurMobileApp() {
  const containerRef = useRef(null);
  
  // Track scroll progress through a 300vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the progress to mimic GSAP's scrub: 1
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 20,
    stiffness: 100,
    restDelta: 0.001
  });

  // Phase 1: Mountain (appears from 0 to 40% of the scroll)
  const mountainY = useTransform(smoothProgress, [0, 0.4], ["100%", "60%"]);
  const mountainBlur = useTransform(smoothProgress, [0, 0.3], ["blur(15px)", "blur(0px)"]);
  const mountainOpacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);

  // Phase 2: Phone & Text (starts after mountain, 40% to 80%)
const contentY = useTransform(smoothProgress, [0.4, 0.8], ["60%", "10%"]); 
const contentOpacity = useTransform(smoothProgress, [0.4, 0.6], [0, 1]);

  return (
    <div ref={containerRef} className={styles.scrollContainer}>
      <div className={styles.stickySection}>
        <div className={styles.stickyWrapper}>
          
          <div className={styles.headingMainContainer}>
            <p className={styles.earlyAccessHeading}>
              Gain early access to tomorrow's leaders
            </p>
            <p className={styles.OurApp}>Our Mobile App</p>
          </div>

          <div className={styles.stage}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageGroup}>
                <motion.img
                  style={{ y: mountainY, filter: mountainBlur, opacity: mountainOpacity }}
                  src="/assets/pictures/mountain.png"
                  className={styles.MountainImage}
                  alt="Mountain"
                />
                <motion.img
                  style={{ y: contentY, opacity: contentOpacity }}
                  src="/assets/pictures/phone.png"
                  className={styles.PhoneImage}
                  alt="Phone"
                />
              </div>

              <motion.div 
                style={{ y: contentY, opacity: contentOpacity }}
                className={styles.leftText}
              >
                Get exclusive app-only deals and manage your trips on the go.
              </motion.div>

              <motion.div 
                style={{ y: contentY, opacity: contentOpacity }}
                className={styles.storeButtons}
              >
                <img 
                  src="/assets/pictures/GooglePlay1.png" 
                  onClick={() => window.open("https://play.google.com/store/apps/details?id=com.preqt.app")} 
                  style={{ cursor: 'pointer' }} 
                  alt="Google Play"
                />
                <img 
                  src="/assets/pictures/AppStore1.png" 
                  onClick={() => window.open("https://apps.apple.com/in/app/preqt/id6751903472")} 
                  style={{ cursor: 'pointer' }} 
                  alt="App Store"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}