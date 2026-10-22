import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDealStore } from "@/store/dealStore";
import Overview from "./overview/overview";
import Business from "./business/Business";
import Industry from "./industry/industry";
import Keyfinancials from "./keyfinancials/keyfinancials";
import Shareholding from "./fundraise/Shareholding";
import Documentation from "./documentation/page";
import "./customnavbar.css";

const Customnavbar = ({ isPrivateDeal, isccps, dealDetails: dealDetailsProp }) => {
  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;

  const hasOverview = useMemo(() => {
    const dealOverview = dealDetails?.data?.deal_overview;
    if (!dealOverview || dealOverview.status === false) {
      return false;
    }
    return Object.keys(dealOverview).some((key) => {
      if (key === "status") return false;
      const item = dealOverview[key];
      return (
        item &&
        typeof item === "object" &&
        item.status === true &&
        item.data !== null &&
        item.data !== undefined
      );
    });
  }, [dealDetails]);

  const hasBusiness = useMemo(() => {
    const business = dealDetails?.data?.business;
    if (!business) return false;

    // Determine data sources for Products and Services
    const productsObj = business?.products_and_services?.status 
      ? business.products_and_services.data?.products 
      : business?.products;
    const servicesObj = business?.products_and_services?.status 
      ? business.products_and_services.data?.services 
      : business?.services;

    const hasProducts = Array.isArray(productsObj?.data) && productsObj.data.length > 0;
    const hasServices = Array.isArray(servicesObj?.data) && servicesObj.data.length > 0;
    const checkData = (node) => {
      if (!node || node.status === false) return false;
      const d = node.data;
      if (typeof d === "string") return d.trim().length > 0;
      if (Array.isArray(d)) return d.length > 0;
      if (Array.isArray(d?.data)) return d.data.length > 0;
      if (d?.content && String(d.content).trim().length > 0) return true;
      if (Array.isArray(node.files) && node.files.length > 0) return true;
      return false;
    };

    const hasGeo = checkData(business?.geographical_presence);
    const hasModel = checkData(business?.business_model);
    const hasChannel = checkData(business?.sales_channel);
    const hasClients = !!(business?.clients?.status && Array.isArray(business.clients.data) && business.clients.data.length > 0);
    const hasRisk = !!(
      business?.key_risk_factors?.status &&
      (
        (typeof business.key_risk_factors.data === "string" && business.key_risk_factors.data.trim() !== "") ||
        (Array.isArray(business.key_risk_factors.data) && business.key_risk_factors.data.length > 0) ||
        (Array.isArray(business.key_risk_factors.data?.data) && business.key_risk_factors.data.data.length > 0) ||
        business.key_risk_factors.data?.content ||
        (Array.isArray(business.key_risk_factors.files) && business.key_risk_factors.files.length > 0)
      )
    );

    return hasProducts || hasServices || hasGeo || hasModel || hasChannel || hasClients || hasRisk;
  }, [dealDetails]);

  const hasFundraise = useMemo(() => {
    const fundraise = dealDetails?.data?.fundraise_future_plans;
    if (!fundraise || fundraise.status === false) return false;

    // 1. Shareholding Pattern check
    const shareholding = fundraise.shareholding_pattern;
    let hasShareholding = false;
    if (shareholding && shareholding.status !== false) {
      const promoters = shareholding?.data?.promoters?.data || shareholding?.promoters?.data;
      const additionals = shareholding?.data?.additional_shareholders?.data || shareholding?.additional_shareholders?.data;
      
      const hasPromoters = Array.isArray(promoters) && promoters.length > 0 && promoters.some(p => p && (p.promoter_name || p.pre_issue_share || p.post_issue_share));
      const hasAdditionals = Array.isArray(additionals) && additionals.length > 0 && additionals.some(a => a && (a.shareholder_name || a.pre_issue_share || a.post_issue_share));
      hasShareholding = hasPromoters || hasAdditionals;
    }

    const existingInvestors = fundraise.existing_investor || fundraise.existing_investors;
    const hasExistingInvestors = existingInvestors && existingInvestors.status !== false && existingInvestors.status !== "false";

    if (isPrivateDeal) {
      return hasShareholding || hasExistingInvestors;
    }

    // 2. IPO Key Highlights check
    const ipoHighlights = fundraise.ipo_key_highlights;
    let hasHighlights = false;
    if (ipoHighlights && ipoHighlights.status !== false && ipoHighlights.status !== "false") {
      const highlightsData = ipoHighlights.data;
      hasHighlights = Array.isArray(highlightsData) && highlightsData.length > 0 && highlightsData.some(item => {
        const key = Object.keys(item)[0];
        const val = item[key]?.value !== undefined ? item[key]?.value : item[key];
        const desc = item[key]?.description;
        return (val?.status && val?.data != null && val?.data !== "") || (desc?.status && desc?.data != null && desc?.data !== "");
      });
    }

    // 3. IPO Objective check
    const ipoObjective = fundraise.ipo_objective;
    const hasObjective = !!(
      ipoObjective &&
      ipoObjective.status !== false && (
        (ipoObjective.business_expansion?.status && ipoObjective.business_expansion?.data != null && ipoObjective.business_expansion?.data !== "") ||
        (ipoObjective.utilization_of_proceeds?.status && ipoObjective.utilization_of_proceeds?.data != null && ipoObjective.utilization_of_proceeds?.data !== "") ||
        (ipoObjective.capital_expenditure?.status && ipoObjective.capital_expenditure?.data != null && ipoObjective.capital_expenditure?.data !== "") ||
        (ipoObjective.credit_rating_outlook?.status && ipoObjective.credit_rating_outlook?.data != null && ipoObjective.credit_rating_outlook?.data !== "")
      )
    );

    // 4. IPO Notes check
    const ipoNotes = fundraise.ipo_notes;
    const hasNotes = !!(
      ipoNotes &&
      ipoNotes.status !== false && (
        (ipoNotes.risk_factor?.status && ipoNotes.risk_factor?.data != null && ipoNotes.risk_factor?.data !== "") ||
        (ipoNotes.additional_activities?.status && ipoNotes.additional_activities?.data != null && ipoNotes.additional_activities?.data !== "") ||
        (ipoNotes.important_dates?.status && ipoNotes.important_dates?.data != null && ipoNotes.important_dates?.data !== "") ||
        (ipoNotes.additional_notes?.status && ipoNotes.additional_notes?.data != null && ipoNotes.additional_notes?.data !== "")
      )
    );

    return hasShareholding || hasHighlights || hasObjective || hasNotes || hasExistingInvestors;
  }, [dealDetails, isPrivateDeal]);

  const availableTabs = useMemo(() => {
    const list = [];
    if (hasOverview) list.push("Overview");
    if (hasBusiness) list.push("Business");
    list.push("Industry Overview");
    list.push("Financial Highlights");
    if (hasFundraise) list.push("Fundraise/Future Plans");
    list.push("Documentation");
    return list;
  }, [hasOverview, hasBusiness, hasFundraise]);

  const [key, setKey] = useState("Overview");

  useEffect(() => {
    if (!availableTabs.includes(key)) {
      setKey(availableTabs[0] || "Overview");
    }
  }, [availableTabs, key]);

  const tabsRef = useRef(null);
  const isManualScrolling = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const contentRefs = {
    Overview: useRef(null),
    Business: useRef(null),
    "Industry Overview": useRef(null),
    "Financial Highlights": useRef(null),
    "Fundraise/Future Plans": useRef(null),
    Documentation: useRef(null),
  };

  const keyRef = useRef(key);
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  const scrollHeaderActiveLink = (activeTabName) => {
    const container = tabsRef.current;
    const activeLink = container?.querySelector(`[data-tab-name="${activeTabName}"]`);
    if (container && activeLink) {
      const containerWidth = container.offsetWidth;
      const linkOffsetLeft = activeLink.offsetLeft;
      const linkWidth = activeLink.offsetWidth;
      // Center the active tab in the horizontally scrollable bar
      const targetScrollLeft = linkOffsetLeft - (containerWidth / 2) + (linkWidth / 2);
      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth"
      });
    }
  };

  const handleTabClick = (tabName) => {
    isManualScrolling.current = true;
    setKey(tabName);

    const element = contentRefs[tabName]?.current;
    if (element) {
      const navbarHeight = tabsRef.current?.offsetHeight || 0;
      // Scroll to target offset with a small buffer
      const targetOffset = element.getBoundingClientRect().top + window.scrollY - navbarHeight + 2;

      window.scrollTo({
        top: targetOffset,
        behavior: "smooth",
      });

      scrollHeaderActiveLink(tabName);
    }

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrolling.current = false;
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrolling.current) return;

      const navbarHeight = tabsRef.current?.offsetHeight || 0;
      let activeTab = availableTabs[0];

      // Check if user scrolled near the bottom of the page
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;
      
      if (isAtBottom && availableTabs.length > 0) {
        activeTab = availableTabs[availableTabs.length - 1];
      } else {
        // Find the active section based on scroll offset
        for (const tabName of availableTabs) {
          const element = contentRefs[tabName]?.current;
          if (element) {
            const rect = element.getBoundingClientRect();
            // A section is considered active if its top edge is scrolled past the sticky navbar bottom
            // Let's add a small offset buffer of 40px to make transition occur slightly before the heading hits the navbar
            if (rect.top - navbarHeight - 40 <= 0) {
              activeTab = tabName;
            }
          }
        }
      }

      if (activeTab && activeTab !== keyRef.current) {
        setKey(activeTab);
        scrollHeaderActiveLink(activeTab);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial active section on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [availableTabs]);

  return (
    <div className="first-navbar">
      <ul className="nav nav-tabs navigation-tabs" ref={tabsRef} role="tablist">
        {availableTabs.map((tabName) => {
          const isActive = key === tabName;
          return (
            <li key={tabName} className="nav-item" role="presentation">
              <button
                type="button"
                className={`nav-link ${isActive ? "active" : ""}`}
                role="tab"
                aria-selected={isActive}
                data-tab-name={tabName}
                onClick={() => handleTabClick(tabName)}
              >
                {tabName}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="tab-contents-stacked">
        {hasOverview && (
          <div ref={contentRefs["Overview"]} className="tab-section-mobile">
            <h2 className="tab-section-title-mobile">Overview</h2>
            <div className="tab-content-wrapper">
              <Overview isPrivateDeal={isPrivateDeal} dealDetails={dealDetails} />
            </div>
          </div>
        )}

        {hasBusiness && (
          <div ref={contentRefs["Business"]} className="tab-section-mobile">
            <h2 className="tab-section-title-mobile">Business</h2>
            <div className="tab-content-wrapper">
              <Business isPrivateDeal={isPrivateDeal} dealDetails={dealDetails} />
            </div>
          </div>
        )}

        <div ref={contentRefs["Industry Overview"]} className="tab-section-mobile">
          <h2 className="tab-section-title-mobile">Industry Overview</h2>
          <div className="tab-content-wrapper">
            <Industry isPrivateDeal={isPrivateDeal} dealDetails={dealDetails} />
          </div>
        </div>

        <div ref={contentRefs["Financial Highlights"]} className="tab-section-mobile">
          <h2 className="tab-section-title-mobile">Financial Highlights</h2>
          <div className="tab-content-wrapper">
            <Keyfinancials isPrivateDeal={isPrivateDeal} dealDetails={dealDetails} />
          </div>
        </div>

        {hasFundraise && (
          <div ref={contentRefs["Fundraise/Future Plans"]} className="tab-section-mobile">
            <h2 className="tab-section-title-mobile">Fundraise/Future Plans</h2>
            <div className="tab-content-wrapper">
              <Shareholding isPrivateDeal={isPrivateDeal} isccps={isccps} dealDetails={dealDetails} />
            </div>
          </div>
        )}

        <div ref={contentRefs["Documentation"]} className="tab-section-mobile">
          <h2 className="tab-section-title-mobile">Documentation</h2>
          <div className="tab-content-wrapper">
            <Documentation isPrivateDeal={isPrivateDeal} dealDetails={dealDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customnavbar;