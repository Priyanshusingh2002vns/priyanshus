"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Cookies from 'js-cookie';
import styles from './DealShowcase.module.css';
import DealCard from '@/app/deals/components/DealCard';
import Link from 'next/link';

const isFeaturedDeal = (deal) => {
    const subType = (deal?.deal_sub_type || '').toLowerCase().trim();
    const type = (deal?.deal_type || '').toLowerCase().trim();
    return subType === 'featured' || type === 'featured';
};

export default function DealShowcase() {
    const [featuredDeals, setFeaturedDeals] = useState([]);
    const [ipoDeals, setIpoDeals] = useState([]);
    const [unlistedDeals, setUnlistedDeals] = useState([]);

    const [loading, setLoading] = useState(true);

    const [featuredPage, setFeaturedPage] = useState(1);
    const [hasMoreFeatured, setHasMoreFeatured] = useState(true);
    const [loadingMoreFeatured, setLoadingMoreFeatured] = useState(false);

    const [publicPage, setPublicPage] = useState(1);
    const [hasMorePublic, setHasMorePublic] = useState(true);
    const [loadingMorePublic, setLoadingMorePublic] = useState(false);

    const [unlistedPage, setUnlistedPage] = useState(1);
    const [hasMoreUnlisted, setHasMoreUnlisted] = useState(true);
    const [loadingMoreUnlisted, setLoadingMoreUnlisted] = useState(false);

    // Q&A state & cache
    const [qaCounts, setQaCounts] = useState({});
    const [replies, setReplies] = useState({});
    const fetchedQaIds = useRef(new Set());
    const isFetchingFeaturedRef = useRef(false);
    const isFetchingPublicRef = useRef(false);
    const isFetchingUnlistedRef = useRef(false);

    // Initial Fetch (Featured, Public with limit=20, Unlisted with limit=40)
    useEffect(() => {
        const fetchInitialDeals = async () => {
            try {
                const token = Cookies.get('accessToken');
                const headers = {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                };

                const [featuredRes, publicRes, unlistedRes] = await Promise.allSettled([
                    fetch(`${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?deal_type=[unlisted,public]&deal_sub_type=featured&limit=20&page=1`, {
                        method: "GET",
                        headers,
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=20&page=1&deal_type=public`, {
                        method: "GET",
                        headers,
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=40&page=1&deal_type=unlisted`, {
                        method: "GET",
                        headers,
                    }),
                ]);

                if (featuredRes.status === 'fulfilled' && featuredRes.value.ok) {
                    const resJson = await featuredRes.value.json();
                    const deals = resJson.data || [];
                    const pagination = resJson.pagination || {};
                    setFeaturedDeals(deals);
                    const totalRecords = Number(pagination.totalRecords || pagination.total || 0);
                    setHasMoreFeatured(totalRecords > 0 ? totalRecords > deals.length : deals.length >= 20);
                }

                if (publicRes.status === 'fulfilled' && publicRes.value.ok) {
                    const resJson = await publicRes.value.json();
                    const deals = resJson.data || [];
                    const pagination = resJson.pagination || {};
                    const nonFeaturedDeals = deals.filter((deal) => !isFeaturedDeal(deal));
                    setIpoDeals(nonFeaturedDeals);
                    const totalRecords = Number(pagination.totalRecords || pagination.total || 0);
                    setHasMorePublic(totalRecords > 0 ? totalRecords > deals.length : deals.length >= 20);
                }

                if (unlistedRes.status === 'fulfilled' && unlistedRes.value.ok) {
                    const resJson = await unlistedRes.value.json();
                    const deals = resJson.data || [];
                    const pagination = resJson.pagination || {};
                    const nonFeaturedDeals = deals.filter((deal) => !isFeaturedDeal(deal));
                    setUnlistedDeals(nonFeaturedDeals);
                    const totalRecords = Number(pagination.totalRecords || pagination.total || 0);
                    setHasMoreUnlisted(totalRecords > 0 ? totalRecords > deals.length : deals.length >= 40);
                }
            } catch (error) {
                console.error("Error fetching deals for landing showcase:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialDeals();
    }, []);

    // Load next page of Featured Deals
    const fetchMoreFeaturedDeals = useCallback(async () => {
        if (!hasMoreFeatured || loadingMoreFeatured || isFetchingFeaturedRef.current) return;
        isFetchingFeaturedRef.current = true;
        setLoadingMoreFeatured(true);

        const nextPage = featuredPage + 1;
        try {
            const token = Cookies.get('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?deal_type=[unlisted,public]&deal_sub_type=featured&limit=20&page=${nextPage}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                }
            );

            if (res.ok) {
                const responseData = await res.json();
                const newDeals = responseData.data || [];
                const pagination = responseData.pagination || {};

                if (newDeals.length > 0) {
                    setFeaturedDeals((prev) => {
                        const existingIds = new Set(prev.map((d) => d.id));
                        const uniqueNew = newDeals.filter((d) => !existingIds.has(d.id));
                        return [...prev, ...uniqueNew];
                    });

                    setFeaturedPage(nextPage);

                    const loadedCount = nextPage * 20;
                    const totalRecords = Number(pagination.totalRecords || pagination.total || 0);
                    setHasMoreFeatured(totalRecords > 0 ? totalRecords > loadedCount : newDeals.length >= 20);
                } else {
                    setHasMoreFeatured(false);
                }
            }
        } catch (error) {
            console.error("Error loading more featured showcase deals:", error);
        } finally {
            isFetchingFeaturedRef.current = false;
            setLoadingMoreFeatured(false);
        }
    }, [hasMoreFeatured, loadingMoreFeatured, featuredPage]);

    // Load next page of Public Deals
    const fetchMorePublicDeals = useCallback(async () => {
        if (!hasMorePublic || loadingMorePublic || isFetchingPublicRef.current) return;
        isFetchingPublicRef.current = true;
        setLoadingMorePublic(true);

        const nextPage = publicPage + 1;
        try {
            const token = Cookies.get('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=20&page=${nextPage}&deal_type=public`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                }
            );

            if (res.ok) {
                const responseData = await res.json();
                const newDeals = responseData.data || [];
                const pagination = responseData.pagination || {};

                if (newDeals.length > 0) {
                    const nonFeaturedNewDeals = newDeals.filter((deal) => !isFeaturedDeal(deal));
                    setIpoDeals((prev) => {
                        const existingIds = new Set(prev.map((d) => d.id));
                        const uniqueNew = nonFeaturedNewDeals.filter((d) => !existingIds.has(d.id));
                        return [...prev, ...uniqueNew];
                    });

                    setPublicPage(nextPage);

                    const loadedCount = nextPage * 20;
                    const totalRecords = Number(pagination.totalRecords || pagination.total || 0);
                    setHasMorePublic(totalRecords > 0 ? totalRecords > loadedCount : newDeals.length >= 20);
                } else {
                    setHasMorePublic(false);
                }
            }
        } catch (error) {
            console.error("Error loading more public showcase deals:", error);
        } finally {
            isFetchingPublicRef.current = false;
            setLoadingMorePublic(false);
        }
    }, [hasMorePublic, loadingMorePublic, publicPage]);

    // Load next page of Unlisted Deals
    const fetchMoreUnlistedDeals = useCallback(async () => {
        if (!hasMoreUnlisted || loadingMoreUnlisted || isFetchingUnlistedRef.current) return;
        isFetchingUnlistedRef.current = true;
        setLoadingMoreUnlisted(true);

        const nextPage = unlistedPage + 1;
        try {
            const token = Cookies.get('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=40&page=${nextPage}&deal_type=unlisted`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                }
            );

            if (res.ok) {
                const responseData = await res.json();
                const newDeals = responseData.data || [];
                const pagination = responseData.pagination || {};

                if (newDeals.length > 0) {
                    const nonFeaturedNewDeals = newDeals.filter((deal) => !isFeaturedDeal(deal));
                    setUnlistedDeals((prev) => {
                        const existingIds = new Set(prev.map((d) => d.id));
                        const uniqueNew = nonFeaturedNewDeals.filter((d) => !existingIds.has(d.id));
                        return [...prev, ...uniqueNew];
                    });

                    setUnlistedPage(nextPage);

                    const loadedCount = nextPage * 40;
                    const totalRecords = Number(pagination.totalRecords || pagination.total || 0);
                    setHasMoreUnlisted(totalRecords > 0 ? totalRecords > loadedCount : newDeals.length >= 40);
                } else {
                    setHasMoreUnlisted(false);
                }
            }
        } catch (error) {
            console.error("Error loading more unlisted showcase deals:", error);
        } finally {
            isFetchingUnlistedRef.current = false;
            setLoadingMoreUnlisted(false);
        }
    }, [hasMoreUnlisted, loadingMoreUnlisted, unlistedPage]);

    return (
        <div className={styles.showcaseContainer}>
            <DealSection
                title="Featured Deals"
                subtitle="HIGHEST CONVICTION OPPORTUNITY"
                deals={featuredDeals}
                variantOverride="featured_deal"
                qaCounts={qaCounts}
                replies={replies}
                onReachEnd={fetchMoreFeaturedDeals}
                loading={loading}
            />

            <DealSection
                title="IPOs"
                subtitle="INSTITUTIONAL GRADE IPOS"
                deals={ipoDeals}
                redirectUrl="/deals?type=public"
                disclaimer="Grey Market Premium (GMPs) are shared for knowledge purpose only. PrEqt doesn’t promote or execute the trades."
                qaCounts={qaCounts}
                replies={replies}
                onReachEnd={fetchMorePublicDeals}
                loading={loading}
            />

            <DealSection
                title="Unlisted Shares"
                subtitle="Established companies traded in the private market"
                deals={unlistedDeals}
                redirectUrl="/deals?type=unlisted"
                disclaimer="Disclaimer: Unlisted shares are unregulated & illiquid. This is NOT investment advice. Please do your own due diligence before investing."
                qaCounts={qaCounts}
                replies={replies}
                onReachEnd={fetchMoreUnlistedDeals}
                loading={loading}
            />
        </div>
    );
}

function CautionIcon({ className }) {
    return (
        <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
            <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
            <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
        </svg>
    );
}

function FallbackCard() {
    return (
        <div className={styles.fallbackContainer}>
            <div className={styles.shapesContainer}>
                <svg width="100%" height="100%" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gold-gradient" x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(113.27 0.5 0.5)">
                            <stop offset="15.04%" stopColor="#D2C299" />
                            <stop offset="84.96%" stopColor="#8E6B0F" />
                        </linearGradient>
                    </defs>
                    
                    {/* Top Left: Circle (shrinks and grows) */}
                    <circle className={styles.circleTop} cx="11.25" cy="11.25" r="11.25" fill="url(#gold-gradient)" />
                    
                    {/* Top Right: Square (translates top-down) */}
                    <rect className={styles.squareTop} x="26.5" y="0" width="22.5" height="22.5" rx="4" fill="url(#gold-gradient)" />
                    
                    {/* Bottom Left: Triangle (rotates 360deg and pauses) */}
                    <path className={styles.triangleBottom} d="M 11.25 29.5 L 19.5 46 L 3 46 Z" fill="url(#gold-gradient)" stroke="url(#gold-gradient)" strokeWidth="6" strokeLinejoin="round" />
                    
                    {/* Bottom Right: Circle (gets constricted when square is down) */}
                    <circle className={styles.circleBottom} cx="37.75" cy="37.75" r="11.25" fill="url(#gold-gradient)" />
                </svg>
            </div>
            <h3 className={styles.fallbackTitle}>Personalizing Opportunities</h3>
            <p className={styles.fallbackSubtitle}>Our team is curating the best deals for you.</p>
            <p className={styles.fallbackSubSubtitle}>Check back soon for exciting offers!</p>
        </div>
    );
}

function DealSection({ title, subtitle, deals, children, redirectUrl, titleColorClass, variantOverride, disclaimer, qaCounts, replies, onReachEnd, loading }) {
    const hasDeals = deals && deals.length > 0;

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    {Boolean(title) && (
                        <h2 className={`${styles.title} ${titleColorClass ? styles[titleColorClass] : ''}`}>
                            {title}
                        </h2>
                    )}
                    {redirectUrl && (
                        <Link href={redirectUrl} className={styles.arrowLink}>
                            <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className={styles.arrowIcon}
                            >
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </Link>
                    )}
                </div>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>

            {children}

            {loading ? (
                <div className={styles.cardRowWrapper}>
                    <div style={{ display: 'flex', gap: '34px', overflow: 'hidden' }}>
                        <div className={styles.cardSkeleton} />
                        <div className={styles.cardSkeleton} />
                        <div className={styles.cardSkeleton} />
                        <div className={styles.cardSkeleton} />
                    </div>
                </div>
            ) : hasDeals ? (
                <div className={styles.cardRowWrapper}>
                    <Swiper
                        slidesPerView="auto"
                        spaceBetween={16}
                        breakpoints={{
                            768: {
                                spaceBetween: 34,
                            },
                        }}
                        loop={false}
                        grabCursor={true}
                        className={styles.cardRow}
                        onReachEnd={() => {
                            onReachEnd?.();
                        }}
                        onSlideChange={(swiper) => {
                            if (swiper.isEnd || (swiper.slides && swiper.activeIndex >= swiper.slides.length - 3)) {
                                onReachEnd?.();
                            }
                        }}
                    >
                        {deals.map(deal => (
                            <SwiperSlide key={deal.id} className={styles.cardWrapper}>
                                <DealCard
                                    deal={deal}
                                    isAuthenticated={true}
                                    isListView={false}
                                    variantOverride={variantOverride}
                                    qaCount={qaCounts?.[deal.id]}
                                    replies={replies?.[deal.id]}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            ) : (
                <FallbackCard />
            )}

            {disclaimer && (
                <div className={styles.disclaimerText}>
                    <CautionIcon className={styles.cautionIcon} />
                    <span>{disclaimer}</span>
                </div>
            )}
        </div>
    );
}
