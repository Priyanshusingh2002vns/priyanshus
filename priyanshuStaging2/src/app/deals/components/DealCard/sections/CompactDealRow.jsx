import React, { useState } from 'react';
import Link from 'next/link';
import RatingBadge from '../ui/RatingBadge';
import { getMetricDetail } from '../config';
import styles from '../DealCard.module.css';

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "TBD") return "TBD";
    if (typeof num === 'object') return "TBD";
    const parsed = Number(num);
    if (isNaN(parsed)) return String(num);
    return parsed.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const formatValueByMetric = (value, metric) => {
    // Unwrap object if nested
    if (value && typeof value === 'object') {
        if (value.data !== undefined && value.data !== null) value = value.data;
        else if (value.value !== undefined && value.value !== null) value = value.value;
        else if (value.name !== undefined && value.name !== null) value = value.name;
        else if (value.label !== undefined && value.label !== null) value = value.label;
        else return "TBD";
    }

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "TBD" ||
        value === "null" ||
        value === "undefined" ||
        value === "-" ||
        value === "N/A" ||
        typeof value === 'object' ||
        String(value).includes('[object Object]')
    ) {
        return "TBD";
    }

    switch (metric?.format) {
        case 'currency':
            return `₹${formatNumberWithCommas(value)}${metric?.suffix ? ` ${metric.suffix}` : ''}${metric?.perShare ? ' /share' : ''}`;
        case 'multiplier':
            return `${formatNumberWithCommas(value)}x`;
        case 'percent':
            return `${formatNumberWithCommas(value)}%`;
        case 'date':
        case 'date_short': {
            const str = String(value).trim();
            if (!str || str === "TBD" || str.toLowerCase() === "null" || str.toLowerCase() === "undefined" || str === "-" || str.includes('[object Object]')) {
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
            const year = d.getFullYear();
            return `${month} '${String(year).slice(-2)}`;
        }
        default:
            return formatNumberWithCommas(value);
    }
};

