import React from 'react';
import Badge from '../ui/Badge';
import styles from '../DealCard.module.css';

export default function CardHeaderFeatured({ deal, onTagClick, isListView = false }) {
    const statusRaw = (deal?.hidden_status || '').toLowerCase();
    let statusKey = 'upcoming';
    if (statusRaw === 'live') statusKey = 'live';
    else if (statusRaw === 'closed') statusKey = 'closed';

    const statusMap = {
        live: 'LIVE',
        upcoming: 'UPCOMING',
        closed: 'CLOSED'
    };

    const handleBadgeClick = (tag) => (e) => {
        if (onTagClick && tag) {
            e.preventDefault();
            e.stopPropagation();
            onTagClick(tag);
        }
    };

    const charLimit = isListView ? 25 : 16;

    const tagsList = React.useMemo(() => {
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

    const shouldRenderStatus = deal?.deal_type?.toLowerCase() === 'public' || deal?.deal_type?.toLowerCase() === 'featured';

    return (
        <div className={styles.headerFeatured}>
            <div className={styles.headerFeaturedRow}>
                {shouldRenderStatus && (
                    <Badge color={statusKey === 'live' ? 'featuredLive' : statusKey} variant="pill" className={styles.featureBadge}>
                        <span className={`${styles.statusDot} ${statusKey === 'live' ? styles.featuredLive : styles[statusKey]}`} />
                        {statusMap[statusKey]}
                    </Badge>
                )}
                {(deal.hight_conviction === true || deal.hight_conviction === "true") && (
                    <div onClick={handleBadgeClick('High Conviction')} style={onTagClick ? { cursor: 'pointer' } : undefined} title="High Conviction">
                        <Badge color="highConviction" variant="pill" className={styles.featureBadge}>
                            HIGH CONVICTION
                        </Badge>
                    </div>
                )}
                {tagsList.map((tagText, idx) => {
                    if (!tagText || tagText.length > charLimit) return null;
                    const isHighConviction = tagText === 'HIGH CONVICTION';

                    return (
                        <div key={idx} onClick={handleBadgeClick(tagText)} style={onTagClick ? { cursor: 'pointer' } : undefined} title={tagText}>
                            <Badge color={isHighConviction ? 'highConviction' : 'sme'} variant="solid" className={styles.featureBadge}>
                                {tagText}
                            </Badge>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
