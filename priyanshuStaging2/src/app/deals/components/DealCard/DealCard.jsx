import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CARD_THEMES, CARD_LAYOUTS, METRICS_CONFIG, determineVariant } from './config';
import * as Sections from './sections';
import CardFooter from './sections/CardFooter';
import RatingBadge from './ui/RatingBadge';
import Badge from './ui/Badge';
import styles from './DealCard.module.css';

export default function DealCard({
    deal: originalDeal,
    variantOverride,
    isAuthenticated,
    onLoginClick,
    qaCount,
    replies,
    isListView,
    isTableView = false,
    ignoreFeatured = false,
    disableLink = false,
    onTagClick,
    isExpanded = false,
    isClosing = false,
    onHover,
    onHoverLeave
}) {
    const router = useRouter();
   
    const deal = React.useMemo(() => {
        if (!originalDeal) return originalDeal;
        const getNumeric = (val) => {
            const extracted = (typeof val === 'object' && val !== null && 'data' in val) ? val.data : val;
            if (extracted === null || extracted === undefined) return NaN;
            if (typeof extracted === 'number') return extracted;
            const clean = String(extracted).replace(/[^0-9.]/g, '');
            const num = parseFloat(clean);
            return isNaN(num) ? NaN : num;
        };
        const lotSize = getNumeric(originalDeal.min_investment_lot_size);
        const perSharePrice = getNumeric(originalDeal.per_share_price || originalDeal.offer_price);
        const lotSizeShare = getNumeric(originalDeal.lot_size_share);

        let calculated = originalDeal.min_investment_amount_in_inr;
        if (!isNaN(lotSize) && !isNaN(perSharePrice) && !isNaN(lotSizeShare)) {
            calculated = lotSize * perSharePrice * lotSizeShare;
        }
        return {
            ...originalDeal,
            min_investment_amount_in_inr: calculated
        };
    }, [originalDeal]);

    // 1. Determine Variant
    const variantKey = variantOverride || determineVariant(deal, ignoreFeatured);
    const theme = CARD_THEMES[variantKey] || CARD_THEMES.public_standard;
    const layout = CARD_LAYOUTS[variantKey] || CARD_LAYOUTS.public_standard;
    let metrics = METRICS_CONFIG[variantKey] || METRICS_CONFIG.public_standard;

    // Overriding metrics for unlisted deals if ROCE (FY'25) is available
    if (deal?.deal_type?.toLowerCase() === 'unlisted') {
        const roceVal = (typeof deal?.roce_fy25_percent === 'object' && deal?.roce_fy25_percent !== null) ? deal.roce_fy25_percent.data : deal?.roce_fy25_percent;
        const hasRoce = roceVal !== null && roceVal !== undefined && String(roceVal).trim() !== '';
        
        if (variantKey === 'featured_deal') {
            metrics = {
                ...metrics,
                hero: [
                    { label: "VALUATION", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
                    { label: "SHARE PRICE", keys: ["per_share_price", "offer_price"], format: "currency", perShare: true },
                    hasRoce 
                        ? { label: "ROCE (FY'25)", key: "roce_fy25_percent", format: "percent", suffix: "%" }
                        : { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" }
                ],
                grid: []
            };
        } else if (variantKey === 'unlisted_nse') {
            metrics = {
                ...metrics,
                grid: metrics.grid.map(m => {
                    if (m.key === 'listing_timeline') {
                        return hasRoce
                            ? { label: "ROCE (FY'25)", key: "roce_fy25_percent", format: "percent" }
                            : m;
                    }
                    return m;
                })
            };
        }
    }

    // Handle Auth Locked State for Private deals
    const hasRatingBadge = layout.ratingStyle !== 'none' && !!(deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score);
    const isPrivate = ['private', 'ccps', 'ofs'].includes((deal?.deal_type || '').toLowerCase());
    if (isPrivate && !isAuthenticated) {
        return <Sections.HiddenOverlay onLoginClick={onLoginClick} />;
    }

    const isSeriesA = deal?.deal_type?.toLowerCase() === 'series-a';
    
    const statusRaw = (deal?.hidden_status || '').toLowerCase();
    let statusKey = 'upcoming';
    if (statusRaw === 'live') statusKey = 'live';
    else if (statusRaw === 'closed') statusKey = 'closed';
    else if (statusRaw === 'upcoming' || statusRaw === 'up comming' || statusRaw === 'draft') statusKey = 'upcoming';

    const statusMap = {
        live: isSeriesA ? 'Round Open' : 'Live',
        upcoming: 'Upcoming',
        closed: isSeriesA ? 'Round Closed' : 'Closed'
    };
    const shouldRenderStatus = deal?.deal_type?.toLowerCase() === 'public';

    // Desktop Table View (1024px and above) - Unified Single-Row Card Architecture
    if (isTableView) {
        return (
            <tbody
                className={`${styles.dealRowGroup} ${isExpanded ? styles.isExpandedGroup : ''} ${styles[theme.theme]} ${theme.gradient ? styles[theme.gradient] : ''} ${layout.hasOFSGradient ? styles.ofsCard : ''} ${styles[variantKey] || ''}`}
                tabIndex={0}
                role="rowgroup"
                onMouseEnter={onHover}
                onMouseLeave={onHoverLeave}
            >
                <tr
                    className={styles.unifiedCardRow}
                    onClick={(e) => {
                        const target = e.target;
                        if (target.closest('button') || target.closest('a') || target.closest('[data-no-navigate]')) return;
                        if (!disableLink && deal?.slug) {
                            router.push(`/deals/${deal.slug}`);
                        }
                    }}
                >
                    <td colSpan={9} className={styles.unifiedCardTd}>
                        <div className={`${styles.unifiedCardShell} ${isExpanded ? styles.shellExpanded : styles.shellCompact}`}>
                            {/* 1. Compact View Layer */}
                            <div className={`${styles.compactLayer} ${isExpanded ? styles.compactLayerHidden : ''}`}>
                                <div className={styles.compactLayerInner}>
                                    <Sections.CompactDealRow
                                        deal={deal}
                                        metrics={metrics}
                                        onTagClick={onTagClick}
                                    />
                                </div>
                            </div>

                            {/* 2. Expanded View Layer */}
                            <div className={`${styles.expandedLayer} ${isExpanded ? styles.expandedLayerVisible : ''}`}>
                                <div className={styles.expandedLayerInner}>
                                    <Sections.ExpandedDealTable
                                        deal={deal}
                                        layout={layout}
                                        metrics={metrics}
                                        qaCount={qaCount}
                                        replies={replies}
                                        onTagClick={onTagClick}
                                    />
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    // Original List View (below 1024px) or Standard Grid Card
    const content = isListView ? (
        <div className={`${styles.cardContainer} ${styles.listView} ${styles[theme.theme]} ${theme.gradient ? styles[theme.gradient] : ''} ${layout.hasOFSGradient ? styles.ofsCard : ''} ${styles[variantKey] || ''}`}>
            {/* Mobile/Tablet Header: Spans full width above both sections */}
            <div className={`${styles.headerRowWrapper} ${styles.mobileHeaderWrapper}`}>
                <Sections.CardHeader deal={deal} layout={layout} isListView={true} onTagClick={onTagClick} />
                <div className={styles.mobileTopRightRow}>
                    <Sections.CardTags deal={deal} isListView={true} onTagClick={onTagClick} />
                    {deal?.ipo_review_rating?.status && (
                        <RatingBadge
                            rating={deal.ipo_review_rating.weighted_composite_score}
                            variant="pill"
                            isListView={isListView}
                        />
                    )}
                    {shouldRenderStatus && (
                        <Badge color={statusKey} variant="pill" className={styles.mobileOnlyStatusBadge}>
                            <span className={`${styles.statusDot} ${styles[statusKey]}`} />
                            {statusMap[statusKey]}
                        </Badge>
                    )}
                </div>
            </div>

            {/* 1. Left Section: Badges, Company Info, Footer */}
            <div className={styles.leftSection}>
                <div className={`${styles.headerRowWrapper} ${styles.desktopHeaderWrapper}`}>
                    <Sections.CardHeader deal={deal} layout={layout} isListView={true} onTagClick={onTagClick} />
                </div>
                <Sections.CardCompanyInfo deal={deal} isListView={true} />
                <CardFooter deal={deal} qaCount={qaCount} replies={replies} isListView={true} />
            </div>

            {/* 2. Hero Section: Stacked boxes */}
            {metrics?.hero && metrics.hero.length > 0 && (
                <div className={styles.heroSection}>
                    <Sections.CardHeroMetrics
                        deal={deal}
                        config={metrics.hero}
                        style="boxes"
                        isListView={true}
                    />
                </div>
            )}

            {/* 3. Metrics & Tags Section */}
            <div className={styles.mainSection}>
                <div className={styles.topRightRow}>
                    <Sections.CardTags deal={deal} isListView={true} onTagClick={onTagClick} />
                    {deal?.ipo_review_rating?.status && (
                        <RatingBadge
                            rating={deal.ipo_review_rating.weighted_composite_score}
                            variant="pill"
                            isListView={isListView}
                        />
                    )}
                </div>
                <Sections.CardProgress deal={deal} />
                <Sections.CardMetricsGrid
                    deal={deal}
                    config={metrics.grid}
                    isListView={true}
                />
            </div>
        </div>
    ) : (
        <div className={`
            ${styles.cardContainer} 
            ${styles[theme.theme]} 
            ${theme.gradient ? styles[theme.gradient] : ''}
            ${layout.hasOFSGradient ? styles.ofsCard : ''}
            ${styles[variantKey] || ''}
        `}>
            {layout.hasOFSGradient && (
                <img src="/ofsdealGradient.svg" alt="" className={styles.ofsGradient} />
            )}

            <div className={`${styles.headerGroup} ${!hasRatingBadge ? styles.noRating : ''}`}>
                {layout.sections.includes('header') && (
                    <Sections.CardHeader deal={deal} layout={layout} isListView={false} onTagClick={onTagClick} />
                )}

                {layout.sections.includes('header_featured') && (
                    <Sections.CardHeaderFeatured deal={deal} onTagClick={onTagClick} isListView={isListView} />
                )}

                {layout.sections.includes('companyInfo') && (
                    <Sections.CardCompanyInfo deal={deal} hideAvatar={layout.sections.includes('header_featured')} />
                )}
            </div>

            {layout.sections.includes('tagline') && (
                <p className={styles.tagline}>
                    {deal.tag_line || "No description available"}
                </p>
            )}

            {layout.sections.includes('ratingLarge') && (
                <Sections.CardRatingLarge deal={deal} />
            )}

            {layout.sections.includes('heroMetrics') && (
                <Sections.CardHeroMetrics
                    deal={deal}
                    config={metrics.hero}
                    style={layout.heroStyle}
                />
            )}

            {layout.sections.includes('metricsGrid') && (
                <Sections.CardMetricsGrid
                    deal={deal}
                    config={metrics.grid}
                />
            )}

            {layout.sections.includes('progress') && (
                <Sections.CardProgress deal={deal} />
            )}

            {layout.sections.includes('tags') && (
                <Sections.CardTags deal={deal} onTagClick={onTagClick} isListView={isListView} />
            )}

            {layout.sections.includes('actionButton') && (
                <Sections.CardActionButton />
            )}

            {layout.sections.includes('footer') && (
                <CardFooter
                    deal={deal}
                    qaCount={qaCount}
                    replies={replies}
                    isListView={isListView}
                />
            )}
        </div>
    );

    const isMockDeal = disableLink || !deal?.slug || (typeof deal?.id === 'string' && (deal.id.startsWith('teaser-') || deal.id.startsWith('dummy-')));

    if (isMockDeal) {
        return content;
    }

    return (
        <Link href={`/deals/${deal.slug}`} className={styles.cardLink}>
            {content}
        </Link>
    );
}
