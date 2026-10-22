"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Styles from "./ExploreTagsBanner.module.css";

export default function ExploreTagsBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isCommunityDetailPage = pathname?.startsWith("/community/") && pathname !== "/community";

  const [selectedTags, setSelectedTags] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const rawTags = urlParams.get("tags");
      const rawTag = urlParams.get("tag");
      if (rawTags) {
        return rawTags.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (rawTag) {
        return [rawTag.trim()];
      }
    } catch (e) {}
    return [];
  });

  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState([
    "avengers",
    "power",
    "mind",
    "time",
    "kk",
    "dff",
    "mk",
    "ck",
    "rk",
    "ksdj",
    "lskd",
    "ksjd",
    "skjd"
  ]);
  const searchDropdownRef = useRef(null);

  // Sync with searchParams
  useEffect(() => {
    const rawTags = searchParams?.get("tags");
    const rawTag = searchParams?.get("tag");
    let tagsFromUrl = [];
    if (rawTags) {
      tagsFromUrl = rawTags.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (rawTag) {
      tagsFromUrl = [rawTag.trim()];
    }
    setSelectedTags(tagsFromUrl);
  }, [searchParams]);

  // Listen to custom event from sidebar or post clicks
  useEffect(() => {
    const handleTagEvent = (e) => {
      const tag = e.detail?.tag;
      const tags = e.detail?.tags;
      if (tags && Array.isArray(tags)) {
        setSelectedTags(tags);
      } else if (tag) {
        setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
      }
    };
    window.addEventListener("communityTagChanged", handleTagEvent);
    return () => window.removeEventListener("communityTagChanged", handleTagEvent);
  }, []);

  // Fetch community tags for autocomplete
  useEffect(() => {
    const fetchCommunityTags = async () => {
      try {
        const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
        const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`;
        const res = await fetch(`${baseUrl}admin/api/community/community-tags`);
        if (res.ok) {
          const result = await res.json();
          const tagsList = result?.data?.data || result?.data || [];
          if (Array.isArray(tagsList) && tagsList.length > 0) {
            setAvailableTags(tagsList);
          }
        }
      } catch (e) {}
    };
    fetchCommunityTags();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateUrlTags = (tags) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (tags.length === 0) {
      url.searchParams.delete("tag");
      url.searchParams.delete("tags");
    } else {
      url.searchParams.delete("tag");
      url.searchParams.set("tags", tags.join(","));
    }
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new CustomEvent("communityTagChanged", { detail: { tags } }));
  };

  const handleAddTag = (tag) => {
    if (!tag) return;
    const trimmed = tag.trim();
    if (!selectedTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      const nextTags = [...selectedTags, trimmed];
      setSelectedTags(nextTags);
      updateUrlTags(nextTags);
    }
    setTagSearchQuery("");
    setShowSearchDropdown(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const nextTags = selectedTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
    setSelectedTags(nextTags);
    updateUrlTags(nextTags);
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
    updateUrlTags([]);
  };

  const suggestedTags = useMemo(() => {
    const q = tagSearchQuery.trim().toLowerCase();
    return availableTags.filter((t) => {
      if (selectedTags.some((st) => st.toLowerCase() === t.toLowerCase())) return false;
      if (!q) return true;
      return t.toLowerCase().includes(q);
    });
  }, [availableTags, tagSearchQuery, selectedTags]);

  if (isCommunityDetailPage || !selectedTags || selectedTags.length === 0) {
    return null;
  }

  return (
    <div className={Styles.bannerWrapper}>
      <div className={Styles.bannerInner}>
        {/* Breadcrumb */}
        <div className={Styles.breadcrumb}>
          <button
            type="button"
            className={Styles.breadcrumbBackBtn}
            onClick={handleClearAllTags}
          >
            <img src="/arrow-left.svg" alt="arrow left" className={Styles.breadcrumbArrowImg} />
            <span>All Community Posts</span>
          </button>
          <span className={Styles.breadcrumbDot}>•</span>
          <span className={Styles.breadcrumbTagLabel}>#Explore Tags</span>
        </div>

        {/* Main Heading: #IPO,  #High Conviction */}
        <h2 className={Styles.mainHeading}>
          {selectedTags.map((t) => `#${t}`).join(",  ")}
        </h2>

        {/* Description  Removed as asked by the client (20-Sep-2026)*/}
        {/* <p className={Styles.description}>
          Explore conversations, insights, and updates related to mainboard and SME public listings, DRHP filings, and subscription trends.
        </p> */}

        {/* Filter Bar Row */}
        <div className={Styles.filterBar}>
          <div className={Styles.filterByGroup}>
            <span className={Styles.filterByLabel}>Filter by:</span>
            <div className={Styles.pillsContainer}>
              {selectedTags.map((tag) => (
                <span key={tag} className={Styles.tagPill}>
                  <span>{tag}</span>
                  <button
                    type="button"
                    className={Styles.removeTagBtn}
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove ${tag}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              className={Styles.clearAllBtn}
              onClick={handleClearAllTags}
            >
              Clear All
            </button>
          </div>

          {/* Search and add tags input */}
          <div className={Styles.searchContainer} ref={searchDropdownRef}>
            <div className={Styles.searchInputWrapper}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={Styles.searchIcon}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search and add tags..."
                value={tagSearchQuery}
                onChange={(e) => {
                  setTagSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className={Styles.searchInput}
              />
            </div>
            {showSearchDropdown && suggestedTags.length > 0 && (
              <div className={Styles.dropdown}>
                {suggestedTags.map((tag) => (
                  <div
                    key={tag}
                    className={Styles.dropdownItem}
                    onClick={() => handleAddTag(tag)}
                  >
                    #{tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
