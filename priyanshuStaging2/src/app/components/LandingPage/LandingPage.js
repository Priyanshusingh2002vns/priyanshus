"use client";

import React, { useEffect, useMemo, useState } from "react";
import LaserBanner from "./LaserBanner";
import styles from "./LaserFlow.module.css";
import MarketInvesting from "./MarketInvesting";
import NetworkStack from "./NetworkStack";
import StepsComponent from "@/app/landing-page/stepsComponent/StepsComponent";
import PreqtAppSection from "@/app/landing-page/preqtAppsection/page";
import Footer from "@/app/landing-page/footer/Footer";

import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import SigninPopup from "@/app/sign-in/SigninPopup";
import OtpPopup from "@/app/otp/OtpPopup";

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);




  /* ---------------- SCROLL LOCK ---------------- */
  useEffect(() => {
    if (menuOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
  }, [menuOpen]);

  /* ---------------- UI ---------------- */
  return (
    <div style={{ background: "#111", width: "100%", height: "100%" }}>
      <LaserBanner handleSigninOpen={() => setShowSignin(true)} />

      <MarketInvesting />
      <NetworkStack />
      <StepsComponent />
      <PreqtAppSection />
      <Footer handleSigninOpen={() => setShowSignin(true)} />

      {/* SIGN IN */}
 

    </div>
  );
};

export default LandingPage;
