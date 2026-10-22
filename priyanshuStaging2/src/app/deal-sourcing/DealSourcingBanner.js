"use client"
import React, { useState } from 'react';
import styles from './DealSourcingBanner.module.css';
import FundraiseFrom from '../components/Fundraise/FundraiseFrom';

export default function DealSourcingBanner() {
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const [isMobileBarVisible, setIsMobileBarVisible] = React.useState(true);
    const [isManuallyClosed, setIsManuallyClosed] = React.useState(false);
    const [isPillarVisible, setIsPillarVisible] = React.useState(false);
    const [appLink, setAppLink] = React.useState("https://play.google.com/store/apps/details?id=com.preqt.app");

    React.useEffect(() => {
        const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
        if (isApple) {
            setAppLink("https://apps.apple.com/in/app/preqt/id6751903472");
        }
    }, []);

    // REMOVED Scroll-hiding logic to keep bar visible on scroll
    // REMOVED IntersectionObserver for Pillar visibility to keep bar persistent

    return (
        <section className={styles.heroBanner}>
            <video
                autoPlay
                loop
                muted
                playsInline
                poster="/dealsbannerthumbnail.png"
                preload="auto"
                className={styles.heroVideo}
            >
                <source src="/dealsbanner.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className={styles.overlay} />

            <div className={`container ${styles.inner}`}>
                <div className={styles.left}>
                    <h1 className={styles.heading}>
                        Are you Looking for Growth Capital or Exploring IPO Possibilities? <span>Start your journey with us!</span>
                    </h1>

                    <p className={styles.subheading}>
                        From high-growth SMEs to established companies exploring IPO possibilities, assessment. PrEqt brings in expertise of an full-fledged investment bank
                    </p>

                    <div className={styles.actions}>

                        <button className={styles.secondaryCta} onClick={handleOpenModal}>
                            <span>Take Our Assessment Now</span>
                            <span className={styles.ctaPlus}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>


                    </div>
                    <div className={styles.actionsToday}>

                        <button className={styles.primaryCta}>
                            <span onClick={handleOpenModal}> Get Started Today </span>
                            <span className={styles.ctaPlus}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </button>
                    </div>


                    <div className={styles.forCompanies}>
                        <h4>FOR COMPANIES</h4>
                    </div>







                </div>

                <div className={styles.featuresContainerlines}></div>




            </div>

            <FundraiseFrom isOpen={showModal} onClose={handleCloseModal} />

        </section>
    );
}