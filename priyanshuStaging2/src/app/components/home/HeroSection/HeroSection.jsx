"use client"
import styles from './heroSection.module.css'
import LetsHearFromThem from '../LetsHearFromThem/LetsHearFromThem'
import DealsTalk from '../DealsTalk/DealsTalk'
import MarketSentiment from '../MarketSentiment/MarketSentiment'
import OurMobileApp from '../OurMobileApp/OurMobileApp'
import MarketPulse from '../MarketPulse/MarketPulse'
import DealShowcase from '../DealShowcase/DealShowcase'
import UnlockTeaser from '../DealShowcase/UnlockTeaser'
import { useEffect, useState } from 'react'

export default function HeroSection() {
    console.log("DealsTalk render");
    return (
        <div className={styles.superMainDiv}>
            <div className={styles.mainDiv}>
                <section className={styles.heroMainContainer}>
                    <div className={styles.heroFrame}>
                        <div className={styles.midlrow}>
                            <div className={styles.rightclm}>
                                <MarketPulse />
                                <DealShowcase />

                                {/* <LetsHearFromThem /> */}
                                {/* <DealsTalk /> */}

                            </div>
                            <div className={styles.leftclm}>
                                <div className={styles.MarketSentimentComponent}>
                                    <MarketSentiment />
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
            </div>
            <UnlockTeaser />

            {/* <OurMobileApp /> */}


        </div>

    )
}