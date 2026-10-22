"use client";
import React, { useEffect, useRef } from "react";
// import ButtonAnimation from "./ButtonAnimation";
import styles from "./dealsmatter.module.css";
import ButtonAnimation from "../../components/LandingPage/ButtonAnimation";

const DealsMatter = () => {
    const firstRef = useRef(null);
    const secondRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            const first = firstRef.current;
            const second = secondRef.current;
            if (!container || !first || !second) return;

            const windowHeight = window.innerHeight;

            const containerRect = container.getBoundingClientRect();
            const scrollYInContainer = -containerRect.top;

            // --- Define Animation Parameters ---
            // INCREASED: Animation now happens over 150% of the viewport height (1.5vh)
            const animationDistance = windowHeight * 1.5;

            // Where the animation starts (e.g., after the first 5% of container is scrolled)
            const animationStartPoint = windowHeight * 0.02;

            // --- Calculate Total Progress (0 to 1) ---
            let totalProgress = 0;
            if (scrollYInContainer > animationStartPoint) {
                totalProgress = Math.min(
                    Math.max((scrollYInContainer - animationStartPoint) / animationDistance, 0),
                    1
                );
            }

            // --- First div animation (Starts immediately) ---
            const firstProgress = totalProgress;
            const firstScale = 1.5 + firstProgress * 0.5;
            const firstOpacity = 1 - firstProgress;
            first.style.transform = `scale(${firstScale})`;
            first.style.opacity = firstOpacity;

            // --- Second div animation (Starts with a delay) ---
            const delayFactor = 0.4; // Start the second div's animation when totalProgress reaches 60%

            let secondProgress = 0;

            if (totalProgress > delayFactor) {
                // Remap the remaining progress (0.6 to 1.0) to a new 0 to 1 range
                const delayedProgress = totalProgress - delayFactor;
                const remainingDistance = 1 - delayFactor;

                secondProgress = Math.min(delayedProgress / remainingDistance, 1);
            }
            let secondScale = 0.9+ secondProgress * 0.5;
            if (window.innerWidth <= 450) {
                secondScale = 0.5+ secondProgress * 0.5;
            }
                                             const secondOpacity = secondProgress;
            // Slight Y translation to enhance "coming from behind"
            const translateY = (1 - secondProgress) * 50;

            second.style.transform = `scale(${secondScale}) translateY(${translateY}px)`;
            second.style.opacity = secondOpacity;
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div className={styles.sepratebox}>
                <div className={`container ${styles.containersp}`} style={{ padding: "0" }}>
                    <div className={styles.seprateboxcontent}></div>
                </div>
            </div>
            <section data-theme="light" className={styles.container} ref={containerRef} style={{ position: 'relative' }}>
                {/* <img src="/overlay-2.png" alt="Decorative background overlay for PrEqt investment platform section" className={styles.overlay} title="Decorative background overlay for PrEqt investment platform section" /> */}
                <div className={styles.stickyWrapper}>
                    {/* <video
                        className={styles.backgroundVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/light_dots.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video> */}
                    <div className={`${styles.layer}`} ref={firstRef}>
                        {/* <ButtonAnimation text="Welcome to PrEqt" /> */}
                        {/* <div className={styles.HeadingTagReplace}>
                            <span>India's #1 form for</span> <br />
                            <span>Equity Market Investing</span>
                        </div>
                        <p className={styles.firstText}>
                            PrEqt brings together ambitious founders and discerning investors through a curated, insight-driven platform
                        </p> */}
                        <div className={styles.dealsmattertitle}>
                            <h2>PrEqt is Built on <br />
                                <span>3 Core Pillars</span> </h2>
                        </div>
                    </div>

                    {/* Second Div - Starts hidden, scales/fades in */}
                    <div className={`${styles.layer} `} ref={secondRef} style={{ opacity: 0, transform: 'scale(1)' }}>

                        <div className={styles.dealsmattertitle}>
                            <h2>Ambitous Founders. Patient Investors.
                                <br />
                                <span>Institution Grade Execution</span></h2>

                        </div>
                    </div>
                </div>
            </section >


            <div className={styles.sepratebox}>
                <div className={`container ${styles.containersp}`} style={{ padding: "0" }}>
                    <div className={styles.seprateboxcontent}></div>
                </div>
            </div>
            {/* <div className={styles.sepratebox2}></div> */}


        </>
    );
};

export default DealsMatter;