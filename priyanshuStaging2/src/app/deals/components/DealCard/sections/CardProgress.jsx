import React from 'react';
import styles from '../DealCard.module.css';

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function CardProgress({ deal }) {
    const raised = deal?.company_name === "Cricstudio Pvt. Ltd." || deal?.company_name === "avineet"
        ? 4.5
        : Number(deal?.raised_amount || 0);

    const targetRaw = (typeof deal?.target_funding_in_cr === 'object' && deal?.target_funding_in_cr !== null && 'data' in deal?.target_funding_in_cr) ? deal.target_funding_in_cr.data : deal?.target_funding_in_cr;
    const target = Number(targetRaw || 0);

    if (target <= 0) return null;

    const percent = parseFloat(((raised / target) * 100).toFixed(1));
    const width = `${Math.min(Number(percent), 100)}%`;

    return (
        <div className={styles.progressContainer}>
            <div className={styles.progressLabelRow}>
                <p className={styles.progressValues}>
                    ₹{formatNumberWithCommas(raised)} Cr / ₹{formatNumberWithCommas(target)} Cr
                </p>
                <p className={styles.progressPercent}>{percent}%</p>
            </div>
            <div className={styles.progressTrack}>
                <div 
                    className={styles.progressBar} 
                    style={{ width }} 
                />
            </div>
        </div>
    );
}
