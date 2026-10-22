export function getVal(field) {
    if (field === null || field === undefined) return null;
    if (typeof field === 'object' && !Array.isArray(field) && 'data' in field) {
        return field.data;
    }
    return field;
}

export function getMetricDetail(deal, metric) {
    let val = "TBD";
    let label = metric?.label || "";
    let icon = null;
    let toolTip = null;

    const extractFromRaw = (raw) => {
        let extractedVal = undefined;
        let extractedLabel = undefined;

        if (raw !== undefined && raw !== null) {
            if (typeof raw === 'object' && !Array.isArray(raw)) {
                if ('data' in raw && raw.data !== undefined && raw.data !== null && raw.data !== '') {
                    extractedVal = raw.data;
                }
                if (raw.label_name && String(raw.label_name).trim() !== '') {
                    let cleanedLabel = String(raw.label_name).trim();
                    const lowerLabel = cleanedLabel.toLowerCase();
                    if (lowerLabel === 'per share price' || lowerLabel === 'per share price ') {
                        cleanedLabel = (metric?.label && metric.label === metric.label.toUpperCase()) ? 'SHARE PRICE' : 'Share Price';
                    } else if (lowerLabel === 'ipo open date') {
                        cleanedLabel = (metric?.label && metric.label === metric.label.toUpperCase()) ? 'OPEN DATE' : 'Open Date';
                    } else if (lowerLabel === 'expected valuation') {
                        cleanedLabel = (metric?.label && metric.label === metric.label.toUpperCase()) ? 'EXPECTED VAL.' : 'Expected Val.';
                    } else if (lowerLabel === 'overall issue size') {
                        cleanedLabel = (metric?.label && metric.label === metric.label.toUpperCase()) ? 'ISSUE SIZE' : 'Issue Size';
                    } else if (lowerLabel === 'overall issue price') {
                        cleanedLabel = (metric?.label && metric.label === metric.label.toUpperCase()) ? 'ISSUE PRICE' : 'Issue Price';
                    }
                    extractedLabel = cleanedLabel;
                }
                if (raw.vector_icon) icon = raw.vector_icon;
                if (raw.tool_tip) toolTip = raw.tool_tip;
            } else if (raw !== '') {
                extractedVal = raw;
            }
        }
        return { extractedVal, extractedLabel };
    };

    if (metric?.keys) {
        let fallbackLabel = null;
        for (const key of metric.keys) {
            const raw = deal?.[key];
            const { extractedVal, extractedLabel } = extractFromRaw(raw);
            if (extractedLabel && !fallbackLabel) {
                fallbackLabel = extractedLabel;
            }
            if (extractedVal !== undefined) {
                val = extractedVal;
                if (extractedLabel) {
                    label = extractedLabel;
                }
                break;
            }
        }
        if (label === metric.label && fallbackLabel) {
            label = fallbackLabel;
        }
    } else if (metric?.key) {
        const raw = deal?.[metric.key];
        const { extractedVal, extractedLabel } = extractFromRaw(raw);
        if (extractedVal !== undefined) {
            val = extractedVal;
        }
        if (extractedLabel) {
            label = extractedLabel;
        }
    }

    if (val === undefined || val === null || val === "" || val === "null" || val === "undefined") {
        val = metric?.fallback || "TBD";
    }

    return { value: val, label, icon, toolTip };
}

export const METRICS_CONFIG = {
    featured_deal: {
        hero: [
            { label: "Issue Size", keys: ["issue_size_overall", "issue_size_amount", "target_funding_in_cr"], format: "currency", suffix: "Cr" },
            { label: "GMP", keys: ["gmp", "estimated_gain_loss"], format: "percent_gain" },
            { label: "Open Date", key: "timeline_ipo_open_date", format: "date" }
        ],
        grid: []
    },
    public_standard: {
        hero: [
            { label: "Issue Size", keys: ["issue_size_overall", "issue_size_amount", "target_funding_in_cr"], format: "currency", suffix: "Cr" },
            { label: "GMP", keys: ["gmp", "estimated_gain_loss"], format: "currency", showGainLoss: true }
        ],
        grid: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "Revenue (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E Multiple", key: "pe_multiple", format: "multiplier" },
            { label: "Open Date", key: "timeline_ipo_open_date", format: "date" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    },

    ofs: {
        hero: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "Share Price", keys: ["per_share_price", "offer_price"], format: "currency", perShare: true }
        ],
        grid: [
            { label: "Min. Investment", key: "min_investment_amount_in_inr", format: "currency" },
            { label: "Revenue (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E Multiple", key: "pe_multiple", format: "multiplier" },
            { label: "Expected Listing", key: "listing_timeline", format: "date" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    },
    series_a: {
        hero: [
            { label: "Round Size", keys: ["round_size", "round_size_in_cr"], format: "currency", suffix: "Cr" },
            { label: "Stage", key: "stage", format: "text" }
        ],
        grid: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "REV ARR", keys: ["rev_arr", "rev_arr_in_cr"], format: "currency", suffix: "Cr" },
            { label: "Gross Margin", keys: ["gross_margin", "gross_margin_percent"], format: "percent" },
            { label: "Growth YoY", key: "growth_yoy", format: "multiplier" },
            { label: "Min Ticket", keys: ["min_ticket", "min_ticket_in_inr"], format: "currency" }
        ]
    },
    unlisted_nse: {
        hero: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "Share Price", keys: ["per_share_price", "offer_price"], format: "currency", perShare: true }
        ],
        grid: [
            { label: "MIN. INVESTMENT", key: "min_investment_amount_in_inr", format: "currency" },
            { label: "REVENUE (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E MULTIPLE", key: "pe_multiple", format: "multiplier" },
            { label: "EXPECTED LISTING", key: "listing_timeline", format: "date_short", fallback: "TBD" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    },
    pre_ipo_exclusive: {
        grid: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "Revenue (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E Multiple", key: "pe_multiple", format: "multiplier" },
            { label: "Expected Listing", key: "listing_timeline", format: "date_short", fallback: "TBD" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    }
};
