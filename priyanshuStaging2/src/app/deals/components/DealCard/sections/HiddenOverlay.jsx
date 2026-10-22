import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import styles from '../DealCard.module.css';

export default function HiddenOverlay({ onLoginClick }) {
    return (
        <div className={styles.hiddenOverlay}>
            <img src="/deal_card.png" alt="Blurred Deal" className={styles.blurredImage} />
            <div className={styles.overlayContent}>
                <div className={styles.lockIcon}>
                    <img src="/lock-deal.png" alt="Lock" />
                </div>
                <button className={styles.loginButton} onClick={onLoginClick}>
                    Login to Explore Private Deal <ArrowUpRight size={18} />
                </button>
            </div>
        </div>
    );
}
