"use client";
import styles from "./DealsTalk.module.css";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Loader from "../../Loader";
import Cookies from "js-cookie";
import { formatDate } from "@/app/utils/FormatDate";

function DealsTalkContent() {
    const swiperRef = useRef(null);
    const searchParams = useSearchParams();
    const dealId = searchParams?.get("dealId");
    const accessToken = Cookies.get('accessToken');
    const [qaCounts, setQaCounts] = useState({});
    const [replies, setReplies] = useState({}); // Store replies per dealId: { [dealId]: data }
    const [countLoading, setCountLoading] = useState(false);
    const [countError, setCountError] = useState(false);
    const [swiperReady, setSwiperReady] = useState(false);
    const [hasMoreSlides, setHasMoreSlides] = useState(false);



    function CompanyLogo({ path, alt, className }) {
        const [failed, setFailed] = useState(false);

        // IMPORTANT: fix your fallback path to a real existing file
        const fallback = "/logo-fallback.png";

        const src = failed
            ? fallback
            : path
                ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${path.replace("public/", "")}`
                : fallback;

        return (
            <img
                src={src}
                alt={alt}
                className={className}
                onError={() => setFailed(true)}
            />
        );
    }

    const formatNumberWithCommas = (num) => {
        if (num === null || num === undefined) return "";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    // Define deals data to check if deal is private
    const dealsConfig = {
        "1": { deal: "public" },
        "2": { deal: "private" },
        "3": { deal: "private" },
        "4": { deal: "private" }
    };

    const isPrivateDeal = dealId && dealsConfig[dealId]?.deal === "private";

    // Custom arrow components (use a button for accessibility and reliable clicks)
    const NextArrow = () => (
        <button
            type="button"
            className={styles.customNextArrow}
            aria-label="Next slide"
            onClick={() => {
                if (swiperRef.current && swiperRef.current.swiper) {
                    swiperRef.current.swiper.slideNext();
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (swiperRef.current && swiperRef.current.swiper) {
                        swiperRef.current.swiper.slideNext();
                    }
                }
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                <path d="M9 18.168L15 12.168L9 6.16797" stroke="#7E60FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );

    const dealsData = [
        {
            id: 2,
            type: "Pre IPO- SME",
            category: "Solar Energy",
            companyLogo: "/assets/pictures/hvr.svg",
            companyName: "HVR Solar Pvt Ltd",
            description: "India’s leading solar module manufacturer powering the green revolution.",
            stats: {
                revenue: "₹75 Cr",
                revenue2: "₹101 Cr",
                expectedListing: "-",
                pat: "7.0 Cr",
                peMultiple: "10.7x"
            },
            progress: {
                current: "0Cr / 15Cr",
                percentage: "94%"
            },
            tags: ["Strong promoter", "Clear Monetization", "Fund Participating"],
            deal: "private"
        },
    ];

    const [allTopDeals, setAllTopDeals] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFetchTopDeals = async () => {
        try {
            // IMPORTANT: The commented out API block below is the old API. Do not delete it, as it can be used in the future.
            /*
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_BASE}/admin/api/deals/all-deals?limit=20`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${accessToken}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAllTopDeals(data.data || []);
            } else {
                console.log("Failed to fetch top deals");
            }
            */

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=20&page=1`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const filteredDeals = (data.data || []).filter(deal => {
                    const type = (deal.deal_type || '').toLowerCase();
                    return type === 'public' || 
                           type === 'unlisted' || 
                           (type === 'ofs' && (!deal.deal_sub_type || deal.deal_sub_type === null || deal.deal_sub_type === undefined || String(deal.deal_sub_type).trim().toLowerCase() === 'null'));
                }).map(deal => {
                    const getNumeric = (val) => {
                        if (val === null || val === undefined) return NaN;
                        if (typeof val === 'number') return val;
                        const clean = String(val).replace(/[^0-9.]/g, '');
                        const num = parseFloat(clean);
                        return isNaN(num) ? NaN : num;
                    };
                    const lotSize = getNumeric(deal?.min_investment_lot_size);
                    const perSharePrice = getNumeric(deal?.per_share_price || deal?.offer_price);
                    const lotSizeShare = getNumeric(deal?.lot_size_share);
                    
                    let calculated = deal?.min_investment_amount_in_inr;
                    if (!isNaN(lotSize) && !isNaN(perSharePrice) && !isNaN(lotSizeShare)) {
                        calculated = lotSize * perSharePrice * lotSizeShare;
                    }
                    return {
                        ...deal,
                        min_investment_amount_in_inr: calculated
                    };
                });
                setAllTopDeals(filteredDeals);
            } else {
                console.log("Failed to fetch top deals");
            }
        } catch (error) {
            console.log("Error fetching top deals:", error);
        }

    }

    useEffect(() => {
        handleFetchTopDeals()
    }, [])

    const fetchedQaDealIds = useRef(new Set());

    useEffect(() => {
        if (allTopDeals.length === 0) return;

        allTopDeals.forEach((deal) => {
            if (deal?.id && !fetchedQaDealIds.current.has(deal.id)) {
                fetchRepliesCount(deal.id, deal.deal_type === "private" || deal.deal_type === "ccps" || deal.deal_type === "ofs");
            }
        });

        // Check if there are more slides after deals are loaded
        if (swiperRef.current && swiperRef.current.swiper) {
            setTimeout(() => {
                checkIfHasMoreSlides();
            }, 100);
        }
    }, [allTopDeals]);

    const checkIfHasMoreSlides = () => {
        if (swiperRef.current && swiperRef.current.swiper && allTopDeals.length > 0) {
            const swiper = swiperRef.current.swiper;
            // For loop mode, check if total slides are more than what can be displayed
            // For non-loop mode, check isEnd
            if (swiper.params.loop) {
                // With loop enabled, check if actual slides count is greater than slidesPerView
                // Note: swiper.slides includes duplicated loop slides, so check allTopDeals.length
                const slidesPerView = typeof swiper.params.slidesPerView === 'number' 
                    ? swiper.params.slidesPerView 
                    : (window.innerWidth >= 1200 ? 3 : window.innerWidth >= 768 ? 2 : 1);
                setHasMoreSlides(allTopDeals.length > slidesPerView);
            } else {
                setHasMoreSlides(!swiper.isEnd);
            }
        }
    };

    useEffect(() => {
        const handleResize = () => {
            // Check again on resize since breakpoints change slidesPerView
            if (swiperRef.current && swiperRef.current.swiper) {
                setTimeout(() => {
                    checkIfHasMoreSlides();
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize Swiper navigation after swiper + custom button have mounted
    useEffect(() => {
        if (!swiperRef.current || !swiperRef.current.swiper) return;
        const swiper = swiperRef.current.swiper;
        const nextSelector = `.${styles.customNextArrow}`;

        // Ensure navigation params exist and point to our custom button
        swiper.params.navigation = swiper.params.navigation || {};
        swiper.params.navigation.nextEl = nextSelector;

        // Destroy existing navigation if present, then init/update so it finds our button
        if (swiper.navigation && swiper.navigation.destroy) {
            try {
                swiper.navigation.destroy();
            } catch (e) {
                // ignore
            }
        }

        if (swiper.navigation && swiper.navigation.init) {
            swiper.navigation.init();
            swiper.navigation.update();
        }
    }, [swiperReady, hasMoreSlides]);


    const fetchRepliesCount = async (dealId, isPrivateDeal) => {
        if (!dealId) return;

        try {
            setCountLoading(true);
            const token = isPrivateDeal ? Cookies.get("accessToken") : null;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/replies-count/${dealId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            );

            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

            const data = await res.json();
            setQaCounts((prev) => ({
                ...prev,
                [dealId]: data?.data?.count || 0,
            }));

            // Store replies data per deal ID
            setReplies((prev) => ({
                ...prev,
                [dealId]: data,
            }));
        } catch (err) {
            console.error("Error fetching replies count:", err);
        } finally {
            setCountLoading(false);
        }
    };

    function daysUntilLive(liveAt) {
        if (!liveAt) return 0;
        const liveDate = new Date(liveAt);
        const today = new Date();

        // Convert to start of day to avoid time-zone partial day issues
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfLive = new Date(liveDate.getFullYear(), liveDate.getMonth(), liveDate.getDate());

        const diffTime = startOfToday - startOfLive; // milliseconds
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays; // Could be 0 or negative
    }

    const getLatestReplyInitials = (questions = []) => {
        const allReplies = [];

        questions.forEach(q => {
            if (q.replies && q.replies.length > 0) {
                q.replies.forEach(r => {
                    allReplies.push({
                        solver: r.solver,
                        createdAt: r.createdAt
                    });
                });
            }
        });

        // Sort by newest first
        allReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Take top 5
        const latestFive = allReplies.slice(0, 5);

        // Convert name → initials
        return latestFive.map(r => {
            if (!r.solver) return "A"; // default like your old PNG  
            const parts = r.solver.trim().split(" ");
            let initials = parts[0][0];
            if (parts.length > 1) initials += parts[1][0];
            return initials.toUpperCase();
        });
    };

    const getPrivateDealProgress = (deal) => {
        const raised =
            deal?.company_name === "Cricstudio Pvt. Ltd." || deal?.company_name === "avineet"
                ? 4.5
                : Number(deal?.raised_amount || 0);

        const target = Number(deal?.target_funding_in_cr || 0);

        if (target <= 0) {
            return {
                raised,
                percent: "0.00",
                width: "0%",
            };
        }

        const percent = ((raised / target) * 100).toFixed(1);

        return {
            raised,
            percent,
            width: `${Math.min(Number(percent), 100)}%`,
        };
    };

    const renderPublicCard = (deal) => {
        const rating = (deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score);

        // Dynamic status badge logic
        const statusRaw = (deal?.hidden_status || '').toLowerCase();
        let statusKey = 'upcoming';
        if (statusRaw === 'live') statusKey = 'live';
        else if (statusRaw === 'closed') statusKey = 'closed';
        else if (statusRaw === 'upcoming' || statusRaw === 'up comming' || statusRaw === 'draft') statusKey = 'upcoming';

        const statusMap = {
            live: { label: 'Live', badgeClass: styles.liveBadge, dotClass: styles.liveDotInner },
            upcoming: { label: 'Upcoming', badgeClass: styles.upcomingBadge, dotClass: styles.upcomingDotInner },
            closed: { label: 'Closed', badgeClass: styles.closedBadge, dotClass: styles.closedDotInner }
        };
        const { label, badgeClass, dotClass } = statusMap[statusKey];

        const numericRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numericRating);
        const hasHalfStar = numericRating % 1 > 0;
        const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

        return (
            <Link href={`/deals/${deal.slug}`} className={styles.cardLink}>
                <div className={styles.cardContainer1}>
                    {/* Header: Badges & Rating */}
                    <div className={styles.topHeaderRow}>
                        <div className={styles.leftBadges}>
                            {deal?.deal_type?.toLowerCase() === 'public' && (
                                <div className={badgeClass}>
                                    <div className={styles.dotWrapper}>
                                        <div className={`${styles.dotInner} ${dotClass}`}></div>
                                    </div>
                                    {label}
                                </div>
                            )}

                            {(() => {
                                let totalChars = 0;
                                return (deal?.tags || []).filter((tag, index) => {
                                    if (index === 0) {
                                        totalChars += (tag?.length || 0);
                                        return true;
                                    }
                                    // Max 2 tags total, and total chars <= 15
                                    if (index === 1 && totalChars + (tag?.length || 0) <= 15) {
                                        totalChars += (tag?.length || 0);
                                        return true;
                                    }
                                    return false;
                                }).map((tag, idx) => (
                                    <div key={idx} className={`${styles.smeBadge} ${idx >= 1 ? styles.hideOnMobile : ''}`}>{tag}</div>
                                ));
                            })()}
                        </div>
                        {numericRating > 0 && (
                            <div className={styles.ratingBadgeNew}>
                                <div className={styles.ratingNumberBox}>
                                    {rating}
                                </div>
                                <div className={styles.starsBox}>
                                    {[...Array(fullStars)].map((_, i) => (
                                        <img key={`full-${i}`} src="/starwhite.svg" alt="star" className={styles.starIconSmall} />
                                    ))}
                                    {hasHalfStar && (
                                        <img src="/halfstar.svg" alt="half star" className={styles.starIconSmall} />
                                    )}
                                    {[...Array(emptyStars)].map((_, i) => (
                                        <img key={`empty-${i}`} src="/emptystar.svg" alt="empty star" className={styles.starIconSmall} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Company Info */}
                    <div className={styles.companyInfoMain}>
                        <CompanyLogo
                            path={deal?.company_logo?.[0]?.path}
                            alt={deal?.company_name}
                            className={styles.anthemPicture}
                        />
                        <h3 className={styles.companyTitle}>{deal?.company_name}</h3>
                    </div>

                    {/* Tagline */}
                    <p className={styles.taglineText}>
                        {deal?.tag_line || "No description available"}
                    </p>

                    {/* Highlight Stats (Issue Size & GMP) */}
                    <div className={styles.highlightStatsRow}>
                        <div className={styles.statBox}>
                            <span className={styles.statBoxLabel}>Issue Size</span>
                            <span className={styles.statBoxValue}>
                                {deal?.issue_size_overall ? "₹" : ""}{formatNumberWithCommas(deal?.issue_size_overall || "TBD")} {deal?.issue_size_amount || deal?.target_funding_in_cr ? "Cr" : ""}
                            </span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statBoxLabel}>GMP</span>
                            <span className={styles.statBoxValue}>
                                ₹{formatNumberWithCommas(deal?.gmp) || "0"} <span className={styles.statBoxSubValue} style={{ color: Number(deal?.estimated_gain_loss) < 0 ? 'red' : undefined }}>({Number(deal?.estimated_gain_loss) > 0 ? '+' : ''}{deal?.estimated_gain_loss || "0"}%)</span>
                            </span>
                        </div>
                    </div>

                    {/* Stats Grid 3x2 */}
                    <div className={styles.statsGrid6}>
                        <div className={styles.gridItem}>
                            <span className={styles.gridLabel}>Expected Val.</span>
                            <span className={styles.gridValue}>₹{formatNumberWithCommas(deal?.expected_valuation) || "0"} Cr</span>
                        </div>
                        <div className={styles.gridItem}>
                            <span className={styles.gridLabel}>Revenue (FY'25)</span>
                            <span className={styles.gridValue}>₹{formatNumberWithCommas(deal?.revenue_fy25_in_cr) || "0"} Cr</span>
                        </div>
                        <div className={styles.gridItem}>
                            <span className={styles.gridLabel}>PAT (FY'25)</span>
                            <span className={styles.gridValue}>₹{formatNumberWithCommas(deal?.pat_fy25_in_cr) || "0"} Cr</span>
                        </div>
                        <div className={styles.gridItem}>
                            <span className={styles.gridLabel}>P/E Multiple</span>
                            <span className={styles.gridValue}>{formatNumberWithCommas(deal?.pe_multiple) || "TBD"}{deal?.pe_multiple ? "x" : ""}</span>
                        </div>
                        <div className={styles.gridItem}>
                            {deal?.deal_type?.toLowerCase() === 'unlisted' && deal?.roce_fy25_percent !== null && deal?.roce_fy25_percent !== undefined && String(deal?.roce_fy25_percent).trim() !== '' ? (
                                <>
                                    <span className={styles.gridLabel}>ROCE (FY'25)</span>
                                    <span className={styles.gridValue}>{formatNumberWithCommas(deal.roce_fy25_percent)}%</span>
                                </>
                            ) : (
                                <>
                                    <span className={styles.gridLabel}>Listing Date </span>
                                    <span className={styles.gridValue}>{formatDate(deal?.listing_timeline) || "Sep '27"}</span>
                                </>
                            )}
                        </div>
                        <div className={styles.gridItem}>
                            <span className={styles.gridLabel}>CAGR 3Y</span>
                            <span className={styles.gridValue}>{formatNumberWithCommas(deal?.cagr_growth_3y_percent) || "0"}%</span>
                        </div>
                    </div>

                    {/* Key Highlights (Chips) */}
                    <div className={styles.tagChipsRow}>
                        {(() => {
                            let totalChars = 0;
                            return (deal?.key_highlights || []).filter(tag => {
                                if (totalChars + (tag?.length || 0) <= 20) {
                                    totalChars += (tag?.length || 0);
                                    return true;
                                }
                                return false;
                            }).map((tag, index) => (
                                <div key={index} className={styles.tagChip}>
                                    {tag}
                                </div>
                            ));
                        })()}
                    </div>

                    {/* Footer Bar */}
                    <div className={styles.bottomFooter}>
                        <p className={styles.qaGoldText}>
                            {qaCounts[deal.id] > 0 ? (
                                `${qaCounts[deal.id]} Q&A Answered In Last  ${daysUntilLive(deal?.createdAt)} Days`
                            ) : (
                                <>
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
                                </>
                            )}
                        </p>

                        {qaCounts[deal.id] > 0 && (
                            <div className={styles.avatarOverlapStack}>
                                {getLatestReplyInitials(
                                    replies[deal.id]?.data?.questions_by || []
                                ).map((initial, idx) => (
                                    <div key={idx} className={styles.overlapAvatar}>
                                        {initial}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        );
    };

    const renderPrivateCard = (deal) => (
        <Link href={`/deals/${deal.slug}`} className={styles.cardLink}>
            <div className={styles.card2Container}>
                {deal?.deal_type === 'ofs' && deal?.exclusive_deal === true && (
                    <img src="/ofsdealGradient.svg" alt="exclusive deal gradient" className={styles.ofsGradient} />
                )}
                <div className={styles.card2InnerSections}>
                    <article className={styles.card2IPOsection}>
                        {(deal?.deal_type === 'ofs' || deal?.deal_type === 'OFS') && (
                            <div className={styles.ofsDefaultTag}>
                                <p className={styles.ofsDefaultTagText}>Unlisted Shares</p>
                            </div>
                        )}
                        {(() => {
                            let totalChars = 0;
                            return (deal?.tags || []).filter(tag => {
                                if (totalChars + (tag?.length || 0) <= 20) {
                                    totalChars += (tag?.length || 0);
                                    return true;
                                }
                                return false;
                            }).map((data, idx) => (
                                <div className={styles.card2IPOtag} key={idx}>
                                    <p className={styles.card2IPOtext}>{data}</p>
                                </div>
                            ));
                        })()}
                    </article>

                    {/* <p className={styles.para} style={{ marginBottom: "6px", width: "95%" }}>
                        {deal.short_desc}
                    </p> */}

                    {/* Exclusive Tag */}
                    {deal?.exclusive_deal === true && (
                        <div className={styles.exclusiveTagWrapperofs}>
                            <div className="exclusiveTagNew">EXCLUSIVE DEAL</div>
                        </div>
                    )}

                    <div className={styles.card2CompanySection}>
                        <CompanyLogo
                            path={deal?.company_logo?.[0]?.path}
                            alt={deal?.company_name}
                            className={styles.anthemPicture}
                        />
                        <p className={styles.card2CompanyName}>{deal?.company_name || ""}</p>
                    </div>

                    {deal?.tag_line && (
                        <p className={styles.card2Description}>
                            {deal?.tag_line}
                        </p>
                    )}

                    {(deal?.deal_type === 'ofs' || deal?.deal_type === 'OFS') ? (
                        <>
                            <div className={styles.ofsHighlightBox}>
                                <div className={styles.ofsHighlightRow}>
                                    <div className={styles.ofsHighlightCol}>
                                        <p className={styles.card2StatHeading}>Valuation</p>
                                        <p className={styles.ofsHighlightValue}>{deal?.valuation_in_cr || deal?.offer_for_sale ? "₹" : ""}{formatNumberWithCommas(deal?.valuation_in_cr || deal?.offer_for_sale || "TBD")} {deal?.issue_size_overall || deal?.offer_for_sale ? "Cr" : ""}</p>
                                    </div>
                                    <div className={styles.ofsHighlightCol}>
                                        <p className={styles.card2StatHeading}>Share Price</p>
                                        <p className={styles.ofsHighlightValue}>{deal?.per_share_price || deal?.offer_price ? "₹" : ""}{formatNumberWithCommas(deal?.per_share_price || deal?.offer_price || "TBD")} <span className={styles.perShare}>{deal?.per_share_price || deal?.offer_price ? "/ share" : ""}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.card2StatsContainer}>
                                <section className={styles.card2StatsRow}>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>Min. Investment</p>
                                        <p className={styles.card2StatValue}>{deal?.min_investment_amount_in_inr ? "₹" : ""}{formatNumberWithCommas(deal?.min_investment_amount_in_inr || "TBD")}</p>
                                    </article>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>Revenue (FY'25)</p>
                                        <p className={styles.card2StatValue}>{deal?.revenue_fy25_in_cr ? "₹" : ""}{formatNumberWithCommas(deal?.revenue_fy25_in_cr || 0)} {deal?.revenue_fy25_in_cr ? "Cr" : ""}</p>
                                    </article>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>PAT (FY'25)</p>
                                        <p className={styles.card2StatValue}>{deal?.pat_fy25_in_cr ? "₹" : ""}{formatNumberWithCommas(deal?.pat_fy25_in_cr || 0)} {deal?.pat_fy25_in_cr ? "Cr" : ""}</p>
                                    </article>
                                </section>

                                <section className={styles.card2StatsRow}>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>P/E Multiple</p>
                                        <p className={styles.card2StatValue}>{formatNumberWithCommas(deal?.pe_multiple) || 0}{deal?.pe_multiple ? "x" : ""}</p>
                                    </article>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>Expected listing</p>
                                        <p className={styles.card2StatValue}> {formatDate(deal?.listing_timeline) || "TBD"}</p>
                                    </article>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>CAGR (3Yrs)</p>
                                        <p className={styles.card2StatValue}>{deal?.cagr_growth_3y_percent || 0}%</p>
                                    </article>
                                </section>
                            </div>
                        </>
                    ) : (
                        <div className={styles.card2StatsContainer}>
                            <section className={styles.card2StatsRow}>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Valuation</p>
                                    <p className={styles.card2StatValue}>{(deal?.valuation_in_cr !== null && deal?.valuation_in_cr !== undefined && deal?.valuation_in_cr !== "") ? "₹" : ""}{formatNumberWithCommas(deal?.valuation_in_cr ?? 0)} {(deal?.valuation_in_cr !== null && deal?.valuation_in_cr !== undefined && deal?.valuation_in_cr !== "") ? "Cr" : ""}</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Revenue (FY'25)</p>
                                    <p className={styles.card2StatValue}>{(deal?.revenue_fy25_in_cr !== null && deal?.revenue_fy25_in_cr !== undefined && deal?.revenue_fy25_in_cr !== "") ? "₹" : ""}{formatNumberWithCommas(deal?.revenue_fy25_in_cr ?? 0)} {(deal?.revenue_fy25_in_cr !== null && deal?.revenue_fy25_in_cr !== undefined && deal?.revenue_fy25_in_cr !== "") ? "Cr" : ""}</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>PAT (FY'25)</p>
                                    <p className={styles.card2StatValue}>{(deal?.pat_fy25_in_cr !== null && deal?.pat_fy25_in_cr !== undefined && deal?.pat_fy25_in_cr !== "") ? "₹" : ""}{formatNumberWithCommas(deal?.pat_fy25_in_cr ?? 0)} {(deal?.pat_fy25_in_cr !== null && deal?.pat_fy25_in_cr !== undefined && deal?.pat_fy25_in_cr !== "") ? "Cr" : ""}</p>
                                </article>
                            </section>

                            <section className={styles.card2StatsRow}>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>P/E Multiple</p>
                                    <p className={styles.card2StatValue}>{formatNumberWithCommas(deal?.pe_multiple ?? "TBD")}{(deal?.pe_multiple !== null && deal?.pe_multiple !== undefined && deal?.pe_multiple !== "") ? "x" : ""}</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Expected Listing</p>
                                    <p className={styles.card2StatValue}>{formatDate(deal?.listing_timeline) || formatDate(deal?.listing_date) || "TBD"}</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>CAGR 3Y</p>
                                    <p className={styles.card2StatValue}>{formatNumberWithCommas(deal?.cagr_growth_3y_percent ?? 0)}%</p>
                                </article>
                            </section>
                        </div>
                    )}

                    {(deal?.target_funding_in_cr || 0) > 0 && (() => {
                        const { raised, percent, width } = getPrivateDealProgress(deal);

                        return (
                            <div className={styles.progressContainer}>
                                <div className={styles.ProgressInPrice}>
                                    <p className={styles.PriceIncr}>
                                        ₹{formatNumberWithCommas(raised)} Cr / {deal?.target_funding_in_cr ? "₹" : ""}{formatNumberWithCommas(deal?.target_funding_in_cr || "TBD")} Cr
                                    </p>
                                    <p className={styles.PricePercent}>{percent}%</p>
                                </div>

                                <div className={styles.progressWrapper}>
                                    <div className={styles.progress}>
                                        <div
                                            className={styles.progressBar}
                                            style={{ width }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className={styles.promoter}>
                        {(() => {
                            let totalChars = 0;
                            return (deal?.key_highlights || []).filter(tag => {
                                if (totalChars + (tag?.length || 0) <= 20) {
                                    totalChars += (tag?.length || 0);
                                    return true;
                                }
                                return false;
                            }).map((tag, index) => (
                                <div key={index} className={index === 0 ? styles.Strong : styles.monetization}>
                                    <p>{tag}</p>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                <div className={styles.card2Footer}>
                    <div className={styles.card2QandA}>
                        <div className={styles.card2QandAStats}>
                            {qaCounts[deal.id] > 0 ? (
                                `${qaCounts[deal.id]} Q&A answered in  last ${daysUntilLive(deal?.createdAt)} days`
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>

                        {qaCounts[deal.id] > 0 && (
                            <div className={styles.initialsContainer}>
                                {getLatestReplyInitials(
                                    replies[deal.id]?.data?.questions_by || []
                                ).map((i, index) => (
                                    <div key={index} className={styles.initialBadge}>
                                        {i}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* <img src="/assets/pictures/star.svg" alt="" className={styles.starImage} /> */}
            </div>
        </Link>
    );

    return (
        <section className={`${styles.DealsTalkMainContainer} ${isPrivateDeal ? styles.privateDealTheme : ''}`}>
            <div className={`${styles.DealsTalkHeading} ${styles.homeTalkingHeading}`}>
                Deals People Are <span className={`${styles.SpanDealsTalkHeading} ${styles.homeTalkingHeadingText}`}>Talking About </span>
            </div>

            <div className={`${styles.carouselWrapper} carouselWrapper`}>
                <Swiper
                    ref={swiperRef}
                    onSwiper={(swiper) => {
                        // Store swiper instance for easier access
                        if (swiperRef.current && !swiperRef.current.swiper) {
                            swiperRef.current.swiper = swiper;
                        }
                        setSwiperReady(true);
                        // Check if there are more slides initially
                        setTimeout(() => {
                            checkIfHasMoreSlides();
                        }, 100);
                    }}
                    onSlideChange={(swiper) => {
                        // Update state when slide changes
                        checkIfHasMoreSlides();
                    }}
                    onResize={(swiper) => {
                        // Update state when swiper resizes (breakpoint changes)
                        checkIfHasMoreSlides();
                    }}
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    // wire navigation to our custom next button (class selector)
                    navigation={{ nextEl: `.${styles.customNextArrow}` }}
                    pagination={false}
                    // disable looping as requested
                    loop={false}
                    autoplay={false}
                    breakpoints={{
                        0: {
                            slidesPerView: 1,
                        },
                        400: {
                            slidesPerView: 1,
                        },
                        480: {
                            slidesPerView: 1,
                        },
                        640: {
                            slidesPerView: 1,
                        },
                        769: {
                            slidesPerView: 1,
                        },
                        1025: {
                            slidesPerView: 1,
                        },
                        1133: {
                            slidesPerView: 2,
                        },
                        1380: {
                            slidesPerView: 2,
                        },
                        1520: {
                            slidesPerView: 3,
                        },
                        1730: {
                            slidesPerView: 3,
                        },

                    }}
                    className={styles.dealsSwiper}
                >
                    {allTopDeals.map((deal, index) => (
                        <SwiperSlide key={deal.id}>
                            {(deal.deal_type === "public" || deal.deal_type === "unlisted") ? renderPublicCard(deal) : renderPrivateCard(deal)}
                        </SwiperSlide>
                    ))}
                </Swiper>
                {swiperReady && allTopDeals.length > 0 && hasMoreSlides && <NextArrow />}
            </div>
        </section>
    );
}

export default function DealsTalk() {
    return (
        <Suspense fallback={<Loader />}>
            <DealsTalkContent />
        </Suspense>
    );
}