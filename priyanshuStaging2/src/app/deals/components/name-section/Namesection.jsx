"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FAQSection from "@/app/components/home/FAQSection/FAQSection";

import "./namesection.css";
import { useRouter } from "next/navigation";
import Accountfooter from '@/app/account/footer/Accountfooter'
import Customnavbar from "../customnavbarsection/customnavbar";
import AskAiSection from "../ask-ai-section/Ask-ai-section";
// import Featured from "../why-featured-section/why";
import Shares from "../shares-section/shares";
// import Questions from "../questions-section/questions"; comment
import Valuation from "../valuation-section/valuation";
import QuesAnsSection from "../ask-ai-section/ques-ans-section/QuesAnsSection";
import Calculator from "@/app/private-deals/components/calculator/Calculator";
import PrivateDealDetails from "./private-deal-detail/page";
import IPOCollapse from "./IPOCollapse";
import IPOReviewAndRating from "./IPOReviewAndRating";
import RatingBadge from "../DealCard/ui/RatingBadge";
import { Bellactive, BellOff, ShareIcon } from "./svgicon";
import { useMediaQuery } from "react-responsive";

import Cookies from "js-cookie";
import { useDealStore } from "@/store/dealStore";
import Loader from "@/app/components/Loader";
import QuestionAnswer from "../ask-ai-section/ques-ans-section/question-answer/QuestionAnswer";
import { useDealType } from "@/app/utils/DealTypeContext";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";
import ShareModal from "@/app/community/components/CommentSection/ShareModal";
import PrivateQuestion from "@/app/private-deals/components/private-questions/PrivateQuestion";
import { Flashlight } from "lucide-react";
import SigninPopup from "@/app/sign-in/SigninPopup";
import OtpPopup from "@/app/otp/OtpPopup";
import { useSearchParams } from "next/navigation";
import { getDealCategoryInfo } from "@/app/utils/seoUtils";

const extractBadgeItems = (field) => {
  if (!field) return [];
  let list = field;
  if (typeof field === "object" && !Array.isArray(field)) {
    if (field.status === false || field.status === "false") return [];
    if (Array.isArray(field.data)) {
      list = field.data;
    } else if (typeof field.data === "string" && field.data.trim()) {
      list = [field.data];
    } else {
      return [];
    }
  } else if (typeof field === "string" && field.trim()) {
    list = [field];
  }
  if (!Array.isArray(list)) return [];

  return list
    .flatMap((item) => {
      if (!item) return [];
      let text = "";
      if (typeof item === "string") {
        text = item.trim();
      } else if (typeof item === "object") {
        text = (
          item.name ||
          item.label ||
          item.sector ||
          item.tag ||
          item.description ||
          item.title ||
          ""
        ).trim();
      } else {
        text = String(item || "").trim();
      }

      if (!text) return [];

      // If text is a stringified JSON array, e.g. '["Tag 1", "Tag 2"]'
      if (text.startsWith("[") && text.endsWith("]")) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            return parsed.map((p) => {
              return typeof p === "string" ? p.trim() : (p?.name || p?.label || p?.sector || p?.tag || "").trim();
            }).filter(Boolean);
          }
        } catch (_) {
          // Fall through
        }
      }

      return [text];
    })
    .filter(Boolean);
};

