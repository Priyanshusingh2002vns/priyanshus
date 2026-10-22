"use client"
import React, { useState } from 'react'
import styles from './CapitalWithConfidence.module.css'
import AnimatedBtn from '../LandingPage/AnimatedBtn'
import ButtonAnimation from '../LandingPage/ButtonAnimation'
import FundraiseFrom from '../Fundraise/FundraiseFrom'

const CapitalWithConfidence = () => {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    return (
        <section className={styles.preqtSection}>

            <div className={styles.appDisplayWrapper}>

                <div className={styles.animatedBorder}>

                    <div className={styles.appScreenshotContainer} style={{ minHeight: "unset" }}>

                        <div className={`${styles.appContentPlaceholder}`}>
                            <div className={styles.partnerDiv}>
                                <div>
                                    <div className={styles.header}>
                                        <h1>Ready to Raise Capital  <br className={styles.hideOnMobile} />with Confidence?</h1>
                                    </div>

                                    {/* <div className={styles.bodyPartnerContaienr}> */}
                                    <div className={styles.bodyPartner}>
                                        <span>Start your funding journey with India's most trusted private market platform.</span>
                                    </div>
                                    <div className={styles.btn} onClick={handleOpenModal}>
                                        <AnimatedBtn text="Start Your Fundraise" fullWidth={true} />
                                    </div>
                                    <FundraiseFrom isOpen={showModal} onClose={handleCloseModal} />
                                    {/* </div> */}

                                    {/* <div className={styles.partnerFooter}>
                      <ButtonAnimation text='Bank-grade Security' /> 
                      <ButtonAnimation text='24/7 Support' />
                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </section>
    )
}

export default CapitalWithConfidence