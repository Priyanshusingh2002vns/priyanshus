import React, { useId } from 'react';
import styles from './RatingBadge.module.css';

/**
 * RatingBadge Component
 * 
 * Renders a numerical rating (e.g., 4.7) and a corresponding 5-star visualization.
 * Features fractional star filling (e.g., 4.7 results in 4 full stars and one 70% filled star).
 */

const Star = ({ fillPercent, id, compact = false }) => {
    return (
        <svg
            width={compact ? "11" : "14"}
            height={compact ? "12" : "16"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={compact ? styles.starIconCompact : styles.starIcon}
        >
            <defs>
                {/* 
                  Linear gradient provides the fractional fill effect.
                  'offset' determines where the color transition happens.
                */}
                <linearGradient id={id}>
                    <stop offset={`${fillPercent}%`} stopColor="#C9A85D" />
                    <stop offset={`${fillPercent}%`} stopColor="#E2E8F0" />
                </linearGradient>
            </defs>
            <path
                d="M12 1.587l3.668 7.431 8.332 1.21-6.001 5.85 1.416 8.297-7.415-3.897-7.415 3.897 1.416-8.297-6.001-5.85 8.332-1.21z"
                fill={`url(#${id})`}
            />
        </svg>
    );
};

export default function RatingBadge({ rating, variant = 'pill', isListView = false, hideLabel = false, compact = false }) {
    // Generate a unique ID to prevent gradient conflicts when multiple badges are rendered
    const uniqueId = useId().replace(/:/g, '');

    if (!rating) return null;

    const numericRating = parseFloat(rating) || 0;

    const renderStars = () => (
        <div className={`${styles.stars} ${variant === 'starsWithLabel' ? styles.featuredStarsGap : ''} ${compact ? styles.starsCompact : ''}`}>
            {[1, 2, 3, 4, 5].map((index) => {
                let fillPercent = 0;

                // Calculate how much of this specific star (index) should be filled
                if (numericRating >= index) {
                    // Entire star is filled
                    fillPercent = 100;
                } else if (numericRating > index - 1) {
                    // Partial fill for the current active star (e.g., 4.7 - (5-1) = 0.7)
                    fillPercent = (numericRating - (index - 1)) * 100;
                }
                return (
                    <Star
                        key={index}
                        fillPercent={fillPercent}
                        id={`star-grad-${uniqueId}-${index}`}
                        compact={compact}
                    />
                );
            })}
        </div>
    );

    if (variant === 'starsOnly') {
        return (
            <div className={`${styles.ratingWrapper} ${isListView ? styles.isListView : ''}`}>
                <div className={`${styles.desktopRatingContainer} ${compact ? styles.compactRatingContainer : ''}`}>
                    {renderStars()}
                </div>
                <div className={styles.simpleMobileBadge}>
                    <span className={styles.starGlyph}>★</span>
                    <span className={styles.simpleMobileValue}>{numericRating.toFixed(1)}</span>
                </div>
            </div>
        );
    }

    if (variant === 'starsWithLabel') {
        return (
            <div className={`${styles.ratingWrapper} ${isListView ? styles.isListView : ''}`}>
                <div className={`${styles.desktopRatingContainer} ${compact ? styles.compactRatingContainer : ''}`}>
                    {renderStars()}
                    {!hideLabel && <div className={styles.ratingLabelNoMargin}>Pr.eqt Rating</div>}
                </div>
                <div className={styles.simpleMobileBadge}>
                    <span className={styles.starGlyph}>★</span>
                    <span className={styles.simpleMobileValue}>{numericRating.toFixed(1)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.ratingWrapper} ${isListView ? styles.isListView : ''} ${compact ? styles.compactWrapper : ''}`}>
            <div className={`${styles.desktopRatingContainer} ${compact ? styles.compactRatingContainer : ''}`}>
                <div className={`${styles.ratingBadge} ${styles[variant]} ${compact ? styles.compactRatingBadge : ''}`}>
                    <div className={`${styles.ratingValueBox} ${compact ? styles.compactRatingValueBox : ''}`}>{numericRating.toFixed(1)}</div>
                    {renderStars()}
                </div>
                {!hideLabel && <div className={styles.ratingLabel}>Pr.eqt Rating</div>}
            </div>

            <div className={styles.simpleMobileBadge}>
                <span className={styles.starGlyph}>★</span>
                <span className={styles.simpleMobileValue}>{numericRating.toFixed(1)}</span>
            </div>
        </div>
    );
}