const Namedetailsection = ({ slug, initialDealData }) => {
  const [bellactive, setBellactive] = useState(false);
  const [isAskAiActive, setIsAskAiActive] = useState(false);
  const [isQuesAnsActive, setIsQuesAnsActive] = useState(false);
  const [qaCount, setQaCount] = useState('');
  const [showQnA, setShowQnA] = useState(false);
  const [showPrivateQna, setShowPrivateQna] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [countError, setCountError] = useState(false)
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!initialDealData);
  const [replies, setReplies] = useState(null); // Store replies data
  const isMobile = useMediaQuery({ maxWidth: 920 });
  const isBelow500 = useMediaQuery({ maxWidth: 500 });
  const { selectedDeal } = useDealStore();
  const router = useRouter();
  const [mainLoader, setMainLoader] = useState(!initialDealData);

  // ---- Signin + OTP states ----
  const [showSignin, setShowSignin] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [otpPayload, setOtpPayload] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSource, setOtpSource] = useState("");

  const handleSigninOpen = (action = null) => {
    if (action && typeof action === "string") {
      setPendingAction(action);
    }
    setShowSignin(true);
  };
  const handleSigninClose = () => setShowSignin(false);
  const handleOtpClose = () => setShowOtp(false);
  const handleSigninShowOtp = (payload) => {
    setShowSignin(false);
    setOtpPayload({ ...payload, flow: "signin" });
  };
  // const activeDealFromStore = deal ?? selectedDeal;
  const { setDealDataDetails } = useDealStore();
  const { updateDealType } = useDealType();
  const [authToken, setAuthToken] = useState("");
  const [currentDealType, setCurrenDealType] = useState(initialDealData?.data?.deal_type || "public");

  useEffect(() => {
    const token = Cookies.get('accessToken') || "";
    setAuthToken(token);
  }, []);

  useEffect(() => {
    if (initialDealData?.data) {
      setDealDataDetails(initialDealData);
      updateDealType(initialDealData?.data?.deal_type);
      setCurrenDealType(initialDealData?.data?.deal_type);
      setMainLoader(false);
      setLoading(false);
    }
  }, [initialDealData, setDealDataDetails, updateDealType]);

  const searchParams = useSearchParams();
  const [hideForReferral, setHideForReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const referral = searchParams.get("r") || sessionStorage.getItem("referral");
    const showFlag = sessionStorage.getItem("showSignUp") || true;
    if (referral) {
      sessionStorage.setItem("referral", referral);
      sessionStorage.setItem("showSignUp", showFlag);
      setReferralCode(referral);
    }
    if (referral && currentDealType != "public") {
      setHideForReferral(!authToken);
    }
  }, [currentDealType, authToken])


  useEffect(() => {
    const shouldLockScroll = showQnA || showPrivateQna;
    if (!shouldLockScroll) {
      return;
    }

    const scrollY = window.scrollY;
    const isInsideModal = (event) => {
      if (!(event.target instanceof Element)) return false;
      return Boolean(event.target.closest(".qnaSlider"));
    };
    const preventBackgroundScroll = (event) => {
      if (isInsideModal(event)) {
        return;
      }
      event.preventDefault();
    };
    const handleKeyDown = (event) => {
      const keys = ["ArrowUp", "ArrowDown", "Space", "PageUp", "PageDown", "Home", "End"];
      if (keys.includes(event.code)) {
        const activeElement = document.activeElement;
        if (activeElement instanceof Element && activeElement.closest(".qnaSlider")) {
          return;
        }
        event.preventDefault();
      }
    };
    const listenerOptions = { passive: false };

    window.addEventListener("wheel", preventBackgroundScroll, listenerOptions);
    window.addEventListener("touchmove", preventBackgroundScroll, listenerOptions);
    window.addEventListener("keydown", handleKeyDown, listenerOptions);

    document.body.classList.add("body-scroll-lock");
    document.body.style.top = `-${scrollY}px`;

    return () => {
      window.removeEventListener("wheel", preventBackgroundScroll, listenerOptions);
      window.removeEventListener("touchmove", preventBackgroundScroll, listenerOptions);
      window.removeEventListener("keydown", handleKeyDown, listenerOptions);

      document.body.classList.remove("body-scroll-lock");
      const offset = parseInt(document.body.style.top || "0", 10);
      document.body.style.top = "";
      window.scrollTo(0, Math.abs(offset));
    };
  }, [showQnA, showPrivateQna]);

  // useEffect(() => {
  //   const checkScreenSize = () => {
  //     setIsMobile(window.innerWidth <= 768);
  //   };
  //   checkScreenSize();
  //   window.addEventListener("resize", checkScreenSize);
  //   return () => window.removeEventListener("resize", checkScreenSize);
  // }, []);





  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof document !== "undefined") {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [slug]);

  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = (dealDetailsFromStore && dealDetailsFromStore.data) ? dealDetailsFromStore : initialDealData;

  const fetchSubscriptions = async (dealId) => {
    if (!authToken || !dealId) return;
    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_BASE}admin/api/notifications/subscribed-deals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      const result = await response.json();
      if (result.data.length > 0) {
        const flag = result.data.filter((data) => data.deal_id == dealId);
        setBellactive(flag.length > 0)
      }

    } catch (error) {
      console.log("failed to fetch ", error)
    }
  }

  const handleSubscription = async (dealId) => {
    try {
      let api = `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/notifications/`;
      let method = "POST";
      if (bellactive) {
        api += `unsubscribed-deal-notification/${dealId}`;
        method = "DELETE";
      } else {
        api += `subscribe-deal-notifications/${dealId}`;
      }

      const response = await fetch(api, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const result = await response.json();

      if (result.success) {
        if (bellactive) {
          showSuccessToast("Unsubscribed from deal.");
        } else {
          showSuccessToast("Subscribed to deal.");
        }

        setBellactive((prev) => !prev);
      }

    } catch (error) {
      console.log("error in handle subscription ", error)
    }
  }

  // useEffect(() => {
  //   const fetchDealDetails = async () => {
  //     try {
  //       const headers = authToken
  //         ? { Authorization: `Bearer ${authToken}` }
  //         : {};

  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/public/detailsbyslug/${slug}`,
  //         {
  //           method: "GET",
  //           headers,
  //         }
  //       );
  //       if (!res.ok) {
  //         throw new Error(`Failed to fetch deal. Status: ${res.status}`);
  //       }

  //       const data = await res.json();
  //       console.log("✅ Deal fetched on client:", data);

  //       // setDeal(data);
  //       setDealDataDetails(data);
  //       updateDealType(data?.data?.deal_type);
  //       fetchSubscriptions(data?.data?.deal_id);

  //     }catch (err) {
  //       console.error("❌ Error fetching deal:", err);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchDealDetails();
  // }, []);

  const fetchDealDetails = async () => {
    try {
      const headers = authToken
        ? { Authorization: `Bearer ${authToken}` }
        : {};

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/public/detailsbyslug/${slug}`,
        {
          method: "GET",
          headers,
        }
      );

      // Even if res.ok is true, the server may return a JSON error object (status: 500 inside body)
      const data = await res.json();

      // --- Redirect on specific token error returned inside JSON body ---
      const tokenErrorMessage =
        "Failed to fetch deal details: Please Provide Valid Token to access This Deal.";

      const errorMessage = "Failed to fetch deal details: Deal not found for given slug or deal_id."
      const isPublicOrUnlisted = data?.data?.deal_type === "public" || data?.data?.deal_type === "unlisted";
      if ((data?.status === 500 && errorMessage == data.data.message) || (!isPublicOrUnlisted && (!authToken && !sessionStorage.getItem("referral")))) {
        // Redirect to deals and trigger signin popup.
        // Include the original deal URL so we can come back here after login.
        const referral = sessionStorage.getItem("referral");
        const redirectPath = referral ? `/deals/${slug}` : `/deals/${slug}?r=${referral}`;
        router.replace(`/deals?showSignin=${!referral && !authToken}&redirect=${encodeURIComponent(redirectPath)}`);
        return; // stop further processing
      }

      // Optional: be slightly more tolerant (uncomment if you want)
      // if (data?.data?.message?.includes("Please Provide Valid Token")) {
      //   router.replace("/deals");
      //   return;
      // }

      // Normal flow: set deal details and continue
      setDealDataDetails(data);
      updateDealType(data?.data?.deal_type);
      setCurrenDealType(data?.data?.deal_type);
      fetchSubscriptions(data?.data?.deal_id);
      setMainLoader(false);
    } catch (err) {
      console.error("❌ Error fetching deal:", err);
      setError(err.message);
      setMainLoader(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
   

    fetchDealDetails();
  }, [slug, authToken, router]);


  const dealVisit = async (dealId) => {
  try {
    const accessToken = Cookies.get("accessToken");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deal/visit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && {
            Authorization: `Bearer ${accessToken}`,
          }),
        },
        body: JSON.stringify({
          deal_id: dealId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to record deal visit:", error);
  }
};
  useEffect(() => {
    if (dealDetails && dealDetails?.data && dealDetails?.data?.deal_id && dealDetails?.data?.deal_type === "private" || dealDetails?.data?.deal_type === "ccps" || dealDetails?.data?.deal_type === "ofs") {
      dealVisit(dealDetails?.data?.deal_id);
    }
  }, [dealDetails]);

  const dealId = dealDetails?.data?.deal_id;
  useEffect(() => {
    const fetchRepliesCount = async () => {
      if (!dealId) return;

      setCountLoading(true);
      setCountError(null);

      try {
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

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();
        console.log("This is the count I got", data);
        setQaCount(data?.data?.count);

        // Store replies data for initials
        setReplies(data);
      } catch (err) {
        console.error("Error fetching replies count:", err);
        setCountError(err.message);
      } finally {
        setCountLoading(false);
      }
    };

    fetchRepliesCount();

  }, [dealId]);


  const liveAt = dealDetails?.data?.deal_setpData?.live_at;

  function daysUntilLive(liveAt) {
    const liveDate = new Date(liveAt);
    const today = new Date();

    // Convert to start of day to avoid time-zone partial day prices
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

  const handleAskAI = (flag) => {
    if (flag && !authToken) {
      handleSigninOpen("ask_ai");
      return;
    }
    setIsAskAiActive(flag);
  }
  const handleQuesAns = (flag) => {
    setIsQuesAnsActive(flag);
  }



  const isPrivateDeal = dealDetails?.data?.deal_type === "private" ;

  const isccps = dealDetails?.data?.deal_type === "ccps";
  const isofs = dealDetails?.data?.deal_type === "ofs";
  const isunlisted = dealDetails?.data?.deal_type === "unlisted";
  const isPrivateLike = isPrivateDeal || isccps || isofs || isunlisted;
  const isDarkTheme = isPrivateDeal || isccps || isofs;
  const isPrivateAndOfs = isPrivateDeal && isofs;

  useEffect(() => {
    if (searchParams?.get("qna") === "true") {
      if (isDarkTheme) {
        setShowPrivateQna(true);
      } else {
        setShowQnA(true);
      }
    }
  }, [searchParams, isDarkTheme]);

  const dealData = dealDetails?.data?.deal_setpData;
  const rawDealType = dealDetails?.data?.deal_type || initialDealData?.data?.deal_type || currentDealType || "";
  const dealCategory = getDealCategoryInfo(rawDealType, dealDetails?.data || initialDealData?.data);

  const sectorBadges = useMemo(() => {
    const raw = [
      ...extractBadgeItems(dealData?.companies_sectors),
      ...extractBadgeItems(dealDetails?.data?.companies_sectors),
      ...extractBadgeItems(initialDealData?.data?.deal_setpData?.companies_sectors),
      ...extractBadgeItems(initialDealData?.data?.companies_sectors),
      ...extractBadgeItems(dealData?.company_sectors),
      ...extractBadgeItems(dealDetails?.data?.company_sectors),
    ];
    return Array.from(new Set(raw));
  }, [
    dealData?.companies_sectors,
    dealDetails?.data?.companies_sectors,
    initialDealData?.data?.deal_setpData?.companies_sectors,
    initialDealData?.data?.companies_sectors,
    dealData?.company_sectors,
    dealDetails?.data?.company_sectors,
  ]);

  const tagBadges = useMemo(() => {
    const raw = [
      ...extractBadgeItems(dealData?.tags),
      ...extractBadgeItems(dealDetails?.data?.tags),
      ...extractBadgeItems(initialDealData?.data?.deal_setpData?.tags),
      ...extractBadgeItems(initialDealData?.data?.tags),
    ];
    return Array.from(new Set(raw));
  }, [
    dealData?.tags,
    dealDetails?.data?.tags,
    initialDealData?.data?.deal_setpData?.tags,
    initialDealData?.data?.tags,
  ]);

  const uniqueSectorBadges = useMemo(() => {
    const tagSet = new Set(tagBadges.map((t) => t.toLowerCase()));
    return sectorBadges.filter((s) => !tagSet.has(s.toLowerCase()));
  }, [sectorBadges, tagBadges]);

  const isShowInterest = dealDetails?.data?.is_user_showed_interest;

  const limit = Number(dealDetails?.data?.deal_setpData?.target_funding_in_cr?.data) * 10000000;

  const [isShareOpen, setIsShareOpen] = useState(false);

  const copyDealLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showSuccessToast("Link copied successfully");
    }).catch(err => {
      showErrorToast("Failed to copy link");
    });
  }

  const [imgSrc, setImgSrc] = useState(
    dealData?.company_logo?.[0]?.path
      ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${dealData.company_logo[0].path.replace("public/", "")}`
      : "/logo-fallback.png"
  );

  const handleImageError = () => {
    setImgSrc("/logo-fallback.png");
  };

  useEffect(() => {
    const path = dealData?.company_logo?.[0]?.path;
    if (path) {
      setImgSrc(`${process.env.NEXT_PUBLIC_USER_BASE}admin/${path.replace("public/", "")}`);
    } else {
      setImgSrc("/logo-fallback.png");
    }
  }, [dealData?.company_logo?.[0]?.path]);

  if (loading || mainLoader) {
    return <Loader />;
  }

  return (
    <div className={`main-container ${isDarkTheme ? 'private-deal-theme' : ''}`}>
      <div className="subcontainer">

        <section className="topbar">
          <Link href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M17.0652 6.31555L12.5768 2.60451C11.0649 1.35449 8.93377 1.35449 7.42187 2.60451L2.93349 6.31555C2.12484 6.98415 1.66602 7.99787 1.66602 9.05558V14.8427C1.66602 16.722 3.11114 18.3337 4.99935 18.3337H6.66602C7.58649 18.3337 8.33268 17.5875 8.33268 16.667V13.9568C8.33268 12.9006 9.1261 12.1326 9.99935 12.1326C10.8726 12.1326 11.666 12.9006 11.666 13.9568V16.667C11.666 17.5875 12.4122 18.3337 13.3327 18.3337H14.9993C16.8876 18.3337 18.3327 16.722 18.3327 14.8427V9.05558C18.3327 7.99788 17.8738 6.98415 17.0652 6.31555Z" fill="url(#paint0_linear_18365_53611)" />
              <defs>
                <linearGradient id="paint0_linear_18365_53611" x1="0.0246017" y1="0.530628" x2="17.1963" y2="18.3337" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF2D0" />
                  <stop offset="1" stopColor="#8E6B0F" />
                </linearGradient>
              </defs>
            </svg>
          </Link>

          <svg
            width="8"
            height="10"
            viewBox="0 0 8 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.14206 13.6663C0.898251 13.6663 0.654443 13.573 0.468734 13.3873C0.0963594 13.0149 0.0963594 12.413 0.468734 12.0407L5.50958 6.99976L0.468734 1.95893C0.0963594 1.58656 0.0963594 0.984664 0.468734 0.612289C0.841109 0.239914 1.443 0.239914 1.81538 0.612289L7.52958 6.32651C7.90192 6.69884 7.90192 7.30076 7.52958 7.67309L1.81538 13.3873C1.62967 13.573 1.38586 13.6663 1.14206 13.6663Z"
              fill={isDarkTheme ? 'white' : " #6b7280"}
            />
          </svg>

          <span className="dea">
            <Link href="/deals"> Deals </Link>
          </span>

          {dealCategory && dealCategory.path !== "/deals" && (
            <>
              <svg
                width="8"
                height="10"
                viewBox="0 0 8 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.14206 13.6663C0.898251 13.6663 0.654443 13.573 0.468734 13.3873C0.0963594 13.0149 0.0963594 12.413 0.468734 12.0407L5.50958 6.99976L0.468734 1.95893C0.0963594 1.58656 0.0963594 0.984664 0.468734 0.612289C0.841109 0.239914 1.443 0.239914 1.81538 0.612289L7.52958 6.32651C7.90192 6.69884 7.90192 7.30076 7.52958 7.67309L1.81538 13.3873C1.62967 13.573 1.38586 13.6663 1.14206 13.6663Z"
                  fill={isDarkTheme ? 'white' : " #6b7280"}
                />
              </svg>

              <span className="dea">
                <Link href={dealCategory.path}> {dealCategory.label} </Link>
              </span>
            </>
          )}

          <svg
            width="8"
            height="10"
            viewBox="0 0 8 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.14206 13.6663C0.898251 13.6663 0.654443 13.573 0.468734 13.3873C0.0963594 13.0149 0.0963594 12.413 0.468734 12.0407L5.50958 6.99976L0.468734 1.95893C0.0963594 1.58656 0.0963594 0.984664 0.468734 0.612289C0.841109 0.239914 1.443 0.239914 1.81538 0.612289L7.52958 6.32651C7.90192 6.69884 7.90192 7.30076 7.52958 7.67309L1.81538 13.3873C1.62967 13.573 1.38586 13.6663 1.14206 13.6663Z"
              fill={isDarkTheme ? 'white' : " #6b7280"}
            />
          </svg>

          <span className="dea">
            {dealData?.company_name && dealData.company_name.length > 20 && isBelow500
              ? dealData.company_name.substring(0, 20) + "..."
              : dealData?.company_name}
          </span>
           
           <div className="shareAndBell">
            <div onClick={() => {
              setIsShareOpen(true)
            }}><ShareIcon /></div>
            {authToken && <div
              onClick={() => { handleSubscription(dealDetails?.data?.deal_id) }}
              className="bell-icon"
            >
              {!bellactive ? (
                <Bellactive />
              ) : (
                <BellOff />
              )}
            </div>}
          </div>
           

        </section>
        <section className="mob-topbar">
          <button
            className="breadcrumArrow"
            onClick={() => router.back()}
            style={{ cursor: "pointer", all: "unset", display: "flex", alignItems: "center", gap: "18px" }}
          >
            <svg
              viewBox="0 0 8 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 13L1 7L7 1"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="dea" style={{ marginTop: '3px' }}>
              {dealData?.company_name && dealData.company_name.length > 20 && isBelow500
                ? dealData.company_name.substring(0, 20) + "..."
                : dealData?.company_name}
            </span>
          </button>
          <div>
            <div onClick={() => {
              setIsShareOpen(true)
            }}><ShareIcon /></div>
            {authToken && <div
              onClick={() => { handleSubscription(dealDetails?.data?.deal_id) }}
              className="bell-icon"
            >
              {!bellactive ? (
                <Bellactive />
              ) : (
                <BellOff />
              )}
            </div>}
          </div>
        </section>

        <div className="body-maincontainer">
          <section className={hideForReferral ? "override-background body" : "body"}>
            <div className={"firsthalf"}>
              <div className="deal-header-top-row">
                <div className="deal-tags-column">
                  {(isofs || tagBadges.length > 0 || uniqueSectorBadges.length > 0) && (
                    <section className={`body1-buttons ${dealDetails?.data?.deal_type === "unlisted" ? "unlisted-buttons" : ""}`}>
                      {isofs && (
                        <Link href="/deals/unlisted-shares" className="ofsDefaultTagLink" title="View all Unlisted Shares">
                          <div className="ofsDefaultTag">
                            <p className="ofsDefaultTagText">Unlisted Shares</p>
                          </div>
                        </Link>
                      )}
                      {tagBadges.map((tag, index) => (
                        <Link
                          key={`tag-${index}`}
                          href={`/deals?tag=${encodeURIComponent(tag)}`}
                          className="deal-tag-badge-link"
                          title={`View all deals tagged with ${tag}`}
                        >
                          <span>{tag}</span>
                        </Link>
                      ))}
                      {uniqueSectorBadges.map((sector, index) => (
                        <Link
                          key={`sector-${index}`}
                          href={`/deals?sector=${encodeURIComponent(sector)}`}
                          className="deal-tag-badge-link"
                          title={`View all deals in ${sector}`}
                        >
                          <span>{sector}</span>
                        </Link>
                      ))}
                    </section>
                  )}
                </div>

                {(() => {
                  const hasTags = isofs || tagBadges.length > 0 || uniqueSectorBadges.length > 0;
                  const isIpoReviewStatusTrue = dealData?.ipo_review_rating?.status === true || dealData?.ipo_review_rating?.status === "true";
                  const rating = (isIpoReviewStatusTrue && (dealData?.ipo_review_rating?.data?.weighted_composite_score || dealData?.ipo_review_rating?.weighted_composite_score));
                  const numericRating = parseFloat(rating) || 0;
                  const hasRating = numericRating > 0;

                  return (
                    <div className={`deal-badges-column ${!hasTags ? 'no-tags' : ''} ${hasRating ? 'has-rating' : ''}`}>
                      {hasRating && (
                        <div className={`ratingContainer ${dealData?.exclusive_deal ? 'has-exclusive' : ''}`}>
                          <RatingBadge rating={rating} />
                        </div>
                      )}
                      {dealData?.exclusive_deal && (
                        <div className="exclusive-deal-tag">
                          <div className="exclusiveTagNew">EXCLUSIVE DEAL</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <section className="body-section2">
                <div>
                  <img
                    src={imgSrc}
                    alt={`${dealData?.company_name || dealDetails?.data?.company_name || "Company"} Logo - PrEqt`}
                    width={50}
                    height={50}
                    loading="eager"
                    fetchPriority="high"
                    onError={handleImageError}
                    style={{ borderRadius: '50%', objectFit: "contain", width: '50px', height: '50px', background: '#fff' }}
                  />
                  <h1>{dealData?.company_name || dealDetails?.data?.company_name || dealDetails?.data?.deal_overview?.company_name || "Deal Details"}</h1>
                </div>
                {authToken &&
                  <div className='svg-icons-button'>
                    <button className="share-button" onClick={() => {
                      setIsShareOpen(true)
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.58984 13.5098L15.4198 17.4898" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.4098 6.50977L8.58984 10.4898" stroke="#B59131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div
                      className="bell-icon"
                      onClick={() => { handleSubscription(dealDetails?.data?.deal_id) }}
                    >
                      {!bellactive ? (

                        <Bellactive />
                      ) : (
                        <BellOff />
                      )}
                    </div>
                  </div>}
              </section>
              {dealData?.tag_line?.status && (
                <section className="body-section3">
                  <svg
                    className="tag-line-icon"
                    width="34"
                    height="34"
                    viewBox="0 0 34 34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.4167 4.25H15.5833V13.5799L8.98612 6.98266L6.98265 8.98613L13.5799 15.5833H4.25V18.4167H13.5799L6.98266 25.0139L8.98613 27.0173L15.5833 20.4201V29.75H18.4167V20.4201L25.0139 27.0173L27.0173 25.0139L20.4201 18.4167H29.75V15.5833H20.4201L27.0173 8.98612L25.0139 6.98265L18.4167 13.5799V4.25Z"
                      fill="#B18C07"
                    />
                  </svg>

                  <span>
                    {dealData?.tag_line?.data}
                  </span>
                </section>
              )}



              {((dealData?.key_highlights?.status && dealData?.key_highlights?.data && dealData?.key_highlights?.data?.length > 0) ||
                (!isDarkTheme && (dealDetails?.data?.deal_type === "public" || dealDetails?.data?.deal_type === "private" || dealDetails?.data?.deal_type === "unlisted" || dealDetails?.data?.deal_type === "ofs") && dealData?.preqt_summary?.status)) && (
                <div className={hideForReferral ? "hideCardUI private-qualities" : isDarkTheme ? "private-qualities" : "qualities"}>
                  {dealData?.key_highlights?.status &&
                    dealData?.key_highlights?.data?.map((item, index) => (
                      <span key={index}>{item}</span>
                    ))}
                  {!isDarkTheme  && (dealDetails?.data?.deal_type === "public" || dealDetails?.data?.deal_type === "private" || dealDetails?.data?.deal_type === "unlisted" || dealDetails?.data?.deal_type === "ofs") && dealData?.preqt_summary?.status && (
                    <PreqtSummarySection 
                      isPrivateLike={false} 
                      summaryData={dealData?.preqt_summary?.data} 
                      labelName={dealData?.preqt_summary?.label_name} 
                    />
                  )}
                </div>
              )}
              {!isDarkTheme && !hideForReferral && (dealData?.ipo_review_rating?.status === true || dealData?.ipo_review_rating?.status === "true") && <IPOReviewAndRating reviewData={dealData?.ipo_review_rating?.data || dealData?.ipo_review_rating} />}
              {isDarkTheme && (dealDetails?.data?.deal_type === "public" || dealDetails?.data?.deal_type === "private" || dealDetails?.data?.deal_type === "unlisted" || dealDetails?.data?.deal_type === "ofs") && dealData?.preqt_summary?.status && (
                <PreqtSummarySection 
                  isPrivateLike={true} 
                  summaryData={dealData?.preqt_summary?.data} 
                  labelName={dealData?.preqt_summary?.label_name} 
                />
              )}

              {!hideForReferral && <div>

                <IPOCollapse isPrivateDeal={isDarkTheme} isccps={isccps} isofs={isofs} dealDetails={dealDetails} />

                <Valuation isPrivateDeal={isPrivateDeal} isccps={isccps} isofs={isofs} dealDetails={dealDetails} />

                {(!isMobile || isPrivateLike) && (
                  <Shares isPrivateDeal={isPrivateLike} isccps={isccps}  isofs={isofs}/>
                )}


                {((dealDetails?.data?.deal_type || '').toLowerCase() === "unlisted" || isunlisted || isofs) && (
                  <div className="unlistedDisclaimerDetails">
                    <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="cautionIcon">
                      <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
                      <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
                      <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
                    </svg>
                    <span>Disclaimer: Unlisted shares are unregulated & illiquid. This is NOT investment advice. Please do your own due diligence before investing.</span>
                  </div>
                )}
              </div>}
              {/* <div className="ipo-timeline-section mobile-ipo-timeline-section">
                <h3>IPO Timeline</h3>

                <div className="timeline">
                  {steps.map((step, index) => (
                    <div key={index} className="timeline-step">
                      <div
                        className={`timeline-icon ${step.completed ? "completed" : ""
                          }`}
                      >
                        {step.completed ? (
                          <svg
                            className="completed"
                            width="26"
                            height="27"
                            viewBox="0 0 26 27"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_3818_3279)">
                              <circle
                                cx="12.8029"
                                cy="13.4182"
                                r="12.0028"
                                fill="#B59131"
                                stroke="#B59131"
                                strokeWidth="1.60037"
                              />
                            </g>
                            <path
                              d="M10.0645 16.3326L17.7799 8.61719L18.8043 9.64162L10.0645 18.3814L6.00098 14.3191L7.02541 13.2947L10.0645 16.3326Z"
                              fill="white"
                            />
                            <defs>
                              <clipPath id="clip0_3818_3279">
                                <rect
                                  width="25.6059"
                                  height="25.6059"
                                  fill="white"
                                  transform="translate(0 0.615234)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        ) : (
                          <span className="step-num">{step.number}</span>
                        )}
                      </div>
                      <div className="timeline-content">
                        <div className="label">{step.label}</div>
                        <div className="date">{step.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>

            <button className={`${isDarkTheme ? " private-qna-btn" : "qna-mob-btn"}`}
              onClick={() => {
                if (!authToken) {
                  handleSigninOpen("qna");
                  return;
                }
                isDarkTheme ? setShowPrivateQna(true) : setShowQnA(true);
              }}
            >
              <>
                <div className="initialsContainer">
                  {getLatestReplyInitials(replies?.data?.questions_by || []).map((i, index) => (
                    <div key={index} className="initialBadge">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="s1">
                  {qaCount && Number(qaCount) > 0 ? (
                    `${qaCount} Q&A answered in last ${daysUntilLive(liveAt)} days`
                  ) : (
                    "Do you have any question? Ask now"
                  )}
                </span>
                <span className="s2">
                  <img src="/assets/pictures/8e3073ca31264b3cb0bd9cb1e07af102b937cb5c.gif" alt="gif" />
                </span>
              </>
            </button>

            {/* <div className={hideForReferral ? "hideCardUI" : ""}>
              <Featured isPrivateDeal={isPrivateLike} data={setDealDataDetails} />
            </div> */}

          </section>

          {isPrivateLike ? (
            <div className={hideForReferral ? "hideCardUI" : ""}>
              <Calculator dealDetails={dealDetails.data} isAskAiActive={isAskAiActive} handleAskAI={handleAskAI} isPrivateDeal={isPrivateLike} deal_id={dealDetails?.data?.deal_id} limit={limit} qaCount={qaCount} replies={replies} isccps={isccps} authToken={authToken} isShowInterest={isShowInterest} fetchDealDetails={fetchDealDetails} onLoginClick={handleSigninOpen} onShowOtp={handleSigninShowOtp} />
            </div>
          ) : (
            <AskAiSection
              isPrivateDeal={isPrivateLike}   // 👈 now AskAiSection gets it
              isAskAiActive={isAskAiActive}
              handleAskAI={handleAskAI}
              qaCount={qaCount}
            />
          )}

        </div>
        <div className="secondhalf">
          {isMobile ? (
            hideForReferral ? "" : <Customnavbar isPrivateDeal={isDarkTheme} dealDetails={dealDetails} />

          ) :
            hideForReferral ? " " : <PrivateDealDetails isPrivateDeal={isDarkTheme} dealDetails={dealDetails} />}
        </div>
      </div>
      {/* <QuestionAnswer /> */}
      {/* <div className="faq-section">
        <FAQSection />
      </div> */}
      <div className="account-footer">
        <Accountfooter />
      </div>

      {isShareOpen && <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} shareUrl={window.location.href} onCopy={copyDealLink} />}
      {
        showPrivateQna && (
          <div
            className="qna-overlay"
            onClick={() => setShowPrivateQna(false)}
          >
            <div className="qnaSlider" onClick={(e) => e.stopPropagation()}>
              <PrivateQuestion
                onBack={() => setShowPrivateQna(false)}
                qaCount={qaCount}
                replies={replies}
              />

            </div>
          </div>
        )
      }
      {
        showQnA && (
          <div
            className="qna-overlay"
            onClick={() => setShowQnA(false)}
          >
            <div
              className="qnaSlider"
              onClick={(e) => e.stopPropagation()}
            >
              <QuestionAnswer qaCount={qaCount} handleQuesAns={() => setShowQnA(false)} />
            </div>
          </div>
        )
      }

      {showSignin && (
        <SigninPopup
          show={showSignin}
          onHide={handleSigninClose}
          onShowOtp={handleSigninShowOtp}
        />
      )}

      {otpPayload && (
        <OtpPopup
          {...otpPayload}
          show
          handleClose={() => {
            setOtpPayload(null);
            setPendingAction(null);
          }}
          handleBack={() => {
            setOtpPayload(null);
            setShowSignin(true);
          }}
          onVerified={() => {
            setOtpPayload(null);
            fetchDealDetails();

            if (pendingAction === "show_interest") {
              window.dispatchEvent(new CustomEvent("openShowInterest"));
            } else if (pendingAction === "ask_ai") {
              setIsAskAiActive(true);
            } else if (pendingAction === "qna") {
              if (isDarkTheme) setShowPrivateQna(true);
              else setShowQnA(true);
            }
            setPendingAction(null);
          }}
        />
      )}
    </div >
  );
};

const PreqtSummarySection = ({ isPrivateLike, summaryData, labelName }) => {
  if (!summaryData) return null;
  const isLight = !isPrivateLike;
  const theme = {
    bg: isLight ? "linear-gradient(90deg, #FDF9EF 0%, #FFFFFF 100%)" : "linear-gradient(90deg, #000000 0%, rgba(0, 0, 0, 0) 100%)",
    textMain: isLight ? "#1a1a1a" : "#ffffff",
    textSub: isLight ? "#6b7280" : "#9ca3af",
    titleColor: "#B59131",
    cardBg: isLight ? "linear-gradient(180deg, #FDFAEE 0%, rgba(238, 242, 253, 0) 40%)" : "linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%)",
    border: isLight ? "none" : "1px solid #1a1a1a",
  };

  return (
    <div style={{ width: "100%" }}>
      <h2 style={{ color: theme.titleColor, marginBottom: "12px", marginTop: "10px" ,fontSize: "16px", fontWeight: "500", fontFamily: "Helvetica Neue" }}>
          {labelName || "Preqt Summary"}
        </h2>
      <div
        style={{
          borderLeft: "4px solid #B59131",
          color: theme.textMain,
          background: theme.bg,
          padding: "12px 16px",
          borderRadius: "0 8px 8px 0",
          borderTop: theme.border,
          borderRight: theme.border,
          borderBottom: theme.border,
        }}
      >
        <div 
          style={{ fontSize: "12px", lineHeight: "1.6", fontFamily: "Helvetica Neue", margin: 0 }}
          className='deal-summary'
          dangerouslySetInnerHTML={{ __html: summaryData }}
        />
      </div>

      {/* <h3 style={{ color: theme.textMain, marginBottom: "16px", fontSize: "14px", fontWeight: "400", fontFamily: "Helvetica Neue", marginTop: 0 }}>
        Why This Deal Stands Out
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "8px" }}>
        Card 1
        <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", border: theme.border, display: "flex", gap: "15px" }}>
          <div style={{ marginTop: "3px", flexShrink: 0 }}>
            <StandingCheckIcon />
          </div>
          <div>
            <h4 style={{ color: theme.textMain, marginBottom: "8px", fontSize: "12px", fontWeight: "700", fontFamily: "Helvetica Neue", marginTop: 0 }}>Issue size and structure</h4>
            <p style={{ color: theme.textSub, fontSize: "12px", lineHeight: "1.4", fontFamily: "Helvetica Neue", margin: 0 }}>₹583 Cr IPO with fresh issue of ₹418 Cr and OFS of ₹165 Cr. Price band ₹216-₹227.</p>
          </div>
        </div>

        Card 2
        <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", border: theme.border, display: "flex", gap: "15px" }}>
          <div style={{ marginTop: "3px", flexShrink: 0 }}>
            <StandingCheckIcon />
          </div>
          <div>
            <h4 style={{ color: theme.textMain, marginBottom: "8px", fontSize: "12px", fontWeight: "700", fontFamily: "Helvetica Neue", marginTop: 0 }}>Explosive Growth</h4>
            <p style={{ color: theme.textSub, fontSize: "12px", lineHeight: "1.4", fontFamily: "Helvetica Neue", margin: 0 }}>340% CAGR revenue growth with strong customer relationships and export-focused supply chain.</p>
          </div>
        </div>

        Card 3
        <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", border: theme.border, display: "flex", gap: "15px" }}>
          <div style={{ marginTop: "3px", flexShrink: 0 }}>
            <StandingCheckIcon />
          </div>
          <div>
            <h4 style={{ color: theme.textMain, marginBottom: "8px", fontSize: "12px", fontWeight: "700", fontFamily: "Helvetica Neue", marginTop: 0 }}>Strong Financials</h4>
            <p style={{ color: theme.textSub, fontSize: "12px", lineHeight: "1.4", fontFamily: "Helvetica Neue", margin: 0 }}>FY25 income ₹349.71 Cr with PAT ₹43.87 Cr showing consistent profitability.</p>
          </div>
        </div>

        Card 4
        <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", border: theme.border, display: "flex", gap: "15px" }}>
          <div style={{ marginTop: "3px", flexShrink: 0 }}>
            <StandingCheckIcon />
          </div>
          <div>
            <h4 style={{ color: theme.textMain, marginBottom: "8px", fontSize: "12px", fontWeight: "700", fontFamily: "Helvetica Neue", marginTop: 0 }}>Premium Metrics</h4>
            <p style={{ color: theme.textSub, fontSize: "12px", lineHeight: "1.4", fontFamily: "Helvetica Neue", margin: 0 }}>ROE 12.07%, PAT margin 11.74%, valued at P/E ~50x with strong fundamentals.</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export const StandingCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="url(#paint0_linear_24441_49678)" />
    <g clipPath="url(#clip0_24441_49678)">
      <path d="M17.6479 7.89759C17.4206 7.67037 17.0523 7.67037 16.825 7.89759L9.85449 14.8682L7.17512 12.1888C6.94792 11.9616 6.57956 11.9616 6.35231 12.1888C6.12508 12.416 6.12508 12.7844 6.35231 13.0116L9.44308 16.1024C9.67021 16.3296 10.0389 16.3294 10.2659 16.1024L17.6479 8.72041C17.8751 8.49321 17.8751 8.12482 17.6479 7.89759Z" fill="white" />
    </g>
    <defs>
      <linearGradient id="paint0_linear_24441_49678" x1="3.94829e-07" y1="12" x2="20.2544" y2="20.71" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D2C299" />
        <stop offset="1" stopColor="#8E6B0F" />
      </linearGradient>
      <clipPath id="clip0_24441_49678">
        <rect width="11.6364" height="11.6364" fill="white" transform="translate(6.18188 6.18182)" />
      </clipPath>
    </defs>
  </svg>
);

export default Namedetailsection;