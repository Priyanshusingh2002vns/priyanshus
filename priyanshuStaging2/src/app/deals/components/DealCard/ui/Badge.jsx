import React from 'react';
import styles from './Badge.module.css';

export default function Badge({ children, variant = 'solid', color = 'default', className = '' }) {
    return (
        <div className={`${styles.badge} ${styles[variant]} ${styles[color]} ${className}`}>
            {children}
        </div>
    );
}
