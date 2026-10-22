"use client";
import { useDealStore } from "@/store/dealStore";
import Loader from "@/app/components/Loader";
import styles from "../../../components/home/DealsTalk/DealsTalk.module.css";
import stylesdeals from "./AllDeals.module.css";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Lock, Search, SlidersHorizontal, X } from "lucide-react";
import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import OtpPopup from "@/app/otp/OtpPopup";
import SigninPopup from "@/app/sign-in/SigninPopup";
import { formatDate } from "@/app/utils/FormatDate";
import LoadMoreLoader from "@/app/components/LoadMore/LoadMoreLoader";
import FilterPopup from "./FilterPopup";
import DealCard from "../DealCard";
import UnlockTeaser from "@/app/components/home/DealShowcase/UnlockTeaser";

/**
 * Safely parses a close date string (YYYY-MM-DD or ISO timestamp)
 * and returns boundaries for the start and end of that day in local time.
 */
function parseCloseDate(dateStr) {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    // Handle standard YYYY-MM-DD format
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match && !str.includes('T') && !str.includes('Z')) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        return {
            startOfDay: new Date(year, month, day, 0, 0, 0, 0).getTime(),
            endOfDay: new Date(year, month, day, 23, 59, 59, 999).getTime(),
            year,
            month,
            day
        };
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    return {
        startOfDay: new Date(year, month, day, 0, 0, 0, 0).getTime(),
        endOfDay: new Date(year, month, day, 23, 59, 59, 999).getTime(),
        exactTime: d.getTime(),
        year,
        month,
        day
    };
}

export const getResponsiveDealLimit = (windowWidth) => {
    if (typeof windowWidth !== "number" || isNaN(windowWidth)) return 16;
    if (windowWidth > 1450) return 16;  // 25% width (4 cols) -> 16
    if (windowWidth > 1130) return 15;  // 33.33% width (3 cols) -> 15
    if (windowWidth > 710) return 16;   // 50% width (2 cols) -> 16
    return 15;                          // 100% width (1 col) -> 15
};

