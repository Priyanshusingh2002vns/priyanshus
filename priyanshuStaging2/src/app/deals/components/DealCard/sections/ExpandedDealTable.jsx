import React, { useState } from 'react';
import Link from 'next/link';
import RatingBadge from '../ui/RatingBadge';
import CardFooter from './CardFooter';
import CardHeader from './CardHeader';
import CardTags from './CardTags';
import CardHeroMetrics from './CardHeroMetrics';
import CardProgress from './CardProgress';
import { getMetricDetail } from '../config';
import { formatFullDate } from '@/app/utils/FormatDate';
import styles from '../DealCard.module.css';

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "TBD") return "TBD";
    const parsed = Number(num);
    if (isNaN(parsed)) return String(num);
    return parsed.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const formatGridValue = (value, metric) => {
    if (value && typeof value === 'object') {
        if (value.data !== undefined && value.data !== null) value = value.data;
        else if (value.value !== undefined && value.value !== null) value = value.value;
        else if (value.name !== undefined && value.name !== null) value = value.name;
        else return "TBD";
    }

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "TBD" ||
        value === "null" ||
        value === "undefined" ||
        value === "N/A" ||
        value === "-" ||
        String(value).includes('[object Object]')
    ) {
        return "TBD";
    }

    switch (metric?.format) {
        case 'currency':
            return `₹${formatNumberWithCommas(value)}${metric.suffix ? ` ${metric.suffix}` : ''}`;
        case 'multiplier':
            return `${formatNumberWithCommas(value)}x`;
        case 'percent':
            return `${formatNumberWithCommas(value)}%`;
        case 'date':
            return formatFullDate(value);
        case 'date_short': {
            const str = String(value).trim();
            if (!str || str === "TBD" || str.toLowerCase() === "null" || str.toLowerCase() === "undefined" || str === "-") {
                return "TBD";
            }
            if (/^[A-Za-z]{3,}\s'?\d{2,4}$/.test(str)) {
                return str;
            }
            const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (match) {
                const [_, year, month, day] = match;
                const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
                const monthName = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                return `${monthName} '${String(year).slice(-2)}`;
            }
            const d = new Date(str);
            if (isNaN(d.getTime())) return str;
            const month = d.toLocaleString('en-US', { month: 'short' });
            const year = d.getFullYear().toString().slice(-2);
            return `${month} '${year}`;
        }
        default:
            return String(value);
    }
};

export default function ExpandedDealTable({
    deal,
    layout,
    metrics,
    qaCount,
    replies,
    onTagClick
}) {
    const [logoFailed, setLogoFailed] = useState(false);
    const fallback = "/logo-fallback.png";
    const path = deal?.company_logo?.[0]?.path;
    let logoSrc = fallback;
    if (!logoFailed && path) {
        logoSrc = path.startsWith('http')
            ? path
            : `${process.env.NEXT_PUBLIC_USER_BASE || 'https://api.preqt.club/'}admin/${path.replace("public/", "")}`;
    }

    const ratingScore = deal?.ipo_review_rating?.weighted_composite_score;
    const gridItems = metrics?.grid || [];

    const isPublic = deal?.deal_type?.toLowerCase() === 'public';
    const hasTags = Boolean(deal?.tags && (Array.isArray(deal.tags) ? deal.tags.length > 0 : Boolean(deal.tags)));
    const isPrivateDeal = ['private', 'ccps'].includes(deal?.deal_type?.toLowerCase());
    const hasStage = Boolean(isPrivateDeal && deal?.stage);
    const rawHighlights = deal?.key_highlights || deal?.deal_setpData?.key_highlights || deal?.data?.key_highlights;
    const highlights = Array.isArray(rawHighlights)
        ? rawHighlights
        : (Array.isArray(rawHighlights?.data) ? rawHighlights.data : []);
    const hasKeyHighlights = highlights.length > 0;
    const hasRating = Boolean(deal?.ipo_review_rating?.status && ratingScore);

    const showTopBar = isPublic || hasTags || hasStage || hasKeyHighlights || hasRating || deal?.exclusive_deal;
    const hasHero = Boolean(metrics?.hero && metrics.hero.length > 0);

    return (
        <div className={styles.expandedCardContainer}>
            {/* 1. Top Bar */}
            {showTopBar && (
                <div className={styles.expandedTopBar}>
                    <div className={styles.expandedTopLeft}>
                        <CardHeader deal={deal} layout={layout} isListView={true} onTagClick={onTagClick} />
                    </div>
                    <div className={styles.expandedTopRight}>
                        <CardTags deal={deal} isListView={true} onTagClick={onTagClick} />
                        {hasRating && (
                            <RatingBadge
                                rating={ratingScore}
                                variant="pill"
                                isListView={true}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* 2. Main Row */}
            <div className={styles.expandedMainRow}>
                {/* Left Column: Company info & Footer */}
                <div className={styles.expandedCompanySection}>
                    <div className={styles.expandedCompanyTop}>
                        <img
                            src={logoSrc}
                            alt={deal?.company_name}
                            className={styles.expandedCompanyLogo}
                            width={58}
                            height={58}
                            loading="lazy"
                            decoding="async"
                            onError={() => setLogoFailed(true)}
                        />
                        <div className={styles.expandedCompanyText}>
                            {deal?.company_name ? (
                                deal?.slug ? (
                                    <Link href={`/deals/${deal.slug}`} className={styles.compactCompanyLink}>
                                        <h2 className={styles.expandedCompanyName}>{deal.company_name}</h2>
                                    </Link>
                                ) : (
                                    <h2 className={styles.expandedCompanyName}>{deal.company_name}</h2>
                                )
                            ) : null}
                            <p className={styles.expandedCompanyTagline}>
                                {deal?.tag_line || "No description available"}
                            </p>
                        </div>
                    </div>
                    <div className={styles.expandedCompanyFooter}>
                        <CardFooter deal={deal} qaCount={qaCount} replies={replies} isListView={true} />
                    </div>
                </div>

                {/* Middle Column: Hero stacked boxes */}
                {hasHero && (
                    <div className={styles.expandedHeroSection}>
                        <CardHeroMetrics
                            deal={deal}
                            config={metrics.hero}
                            style="boxes"
                            isListView={true}
                        />
                    </div>
                )}

                {/* Right Column: Plain metrics 3-col x 2-row grid */}
                <div className={styles.expandedMetricsSection}>
                    <CardProgress deal={deal} />
                    <div className={styles.expandedMetricsGrid}>
                        {gridItems.slice(0, 6).map((metric, idx) => {
                            const { value, label } = getMetricDetail(deal, metric);
                            return (
                                <div key={idx} className={styles.expandedMetricCell}>
                                    <span className={styles.expandedMetricLabel}>{label}</span>
                                    <span className={styles.expandedMetricValue}>{formatGridValue(value, metric)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