export default function CompactDealRow({
    deal,
    metrics,
    onTagClick
}) {
    const [logoFailed, setLogoFailed] = useState(false);
    const fallback = "/logo-fallback.png";
    const path = deal?.company_logo?.[0]?.path;
    const src = logoFailed
        ? fallback
        : path
            ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${path.replace("public/", "")}`
            : fallback;

    // Helper for labels: always clean Title Case (or preserve API label for revenue)
    const formatPlainLabel = (label, isHero = false, isRevenue = false) => {
        if (!label) return "";
        if (isRevenue) return label;
        const lower = String(label).trim().toLowerCase();
        if (isHero) {
            if (lower.includes('issue size')) return 'Issue Size';
            if (lower === 'gmp') return 'GMP';
            if (lower.includes('valuation')) return 'Valuation';
            if (lower.includes('share price')) return 'Share Price';
            return String(label).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
        if (lower.includes('revenue') || lower.includes('rev arr')) return label;
        if (lower.includes('val') || lower.includes('valuation')) {
            if (lower.includes('expect')) return 'Valuation';
            if (lower === 'valuation') return 'Valuation';
            return label;
        }
        if (lower.includes('open date') || lower.includes('ipo open')) return 'Open Date';
        if (lower.includes('listing')) return 'Expected Listing';
        if (lower.includes('min') && lower.includes('invest')) return 'Min. Investment';
        if (lower.includes('share price')) return 'Share Price';
        if (lower.includes('issue size')) return 'Issue Size';
        if (lower === 'gmp') return 'GMP';
        // Capitalize words
        return String(label).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    // Hero metrics (Issue Size / Valuation & GMP / Share Price)
    const hero1 = metrics?.hero?.[0] ? getMetricDetail(deal, metrics.hero[0]) : null;
    const hero2 = metrics?.hero?.[1] ? getMetricDetail(deal, metrics.hero[1]) : null;

    // Grid metrics:
    // For unlisted/ofs deals: show Min. Investment and Revenue
    // For public deals: show Expected Val. and Open Date
    const isUnlisted = ['unlisted', 'ofs', 'pre_ipo_exclusive'].includes((deal?.deal_type || '').toLowerCase());
    const gridMetrics = (metrics?.grid || []);

    let plain1Metric = null;
    let plain2Metric = null;

    if (isUnlisted) {
        plain1Metric = gridMetrics.find(m => m.key?.includes('min_investment') || m.key?.includes('min_ticket') || (m.label && m.label.toLowerCase().includes('min'))) || gridMetrics[0];
        plain2Metric = gridMetrics.find(m => m.key?.includes('revenue') || m.key?.includes('rev_arr') || (m.label && m.label.toLowerCase().includes('rev'))) || gridMetrics[1];
    } else {
        plain1Metric = gridMetrics.find(m => m.key === 'valuation_in_cr' || (m.label && m.label.toLowerCase().includes('val'))) || gridMetrics[0];
        plain2Metric = gridMetrics.find(m => m.format === 'date' || m.format === 'date_short' || m.key?.includes('date') || m.key?.includes('timeline') || m.key?.includes('listing')) || gridMetrics[1];
    }

    const plain1 = plain1Metric ? { metric: plain1Metric, ...getMetricDetail(deal, plain1Metric) } : null;
    const plain2 = plain2Metric ? { metric: plain2Metric, ...getMetricDetail(deal, plain2Metric) } : null;

    // Tags extraction
    const rawTags = deal?.tags || [];
    const listTags = Array.isArray(rawTags) ? rawTags : [rawTags];
    const compactTags = listTags.flatMap(item => {
        if (!item) return [];
        let str = "";
        if (typeof item === 'string') {
            str = item.trim();
        } else if (typeof item === 'object') {
            str = (item.name || item.tag || item.label || item.title || '').trim();
        } else {
            str = String(item || '').trim();
        }
        if (!str) return [];
        if (str.startsWith('[') && str.endsWith(']')) {
            try {
                const parsed = JSON.parse(str);
                if (Array.isArray(parsed)) {
                    return parsed.map(p => {
                        return typeof p === 'string' ? p.trim() : (p?.name || p?.tag || p?.label || '').trim();
                    }).filter(Boolean);
                }
            } catch (_) {}
        }
        return [str];
    }).filter(Boolean);

    const ratingVal = deal?.ipo_review_rating?.data?.weighted_composite_score || deal?.ipo_review_rating?.weighted_composite_score;
    const isStatusActive = deal?.ipo_review_rating?.status === true || 
                           deal?.ipo_review_rating?.status === "true" || 
                           (deal?.ipo_review_rating?.status !== false && deal?.ipo_review_rating?.status !== "false" && !!ratingVal);
    const hasRating = Boolean(isStatusActive && ratingVal && parseFloat(ratingVal) > 0);
    const ratingScore = hasRating ? ratingVal : null;

    // Helper to format hero values cleanly
    const formatHeroValue = (hero, config) => {
        if (!hero || hero.value === "TBD") return "TBD";
        if (config?.format === "currency") {
            return `₹${formatNumberWithCommas(hero.value)}${config?.suffix ? ` ${config.suffix}` : ''}${config?.perShare ? ' /share' : ''}`;
        }
        return formatNumberWithCommas(hero.value);
    };

    const plain1RawLabel = deal?.[plain1Metric?.key]?.label_name || deal?.valuation_in_cr?.label_name || plain1?.label;
    const plain1LabelFormatted = formatPlainLabel(plain1RawLabel);

    const plain2RawLabel = (isUnlisted && (deal?.[plain2Metric?.key]?.label_name || deal?.revenue_fy25_in_cr?.label_name))
        ? (deal?.[plain2Metric?.key]?.label_name || deal?.revenue_fy25_in_cr?.label_name)
        : plain2?.label;
    const plain2LabelFormatted = formatPlainLabel(plain2RawLabel, false, isUnlisted);

    return (
        <div className={styles.compactRowFlex}>
            {/* 1. Company Name Column */}
            <div className={styles.tdCompany}>
                <div className={styles.companyInfoRow}>
                    <img
                        src={src}
                        alt={deal?.company_name || "Company Logo"}
                        className={styles.compactLogo}
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                        onError={() => setLogoFailed(true)}
                    />
                    <div className={styles.companyTextGroup}>
                        <span className={styles.tableColHeader}>Company Name</span>
                        {deal?.company_name ? (
                            deal?.slug ? (
                                <Link href={`/deals/${deal.slug}`} className={styles.compactCompanyLink}>
                                    <h2 className={styles.compactCompanyName} title={deal.company_name}>
                                        {deal.company_name}
                                    </h2>
                                </Link>
                            ) : (
                                <h2 className={styles.compactCompanyName} title={deal.company_name}>
                                    {deal.company_name}
                                </h2>
                            )
                        ) : null}
                    </div>
                </div>
            </div>

            {/* 2. Vertical Divider 1 */}
            {hasRating && (
                <div className={styles.tdDivider}>
                    <div className={styles.compactDivider} />
                </div>
            )}

            {/* 3. Pr.eqt Rating Column */}
            {hasRating && (
                <div className={styles.tdRating}>
                    <div className={styles.ratingColGroup}>
                        <span className={styles.tableColHeader}>Pr.eqt Rating</span>
                        <div className={styles.ratingContent}>
                            <RatingBadge
                                rating={ratingScore}
                                variant="pill"
                                isListView={false}
                                hideLabel={true}
                                compact={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Tagline / Tags Column */}
            <div className={styles.tdTagline}>
                {compactTags.map((singleTag, idx) => {
                    if (!singleTag || singleTag.length > 55) return null;
                    return (
                        <div
                            key={idx}
                            className={styles.taglinePill}
                            title={singleTag}
                            data-no-navigate
                            onClick={(e) => {
                                if (onTagClick) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onTagClick(singleTag);
                                }
                            }}
                            style={onTagClick ? { cursor: 'pointer' } : undefined}
                        >
                            {singleTag}
                        </div>
                    );
                })}
            </div>

            {/* 5. Vertical Divider 2 */}
            <div className={styles.tdDivider}>
                <div className={styles.compactDivider} />
            </div>

            {/* 6. Hero Metric Box 1 (Issue Size / Valuation) */}
            {hero1 && (
                <div className={styles.tdHero}>
                    <div className={styles.compactHeroBox}>
                        <span className={styles.compactHeroLabel}>{formatPlainLabel(hero1.label, true)}</span>
                        <span className={styles.compactHeroValue}>{formatHeroValue(hero1, metrics.hero[0])}</span>
                    </div>
                </div>
            )}

            {/* 7. Hero Metric Box 2 (GMP / Share Price) */}
            {hero2 && (
                <div className={styles.tdHero}>
                    <div className={styles.compactHeroBox}>
                        <span className={styles.compactHeroLabel}>{formatPlainLabel(hero2.label, true)}</span>
                        <span className={styles.compactHeroValue}>
                            {formatHeroValue(hero2, metrics.hero[1])}
                            {metrics.hero[1]?.showGainLoss && 
                             deal.estimated_gain_loss && 
                             parseFloat(deal.estimated_gain_loss) !== 0 && (
                                <span className={`${styles.compactGainLoss} ${Number(deal.estimated_gain_loss) < 0 ? styles.loss : styles.gain}`}>
                                    &nbsp;({Number(deal.estimated_gain_loss) > 0 ? '+' : ''}{String(deal.estimated_gain_loss).replace(/^\+/, '')}%)
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* 8. Plain Metric 1 (Valuation / Min. Investment) */}
            {plain1 && (
                <div className={`${styles.tdPlain} ${styles.tdPlainMinVal}`}>
                    <div className={styles.compactPlainItem}>
                        <span className={styles.compactPlainLabel}>{plain1LabelFormatted}</span>
                        <span className={styles.compactPlainValue}>{formatValueByMetric(plain1.value, plain1.metric)}</span>
                    </div>
                </div>
            )}

            {/* 9. Plain Metric 2 (Open Date / Expected Listing / Revenue) */}
            {plain2 && (
                <div className={`${styles.tdPlain} ${styles.tdPlainDateRev}`}>
                    <div className={styles.compactPlainItem}>
                        <span className={styles.compactPlainLabel}>{plain2LabelFormatted}</span>
                        <span className={styles.compactPlainValue}>{formatValueByMetric(plain2.value, plain2.metric)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
