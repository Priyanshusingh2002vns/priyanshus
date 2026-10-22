"use client"
import React from 'react'
import styles from "./page.module.css"
import CountUp from '../components/LandingPage/CountUp'
import ButtonAnimation from '../components/LandingPage/ButtonAnimation'
import SingleGlowCard from './SingleGlowCard'

const glowCards = [
    {
        id: 1,
        path: "/glow-icon-1.png",
        head: "Lifetime Commission Model",
        para: "Earn XX% of PrEqt’s revenue on every investor you onboard — for life."
    },
    {
        id: 2,
        path: "/glow-icon-2.png",
        head: "Curated, Verified Deal Flow",
        para: "Only high-quality, diligence-backed deals vetted by our investment team."
    },
    {
        id: 3,
        path: "/glow-icon-3.png",
        head: "Real-Time Tracking",
        para: "Access a personalized dashboard to track deal participation, investor activity, and earnings."
    },
    {
        id: 4,
        path: "/glow-icon-4.png",
        head: "Full Transparency",
        para: "Every transaction, payout, and investor tag is visible — no hidden processes."
    }
]

const glowSquareCard = [
    {
        id: 1,
        path: "/square-glow-1.png",
        head: "SEBI Compliant",
        para: "Powered by SEBI-registered intermediaries"
    },
    {
        id: 2,
        path: "/square-glow-2.png",
        head: "Real-time Tracking",
        para: "Monitor all your referrals and commissions live."
    },
    {
        id: 3,
        path: "/square-glow-3.png",
        head: "Dedicated Support",
        para: "24x7 partner helpdesk and dedicated RM support"
    },
]

const PartnerWithUs = () => {

    return (
        <section className={styles.networkStack}>
            <img src="/stack-overlay.png" alt="background" className={styles.overlay} />

            <div>
                <div className={styles.counterDiv}>
                    <div className={styles.valueDiv}>
                        <div>{<CountUp
                            from={1}
                            to={500}
                            separator=","
                            direction="up"
                            duration={2}
                            className="count-up-text"
                        />}+</div>
                        <p>Verified investors already onboard</p>
                    </div>
                    <div className={styles.verticalLine}></div>
                    <div className={styles.valueDiv}>
                        <div>{<CountUp
                            from={1}
                            to={200}
                            separator=","
                            direction="up"
                            duration={2}
                            className="count-up-text"
                        />}+</div>
                        <p>Financial professionals in our network</p>
                    </div>
                </div>
            </div>

            <div className={styles.mainContainer}>
                <div className={`container ${styles.mainMobileDiv}`} style={{ textAlign: 'center', padding: '0px' }}>
                    <div className={styles.headingDiv}>
                        <div style={{ maxWidth: 'fit-content', margin: 'auto' }}>
                            <ButtonAnimation text="Why Choose Us" />
                        </div>
                        <div className={styles.textSection}>
                            <h2 style={{ fontWeight: '500' }}><span>Why Partner With Us</span></h2>
                            <p>Serious capital demands access to high-conviction equity deals — with real diligence, not noise</p>
                        </div>

                        <div className={styles.glowCardParent}>
                            {glowCards.map((data) => (
                                <SingleGlowCard data={data} key={data.id} />
                            ))}
                        </div>

                        <div className={styles.textSection} style={{ marginTop: '100px' }}>
                            <h2 style={{ fontWeight: '500' }}><span>Compliance, Security & Support.</span></h2>
                            <p>Partner with confidence on a trusted, regulated platform.</p>
                        </div>

                        <div className={styles.glowCardParent}>
                            {glowSquareCard.map((data) => (
                                <SingleGlowCard data={data} key={data.id} />
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

export default PartnerWithUs
