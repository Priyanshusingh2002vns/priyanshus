"use client"
import React, { useEffect, useRef, useState } from "react";
import styles from "./DealsVideos.module.css";

const phases = [
    {
        id: 0,
        title: "How PrEqt does things differently",
        description: "Innovative approach to growth capital and IPO readiness",
        isIntro: true
    },
    {
        id: 1,
        title: "Complete a 10-Minute Business Assessment & Receive Capital Readiness Report",
        description: "A structured assessment followed by a data-backed report identifying the most suitable fundraising route and capital eligibility",
        video: "/videopd1.mov"
    },
    {
        id: 2,
        title: "Engage One-on-One with Assigned Bankers",
        description: "Discuss the assessment insights and align on the optimal capital strategy and execution approach",
        video: "/videopd2.mp4"
    },
    {
        id: 3,
        title: "Undertake In-Depth Due Diligence",
        description: "Centralized diligence, disclosures, and regulatory readiness for transaction execution",
        video: "/videopd3.mp4"
    },
    {
        id: 4,
        title: "Execute Capital Raise or IPO Pathway",
        description: "Execute the transaction through Private Placement, Pre-IPO, IPO, or structured instruments. We have to also decide the CTA to display besides the process",
        video: "/videopd4.mp4"
    }
];

const DealsDiffPreqtVideo = () => {
    const sectionRef = useRef(null);
    const [activePhase, setActivePhase] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const sectionHeight = rect.height;
            const scrollTop = -rect.top;

            // Calculate progress (0 to 1)
            const progress = Math.max(0, Math.min(1, scrollTop / (sectionHeight - window.innerHeight)));

            // Determine phase (0 to 4)
            const phase = Math.min(phases.length - 1, Math.floor(progress * phases.length));
            setActivePhase(phase);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section ref={sectionRef} className={styles.scrollSection}>
            <div className={styles.stickyContainer}>
                {/* Bottom Border Box Decoration */}
                <div className={styles.sepratebox}>
                    <div className="container" style={{ padding: "0" }}>
                        <div className={styles.seprateboxcontent}></div>
                    </div>
                </div>
                {/* Background Videos */}
                <div className={styles.videoWrapper}>
                    {phases.map((phase, index) => (
                        <video
                            key={phase.id}
                            src={phase.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={`${styles.bgVideo} ${activePhase === index ? styles.active : ""}`}
                        />
                    ))}
                    <div className={styles.overlay}></div>
                </div>

                {/* Grid Lines Overlay */}
                <div className={`container ${styles.gridLines}`}>
                    <div className={styles.lineLeft}></div>
                    <div className={styles.lineRight}></div>
                </div>

                {/* Content */}
                <div className={`container ${styles.content}`}>
                    {phases.map((phase, index) => (
                        <div
                            key={phase.id}
                            className={`${styles.textBlock} ${activePhase === index ? styles.active : ""} ${phase.isIntro ? styles.introBlock : ""}`}
                        >
                            {!phase.isIntro && (
                                <div className={styles.scrollIcon}>
                                    {/* <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 1V13M7 13L1 7M7 13L13 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg> */}
                                </div>
                            )}
                            {phase.isIntro ? (
                                <h2 className={styles.title}>
                                    How <span>PrEqt</span> <br /> does things differently
                                </h2>
                            ) : (
                                <h2 className={styles.title}>{phase.title}</h2>
                            )}
                            {!phase.isIntro && <p className={styles.description}>{phase.description}</p>}
                        </div>
                    ))}
                </div>

                {/* Bottom Border Box Decoration */}
                <div className={styles.sepratebox1}>
                    <div className="container" style={{ padding: "0" }}>
                        <div className={styles.seprateboxcontent1}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DealsDiffPreqtVideo;
