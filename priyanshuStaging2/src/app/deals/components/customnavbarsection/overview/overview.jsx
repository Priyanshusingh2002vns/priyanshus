"use client";
import React, { useEffect, useState } from "react";
import FirstCarousel from "./custom-carousel/customcarousel";
import LastCarousel from "./lastcarousel/lastcarousel";
import Bod from "./directors-section/bod";
import Pitchdeck from "./pitch-deck-section/pitchdeck";
import About from "./about-section/about";
import UtilisationFunds from "./utilisation-of-funds/UtilisationFunds";
import Shareholding from "../fundraise/Shareholding";
import PeerComparison from "./peer-comparison/PeerComparison";
import RHPDocument from "./rhp-document-section/RHPDocument";
import FundAndTimeline from "./fund-timeline/FundAndTimeline";
import { useDealStore } from "@/store/dealStore";



const Overview = ({ isPrivateDeal, dealDetails: dealDetailsProp }) => {
  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;
  const dealType = dealDetails?.data?.deal_type;
  const isPrivateLike = isPrivateDeal || dealType === "ofs" || dealType === "ccps" || dealType === "unlisted";
  const isDarkTheme = isPrivateDeal || dealType === "ofs" || dealType === "ccps";
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const dealOverview = dealDetails?.data?.deal_overview;
    const dealStepData = dealDetails?.data?.deal_setpData;
    const pitch = dealStepData?.pitch_deck || dealOverview?.pitch_deck;

    if (!pitch?.status || !pitch?.data) return;

    const baseUrl = process.env.NEXT_PUBLIC_USER_BASE;
    let filePath = "";

    // Support both new (array) and old (nested object) structures
    const data = pitch.data;
    if (Array.isArray(data) && data.length > 0) {
      // If it's an array, the path might be inside a nested 'file' array
      filePath = data[0].file?.[0]?.path || data[0].path;
    } else if (data?.file && Array.isArray(data.file) && data.file.length > 0) {
      filePath = data.file[0].path;
    } else if (data?.path) {
      filePath = data.path;
    }

    if (!filePath) return;

    const cleanedPath = filePath.replace("public", "");
    const fullUrl = `${baseUrl}admin/${cleanedPath}`;

    setPdfUrl(fullUrl);
  }, [dealDetails]);

  return (
    <div className="overview-container">
      <FirstCarousel isPrivateDeal={isDarkTheme} />
      <About isPrivateDeal={isDarkTheme} />
      
      <RHPDocument isPrivateDeal={isDarkTheme} />
      
      {/* ✅ Pass pdfUrl dynamically */}
      <Pitchdeck isPrivateDeal={isDarkTheme} pdfUrl={pdfUrl} />
      
      <PeerComparison isPrivateDeal={isDarkTheme} />
      
      <Bod isPrivateDeal={isDarkTheme} />
      <LastCarousel isPrivateDeal={isDarkTheme} />
      
      {/* Fund Allocation & Timeline for Public deals inserted after Company Gallery */}
      {!isPrivateLike && <FundAndTimeline />}

      {isPrivateLike && <UtilisationFunds isPrivateDeal={isDarkTheme} />}
    </div>
  );
};

export default Overview;
