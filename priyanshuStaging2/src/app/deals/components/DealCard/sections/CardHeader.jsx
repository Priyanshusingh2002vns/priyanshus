import React from 'react';
import Badge from '../ui/Badge';
import RatingBadge from '../ui/RatingBadge';
import styles from '../DealCard.module.css';

export default function CardHeader({ deal, layout, isListView, onTagClick }) {
    const statusRaw = (deal?.hidden_status || '').toLowerCase();
    let statusKey = 'upcoming';
    if (statusRaw === 'live') statusKey = 'live';
    else if (statusRaw === 'closed') statusKey = 'closed';
    else if (statusRaw === 'upcoming' || statusRaw === 'up comming' || statusRaw === 'draft') statusKey = 'upcoming';

    const isPrivateDeal = ['private', 'ccps'].includes(deal.deal_type?.toLowerCase());
    const isSeriesA = isPrivateDeal && layout?.heroStyle === 'boxes';

    const statusMap = {
        live: isSeriesA ? 'Round Open' : 'Live',
        upcoming: 'Upcoming',
        closed: isSeriesA ? 'Round Closed' : 'Closed'
    };

    const rating = deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score;
    const shouldRenderStatus = deal?.deal_type?.toLowerCase() === 'public';

    const handleBadgeClick = (tag) => (e) => {
        if (onTagClick && tag) {
            e.preventDefault();
            e.stopPropagation();
            onTagClick(tag);
        }
    };

    const charLimit = isListView ? 25 : 16;

    const headerTags = React.useMemo(() => {
        const raw = deal?.tags || [];
        const list = Array.isArray(raw) ? raw : [raw];
        return list.flatMap(item => {
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
    }, [deal?.tags]);

    const stageItems = React.useMemo(() => {
        const raw = deal?.stage;
        if (!raw) return [];
        const list = Array.isArray(raw) ? raw : [raw];
        return list.flatMap(item => {
            const str = typeof item === 'string' ? item.trim() : (item?.name || item?.label || '').trim();
            if (!str) return [];
            return [str];
        }).filter(Boolean);
    }, [deal?.stage]);

    return (
        <div className={styles.headerRow}>
            <div className={styles.leftBadges}>
                {shouldRenderStatus && (
                    <Badge color={statusKey} variant="pill" className={styles.headerStatusBadge}>
                        <span className={`${styles.statusDot} ${styles[statusKey]}`} />
                        {statusMap[statusKey]}
                    </Badge>
                )}

                {['unlisted', 'public'].includes(deal?.deal_type?.toLowerCase()) &&
                    headerTags.map((tagText, idx) => {
                        if (!tagText || tagText.length > charLimit) return null;
                        return (
                            <div
                                key={idx}
                                onClick={handleBadgeClick(tagText)}
                                style={onTagClick ? { cursor: 'pointer' } : undefined}
                                title={tagText}
                            >
                                <Badge color="sme" variant="pill">
                                    {tagText}
                                </Badge>
                            </div>
                        );
                    })}

                {isPrivateDeal &&
                    stageItems.map((stageText, idx) => {
                        if (!stageText || stageText.length > charLimit) return null;
                        return (
                            <div
                                key={idx}
                                onClick={handleBadgeClick(stageText)}
                                style={onTagClick ? { cursor: 'pointer' } : undefined}
                                title={stageText}
                            >
                                <Badge color="preIpoSme" variant="pill">
                                    {stageText}
                                </Badge>
                            </div>
                        );
                    })}
            </div>

            {!isListView && layout?.ratingStyle !== 'none' && rating && (
                <RatingBadge rating={rating} variant={layout.ratingStyle} />
            )}

            {deal.exclusive_deal && (
                <div className={styles.exclusivePill}>Exclusive Deal</div>
            )}
        </div>
    );
}