function AllDealsContent({ initialDeals = [], initialPagination = {}, initialCategory = null, initialSort = "latest" }) {
    const pathname = usePathname();
    const router = useRouter();

    // Map current pathname to category to ensure URL and active tab are always in sync
    const categoryFromPath = useMemo(() => {
        if (!pathname) return null;
        const slug = pathname.replace(/^\/deals\/?/, "").split("/")[0];
        if (!slug) return "All";
        const aliasMap = {
            "upcoming-ipo": "Upcoming",
            "upcoming": "Upcoming",
            "upcoming-ipos": "Upcoming",
            "ipo": "Public",
            "public": "Public",
            "ipos": "Public",
            "unlisted-shares": "Unlisted",
            "unlisted": "Unlisted",
            "private-deals": "Private",
            "private": "Private",
            "startup-deals": "Startup",
            "startup": "Startup"
        };
        return aliasMap[slug] || null;
    }, [pathname]);

    // Initial category derived from URL pathname or initial server prop
    const initialResolvedCategory = categoryFromPath || initialCategory || "All";
    const [selectedDealType, setSelectedDealTypeState] = useState(initialResolvedCategory);
    const [loading, setLoading] = useState(!initialDeals || initialDeals.length === 0);
    const [allDeals, setAllDeals] = useState(initialDeals);
    const [pagination, setPagination] = useState(initialPagination);
    const [totalRecords, setTotalRecords] = useState(Number(initialPagination?.totalRecords || initialPagination?.total || 0));
    const [error, setError] = useState([]);
    const { setSelectedDeal, appliedFilters, setAppliedFilters, setSelectedDealType } = useDealStore();

    const isUserLimitManual = useRef(false);

    const initialLimit = useMemo(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const l = parseInt(params.get("limit"), 10);
            if (!isNaN(l) && l > 0) {
                isUserLimitManual.current = true;
                return l;
            }
            return getResponsiveDealLimit(window.innerWidth);
        }
        return Number(initialPagination?.limit) || 16;
    }, [initialPagination?.limit]);
    const [limit, setLimit] = useState(initialLimit);
    const initialPage = useMemo(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const p = parseInt(params.get("page"), 10);
            return !isNaN(p) && p > 0 ? p : 1;
        }
        return 1;
    }, []);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const dealsSectionRef = useRef(null);

    const authToken = Cookies.get('accessToken'); // or from cookies
    const searchParams = useSearchParams();

    const [viewType, setViewType] = useState('list'); // 'grid' or 'list'
    const [showBtn, setShowBtn] = useState(-1);

    const [companySearch, setCompanySearch] = useState("");
    const [sortBy, setSortBy] = useState(() => {
        return searchParams?.get("sort_by") || searchParams?.get("sortBy") || initialSort || "latest";
    });

    const updatePageInUrl = (page, sort = sortBy, currentLimit = limit, tags = selectedTags, filters = appliedFilters) => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        if (page > 1) {
            url.searchParams.set("page", page);
        } else {
            url.searchParams.delete("page");
        }
        const currentResponsiveLimit = getResponsiveDealLimit(window.innerWidth);
        if (currentLimit && isUserLimitManual.current && currentLimit !== currentResponsiveLimit) {
            url.searchParams.set("limit", currentLimit);
        } else {
            url.searchParams.delete("limit");
        }
        if (sort && sort !== "latest") {
            url.searchParams.set("sort_by", sort);
        } else {
            url.searchParams.delete("sort_by");
            url.searchParams.delete("sortBy");
        }
        if (tags && tags.length > 0) {
            url.searchParams.set("tag", tags.join(","));
        } else {
            url.searchParams.delete("tag");
            url.searchParams.delete("tags");
        }
        if (filters?.sectors && filters.sectors.length > 0) {
            url.searchParams.set("sector", filters.sectors.join(","));
        } else {
            url.searchParams.delete("sector");
            url.searchParams.delete("sectors");
        }
        window.history.pushState(null, "", url.toString());
    };
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [tagSearch, setTagSearch] = useState("");
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [selectedTags, setSelectedTags] = useState(() => {
        const tagParam = searchParams?.get("tag") || searchParams?.get("tags");
        if (tagParam) {
            return [tagParam.trim()];
        }
        return [];
    });
    const [fetchedTags, setFetchedTags] = useState([]);
    const [fetchedSectors, setFetchedSectors] = useState([]);

    const sortDropdownRef = useRef(null);
    const mobileSortDropdownRef = useRef(null);
    const tagDropdownRef = useRef(null);

    // Desktop Table View: Persistent Hover & Smooth Closing State with Intent Delay
    const [activeDealId, setActiveDealId] = useState(null);
    const [closingDealId, setClosingDealId] = useState(null);
    const openTimerRef = useRef(null);
    const closeTimerRef = useRef(null);
    const leaveTimerRef = useRef(null);

    const handleHoverDeal = useCallback((dealId) => {
        // Clear any pending leave/close timer
        if (leaveTimerRef.current) {
            clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = null;
        }

        // Clear any pending open timer from another card
        if (openTimerRef.current) {
            clearTimeout(openTimerRef.current);
            openTimerRef.current = null;
        }

        // Delay opening by 80ms so the card opens quickly when intended
        openTimerRef.current = setTimeout(() => {
            setActiveDealId((prevActive) => {
                if (prevActive === dealId) return prevActive;
                if (prevActive) {
                    setClosingDealId(prevActive);
                    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                    closeTimerRef.current = setTimeout(() => {
                        setClosingDealId(null);
                    }, 380);
                }
                return dealId;
            });
            setClosingDealId((prevClosing) => {
                if (prevClosing === dealId) {
                    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                    return null;
                }
                return prevClosing;
            });
        }, 80);
    }, []);

    const handleHoverLeave = useCallback((dealId) => {
        // Cancel pending open timer if user swiped past before delay completed
        if (openTimerRef.current) {
            clearTimeout(openTimerRef.current);
            openTimerRef.current = null;
        }

        // Clear any existing leave timer
        if (leaveTimerRef.current) {
            clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = null;
        }

        // When mouse leaves the card, smoothly close back to compact form after 120ms
        leaveTimerRef.current = setTimeout(() => {
            setActiveDealId((prevActive) => {
                if (prevActive === dealId) {
                    return null;
                }
                return prevActive;
            });
        }, 120);
    }, []);

    const handleCloseActiveDeal = useCallback(() => {
        if (openTimerRef.current) {
            clearTimeout(openTimerRef.current);
            openTimerRef.current = null;
        }
        if (leaveTimerRef.current) {
            clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = null;
        }
        setActiveDealId((prevActive) => {
            if (prevActive) {
                setClosingDealId(prevActive);
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                closeTimerRef.current = setTimeout(() => {
                    setClosingDealId(null);
                }, 380);
            }
            return null;
        });
    }, []);

    // Global listener: close active expanded card smoothly when user clicks any button/interactive control
    useEffect(() => {
        const handleGlobalClick = (e) => {
            const btn = e.target.closest('button, [role="button"], input[type="button"], input[type="submit"], a, select') ||
                        e.target.closest(`.${stylesdeals.tabItem}`) ||
                        e.target.closest(`.${stylesdeals.sortOption}`) ||
                        e.target.closest(`.${stylesdeals.viewToggleBtn}`) ||
                        e.target.closest(`.${stylesdeals.pill}`) ||
                        e.target.closest(`.${stylesdeals.selectedTagPill}`) ||
                        e.target.closest(`.${stylesdeals.companySearchClear}`);
            if (btn) {
                handleCloseActiveDeal();
            }
        };
        window.addEventListener('click', handleGlobalClick, true);
        return () => {
            window.removeEventListener('click', handleGlobalClick, true);
            if (openTimerRef.current) clearTimeout(openTimerRef.current);
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        };
    }, [handleCloseActiveDeal]);

    useEffect(() => {
        if (openTimerRef.current) clearTimeout(openTimerRef.current);
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        setActiveDealId(null);
        setClosingDealId(null);
    }, [currentPage, viewType]);

    const sortOptions = useMemo(() => {
        const isUnlisted = (selectedDealType || "").toLowerCase() === "unlisted";
        const allOptions = [
            { label: "Latest", value: "latest" },
            { label: "Closing Soon", value: "closing_soon" },
            { label: "Most Viewed", value: "most_viewed" },
            { label: "High Conviction", value: "high_conviction" }
        ];
        if (isUnlisted) {
            return allOptions.filter(opt => opt.value !== "closing_soon");
        }
        return allOptions;
    }, [selectedDealType]);

    useEffect(() => {
        if ((selectedDealType || "").toLowerCase() === "unlisted" && sortBy === "closing_soon") {
            setSortBy("latest");
        }
    }, [selectedDealType, sortBy]);

    const [showSignin, setShowSignin] = useState(false);
    const [showSignupType, setShowSignupType] = useState(false);
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [otpSource, setOtpSource] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signinEmail, setSigninEmail] = useState("");
    const [qaCounts, setQaCounts] = useState({});
    const [replies, setReplies] = useState({}); // Store replies per dealId: { [dealId]: data }
    const [countLoading, setCountLoading] = useState(false);
    const [countError, setCountError] = useState(false)
    const [redirectPath, setRedirectPath] = useState(null);

    const [showDealTypeDropdown, setShowDealTypeDropdown] = useState(false);
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDealTypeDropdown(false);
            }
            const clickedSort = (sortDropdownRef.current && sortDropdownRef.current.contains(event.target)) ||
                                (mobileSortDropdownRef.current && mobileSortDropdownRef.current.contains(event.target));
            if (!clickedSort) {
                setShowSortDropdown(false);
            }
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
                setShowTagDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const removeFilter = (category, value) => {
        setAppliedFilters(prev => {
            if (!prev) return null;
            const updated = { ...prev };
            if (category === 'ticketSize' || category === 'valuationRange') {
                delete updated[category];
            } else if (Array.isArray(updated[category])) {
                updated[category] = updated[category].filter(v => v !== value);
                if (updated[category].length === 0) delete updated[category];
            } else {
                delete updated[category];
            }
            const hasRemaining = Object.entries(updated).some(([key, val]) => {
                if (Array.isArray(val)) return val.length > 0;
                return val != null;
            });
            return hasRemaining ? updated : null;
        });
    };

    const dealTypeTabs = [
        { label: "ALL", value: "All", slug: "" },
        { label: "Upcoming IPO", value: "Upcoming", slug: "upcoming-ipo" },
        { label: "IPO", value: "Public", slug: "ipo" },
        { label: "Unlisted Shares", value: "Unlisted", slug: "unlisted-shares" },
        { label: "Private Deals", value: "Private", slug: "private-deals" },
        { label: "Startup Deals", value: "Startup", slug: "startup-deals" }
    ];

    const getCategoryHeading = () => {
        const type = (selectedDealType || "").toLowerCase();
        switch (type) {
            case "upcoming":
                return "Upcoming IPO Deals & Issues";
            case "public":
                return "Live IPO Deals & Investment Opportunities";
            case "unlisted":
                return "Unlisted Shares & Pre-IPO Investments";
            case "private":
                return "Exclusive Private Equity Deals";
            case "startup":
                return "Curated Startup Deals & Venture Investments";
            default:
                return "Invest Opportunities";
        }
    };

    const getCategorySubtitle = () => {
        const type = (selectedDealType || "").toLowerCase();
        switch (type) {
            case "upcoming":
                return "Discover upcoming IPOs and pre-IPO investment opportunities on PrEqt. Access live analytics, timeline tracking, and issue size details.";
            case "public":
                return "Access verified IPO opportunities with live GMP, valuation scores, financials, and company analytics on PrEqt.";
            case "unlisted":
                return "Invest in verified unlisted company shares, explore valuations, price trends, and financial reports on PrEqt.";
            case "private":
                return "Explore institutional-grade private equity opportunities and exclusive co-investment deals on PrEqt.";
            case "startup":
                return "Invest in high-growth startups and venture-backed companies. Verified deal flow for early-stage capital.";
            default:
                return "Browse through institutional-grade private equity, SME IPOs, and unlisted shares. Verified data for sophisticated capital.";
        }
    };

    // Keep Zustand store and active category in sync when pathname/props change externally
    useEffect(() => {
        const cat = categoryFromPath || initialCategory || "All";
        setSelectedDealTypeState(cat);
        setSelectedDealType(cat);
    }, [categoryFromPath, initialCategory, setSelectedDealType]);

    // Handle tab clicks smoothly in-page without full page refresh
    const handleTabClick = (e, tab) => {
        if (e && e.preventDefault) e.preventDefault();
        if (selectedDealType === tab.value) return;

        setSelectedDealTypeState(tab.value);
        setSelectedDealType(tab.value);
        setCurrentPage(1);

        const newPath = tab.slug ? `/deals/${tab.slug}` : "/deals";
        if (typeof window !== "undefined" && window.location.pathname !== newPath) {
            window.history.pushState({ category: tab.value }, "", newPath);
        }
    };

    useEffect(() => {
        const typeParam = searchParams?.get("type");
        if (typeParam) {
            const matchingTab = dealTypeTabs.find(
                (tab) => tab.value.toLowerCase() === typeParam.toLowerCase() || tab.label.toLowerCase() === typeParam.toLowerCase()
            );
            if (matchingTab) {
                setSelectedDealType(matchingTab.value);
            }
        }
    }, [searchParams, setSelectedDealType]);

    const [filterOptionsData, setFilterOptionsData] = useState(null);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const token = Cookies.get('accessToken');
                const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
                const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
                const res = await fetch(`${baseUrl}admin/api/deals/filter-options`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                });
                if (res.ok) {
                    const result = await res.json();
                    const options = result?.data?.data || result?.data || {};
                    setFilterOptionsData(options);
                }
            } catch (err) {
                console.error("Error fetching filter options:", err);
            }
        };
        fetchFilterOptions();
    }, []);

    const availableStages = useMemo(() => {
        if (Array.isArray(filterOptionsData?.dealStages) && filterOptionsData.dealStages.length > 0) {
            return Array.from(new Set(filterOptionsData.dealStages.map(s => String(s).trim()).filter(Boolean)));
        }
        return ["IPO – SME", "IPO – Mainboard", "Pre-IPO – SME", "Pre-IPO – Mainboard", "Early Stage", "Growth Stage", "Late Stage"];
    }, [filterOptionsData]);

    const ticketSizeData = useMemo(() => {
        const ts = filterOptionsData?.ticketSize;
        return {
            min: typeof ts?.min === 'number' ? ts.min : 0,
            max: typeof ts?.max === 'number' ? ts.max : 10000,
            ranges: Array.isArray(ts?.ranges) ? ts.ranges : [],
            options: Array.isArray(ts?.options) ? ts.options : [],
        };
    }, [filterOptionsData]);

    const valuationRangeData = useMemo(() => {
        const vr = filterOptionsData?.valuationRange;
        return {
            min: typeof vr?.min === 'number' ? vr.min : 0,
            max: typeof vr?.max === 'number' ? vr.max : 20000,
            ranges: Array.isArray(vr?.ranges) ? vr.ranges : [],
            options: Array.isArray(vr?.options) ? vr.options : [],
        };
    }, [filterOptionsData]);

    const availableActivities = useMemo(() => {
        if (Array.isArray(filterOptionsData?.activities) && filterOptionsData.activities.length > 0) {
            return Array.from(new Set(filterOptionsData.activities.map(a => String(a).trim()).filter(Boolean)));
        }
        return ["New Deals", "Trending Deals", "Most Viewed", "Recently Updated", "Closing Soon"];
    }, [filterOptionsData]);

    const availableFundingStatus = useMemo(() => {
        const fs = filterOptionsData?.fundingStatus || filterOptionsData?.funding_status || filterOptionsData?.funding;
        if (Array.isArray(fs) && fs.length > 0) {
            return Array.from(new Set(fs.map(f => String(f).trim()).filter(Boolean)));
        }
        return ["< 50%", "50% - 80%", "80%+"];
    }, [filterOptionsData]);

    const availableParticipations = useMemo(() => {
        if (Array.isArray(filterOptionsData?.participation) && filterOptionsData.participation.length > 0) {
            return Array.from(new Set(filterOptionsData.participation.map(p => String(p).trim()).filter(Boolean)));
        }
        return ["Merchant Banker Appointed", "Anchor / Strategic Investors", "Institutional / Fund Participation", "Strong Promoter Background"];
    }, [filterOptionsData]);

    const availableSectors = useMemo(() => {
        if (!fetchedSectors || !Array.isArray(fetchedSectors)) return [];
        const sectorSet = new Set();
        fetchedSectors.forEach(s => {
            const name = typeof s === 'string'
                ? s.trim()
                : (s && typeof s === 'object' ? (s.name || s.sector || s.sector_name || s.title || s.label || s.value || '') : '');
            if (name) sectorSet.add(name);
        });
        return Array.from(sectorSet).sort((a, b) => a.localeCompare(b));
    }, [fetchedSectors]);

    useEffect(() => {
        const fetchCompanySectors = async () => {
            try {
                const token = Cookies.get('accessToken');
                const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
                const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
                const res = await fetch(`${baseUrl}admin/api/deals/company-sectors`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                });
                if (res.ok) {
                    const result = await res.json();
                    let sectorArray = [];
                    if (result?.data?.data && Array.isArray(result.data.data)) {
                        sectorArray = result.data.data;
                    } else if (result?.data && Array.isArray(result.data)) {
                        sectorArray = result.data;
                    } else if (Array.isArray(result)) {
                        sectorArray = result;
                    }
                    const parsedSectors = sectorArray
                        .map(s => {
                            if (typeof s === 'string') return s.trim();
                            if (s && typeof s === 'object') {
                                return (s.name || s.sector || s.sector_name || s.title || s.label || s.value || '').trim();
                            }
                            return '';
                        })
                        .filter(Boolean);

                    setFetchedSectors([...new Set(parsedSectors)]);
                }
            } catch (err) {
                console.error("Failed to fetch company sectors:", err);
            }
        };

        fetchCompanySectors();
    }, []);

    useEffect(() => {
        const fetchDealTags = async () => {
            try {
                const token = Cookies.get('accessToken');
                const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
                const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
                const res = await fetch(`${baseUrl}admin/api/deals/get-all-deal-tags`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                });
                if (res.ok) {
                    const result = await res.json();
                    let tagArray = [];
                    if (result?.data?.data && Array.isArray(result.data.data)) {
                        tagArray = result.data.data;
                    } else if (result?.data && Array.isArray(result.data)) {
                        tagArray = result.data;
                    }
                    if (tagArray.length > 0) {
                        setFetchedTags(tagArray);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch deal tags:", err);
            }
        };

        fetchDealTags();
    }, []);

    const allAvailableTags = useMemo(() => {
        const tagSet = new Set();
        const addCleanTag = (str) => {
            if (!str || str === '[object Object]') return;
            const clean = String(str).trim();
            if (clean && clean !== '[object Object]') tagSet.add(clean);
        };

        if (fetchedTags && Array.isArray(fetchedTags)) {
            fetchedTags.forEach(t => addCleanTag(t));
        }
        if (allDeals && Array.isArray(allDeals)) {
            allDeals.forEach(deal => {
                if (Array.isArray(deal.tags)) {
                    deal.tags.forEach(t => {
                        const tagText = typeof t === 'string' ? t.trim() : (t && typeof t === 'object' ? (t.name || t.tag || t.label || t.title || '') : '');
                        addCleanTag(tagText);
                    });
                }
                if (Array.isArray(deal.key_highlights)) {
                    deal.key_highlights.forEach(h => {
                        const hText = typeof h === 'string' ? h.trim() : (h && typeof h === 'object' ? (h.name || h.tag || h.label || h.title || '') : '');
                        addCleanTag(hText);
                    });
                }
                if (Array.isArray(deal.companies_sectors)) {
                    deal.companies_sectors.forEach(s => {
                        const secText = typeof s === 'string' ? s.trim() : (s?.name || s?.sector || '');
                        addCleanTag(secText);
                    });
                }
                if (deal.sector_industry) {
                    addCleanTag(deal.sector_industry);
                }
                if (deal.company_stage) {
                    addCleanTag(deal.company_stage);
                }
                if (deal.stage) {
                    addCleanTag(deal.stage);
                }
            });
        }
        if (tagSet.size === 0) {
            ["SME", "IPO", "High Conviction", "Manufacturing", "Pre-IPO", "Unlisted", "Tech", "Saas", "Fintech", "AI"].forEach(t => tagSet.add(t));
        }
        return Array.from(tagSet);
    }, [allDeals, fetchedTags]);

    const suggestedTags = useMemo(() => {
        const query = tagSearch.trim().toLowerCase();
        return allAvailableTags.filter(tag => {
            if (selectedTags.some(st => st.toLowerCase() === tag.toLowerCase())) return false;
            if (!query) return true;
            return tag.toLowerCase().includes(query);
        });
    }, [allAvailableTags, tagSearch, selectedTags]);

    const handleAddTag = (tag) => {
        if (!tag) return;
        const trimmed = String(tag).trim();
        if (!selectedTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
            setSelectedTags(prev => [...prev, trimmed]);
        }
        setTagSearch("");
        setShowTagDropdown(false);
    };

    useEffect(() => {
        const tagParam = searchParams?.get("tag") || searchParams?.get("tags");
        if (tagParam) {
            handleAddTag(tagParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const sectorParam = searchParams?.get("sector") || searchParams?.get("sectors");
        if (sectorParam) {
            const splitSectors = sectorParam.split(",").map(s => s.trim()).filter(Boolean);
            if (splitSectors.length > 0) {
                setAppliedFilters(prev => {
                    const currentSectors = Array.isArray(prev?.sectors) ? prev.sectors : [];
                    const merged = Array.from(new Set([...currentSectors, ...splitSectors]));
                    return {
                        ...(prev || {}),
                        sectors: merged
                    };
                });
            }
        }
    }, [searchParams, setAppliedFilters]);

    const handleRemoveTag = (tagToRemove) => {
        setSelectedTags(prev => prev.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()));
    };

    const handleClearAllTags = () => {
        setSelectedTags([]);
        setTagSearch("");
    };

    const matchTag = (deal, tag) => {
        if (!deal || !tag) return false;
        const t = tag.trim().toLowerCase();
        if (Array.isArray(deal.tags) && deal.tags.some(item => {
            const str = typeof item === 'string' ? item : (item && typeof item === 'object' ? (item.name || item.tag || item.label || item.title || '') : '');
            return str && (str.toLowerCase() === t || str.toLowerCase().includes(t) || t.includes(str.toLowerCase()));
        })) return true;
        if (Array.isArray(deal.key_highlights) && deal.key_highlights.some(item => {
            const str = typeof item === 'string' ? item : (item && typeof item === 'object' ? (item.name || item.tag || item.label || item.title || '') : '');
            return str && (str.toLowerCase() === t || str.toLowerCase().includes(t) || t.includes(str.toLowerCase()));
        })) return true;
        if (t === "sme" && (deal.is_sme || (deal.deal_type || '').toLowerCase() === 'public' || (deal.tags && deal.tags.some(x => {
            const str = typeof x === 'string' ? x : (x && typeof x === 'object' ? (x.name || x.tag || x.label || x.title || '') : '');
            return str && str.toLowerCase().includes('sme');
        })))) return true;
        if (t === "ipo" && ((deal.deal_type || '').toLowerCase() === 'public' || (deal.deal_type || '').toLowerCase() === 'upcoming')) return true;
        if (t === "high conviction" && (deal.hight_conviction === true || deal.hight_conviction === "true" || deal.high_conviction === true || deal.high_conviction === "true")) return true;
        if (Array.isArray(deal.companies_sectors) && deal.companies_sectors.some(s => {
            const secText = typeof s === 'string' ? s.toLowerCase() : (s?.name || s?.sector || '').toLowerCase();
            return secText && (secText === t || secText.includes(t) || t.includes(secText));
        })) return true;
        if (deal.deal_setpData) {
            const stepTags = Array.isArray(deal.deal_setpData.tags) ? deal.deal_setpData.tags : (deal.deal_setpData.tags?.data || []);
            if (Array.isArray(stepTags) && stepTags.some(item => {
                const str = typeof item === 'string' ? item : (item?.name || item?.tag || item?.label || item?.title || '');
                return str && (str.toLowerCase() === t || str.toLowerCase().includes(t) || t.includes(str.toLowerCase()));
            })) return true;
            const stepSectors = Array.isArray(deal.deal_setpData.companies_sectors) ? deal.deal_setpData.companies_sectors : (deal.deal_setpData.companies_sectors?.data || []);
            if (Array.isArray(stepSectors) && stepSectors.some(s => {
                const secText = typeof s === 'string' ? s.toLowerCase() : (s?.name || s?.sector || s?.label || '').toLowerCase();
                return secText && (secText === t || secText.includes(t) || t.includes(secText));
            })) return true;
        }
        if (deal.sector_industry && (deal.sector_industry.toLowerCase().includes(t) || t.includes(deal.sector_industry.toLowerCase()))) return true;
        if (deal.company_stage && (deal.company_stage.toLowerCase().includes(t) || t.includes(deal.company_stage.toLowerCase()))) return true;
        if (deal.stage && (deal.stage.toLowerCase().includes(t) || t.includes(deal.stage.toLowerCase()))) return true;
        if (deal.company_name && (deal.company_name.toLowerCase().includes(t) || t.includes(deal.company_name.toLowerCase()))) return true;
        return false;
    };

    const filteredDeals = useMemo(() => {
        // For Private and Startup deals, we do NOT show deal cards - only the UnlockTeaser banner is displayed
        const isPrivateOrStartup = (selectedDealType || '').toLowerCase() === "private" || (selectedDealType || '').toLowerCase() === "startup";
        if (isPrivateOrStartup) {
            return [];
        }

        // Restrict rendered opportunities to selected types (case-insensitive)
        let deals = allDeals.filter(deal => {
            const type = (deal.deal_type || '').toLowerCase();
            return type === 'public' || type === 'unlisted';
        });

        // 1. Deal Type (Tabs)
        if (selectedDealType === "Upcoming") {
            deals = deals.filter(deal => {
                const type = (deal.deal_type || '').toLowerCase();
                if (type !== 'public') return false;
                const statusRaw = (deal.hidden_status || '').toLowerCase();
                return statusRaw === 'upcoming' || statusRaw === 'up comming' || statusRaw === 'draft' || (statusRaw !== 'live' && statusRaw !== 'closed');
            });
        } else if (selectedDealType === "Public") {
            deals = deals.filter(deal => (deal.deal_type || '').toLowerCase() === 'public');
        } else if (selectedDealType !== "All") {
            deals = deals.filter(deal => (deal.deal_type || '').toLowerCase() === selectedDealType.toLowerCase());
        }

        // 2. Applied Filters - Sectors
        if (appliedFilters?.sectors && appliedFilters.sectors.length > 0) {
            deals = deals.filter(deal => {
                const sList = Array.isArray(deal.companies_sectors) ? deal.companies_sectors : (deal.companies_sectors?.data || []);
                const stepSList = Array.isArray(deal.deal_setpData?.companies_sectors) ? deal.deal_setpData.companies_sectors : (deal.deal_setpData?.companies_sectors?.data || []);
                const allSectors = [...sList, ...stepSList, deal.sector_industry].filter(Boolean).map(s => {
                    return typeof s === 'string' ? s.toLowerCase().trim() : (s?.name || s?.sector || s?.label || '').toLowerCase().trim();
                });
                return appliedFilters.sectors.some(sec => {
                    const targetSec = sec.toLowerCase().trim();
                    return allSectors.some(s => s === targetSec || s.includes(targetSec) || targetSec.includes(s));
                });
            });
        }

        // 3. Search Company Query
        if (companySearch && companySearch.trim()) {
            const query = companySearch.trim().toLowerCase();
            deals = deals.filter(deal => {
                const name = (deal.company_name || '').toLowerCase();
                const brand = (deal.brand_name || '').toLowerCase();
                const intro = (deal.company_intro || '').toLowerCase();
                const tagline = (deal.tag_line || '').toLowerCase();
                const symbol = (deal.symbol || '').toLowerCase();
                return name.includes(query) || brand.includes(query) || intro.includes(query) || tagline.includes(query) || symbol.includes(query);
            });
        }

        // 4. Selected Tags Filter
        if (selectedTags.length > 0) {
            deals = deals.filter(deal => selectedTags.every(tag => matchTag(deal, tag)));
        }

        // 5. Sorting
        // =====================================================================
        // Sorting Strategies:
        // - "closing_soon":
        //     1. Only includes public deals that are not explicitly marked closed.
        //     2. Preserves deals closing today (keeps them active until 23:59:59).
        //     3. Deals closing TODAY appear at the very top of the list.
        //     4. Future closing deals appear in ascending order (nearest date first).
        //     5. Secondary sort: newest createdAt descending.
        // - "most_viewed":
        //     Sorts deals by user visit count descending.
        // - "high_conviction":
        //     Filters exclusively for high-conviction deals, sorted by latest createdAt.
        // - "latest" (Default):
        //     Sorts deals by creation date descending (newest deals first).
        // =====================================================================
        if (sortBy === 'closing_soon') {
            const now = new Date();
            const todayYear = now.getFullYear();
            const todayMonth = now.getMonth();
            const todayDate = now.getDate();
            const startOfToday = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0).getTime();

            // Helper to determine if a parsed close date matches today's calendar date
            const isToday = (parsed) => {
                if (!parsed) return false;
                return parsed.year === todayYear && parsed.month === todayMonth && parsed.day === todayDate;
            };

            // Step 1: Filter out non-public deals, closed deals, and deals that closed strictly before today
            deals = deals.filter(deal => {
                const isPublic = (deal.deal_type || '').toLowerCase() === 'public';
                if (!isPublic) return false;

                // Exclude explicitly closed deals
                const statusRaw = (deal.hidden_status || deal.status || '').toLowerCase().trim();
                if (statusRaw === 'closed' || statusRaw === 'round closed') return false;

                // Exclude deals whose closing date ended strictly before today
                const closeDateStr = deal.timeline_ipo_close_date || deal.bidding_end_date || deal.close_date;
                if (closeDateStr) {
                    const parsed = parseCloseDate(closeDateStr);
                    if (parsed && parsed.endOfDay < startOfToday) {
                        return false; // Close date expired before today
                    }
                }

                return true;
            });

            // Step 2: Sort deals with today's closing deals prioritized at the top
            deals = [...deals].sort((a, b) => {
                const aDateStr = a.timeline_ipo_close_date || a.bidding_end_date || a.close_date;
                const bDateStr = b.timeline_ipo_close_date || b.bidding_end_date || b.close_date;

                const aParsed = parseCloseDate(aDateStr);
                const bParsed = parseCloseDate(bDateStr);

                const aIsToday = isToday(aParsed);
                const bIsToday = isToday(bParsed);

                // Priority 1: Deals closing TODAY come at the very top
                if (aIsToday && !bIsToday) return -1;
                if (!aIsToday && bIsToday) return 1;

                // Priority 2: Sort upcoming deals in ascending order (nearest closing date first)
                const aTime = aParsed ? aParsed.startOfDay : null;
                const bTime = bParsed ? bParsed.startOfDay : null;

                const aHasDate = aTime !== null;
                const bHasDate = bTime !== null;

                if (aHasDate && bHasDate) {
                    if (aTime !== bTime) return aTime - bTime;
                } else if (aHasDate) {
                    return -1;
                } else if (bHasDate) {
                    return 1;
                }

                // Priority 3: Secondary sort by creation date (newest first)
                const aCreated = new Date(a.createdAt || a.created_at || 0).getTime();
                const bCreated = new Date(b.createdAt || b.created_at || 0).getTime();
                return bCreated - aCreated;
            });
        } else if (sortBy === 'most_viewed') {
            // Sort by views / user visits in descending order
            deals = [...deals].sort((a, b) => {
                const aViews = parseFloat(a.user_visited_count ?? a.views ?? a.visit_count ?? 0) || 0;
                const bViews = parseFloat(b.user_visited_count ?? b.views ?? b.visit_count ?? 0) || 0;
                return bViews - aViews;
            });
        } else if (sortBy === 'high_conviction') {
            // Filter exclusively for deals marked as High Conviction, then sort by newest first
            deals = deals.filter(deal =>
                deal.hight_conviction === true ||
                deal.hight_conviction === "true" ||
                deal.high_conviction === true ||
                deal.high_conviction === "true"
            );
            deals = [...deals].sort((a, b) => {
                const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
                const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
                return bTime - aTime;
            });
        } else {
            // Default: "latest" (sort by createdAt descending, newest deals first)
            deals = [...deals].sort((a, b) => {
                const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
                const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
                return bTime - aTime;
            });
        }

        return deals;
    }, [allDeals, selectedDealType, appliedFilters, companySearch, selectedTags, sortBy]);

    // Reset page to 1 whenever any filter, search, tags, or sort change
    useEffect(() => {
        if (isFirstRender.current) return;
        setCurrentPage(1);
        updatePageInUrl(1, sortBy);
    }, [selectedDealType, appliedFilters, companySearch, selectedTags, sortBy]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event) => {
            const currentPath = window.location.pathname;
            const slug = currentPath.replace(/^\/deals\/?/, "").split("/")[0];
            const aliasMap = {
                "upcoming-ipo": "Upcoming",
                "upcoming": "Upcoming",
                "upcoming-ipos": "Upcoming",
                "ipo": "Public",
                "public": "Public",
                "ipos": "Public",
                "unlisted-shares": "Unlisted",
                "unlisted": "Unlisted",
                "private-deals": "Private",
                "private": "Private",
                "startup-deals": "Startup",
                "startup": "Startup"
            };
            const detectedCategory = event?.state?.category || (slug ? (aliasMap[slug] || "All") : "All");
            setSelectedDealTypeState(detectedCategory);
            setSelectedDealType(detectedCategory);

            const params = new URLSearchParams(window.location.search);
            const pageParam = parseInt(params.get("page"), 10);
            const targetPage = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
            const sortParam = params.get("sort_by") || params.get("sortBy") || "latest";
            const limitParam = parseInt(params.get("limit"), 10);
            const targetLimit = !isNaN(limitParam) && limitParam > 0 ? limitParam : getResponsiveDealLimit(window.innerWidth);
            if (!isNaN(limitParam) && limitParam > 0) {
                isUserLimitManual.current = true;
            } else {
                isUserLimitManual.current = false;
            }
            setCurrentPage(targetPage);
            if (targetLimit !== limit) {
                setLimit(targetLimit);
            }
            if (sortParam !== sortBy) {
                setSortBy(sortParam);
            }
            const tagParam = params.get("tag") || params.get("tags");
            const newTags = tagParam ? [tagParam.trim()] : [];
            setSelectedTags(newTags);

            const sectorParam = params.get("sector") || params.get("sectors");
            const newSectors = sectorParam ? sectorParam.split(",").map(s => s.trim()).filter(Boolean) : [];
            let updatedFilters = appliedFilters;
            if (newSectors.length > 0) {
                updatedFilters = { ...(appliedFilters || {}), sectors: newSectors };
                setAppliedFilters(updatedFilters);
            } else if (appliedFilters?.sectors) {
                const copy = { ...appliedFilters };
                delete copy.sectors;
                updatedFilters = Object.keys(copy).length > 0 ? copy : null;
                setAppliedFilters(updatedFilters);
            }
            fetchDeals(targetPage, detectedCategory, companySearch, newTags, updatedFilters, sortParam, targetLimit);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [companySearch, selectedTags, appliedFilters, sortBy, limit, setSelectedDealType]);

    // Mount check: ensure initial fetch matches client screen's responsive limit if no manual limit in URL
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const manualLimit = parseInt(params.get("limit"), 10);
        if (!isNaN(manualLimit) && manualLimit > 0) {
            isUserLimitManual.current = true;
            return;
        }
        const responsiveLimit = getResponsiveDealLimit(window.innerWidth);
        setLimit(responsiveLimit);
        const currentInitialLimit = Number(initialPagination?.limit) || 16;
        if (responsiveLimit !== currentInitialLimit) {
            fetchDeals(currentPage, selectedDealType, companySearch, selectedTags, appliedFilters, sortBy, responsiveLimit);
        }
    }, []);

    // Window resize listener: automatically adapt pagination limit when crossing breakpoints
    useEffect(() => {
        if (typeof window === "undefined") return;

        let resizeTimer = null;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (isUserLimitManual.current) return;
                const newLimit = getResponsiveDealLimit(window.innerWidth);
                setLimit((prevLimit) => {
                    if (newLimit !== prevLimit) {
                        setCurrentPage((prevPage) => {
                            const newPage = Math.max(1, Math.floor(((prevPage - 1) * prevLimit) / newLimit) + 1);
                            fetchDeals(newPage, selectedDealType, companySearch, selectedTags, appliedFilters, sortBy, newLimit);
                            return newPage;
                        });
                        return newLimit;
                    }
                    return prevLimit;
                });
            }, 150);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener("resize", handleResize);
        };
    }, [selectedDealType, companySearch, selectedTags, appliedFilters, sortBy]);

    const totalCount = Number(
        pagination?.totalRecords ??
        pagination?.total ??
        pagination?.total_records ??
        pagination?.count ??
        totalRecords ??
        allDeals.length ??
        0
    );
    const effectiveLimit = Number(limit || pagination?.limit || 15);
    const totalPages = Math.max(
        1,
        Number(pagination?.totalPages || pagination?.total_pages || pagination?.pages) ||
        Math.ceil(totalCount / effectiveLimit)
    );

    const dealsToRender = useMemo(() => {
        if (allDeals.length <= effectiveLimit) {
            return filteredDeals;
        }
        const startIndex = (currentPage - 1) * effectiveLimit;
        return filteredDeals.slice(startIndex, startIndex + effectiveLimit);
    }, [filteredDeals, allDeals.length, currentPage, effectiveLimit]);

    const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * effectiveLimit + 1;
    const endRecord = totalCount === 0 ? 0 : Math.min(currentPage * effectiveLimit, totalCount);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setCurrentPage(page);
        updatePageInUrl(page, sortBy, effectiveLimit);
        fetchDeals(page, selectedDealType, companySearch, selectedTags, appliedFilters, sortBy, effectiveLimit);
        if (dealsSectionRef.current) {
            dealsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const buildPageHref = useCallback((page) => {
        const basePath = pathname || "/deals";
        const params = new URLSearchParams();
        if (page && page > 1) {
            params.set("page", String(page));
        }
        if (sortBy && sortBy !== "latest") {
            params.set("sort_by", sortBy);
        }
        if (limit && limit !== 16 && isUserLimitManual.current) {
            params.set("limit", String(limit));
        }
        const qs = params.toString();
        return qs ? `${basePath}?${qs}` : basePath;
    }, [pathname, sortBy, limit]);

    const handleLimitChange = (newLimit) => {
        isUserLimitManual.current = true;
        setLimit(newLimit);
        setCurrentPage(1);
        updatePageInUrl(1, sortBy, newLimit);
        fetchDeals(1, selectedDealType, companySearch, selectedTags, appliedFilters, sortBy, newLimit);
        if (dealsSectionRef.current) {
            dealsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const getPageNumbers = (current, total) => {
        if (total <= 4) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages = new Set();
        // First 2 pages
        pages.add(1);
        pages.add(2);

        // Active page if in middle
        if (current > 2 && current < total - 1) {
            pages.add(current);
        }

        // Last 2 pages
        pages.add(total - 1);
        pages.add(total);

        const sorted = Array.from(pages).sort((a, b) => a - b);
        const result = [];
        for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
                result.push('...');
            }
            result.push(sorted[i]);
        }
        return result;
    };

    const formatDealType = (type) => {
        if (type === "All") return "All Deals";
        if (type.toLowerCase() === "ccps") return "CCPS Deals";
        if (type.toLowerCase() === "unlisted") return "unlisted Deals";
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + " Deals";
    };


    const formatNumberWithCommas = (num) => {
        if (num === null || num === undefined) return "";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    useEffect(() => {
        const shouldShowSignin = searchParams?.get("showSignin") === "true";
        if (!shouldShowSignin) return;

        // Capture redirect target (original deal page) if present
        const redirectParam = searchParams?.get("redirect");
        if (redirectParam) {
            setRedirectPath(redirectParam);
        }

        setShowSignin(true);

        const updatedParams = new URLSearchParams(searchParams.toString());
        updatedParams.delete("showSignin");
        updatedParams.delete("redirect");

        const nextUrl = updatedParams.toString()
            ? `/deals?${updatedParams.toString()}`
            : "/deals";

        router.replace(nextUrl);
    }, [searchParams, router]);

    // Q&A counts and replies are now lazily loaded per visible card via CardFooter's Viewport IntersectionObserver

    function daysUntilLive(liveAt) {
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






    const [otpPayload, setOtpPayload] = useState(null);

    const handleSigninOpen = () => {
        setShowSignin(true);
    };


    // SIGN IN → EMAIL OTP
    const handleSigninShowOtp = (payload) => {
        if (!payload?.type || !payload?.identifier) {
            console.error("Invalid OTP payload", payload);
            return;
        }

        setOtpPayload({
            flow: "signin",
            ...payload,
        });

        setShowSignin(false);
    };

    // SIGN UP → MOBILE OTP
    const handleSignupShowOtp = ({ email, phone }) => {
        if (!phone) return;

        setOtpPayload({
            flow: "signup",
            type: "mobile",
            identifier: phone,
            verifyEndpoint: "verify-register-otp",
            resendEndpoint: "resend-registeration-otp",
            email, // keep for later
        });

        setShowSignupForm(false);
    };
    const closeOtp = () => {
        setOtpPayload(null);
    };

    /* 
    ==========================================================================
    LEGACY RENDER FUNCTIONS (COMMENTED AS REQUESTED)
    ==========================================================================
    
    const renderPublicCard = (deal) => { ... }
    const renderPrivateCard = (deal) => { ... }
    const renderHiddenCard = (index) => { ... }
    */



    const isFirstRender = useRef(true);

    useEffect(() => {
        if (initialDeals && initialDeals.length > 0) {
            setAllDeals(initialDeals);
            setLoading(false);
        }
        if (initialPagination && (initialPagination.totalRecords || initialPagination.total || initialPagination.total_records || initialPagination.count)) {
            setPagination(initialPagination);
            setTotalRecords(Number(initialPagination.totalRecords || initialPagination.total || initialPagination.total_records || initialPagination.count || 0));
            if (isUserLimitManual.current && initialPagination.limit) {
                setLimit(Number(initialPagination.limit));
            }
            if (initialPagination.page) {
                setCurrentPage(Number(initialPagination.page));
            }
        }
    }, [initialDeals, initialPagination]);

    const fetchDeals = async (
        page = currentPage,
        dealType = selectedDealType,
        search = companySearch,
        tags = selectedTags,
        filters = appliedFilters,
        sort = sortBy,
        limitVal = limit
    ) => {
        try {
            setLoading(true);
            setError(null);
            const token = Cookies.get('accessToken');

            let dealTypeQuery = "";
            const t = (dealType || "").toLowerCase();
            if (t === "unlisted") {
                dealTypeQuery = "deal_type=unlisted";
            } else if (t === "upcoming") {
                dealTypeQuery = "deal_type=public&is_upcoming=true";
            } else if (t === "public" || t === "ipo") {
                dealTypeQuery = "deal_type=public";
            } else if (t === "private") {
                dealTypeQuery = "deal_type=[private,ofs,ccps]";
            } else if (t === "startup") {
                dealTypeQuery = "deal_type=[startup]";
            } else if (t === "all" || !t) {
                dealTypeQuery = "deal_type=[unlisted,public]";
            }

            let queryString = `?page=${page}&limit=${limitVal}&${dealTypeQuery}`;

            if (sort) {
                queryString += `&sort_by=${encodeURIComponent(sort)}`;
            }

            if (search && search.trim()) {
                queryString += `&search=${encodeURIComponent(search.trim())}`;
            }

            // Tags (from tag selector or filter modal)
            const allTags = [
                ...(Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.trim() ? [tags] : [])),
                ...(Array.isArray(filters?.tags) ? filters.tags : (typeof filters?.tags === 'string' && filters.tags.trim() ? [filters.tags] : []))
            ];
            const cleanTags = Array.from(new Set(allTags.map(item => String(item).trim()).filter(Boolean)));
            if (cleanTags.length > 0) {
                queryString += `&tags=${encodeURIComponent(cleanTags.join(','))}`;
            }

            // Sectors
            const sectors = filters?.sectors;
            const cleanSectors = Array.isArray(sectors)
                ? sectors.map(item => String(item).trim()).filter(Boolean)
                : (typeof sectors === 'string' && sectors.trim() ? [sectors.trim()] : []);
            if (cleanSectors.length > 0) {
                queryString += `&sectors=${encodeURIComponent(cleanSectors.join(','))}`;
            }

            // Deal Stages
            const dealStages = filters?.dealStages;
            const cleanDealStages = Array.isArray(dealStages)
                ? dealStages.map(item => String(item).trim()).filter(Boolean)
                : (typeof dealStages === 'string' && dealStages.trim() ? [dealStages.trim()] : []);
            if (cleanDealStages.length > 0) {
                queryString += `&dealStages=${encodeURIComponent(cleanDealStages.join(','))}`;
            }

            // Deal Ratings
            const dealRatings = filters?.dealRatings;
            const cleanDealRatings = Array.isArray(dealRatings)
                ? dealRatings.map(item => String(item).trim()).filter(Boolean)
                : (typeof dealRatings === 'string' && dealRatings.trim() ? [dealRatings.trim()] : []);
            if (cleanDealRatings.length > 0) {
                const normalizedRatings = cleanDealRatings.map(r => {
                    const s = r.replace(/–/g, '-').trim();
                    if (s === '4.5 & above' || s === '4.5 and above') return '4.5+';
                    return s;
                });
                queryString += `&dealRatings=${encodeURIComponent(normalizedRatings.join(','))}`;
            }

            // Ticket Size
            if (filters?.ticketSize !== undefined && filters?.ticketSize !== null) {
                let ticketVal = "";
                if (Array.isArray(filters.ticketSize) && filters.ticketSize.length >= 2) {
                    const [min, max] = filters.ticketSize;
                    const maxLimit = ticketSizeData?.max || 10000;
                    if (max === null || max === undefined || (maxLimit && max >= maxLimit && min > 0)) {
                        ticketVal = `${min}+`;
                    } else {
                        ticketVal = `${min}-${max}`;
                    }
                } else if (typeof filters.ticketSize === 'string' && filters.ticketSize.trim()) {
                    ticketVal = filters.ticketSize.trim();
                }
                if (ticketVal) {
                    queryString += `&ticketSize=${encodeURIComponent(ticketVal)}`;
                }
            }

            // Funding Status
            const fundingStatus = filters?.fundingStatus;
            const cleanFundingStatus = Array.isArray(fundingStatus)
                ? fundingStatus.map(item => String(item).trim()).filter(Boolean)
                : (typeof fundingStatus === 'string' && fundingStatus.trim() ? [fundingStatus.trim()] : []);
            if (cleanFundingStatus.length > 0) {
                const normalizedFunding = cleanFundingStatus.map(s => {
                    return s.replace(/\s*Funded/i, '').replace(/–/g, '-').trim();
                });
                queryString += `&fundingStatus=${encodeURIComponent(normalizedFunding.join(','))}`;
            }

            // Valuation Range
            if (filters?.valuationRange !== undefined && filters?.valuationRange !== null) {
                let valRangeVal = "";
                if (Array.isArray(filters.valuationRange) && filters.valuationRange.length >= 2) {
                    const [min, max] = filters.valuationRange;
                    const maxLimit = valuationRangeData?.max || 20000;
                    if (max === null || max === undefined || (maxLimit && max >= maxLimit && min > 0)) {
                        valRangeVal = `${min}+`;
                    } else {
                        valRangeVal = `${min}-${max}`;
                    }
                } else if (typeof filters.valuationRange === 'string' && filters.valuationRange.trim()) {
                    valRangeVal = filters.valuationRange.trim();
                }
                if (valRangeVal) {
                    queryString += `&valuationRange=${encodeURIComponent(valRangeVal)}`;
                }
            }

            // Activities
            const activities = filters?.activities;
            const cleanActivities = Array.isArray(activities)
                ? activities.map(item => String(item).trim()).filter(Boolean)
                : (typeof activities === 'string' && activities.trim() ? [activities.trim()] : []);
            if (cleanActivities.length > 0) {
                queryString += `&activities=${encodeURIComponent(cleanActivities.join(','))}`;
            }

            // Participation
            const participation = filters?.participation;
            const cleanParticipation = Array.isArray(participation)
                ? participation.map(item => String(item).trim()).filter(Boolean)
                : (typeof participation === 'string' && participation.trim() ? [participation.trim()] : []);
            if (cleanParticipation.length > 0) {
                queryString += `&participation=${encodeURIComponent(cleanParticipation.join(','))}`;
            }

            const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
            const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

            const res = await fetch(
                `${baseUrl}admin/api/deals/all-deals${queryString}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const responseData = await res.json();
            const deals = responseData.data || [];
            const pageData = responseData.pagination || {};
            setAllDeals(deals);
            setPagination(pageData);
            if (pageData.limit) {
                setLimit(Number(pageData.limit));
            }
            if (pageData.page) {
                setCurrentPage(Number(pageData.page));
            }
            const total = Number(pageData.totalRecords ?? pageData.total ?? pageData.total_records ?? pageData.count ?? responseData.total ?? deals.length ?? 0);
            setTotalRecords(total);
        } catch (err) {
            console.error("Fetch error in AllDeals:", err);
            setError(err.message || "Failed to fetch deals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) return;
        const timer = setTimeout(() => {
            fetchDeals(1, selectedDealType, companySearch, selectedTags, appliedFilters, sortBy);
        }, 350);

        return () => clearTimeout(timer);
    }, [companySearch]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            const hasTags = selectedTags && selectedTags.length > 0;
            const hasFilters = appliedFilters && Object.keys(appliedFilters).length > 0;
            const isDifferentSort = sortBy !== (initialSort || "latest");
            if (initialDeals && initialDeals.length > 0 && !companySearch && !hasTags && !hasFilters && !isDifferentSort) {
                return; // Already pre-fetched via SSR
            }
            fetchDeals(initialPage, selectedDealType, companySearch, selectedTags, appliedFilters, sortBy);
            return;
        }

        fetchDeals(1, selectedDealType, companySearch, selectedTags, appliedFilters, sortBy);
    }, [selectedDealType, selectedTags, appliedFilters, sortBy]);


    return (
        <>
            <div className={styles.AllDealsMainContainer}>
                <section ref={dealsSectionRef} id="dealsSection" className={`${styles.DealsTalkMainContainer} ${stylesdeals.DealsTalkMainContainer} ${appliedFilters ? stylesdeals.filtersActive : ""}`} >
                    <div className={`${stylesdeals.allDealsHeaderRow} ${appliedFilters ? stylesdeals.filtersActive : ""}`}>
                        <div className={stylesdeals.pageHeader}>
                            <div className={stylesdeals.backButtonHeader} onClick={() => router.push('/')} role="button" tabIndex={0} aria-label="Go to Home">
                                <span className={stylesdeals.backArrow}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </span>
                                <span className={stylesdeals.mobileDealsTitle}>Deals</span>
                            </div>
                            <h1 className={stylesdeals.desktopTitle}>{getCategoryHeading()}</h1>
                            <p className={stylesdeals.desktopSubtitle}>{getCategorySubtitle()}</p>
                        </div>

                        <div className={stylesdeals.filterBarRow}>
                            {/* Row 1: Filter button + View Toggle + Deal Type Dropdown (Mobile) / Full Desktop Row */}
                            <div className={stylesdeals.filterRowTop}>
                                <button className={stylesdeals.desktopFilterBtn} onClick={() => setShowFilterPopup(!showFilterPopup)} title="Filters" aria-label="Filters">
                                    <SlidersHorizontal size={18} />
                                </button>

                                <nav className={stylesdeals.dealTypeTabs} aria-label="Deal Categories">
                                    {dealTypeTabs.map(tab => {
                                        const tabHref = tab.slug ? `/deals/${tab.slug}` : "/deals";
                                        const isActive = selectedDealType === tab.value;
                                        return (
                                            <Link
                                                key={tab.value}
                                                href={tabHref}
                                                prefetch={true}
                                                scroll={false}
                                                className={`${stylesdeals.tabItem} ${isActive ? stylesdeals.activeTab : ""}`}
                                                onClick={(e) => handleTabClick(e, tab)}
                                                aria-current={isActive ? "page" : undefined}
                                            >
                                                {tab.label}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* Search Company Input (Desktop only) */}
                                <div className={`${stylesdeals.companySearchContainer} ${stylesdeals.desktopOnly}`}>
                                    <Search size={16} className={stylesdeals.companySearchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search company"
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                        className={stylesdeals.companySearchInput}
                                    />
                                    {companySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setCompanySearch("")}
                                            className={stylesdeals.companySearchClear}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className={stylesdeals.headerActions} ref={dropdownRef}>
                                    {/* Sort by Dropdown (Desktop only) */}
                                    <div className={`${stylesdeals.sortDropdownContainer} ${stylesdeals.desktopOnly}`} ref={sortDropdownRef}>
                                        <button
                                            type="button"
                                            className={stylesdeals.sortDropdownBtn}
                                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                                        >
                                            <span className={stylesdeals.sortLabelText}>
                                                Sort by: {sortOptions.find(o => o.value === sortBy)?.label || "Latest"}
                                            </span>
                                            <ChevronDown size={14} strokeWidth={2.8} className={`${stylesdeals.sortChevron} ${showSortDropdown ? stylesdeals.sortChevronActive : ""}`} />
                                        </button>

                                        {showSortDropdown && (
                                            <div className={stylesdeals.sortDropdownMenu}>
                                                {sortOptions.map(option => {
                                                    const isSelected = sortBy === option.value;
                                                    return (
                                                        <div
                                                            key={option.value}
                                                            className={`${stylesdeals.sortDropdownItem} ${isSelected ? stylesdeals.sortDropdownItemActive : ""}`}
                                                            onClick={() => {
                                                                setSortBy(option.value);
                                                                setShowSortDropdown(false);
                                                            }}
                                                        >
                                                            <span>{option.label}</span>
                                                            {isSelected && (
                                                                <Check size={16} className={stylesdeals.sortCheckIcon} strokeWidth={2.5} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* View Toggle */}
                                    <div className={stylesdeals.viewToggle}>
                                        <div className={`${stylesdeals.toggleSlider} ${viewType === 'list' ? stylesdeals.slideRight : ''}`} />
                                        <div
                                            className={`${stylesdeals.toggleIcon} ${viewType === 'grid' ? stylesdeals.active : ""}`}
                                            onClick={() => setViewType('grid')}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={viewType === 'grid' ? '#96785f' : '#aba99b'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect width="7" height="7" x="3" y="3" rx="1" />
                                                <rect width="7" height="7" x="14" y="3" rx="1" />
                                                <rect width="7" height="7" x="14" y="14" rx="1" />
                                                <rect width="7" height="7" x="3" y="14" rx="1" />
                                            </svg>
                                        </div>
                                        <div
                                            className={`${stylesdeals.toggleIcon} ${viewType === 'list' ? stylesdeals.active : ""}`}
                                            onClick={() => setViewType('list')}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={viewType === 'list' ? '#96785f' : '#aba99b'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 5h.01" />
                                                <path d="M3 12h.01" />
                                                <path d="M3 19h.01" />
                                                <path d="M8 5h13" />
                                                <path d="M8 12h13" />
                                                <path d="M8 19h13" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Mobile Deal Type Dropdown (visible <= 768px) */}
                                    <div className={`${stylesdeals.dealTypeDropdownContainer} ${stylesdeals.mobileOnly}`}>
                                        <button
                                            className={`${stylesdeals.dealTypeDropdownBtn} ${showDealTypeDropdown ? stylesdeals.activeBtn : ""}`}
                                            onClick={() => setShowDealTypeDropdown(!showDealTypeDropdown)}
                                        >
                                            <span>
                                                {selectedDealType === "All" ? "All Deals" :
                                                    dealTypeTabs.find(t => t.value === selectedDealType)?.label || "All Deals"}
                                            </span>
                                            <ChevronDown size={14} className={`${stylesdeals.chevronIcon} ${showDealTypeDropdown ? stylesdeals.chevronIconActive : ""}`} />
                                        </button>

                                        <div className={`${stylesdeals.dealTypeDropdownMenu} ${showDealTypeDropdown ? stylesdeals.dropdownOpen : ""}`}>
                                            {dealTypeTabs.map(tab => {
                                                const tabHref = tab.slug ? `/deals/${tab.slug}` : "/deals";
                                                const isActive = selectedDealType === tab.value;
                                                return (
                                                    <Link
                                                        key={tab.value}
                                                        href={tabHref}
                                                        prefetch={true}
                                                        scroll={false}
                                                        className={`${stylesdeals.dropdownItem} ${isActive ? stylesdeals.dropdownItemActive : ""}`}
                                                        onClick={(e) => {
                                                            handleTabClick(e, tab);
                                                            setShowDealTypeDropdown(false);
                                                        }}
                                                        aria-current={isActive ? "page" : undefined}
                                                    >
                                                        {tab.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 on mobile (Search company + Sort by) */}
                            <div className={stylesdeals.mobileSearchAndSortRow}>
                                <div className={stylesdeals.companySearchContainer}>
                                    <Search size={16} className={stylesdeals.companySearchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search company"
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                        className={stylesdeals.companySearchInput}
                                    />
                                    {companySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setCompanySearch("")}
                                            className={stylesdeals.companySearchClear}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className={stylesdeals.sortDropdownContainer} ref={mobileSortDropdownRef}>
                                    <button
                                        type="button"
                                        className={stylesdeals.sortDropdownBtn}
                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    >
                                        <span className={stylesdeals.sortLabelText}>
                                            Sort by: {sortOptions.find(o => o.value === sortBy)?.label || "Latest"}
                                        </span>
                                        <ChevronDown size={14} strokeWidth={2.8} className={`${stylesdeals.sortChevron} ${showSortDropdown ? stylesdeals.sortChevronActive : ""}`} />
                                    </button>

                                    {showSortDropdown && (
                                        <div className={stylesdeals.sortDropdownMenu}>
                                            {sortOptions.map(option => {
                                                const isSelected = sortBy === option.value;
                                                return (
                                                    <div
                                                        key={option.value}
                                                        className={`${stylesdeals.sortDropdownItem} ${isSelected ? stylesdeals.sortDropdownItemActive : ""}`}
                                                        onClick={() => {
                                                            setSortBy(option.value);
                                                            setShowSortDropdown(false);
                                                        }}
                                                    >
                                                        <span>{option.label}</span>
                                                        {isSelected && (
                                                            <Check size={16} className={stylesdeals.sortCheckIcon} strokeWidth={2.5} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search & Add Tags Bar Row (Row 3 & Row 4 on mobile) - Only visible when tag(s) selected */}
                        {selectedTags.length > 0 && (
                            <div className={stylesdeals.tagsFilterRow}>
                                <div className={stylesdeals.tagSearchContainer} ref={tagDropdownRef}>
                                    <Search size={15} className={stylesdeals.tagSearchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search and add tags..."
                                        value={tagSearch}
                                        onChange={(e) => {
                                            setTagSearch(e.target.value);
                                            setShowTagDropdown(true);
                                        }}
                                        onFocus={() => setShowTagDropdown(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && tagSearch.trim()) {
                                                e.preventDefault();
                                                handleAddTag(tagSearch.trim());
                                            }
                                        }}
                                        className={stylesdeals.tagSearchInput}
                                    />
                                    {showTagDropdown && suggestedTags.length > 0 && (
                                        <div className={stylesdeals.tagDropdownMenu}>
                                            {suggestedTags.slice(0, 10).map(tag => (
                                                <div
                                                    key={tag}
                                                    className={stylesdeals.tagDropdownItem}
                                                    onClick={() => handleAddTag(tag)}
                                                >
                                                    <span>{tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Active Tag Pills & Clear All (Row 4 on mobile) */}
                                <div className={stylesdeals.selectedTagsRowWrapper}>
                                    <div className={stylesdeals.selectedTagsContainer}>
                                        {selectedTags.map(tag => (
                                            <div key={tag} className={stylesdeals.selectedTagPill}>
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className={stylesdeals.removeTagBtn}
                                                    aria-label={`Remove tag ${tag}`}
                                                >
                                                    <X size={11} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Clear All button */}
                                    {selectedTags.length > 0 && (
                                        <button
                                            type="button"
                                            className={stylesdeals.clearAllTagsBtn}
                                            onClick={handleClearAllTags}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {appliedFilters && (
                        <div className={stylesdeals.appliedFiltersRow}>
                            {Object.entries(appliedFilters).map(([category, values]) => {
                                if (category === 'ticketSize' || category === 'valuationRange') {
                                    if (!values || !Array.isArray(values) || values.length !== 2) return null;
                                    const [min, max] = values;
                                    const label = category === 'ticketSize' ? `Ticket Size / Allocation: ₹${min}Cr - ₹${max}Cr` : `Valuation Range: ₹${min}Cr - ₹${max}Cr`;
                                    return (
                                        <div key={category} className={stylesdeals.filterTag}>
                                            <span>{label}</span>
                                            <div onClick={() => removeFilter(category, null)} className={stylesdeals.removeFilterBtn}>
                                                <X size={14} />
                                            </div>
                                        </div>
                                    );
                                }
                                if (!Array.isArray(values) || values.length === 0) return null;
                                return values.map((val) => (
                                    <div key={`${category}-${val}`} className={stylesdeals.filterTag}>
                                        <span>
                                            {category === "dealRatings" ? `⭐ ${val}` : val}
                                        </span>
                                        <div onClick={() => removeFilter(category, val)} className={stylesdeals.removeFilterBtn}>
                                            <X size={14} />
                                        </div>
                                    </div>
                                ));
                            })}
                        </div>
                    )}

                    <div className={`${styles.carouselWrapper} carouselWrapper`}>
                        <div className={`row g-0 ${styles.dealsRow} ${stylesdeals.dealsRow} ${viewType === 'list' ? stylesdeals.listView : ""}`}>
                            {loading ? (
                                [...Array(15)].map((_, i) => (
                                    <div
                                        key={`skeleton-${i}`}
                                        className={`${viewType === 'grid' ? 'col-lg-3' : 'col-lg-12'} col-md-6 col-sm-12 ${stylesdeals.dealCardCol} ${viewType === 'list' ? stylesdeals.listViewCol : ""}`}
                                    >
                                        <div className={`${stylesdeals.skeletonCard} ${viewType === 'list' ? stylesdeals.skeletonCardList : ""}`} />
                                    </div>
                                ))
                            ) : ((selectedDealType || '').toLowerCase() === "private" || (selectedDealType || '').toLowerCase() === "startup") ? (
                                <div style={{ width: "100%", marginTop: "10px" }}>
                                    <UnlockTeaser className={stylesdeals.teaserNoMargin} isAllDeals={true} isListView={false} />
                                </div>
                            ) : dealsToRender && dealsToRender.length > 0 ? (
                                <>
                                    {viewType === 'list' ? (
                                        <>
                                            {/* Desktop Table View (>= 1024px) */}
                                            <div className={stylesdeals.desktopTableWrapper}>
                                                <div className={stylesdeals.tableScrollWrapper}>
                                                    <table className={stylesdeals.dealsTable}>
                                                        {dealsToRender.map((deal) => (
                                                            <DealCard
                                                                key={`table-${deal.id}`}
                                                                deal={deal}
                                                                isAuthenticated={!!authToken}
                                                                onLoginClick={handleSigninOpen}
                                                                isListView={true}
                                                                isTableView={true}
                                                                ignoreFeatured={true}
                                                                onTagClick={handleAddTag}
                                                                isExpanded={activeDealId === deal.id}
                                                                isClosing={closingDealId === deal.id}
                                                                onHover={() => handleHoverDeal(deal.id)}
                                                                onHoverLeave={() => handleHoverLeave(deal.id)}
                                                            />
                                                        ))}
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Mobile / Tablet Original List View (< 1024px) */}
                                            <div className={stylesdeals.mobileListWrapper}>
                                                {dealsToRender.map((deal) => (
                                                    <div key={`list-${deal.id}`} className={`col-12 ${stylesdeals.dealCardCol} ${stylesdeals.listViewCol}`}>
                                                        <DealCard
                                                            deal={deal}
                                                            isAuthenticated={!!authToken}
                                                            onLoginClick={handleSigninOpen}
                                                            isListView={true}
                                                            isTableView={false}
                                                            ignoreFeatured={true}
                                                            onTagClick={handleAddTag}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {dealsToRender.map((deal) => (
                                                <div
                                                    key={deal.id}
                                                    className={`col-lg-3 col-md-6 col-sm-12 ${stylesdeals.dealCardCol}`}
                                                >
                                                    <DealCard
                                                        deal={deal}
                                                        isAuthenticated={!!authToken}
                                                        onLoginClick={handleSigninOpen}
                                                        isListView={false}
                                                        ignoreFeatured={true}
                                                        onTagClick={handleAddTag}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className={stylesdeals.noDealsFound}>
                                    <p>No deals found matching your filters.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {((selectedDealType || '').toLowerCase() !== "private" && (selectedDealType || '').toLowerCase() !== "startup") && totalCount > 0 && (
                        <div className={stylesdeals.paginationContainer}>
                            {/* Left Side: Number of deals and out of total deals */}
                            <div className={stylesdeals.paginationInfo}>
                                Showing <span className={stylesdeals.paginationHighlight}>{startRecord === endRecord ? startRecord : `${startRecord}–${endRecord}`}</span> out of <span className={stylesdeals.paginationHighlight}>{totalCount}</span> deals
                            </div>

                            {/* Right Side: Change limit & Change page */}
                            <div className={stylesdeals.paginationRightSection}>
                                <div className={stylesdeals.limitSelectorWrapper}>
                                    <span className={stylesdeals.limitLabel}>
                                        <span className={stylesdeals.limitLabelPrefix}>Deals </span>per page:
                                    </span>
                                    <select
                                        value={effectiveLimit}
                                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                                        className={stylesdeals.limitSelect}
                                        aria-label="Deals per page"
                                    >
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={16}>16</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                {totalPages > 1 && (
                                    <div className={stylesdeals.pageNavWrapper}>
                                        {/* Mobile / Tablet View (<= 920px): [<<] [<] [>] [>>] */}
                                        <div className={stylesdeals.mobileNavControls}>
                                            {currentPage > 1 ? (
                                                <Link
                                                    href={buildPageHref(1)}
                                                    prefetch={false}
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(1);
                                                    }}
                                                    aria-label="First Page"
                                                >
                                                    <ChevronsLeft size={16} strokeWidth={2} />
                                                </Link>
                                            ) : (
                                                <span
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn} ${stylesdeals.paginationArrowDisabled}`}
                                                    aria-label="First Page"
                                                    aria-disabled="true"
                                                >
                                                    <ChevronsLeft size={16} strokeWidth={2} />
                                                </span>
                                            )}
                                            {currentPage > 1 ? (
                                                <Link
                                                    href={buildPageHref(currentPage - 1)}
                                                    prefetch={false}
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(currentPage - 1);
                                                    }}
                                                    aria-label="Previous Page"
                                                >
                                                    <ChevronLeft size={16} strokeWidth={2} />
                                                </Link>
                                            ) : (
                                                <span
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn} ${stylesdeals.paginationArrowDisabled}`}
                                                    aria-label="Previous Page"
                                                    aria-disabled="true"
                                                >
                                                    <ChevronLeft size={16} strokeWidth={2} />
                                                </span>
                                            )}
                                            {currentPage < totalPages ? (
                                                <Link
                                                    href={buildPageHref(currentPage + 1)}
                                                    prefetch={false}
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(currentPage + 1);
                                                    }}
                                                    aria-label="Next Page"
                                                >
                                                    <ChevronRight size={16} strokeWidth={2} />
                                                </Link>
                                            ) : (
                                                <span
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn} ${stylesdeals.paginationArrowDisabled}`}
                                                    aria-label="Next Page"
                                                    aria-disabled="true"
                                                >
                                                    <ChevronRight size={16} strokeWidth={2} />
                                                </span>
                                            )}
                                            {currentPage < totalPages ? (
                                                <Link
                                                    href={buildPageHref(totalPages)}
                                                    prefetch={false}
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(totalPages);
                                                    }}
                                                    aria-label="Last Page"
                                                >
                                                    <ChevronsRight size={16} strokeWidth={2} />
                                                </Link>
                                            ) : (
                                                <span
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.navSquareBtn} ${stylesdeals.paginationArrowDisabled}`}
                                                    aria-label="Last Page"
                                                    aria-disabled="true"
                                                >
                                                    <ChevronsRight size={16} strokeWidth={2} />
                                                </span>
                                            )}
                                        </div>

                                        {/* Desktop View (> 920px): 1 2 ... 5 6 */}
                                        <div className={stylesdeals.desktopNavControls}>
                                            {currentPage > 1 ? (
                                                <Link
                                                    href={buildPageHref(currentPage - 1)}
                                                    prefetch={false}
                                                    className={stylesdeals.paginationArrow}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(currentPage - 1);
                                                    }}
                                                    aria-label="Previous Page"
                                                >
                                                    <ChevronLeft size={18} strokeWidth={2} />
                                                </Link>
                                            ) : (
                                                <span
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.paginationArrowDisabled}`}
                                                    aria-label="Previous Page"
                                                    aria-disabled="true"
                                                >
                                                    <ChevronLeft size={18} strokeWidth={2} />
                                                </span>
                                            )}
                                            {getPageNumbers(currentPage, totalPages).map((p, idx) =>
                                                p === '...' ? (
                                                    <span key={`dots-${idx}`} className={stylesdeals.paginationDots}>
                                                        ...
                                                    </span>
                                                ) : (
                                                    <Link
                                                        key={`page-${p}`}
                                                        href={buildPageHref(p)}
                                                        prefetch={false}
                                                        className={`${stylesdeals.paginationBtn} ${currentPage === p ? stylesdeals.paginationActive : ''}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(p);
                                                        }}
                                                        aria-label={`Page ${p}`}
                                                        aria-current={currentPage === p ? "page" : undefined}
                                                    >
                                                        {p}
                                                    </Link>
                                                )
                                            )}
                                            {currentPage < totalPages ? (
                                                <Link
                                                    href={buildPageHref(currentPage + 1)}
                                                    prefetch={false}
                                                    className={stylesdeals.paginationArrow}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(currentPage + 1);
                                                    }}
                                                    aria-label="Next Page"
                                                >
                                                    <ChevronRight size={18} strokeWidth={2} />
                                                </Link>
                                            ) : (
                                                <span
                                                    className={`${stylesdeals.paginationArrow} ${stylesdeals.paginationArrowDisabled}`}
                                                    aria-label="Next Page"
                                                    aria-disabled="true"
                                                >
                                                    <ChevronRight size={18} strokeWidth={2} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {((selectedDealType || '').toLowerCase() === "public" || (selectedDealType || '').toLowerCase() === "upcoming") && (
                        <div className={stylesdeals.disclaimerText}>
                            <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={stylesdeals.cautionIcon}>
                                <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
                                <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
                                <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
                            </svg>
                            <span>Grey Market Premium (GMPs) are shared for knowledge purpose only. PrEqt doesn’t promote or execute the trades.</span>
                        </div>
                    )}
                    {(selectedDealType || '').toLowerCase() === "unlisted" && (
                        <div className={stylesdeals.disclaimerText}>
                            <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={stylesdeals.cautionIcon}>
                                <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
                                <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
                                <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
                            </svg>
                            <span>Disclaimer: Unlisted shares are unregulated & illiquid. This is NOT investment advice. Please do your own due diligence before investing.</span>
                        </div>
                    )}
                </section>
            </div>
            {showSignin && (
                <SigninPopup
                    show={showSignin}
                    onHide={() => setShowSignin(false)}
                    onShowOtp={handleSigninShowOtp}
                    onShowSignUp={() => {
                        setShowSignin(false);
                        setShowSignupType(true);
                    }}
                />
            )}

            {/* SIGN UP TYPE */}
            {showSignupType && (
                <SignupTypePopup
                    show
                    onHide={() => setShowSignupType(false)}
                    onProceed={() => {
                        setShowSignupType(false);
                        setShowSignupForm(true);
                    }}
                    onBack={() => {
                        setShowSignupType(false);
                        setShowSignin(true);
                    }}
                />
            )}

            {/* SIGN UP FORM */}
            {showSignupForm && (
                <SignupFormPopup
                    show
                    onHide={() => setShowSignupForm(false)}
                    onBack={() => {
                        setShowSignupForm(false);
                        setShowSignupType(true);
                    }}
                    onShowOtp={handleSignupShowOtp}
                />
            )}

            {/* OTP POPUP (NO showOtp FLAG) */}
            {otpPayload && (
                <OtpPopup
                    {...otpPayload}
                    show
                    redirectTo={redirectPath}
                    handleClose={closeOtp}
                    handleBack={() => {
                        const flow = otpPayload.flow;
                        closeOtp();
                        flow === "signin"
                            ? setShowSignin(true)
                            : setShowSignupForm(true);
                    }}
                    onVerified={() => {
                        closeOtp();
                    }}
                />
            )}

            <FilterPopup
                show={showFilterPopup}
                onHide={() => setShowFilterPopup(false)}
                availableStages={availableStages}
                ticketSizeRange={ticketSizeData}
                revenueRange={ticketSizeData}
                valuationRange={valuationRangeData}
                availableFundingStatus={availableFundingStatus}
                availableActivities={availableActivities}
                availableParticipations={availableParticipations}
                availableSectors={availableSectors}
                initialFilters={appliedFilters}
                onApply={(filters) => {
                    setAppliedFilters(filters);
                }}
            />
        </>

    );
}


export default function AllDeals({ initialDeals = [], initialPagination = {}, initialCategory = null, initialSort = "latest" }) {
    return (
        <Suspense fallback={<Loader />}>
            <AllDealsContent initialDeals={initialDeals} initialPagination={initialPagination} initialCategory={initialCategory} initialSort={initialSort} />
        </Suspense>
    );
} 
