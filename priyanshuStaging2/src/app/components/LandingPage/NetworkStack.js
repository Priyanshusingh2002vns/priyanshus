"use client"
import React, { useEffect, useState } from 'react'
import styles from "./network.module.css"
import CountUp from './CountUp'
import ButtonAnimation from './ButtonAnimation'
import Image from 'next/image'
import ScrollStack, { ScrollStackItem } from './ScrollStack'
import IconCarousel from './IconCarousel'


const NetworkStack = () => {

    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS device
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

        if (isIosDevice) {
            setIsIOS(true);
        }
    }, []);

    return (
        <>
            <section className={styles.networkStack}>
                <img src="/stack-overlay.png" alt="Decorative background overlay for PrEqt network stack section" className={styles.overlay} title="Decorative background overlay for PrEqt network stack section" />

                <div>
                    <div className={styles.counterDiv}>
                        {/* <div className={styles.valueDiv}>
                            <div>${<CountUp
                                from={0}
                                to={2}
                                separator=","
                                direction="up"
                                duration={1}
                                className="count-up-text"
                            />}.3B+</div>
                            <p>Volume</p>
                        </div>
                        <div className={styles.verticalLine}></div> */}
                        {/* <div className={styles.valueDiv}>
                            <div>{<CountUp
                                from={1}
                                to={500}
                                separator=","
                                direction="up"
                                duration={2}
                                className="count-up-text"
                            />}+</div>
                            <p>Deals</p>
                        </div> */}
                        {/* <div className={styles.verticalLine}></div> */}
                        <div className={styles.valueDiv}>
                            <div>{<CountUp
                                from={1}
                                to={5000}
                                separator=","
                                direction="up"
                                duration={2}
                                className="count-up-text"
                            />}K+</div>
                            <p>UNHI's Family Offices</p>
                        </div>
                    </div>
                </div>

                <div className={styles.mainContainer}>
                    <div className={`landing-container ${styles.mainMobileDiv}`} style={{ textAlign: 'center', padding: '0px' }}>
                        <div className={styles.headingDiv}>
                            <ButtonAnimation text="Why Choose Us" />
                            <div className={styles.sectionGlowHead}>
                                {/* <h1>For founders who need capital, and investors< br /> who value diligence — PrEqtconnects both </h1> */}
                                {/* <h1><span>through a trusted and transparent platform</span></h1> */}
                                <div className={styles.HeadingTagReplace}><span>Invite-only for UHNIs, Family Offices and Institutions</span></div>
                            </div>

                            <p>Serious capital demands access to high-conviction equity deals — with real diligence, not noise</p>
                        </div>

                        <ScrollStack>
                            <ScrollStackItem >
                                <div className={styles.singleCard}>
                                    <div className={styles.data}>
                                        <div className={styles.headText}>For Investors</div>
                                        <div className={styles.descText}>Built for Clarity, Confidence & Conviction</div>

                                        <div className={styles.listData}>
                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>App-first deal discovery — not buried in WhatsApp forwards</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Founder videos, AMAs & risk disclosures — upfront and honest</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Curated diligence packs — simplified, not scattered</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Live dashboards — track updates, lock-ins & exits in real time</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Sentiment gauge — see market mood & anchor appetite instantly</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Exit readiness & liquidity insights — when and how you’ll cash out</p>
                                            </div>

                                        </div>
                                    </div>
                                    <div className={styles.imageCard}>
                                        <img src="/card-1.png" alt="PrEqt platform features for investors - deal discovery, founder videos, diligence packs, live dashboards" loading="eager" title="PrEqt platform features for investors - deal discovery, founder videos, diligence packs, live dashboards" />
                                        <div className={styles.carouselContent}>
                                            <IconCarousel />
                                        </div>
                                    </div>

                                </div>
                            </ScrollStackItem>

                            <ScrollStackItem >
                                <div className={styles.singleCard2}>
                                    <div className={styles.imageCard}>
                                        <img src="/card-2.png" alt="PrEqt platform features for promoters - direct investor interaction, smart deal pages, story-led content, commitment tracking" loading="eager" title="PrEqt platform features for promoters - direct investor interaction, smart deal pages, story-led content, commitment tracking" />
                                    </div>
                                    <div className={styles.data}>
                                        <div className={styles.headText}>For Promoters</div>
                                        <div className={styles.descText}>Designed to Let You Focus on Building — Not Chasing Capital</div>

                                        <div className={styles.listData}>
                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Interact directly with the investors through the platform - transparent and convenient</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>One smart deal page — everything your investor needs in one place</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Story-led content — pitch videos, podcasts, and live AMAs</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Standardized diligence templates — zero rework, fast turnaround</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-1-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Commitment tracking — live dashboards & interest heatmaps</p>
                                            </div>


                                            {/* <div className={styles.singleList}>
                                                <div><Image src="/card-2-2.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Participate in funding rounds before companies go public.</p>
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            </ScrollStackItem>

                            {/* <ScrollStackItem >
                                <div className={styles.singleCard}>
                                    <div className={styles.data}>
                                        <div className={styles.headText}>Speed & Intelligence</div>
                                        <div className={styles.descText}>Move faster with technology that delivers real-time intelligence, smart tracking, and analytics for sharper decision-making.</div>

                                        <div className={styles.listData}>
                                            <div className={styles.singleList}>
                                                <div><Image src="/card-3-1.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Execute trades in milliseconds with our matching engine.</p>
                                            </div>

                                            <div className={styles.singleList}>
                                                <div><Image src="/card-3-2.svg" height={32} width={32} alt="PrEqt feature icon" title="PrEqt feature icon" /></div>
                                                <p>Use analytics and outreach tools to close deals faster.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.imageCard}>
                                        <Image src="/card-3.png" height={460} width={580} alt="PrEqt speed and intelligence features - real-time analytics and smart tracking" title="PrEqt speed and intelligence features - real-time analytics and smart tracking" />
                                    </div>
                                </div>
                            </ScrollStackItem> */}
                        </ScrollStack>
                    </div>
                </div>
            </section>


        </>
    )
}

export default NetworkStack
