"use client"
import React from 'react'
import styles from "./page.module.css"
import { useRouter } from 'next/navigation'

const page = () => {

    const router = useRouter();

    return (
        <div className={styles.parentPage}>
            <div className={styles.mainContent}>
                <div className={styles.topContent}>
                    <img src="/failed-img.png" width={150} />
                    <div>We couldn’t complete your PAN/ Aadhaar verification</div>
                    <p>Something went wrong while verifying your details through Digilocker.</p>
                </div>
                <div className={styles.lowerContent}>
                    <p>This may happen due to:</p>
                    <ul className={styles.listtable}>
                        <li>Incorrect or mismatched PAN/Aadhaar details</li>
                        <li>Digilocker timeout or network issue</li>
                        <li>Incomplete consent/authorization</li>
                        <li>Temporary server issue</li>
                    </ul>
                </div>
                <div className={styles.lowerBtn} onClick={() => {
                    localStorage.removeItem("currentStep");
                    localStorage.removeItem("showinterest");
                    localStorage.removeItem("session_id");
                    localStorage.removeItem("transaction_id");
                    router.replace("/deals")
                }}>
                    Go Back To Deals
                </div>
            </div>

        </div>
    )
}

export default page
