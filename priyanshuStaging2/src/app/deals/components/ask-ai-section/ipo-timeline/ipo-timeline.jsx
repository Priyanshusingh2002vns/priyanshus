"use client";
import { useDealStore } from "@/store/dealStore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useDeals } from "@/app/context/DealContext";
import { formatDealCountText } from "@/app/utils/formatUtils";

const Ipotimeline = ({ handleAskAI, handleQuesAns, isPrivateDeal, qaCount }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const ipoTimeline = dealDetails?.data?.deal_setpData?.ipo_timeline;
  const [replies, setReplies] = useState(null); // Store replies data
  const dealId = dealDetails?.data?.deal_id;
  const { totalDeals } = useDeals();

  const hasIpoTimeline =
    ipoTimeline?.status && ipoTimeline?.data && Object.keys(ipoTimeline.data).length > 0;
  const ipoData = hasIpoTimeline ? ipoTimeline.data : {};

  // ✅ Dynamically generate steps from API keys
  const steps = hasIpoTimeline
    ? [
        { label: "IPO Open Date", date: ipoData.ipo_open_date },
        { label: "IPO Close Date", date: ipoData.ipo_close_date },
        { label: "Tentative Allotment", date: ipoData.tentative_allotment },
        { label: "Initiation of Refunds", date: ipoData.initiation_of_refunds },
        { label: "Credit of Shares to Demat", date: ipoData.credit_of_shares_to_demat },
        { label: "Tentative Listing Date", date: ipoData.tentative_listing_date },
        // { label: "Cut-off time for UPI mandate confirmation", date: ipoData.cut_off_time_for_upi_mandate_confirmation },
      ]
    : [];

  // ✅ Function to format dates like "Fri, Oct 04, 2025"
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // ✅ Determine which steps are completed (today-based)
  const today = new Date();
  const stepsWithStatus = steps.map((step, i) => ({
    ...step,
    date: formatDate(step.date),
    completed: step.date ? new Date(step.date) < today : false,
    number: (i + 1).toString().padStart(2, "0"),
  }));

  // Fetch replies data for initials
  useEffect(() => {
    const fetchRepliesCount = async () => {
      if (!dealId) return;

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
        // Store replies data for initials
        setReplies(data);
      } catch (err) {
        console.error("Error fetching replies count:", err);
      }
    };

    fetchRepliesCount();
  }, [dealId, isPrivateDeal]);

  // Function to calculate days until live
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

  // Function to get latest reply initials
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

  const liveAt = dealDetails?.data?.deal_setpData?.live_at;

  return (
    <section className="ask-ai-section">
      {/* Ask AI Button conditionally rendered based on chat_bot_supported */}


      {/* {dealDetails?.data?.chat_bot_supported && (
      <button
        className="ask-ai-button"
        onClick={() => handleAskAI(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9.9688 5.57749L10.571 7.24999C11.24 9.10624 12.7018 10.568 14.558 11.237L16.2305 11.8392C16.3813 11.894 16.3813 12.1077 16.2305 12.1617L14.558 12.764C12.7018 13.433 11.24 14.8947 10.571 16.751L9.9688 18.4235C9.91405 18.5742 9.7003 18.5742 9.6463 18.4235L9.04405 16.751C8.37505 14.8947 6.9133 13.433 5.05705 12.764L3.38455 12.1617C3.2338 12.107 3.2338 11.8932 3.38455 11.8392L5.05705 11.237C6.9133 10.568 8.37505 9.10624 9.04405 7.24999L9.6463 5.57749C9.7003 5.42599 9.91405 5.42599 9.9688 5.57749Z" fill="#E4C575" />
          <path d="M17.4973 1.55794L17.8026 2.40469C18.1416 3.34444 18.8818 4.08469 19.8216 4.42369L20.6683 4.72894C20.7448 4.75669 20.7448 4.86469 20.6683 4.89244L19.8216 5.19769C18.8818 5.53669 18.1416 6.27694 17.8026 7.21669L17.4973 8.06344C17.4696 8.13994 17.3616 8.13994 17.3338 8.06344L17.0286 7.21669C16.6896 6.27694 15.9493 5.53669 15.0096 5.19769L14.1628 4.89244C14.0863 4.86469 14.0863 4.75669 14.1628 4.72894L15.0096 4.42369C15.9493 4.08469 16.6896 3.34444 17.0286 2.40469L17.3338 1.55794C17.3616 1.48069 17.4703 1.48069 17.4973 1.55794Z" fill="#E4C575" />
          <path d="M17.4973 15.9382L17.8026 16.785C18.1416 17.7247 18.8818 18.465 19.8216 18.804L20.6683 19.1092C20.7448 19.137 20.7448 19.245 20.6683 19.2727L19.8216 19.578C18.8818 19.917 18.1416 20.6572 17.8026 21.597L17.4973 22.4437C17.4696 22.5202 17.3616 22.5202 17.3338 22.4437L17.0286 21.597C16.6896 20.6572 15.9493 19.917 15.0096 19.578L14.1628 19.2727C14.0863 19.245 14.0863 19.137 14.1628 19.1092L15.0096 18.804C15.9493 18.465 16.6896 17.7247 17.0286 16.785L17.3338 15.9382C17.3616 15.8617 17.4703 15.8617 17.4973 15.9382Z" fill="#E4C575" />
        </svg>
        Ask AI About This Deal
      </button>
      )} */}

      <div className="ask-ai-section2">
        <button className="image-stack" onClick={() => handleQuesAns && handleQuesAns(true)}>
          <div className="initialsContainer">
            {getLatestReplyInitials(replies?.data?.questions_by || []).map((i, index) => (
              <div key={index} className="initialBadge">
                {i}
              </div>
            ))}
          </div>
          <span className="s1">{qaCount > 0 ? `${qaCount} Q&A answered in last ${daysUntilLive(liveAt)} days`:  "Do you have any question? Ask now"} </span>
          <span className="s2">
            <img src="/assets/pictures/8e3073ca31264b3cb0bd9cb1e07af102b937cb5c.gif" alt="gif" />
          </span>
        </button>

        {/* ✅ IPO Timeline Section */}
        {hasIpoTimeline &&
        
        (
          <div className="ipo-timeline-section">
            <h3>IPO Timeline</h3>
            <div className="timeline">
              {stepsWithStatus.map((step, index) => (
                <div key={index} className="timeline-step">
                  <div className={`timeline-icon ${step.completed ? "completed" : "not-completed"}`}>
                    {step.completed ? (
                      <svg
                        className="completed"
                        width="26"
                        height="27"
                        viewBox="0 0 26 27"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12.8029"
                          cy="13.4182"
                          r="12.0028"
                          fill="#B59131"
                          stroke="#B59131"
                          strokeWidth="1.60037"
                        />
                        <path
                          d="M10.0645 16.3326L17.7799 8.61719L18.8043 9.64162L10.0645 18.3814L6.00098 14.3191L7.02541 13.2947L10.0645 16.3326Z"
                          fill="white"
                        />
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

           
          </div>
        )}
         <div className="view-details-btn">
              <div className="left-div">
                <div className="greenDot"></div>
                 <p>{formatDealCountText(totalDeals, "remaining")}</p>
              </div>
              <Link className="link" href="/deals">View All Deals</Link>
            </div>
      </div>
    </section>
  );
};

export default Ipotimeline;
