"use client"
import React, { useState } from "react";
import styles from "./DealRaiseCapital.module.css";
import FundraiseFrom from "../components/Fundraise/FundraiseFrom";

const DealRaiseCspital = () => {
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    return (
        <section className={styles.dealRaiseCapitalSection}>

            <div className={styles.dealRaiseCapital}>
                <div className={styles.dealRaiseCapitalContent}>


                    <h4>Ready to Raise Capital <br /> with Confidence?</h4>
                    <p>Start your funding journey with India's most trusted private market platform.</p>
                    <button className={styles.secondaryCta} onClick={handleOpenModal}>
                        <span>Raise Capital Smarter</span>
                        <span className={styles.ctaPlus}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>

                </div>

            </div>
            <FundraiseFrom isOpen={showModal} onClose={handleCloseModal} />
        </section>

    );
};

export default DealRaiseCspital;
