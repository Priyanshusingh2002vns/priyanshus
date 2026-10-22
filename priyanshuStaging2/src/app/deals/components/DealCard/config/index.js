import { CARD_THEMES } from './themes';
import { CARD_LAYOUTS } from './layouts';
import { METRICS_CONFIG, getMetricDetail, getVal } from './metricsMap';

export { CARD_THEMES, CARD_LAYOUTS, METRICS_CONFIG, getMetricDetail, getVal };

export function determineVariant(deal, ignoreFeatured = false) {
    const type = (deal.deal_type || '').toLowerCase();
    const subType = (deal.deal_sub_type || '').toLowerCase().trim();
    
    if (!ignoreFeatured && (type === 'featured' || subType === 'featured')) {
        return 'featured_deal';
    }

    if (type === 'public') {
        if (deal.is_deep_dive) return 'public_deep_dive';
        return 'public_standard';
    }

    if (type === 'unlisted' || (type === 'ofs' && (!deal.deal_sub_type || deal.deal_sub_type === null || deal.deal_sub_type === undefined || String(deal.deal_sub_type).trim().toLowerCase() === 'null'))) {
        return 'unlisted_nse';
    }
    
    if (type === 'ofs') return 'ofs';
    
    if (type === 'private' || type === 'ccps') {
        if (deal.exclusive_deal) return 'pre_ipo_exclusive';
        return 'series_a';
    }
    
    return 'unlisted_nse'; // Default fallback
}
