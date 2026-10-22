import React from 'react'
import styles from './investors.module.css'
import AppDownload from './AppDownload';

export default function Investors() {
    return (
        <section className={styles.investors}>
            <div className={styles.containerlinesarrow}>
                {/* <p></p> */}
                <div className={styles.seprateboxcontent}></div>

                {/* <button className={styles.scrollIndicator} aria-label="Scroll down">
                    <span className={styles.scrollIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 12L12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button> */}
            </div>

            <div className={`container ${styles.investorscontainer}`}>
                <div className={styles.featuresContainerlines}></div>

                <div className={styles.investorscontenttop}>
                    <h2>How will it Benefit Investors?</h2>
                    <p>A controlled, insight-driven investment environment that gives investors early access to quality deals, direct promoter interaction, and AI-backed analysis—reducing information asymmetry and decision risk in pre-IPO investing.</p>
                </div>

                <div className={styles.investorscontentbottomcontainer}>
                    <div className="row">
                        <div className={`col-lg-6 ${styles.colsixone}`} style={{ paddingRight: '0' }}>
                            <div className={styles.investorscontentbottom}>
                                <div className={styles.investorscontentbottomcard}>
                                    <h3>1</h3>
                                    <h4>Access to Exclusive Deal Rooms</h4>
                                    <p>Curated, invite-only access to live pre-IPO opportunities. <br />
                                        Ensures deal quality and eliminates noise from unverified listings.</p>
                                </div>
                                <div className={styles.investorscontentbottomcard}>
                                    <h3>2</h3>
                                    <h4>Direct Communication with KMPs</h4>
                                    <p>Structured interaction with promoters and key management.<br />
                                        Improves transparency and enables informed conviction building.</p>
                                </div>
                                <div className={styles.investorscontentbottomcard}>
                                    <h3>3</h3>
                                    <h4>AI-Enabled Deal Assistant</h4>
                                    <p>AI-powered analysis of financials, risks, and key deal metrics.<br />
                                        Helps investors evaluate opportunities faster and more objectively.</p>
                                </div>
                                <div className={styles.investorscontentbottomcard}>
                                    <h3>4</h3>
                                    <h4>Strong Market Relationships</h4>
                                    <p>Deep, long-standing relationships with promoters, merchant <br />
                                        bankers and intermediaries across private and public 
                                        markets—enabling better access and smoother execution.</p>
                                </div>
                            </div>
                        </div>

                        <div className={`col-lg-6 ${styles.colsixtwo}`} style={{ paddingLeft: '0' }}>
                            <AppDownload />
                        </div>

                    </div>

                </div>

            </div >
        </section >
    );
}