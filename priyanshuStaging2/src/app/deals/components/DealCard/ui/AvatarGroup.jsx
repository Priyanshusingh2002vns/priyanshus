import React from 'react';
import styles from './AvatarGroup.module.css';

export default function AvatarGroup({ initials = [] }) {
    if (!initials.length) return null;

    return (
        <div className={styles.avatarStack}>
            {initials.map((initial, idx) => (
                <div key={idx} className={styles.avatar}>
                    {initial}
                </div>
            ))}
        </div>
    );
}
