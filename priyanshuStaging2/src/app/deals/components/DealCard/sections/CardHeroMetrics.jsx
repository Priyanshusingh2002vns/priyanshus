import React from 'react';
import styles from '../DealCard.module.css';
import { formatDateMonthDay, formatFullDate } from '@/app/utils/FormatDate';
import { getMetricDetail } from '../config';

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "TBD") return "TBD";
    const parsed = Number(num);
    if (isNaN(parsed)) return num;
    return parsed.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

export default function CardHeroMetrics({ deal, config, style }) {
    if (!config || style === 'none') return null;

    const formatMetricValue = (value, metric) => {
        if (value === "TBD" || value === null || value === undefined) return "TBD";
        if (metric.format === 'date') {
            return formatFullDate(value);
        }
        return formatNumberWithCommas(value);
    };

    if (style === 'boxes') {
        return (
            <div className={styles.heroBoxes}>
                {config.map((metric, idx) => {
                    const { value, label } = getMetricDetail(deal, metric);
                    return (
                        <div key={idx} className={styles.heroBox}>
                            <span className={styles.metricLabel}>{label}</span>
                            <span className={styles.metricValue}>
                                {value !== "TBD" && metric.format === "currency" ? "₹" : ""}
                                {formatMetricValue(value, metric)}
                                {value !== "TBD" && metric.suffix ? ` ${metric.suffix}` : ""}
                                {metric.perShare && value !== "TBD" ? <span className={styles.subValue}>/ share</span> : ""}
                                {metric.showGainLoss && deal.estimated_gain_loss && (
                                    <span className={`${styles.gainLoss} ${Number(deal.estimated_gain_loss) < 0 ? styles.loss : styles.gain}`}>
                                        ({Number(deal.estimated_gain_loss) > 0 ? '+' : ''}{deal.estimated_gain_loss}%)
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (style === 'inline') {
        return (
            <div className={styles.heroInline}>
                {config.map((metric, idx) => {
                    const { value, label } = getMetricDetail(deal, metric);
                    return (
                        <div key={idx} className={styles.heroInlineItem}>
                            <span className={styles.metricLabel}>{label}</span>
                            <span className={styles.metricValue}>
                                {value !== "TBD" && metric.format === "currency" ? "₹" : ""}
                                {formatMetricValue(value, metric)}
                                {value !== "TBD" && metric.suffix ? ` ${metric.suffix}` : ""}
                                {metric.showGainLoss && deal.estimated_gain_loss && (
                                    <span className={`${styles.gainLoss} ${Number(deal.estimated_gain_loss) < 0 ? styles.loss : styles.gain}`}>
                                        ({Number(deal.estimated_gain_loss) > 0 ? '+' : ''}{deal.estimated_gain_loss}%)
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (style === 'divided') {
        return (
            <div className={styles.heroDivided}>
                {config.map((metric, idx) => {
                    const { value, label } = getMetricDetail(deal, metric);
                    return (
                        <React.Fragment key={idx}>
                            <div className={styles.heroDividedItem}>
                                <span className={styles.metricLabel}>{label}</span>
                                <span className={`${styles.metricValue} ${metric.format === 'percent_gain' ? (Number(value) >= 0 ? styles.gain : styles.loss) : ''}`}>
                                    {value !== "TBD" && metric.format === "currency" ? "₹" : ""}
                                    {metric.format === 'percent_gain' && value !== "TBD" && Number(value) > 0 ? '+' : ''}
                                    {formatMetricValue(value, metric)}
                                    {value !== "TBD" && metric.suffix ? ` ${metric.suffix}` : ""}
                                    {metric.format === 'percent_gain' && value !== "TBD" ? '%' : ''}
                                    
                                    {metric.showGainLoss && deal.estimated_gain_loss && (
                                        <span className={`${styles.gainLoss} ${Number(deal.estimated_gain_loss) < 0 ? styles.loss : styles.gain}`}>
                                            ({Number(deal.estimated_gain_loss) > 0 ? '+' : ''}{deal.estimated_gain_loss}%)
                                        </span>
                                    )}
                                </span>
                            </div>
                            {idx < config.length - 1 && <div className={styles.heroDividedSeparator} />}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }

    return null;
}
