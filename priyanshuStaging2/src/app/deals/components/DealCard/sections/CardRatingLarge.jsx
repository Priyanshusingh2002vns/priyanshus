import React from 'react';
import RatingBadge from '../ui/RatingBadge';
import styles from '../DealCard.module.css';

export default function CardRatingLarge({ deal }) {
    const ipoReviewRating = deal?.ipo_review_rating;
    if (!ipoReviewRating) return null;

    const rating = ipoReviewRating.weighted_composite_score;
    const showRating = ipoReviewRating.status === true || ipoReviewRating.status === "true";
    const badgeTextObj = ipoReviewRating.badge_text;
    const showBadgeText = badgeTextObj?.status === true || badgeTextObj?.status === "true";
    const recommendation = showBadgeText ? badgeTextObj?.value : ipoReviewRating.overall_recommendation;

    // If rating is hidden/unavailable and there is no recommendation text, hide the component to prevent empty space
    if (!showRating && !recommendation) return null;

    return (
        <div className={styles.ratingLargeRow}>
            {showRating && rating && (
                <>
                    <div className={styles.ratingLargeScoreWrapper}>
                        <span className={styles.ratingLargeScore}>{Number(rating).toFixed(1)}</span>
                        <span className={styles.ratingLargeScale}>/ 5</span>
                    </div>
                    
                    <div className={styles.ratingLargeStarsWrapper}>
                        <RatingBadge rating={rating} variant="starsWithLabel" />
                    </div>
                </>
            )}
            
            {/* The recommendation pill */}
            {recommendation ? (
                <div className={styles.strongBuyPill}>
                    {recommendation.toUpperCase()}
                </div>
            ) : (
                /* Fallback to STRONG BUY only if we have rating but no explicit recommendation text */
                showRating && rating && (
                    <div className={styles.strongBuyPill}>
                        STRONG BUY
                    </div>
                )
            )}
        </div>
    );
}
