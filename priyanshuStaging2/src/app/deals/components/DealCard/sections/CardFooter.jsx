"use client";
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import AvatarGroup from '../ui/AvatarGroup';
import RatingBadge from '../ui/RatingBadge';
import CardTags from './CardTags';
import styles from '../DealCard.module.css';

// In-memory session cache and deduplication map
const globalQaCache = new Map();
const globalInFlightPromises = new Map();

export async function fetchDealQaData(dealId, isPrivateDeal) {
    if (!dealId) return null;
    const idStr = String(dealId).trim();
    if (idStr.startsWith("teaser-") || idStr.startsWith("dummy-")) return null;
    if (globalQaCache.has(idStr)) {
        return globalQaCache.get(idStr);
    }
    if (globalInFlightPromises.has(idStr)) {
        return globalInFlightPromises.get(idStr);
    }

    const promise = (async () => {
        try {
            const rawBase = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
            const baseUrl = rawBase.replace(/\/$/, "");
            const token = isPrivateDeal ? Cookies.get("accessToken") : null;

            const res = await fetch(`${baseUrl}/admin/api/dashboard/replies-count/${idStr}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const result = {
                count: Number(data?.data?.count || data?.count || 0),
                replies: data,
            };
            globalQaCache.set(idStr, result);
            return result;
        } catch (err) {
            console.error("Error fetching lazy QA for deal:", idStr, err);
            const fallback = { count: 0, replies: null };
            globalQaCache.set(idStr, fallback);
            return fallback;
        } finally {
            globalInFlightPromises.delete(idStr);
        }
    })();

    globalInFlightPromises.set(idStr, promise);
    return promise;
}

function daysUntilLive(liveAt) {
    const liveDate = new Date(liveAt);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfLive = new Date(liveDate.getFullYear(), liveDate.getMonth(), liveDate.getDate());
    const diffTime = startOfToday - startOfLive;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const getInitials = (questions = []) => {
    const allReplies = [];
    questions.forEach(q => {
        if (q.replies && q.replies.length > 0) {
            q.replies.forEach(r => {
                allReplies.push({ solver: r.solver, createdAt: r.createdAt });
            });
        }
    });
    allReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return allReplies.slice(0, 5).map(r => {
        if (!r.solver) return "A";
        const parts = r.solver.trim().split(" ");
        let initials = parts[0][0];
        if (parts.length > 1) initials += parts[1][0];
        return initials.toUpperCase();
    });
};

export default function CardFooter({ deal, qaCount: propQaCount, replies: propReplies, isListView }) {
    const dealId = deal?.id || deal?.deal_id;
    const isPrivateDeal = deal?.deal_type === "private" || deal?.deal_type === "ccps" || deal?.deal_type === "unlisted";

    const [lazyData, setLazyData] = useState(() => {
        if (propQaCount !== undefined && propQaCount !== null) {
            return { count: propQaCount, replies: propReplies };
        }
        if (dealId && globalQaCache.has(dealId)) {
            return globalQaCache.get(dealId);
        }
        return { count: deal?.qa_count || 0, replies: propReplies || null };
    });

    const footerRef = useRef(null);

    useEffect(() => {
        if (propQaCount !== undefined && propQaCount !== null) {
            setLazyData({ count: propQaCount, replies: propReplies });
            return;
        }

        if (!dealId) return;
        const idStr = String(dealId).trim();
        if (idStr.startsWith('teaser-') || idStr.startsWith('dummy-')) return;

        if (globalQaCache.has(idStr)) {
            setLazyData(globalQaCache.get(idStr));
            return;
        }

        const currentRef = footerRef.current;
        if (!currentRef) return;

        // Viewport IntersectionObserver: Only fetch when card is in/near viewport
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    observer.disconnect();
                    fetchDealQaData(dealId, isPrivateDeal).then((data) => {
                        if (data) setLazyData(data);
                    });
                }
            },
            { rootMargin: "150px" } // Pre-fetch 150px before entering screen for seamless UX
        );

        observer.observe(currentRef);

        return () => {
            observer.disconnect();
        };
    }, [dealId, propQaCount, propReplies, isPrivateDeal]);

    const finalQaCount = lazyData.count !== undefined ? lazyData.count : (deal?.qa_count || 0);
    const hasQA = finalQaCount > 0;
    const finalReplies = lazyData.replies || propReplies;
    const initials = getInitials(finalReplies?.data?.questions_by || []);
    const finalInitials = initials && initials.length > 0 ? initials : (deal?.dummy_initials || []);

    return (
        <div ref={footerRef} className={styles.footer}>
            <div className={styles.qaContainer}>
                {hasQA ? (
                    <>
                        <span className={styles.qaCount}>{finalQaCount} Q&A</span>
                        <span className={styles.qaSeparator}>•</span>
                        <span className={styles.qaFreshness}>
                            {deal?.qa_freshness ? deal.qa_freshness : `Last ${daysUntilLive(deal?.createdAt || new Date())} Days`}
                        </span>
                    </>
                ) : (
                    <>
                        <span className={styles.qaEmpty}>
                            Do you have any question?{" "}
                            <span
                                className={styles.askNowLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = `/deals/${deal?.slug}?qna=true`;
                                }}
                            >
                                Ask now
                            </span>
                        </span>
                        <div className={styles.mobileFooterTags}>
                            <CardTags deal={deal} isListView={isListView} />
                        </div>
                    </>
                )}
            </div>

            {hasQA && finalInitials.length > 0 && <AvatarGroup initials={finalInitials} />}
        </div>
    );
}
