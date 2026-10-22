import React from 'react';
import styles from '../DealCard.module.css';

export default function CardTags({ deal, onTagClick, isListView = false }) {
    const rawHighlights = deal?.key_highlights || deal?.deal_setpData?.key_highlights || deal?.data?.key_highlights;
    const highlights = Array.isArray(rawHighlights)
        ? rawHighlights
        : (Array.isArray(rawHighlights?.data) ? rawHighlights.data : []);

    const rawItems = highlights.length > 0 ? highlights : (deal?.tags || []);
    const items = rawItems.flatMap((item) => {
        if (!item) return [];
        let itemText = typeof item === 'string'
            ? item.trim()
            : (item && typeof item === 'object' ? (item.name || item.tag || item.label || item.title || '') : '');
        if (!itemText) return [];
        if (itemText.startsWith('[') && itemText.endsWith(']')) {
            try {
                const parsed = JSON.parse(itemText);
                if (Array.isArray(parsed)) {
                    return parsed.map(p => {
                        return typeof p === 'string' ? p.trim() : (p?.name || p?.tag || p?.label || '').trim();
                    }).filter(Boolean);
                }
            } catch (_) {}
        }
        return [itemText];
    });
    
    if (!items.length) return null;

    const charLimit = isListView ? 35 : 28;

    return (
        <div className={styles.tagChips}>
            {items.map((itemText, index) => {
                if (!itemText) return null;

                const displayText = itemText.length > charLimit
                    ? `${itemText.slice(0, charLimit)}...`
                    : itemText;

                return (
                    <div 
                        key={index} 
                        className={styles.tagChip}
                        onClick={(e) => {
                            if (onTagClick) {
                                e.preventDefault();
                                e.stopPropagation();
                                onTagClick(itemText);
                            }
                        }}
                        style={onTagClick ? { cursor: 'pointer' } : undefined}
                        title={itemText}
                    >
                        {displayText}
                    </div>
                );
            })}
        </div>
    );
}
