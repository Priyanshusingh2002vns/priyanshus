import React, { useState } from 'react';
import styles from '../DealCard.module.css';

export default function CardCompanyInfo({ deal, isListView, hideAvatar }) {
    const [logoFailed, setLogoFailed] = useState(false);
    const fallback = "/logo-fallback.png";

    const path = deal?.company_logo?.[0]?.path;
    const src = logoFailed
        ? fallback
        : path
            ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${path.replace("public/", "")}`
            : fallback;

    const charLimit = isListView ? 25 : 16;

    return (
        <div className={styles.companyInfo}>
            {!hideAvatar && (
                <img 
                    src={src} 
                    alt={deal?.company_name} 
                    className={styles.companyLogo}
                    loading="lazy"
                    decoding="async"
                    onError={() => setLogoFailed(true)}
                />
            )}
            <div className={styles.companyText}>
                <h3 className={styles.companyName}>{deal?.company_name}</h3>
                {isListView && (
                    <>
                        <p className={styles.tagline}>
                            {deal.tag_line || "No description available"}
                        </p>
                        <div className={styles.mobileCompanyBadgeRow}>
                            {deal?.tags && deal.tags.length > 0 && (
                                <span className={styles.mobileTagsInline}>
                                    {(Array.isArray(deal.tags) ? deal.tags : [deal.tags])
                                        .map(t => {
                                            const tagText = typeof t === 'string' ? t.trim() : (t && typeof t === 'object' ? (t.name || t.tag || t.label || t.title || '') : '');
                                            return tagText;
                                        })
                                        .filter(tagText => tagText && tagText.length <= charLimit)
                                        .join(' • ')}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
