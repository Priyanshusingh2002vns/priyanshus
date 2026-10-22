import React from 'react';
import styles from '../DealCard.module.css';
import { ArrowUpRight } from 'lucide-react';

export default function CardActionButton() {
    return (
        <div className={styles.actionButtonWrapper} style={{ margin: "0px" }}>
            <button className={styles.actionButton}>
                DETAILED DEEP DIVE 
                <ArrowUpRight size={16} className={styles.actionIcon} />
            </button>
        </div>
    );
}
