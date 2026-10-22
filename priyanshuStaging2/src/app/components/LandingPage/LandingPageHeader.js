"use client";
import { useState, useEffect } from "react";
import styles from "./header.module.css";
import { Button } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import AuthAnimatedBtn from "./AuthAnimatedBtn";
// import SigninPopup from "@/app/sign-in/SigninPopup";
// import OtpPopup from "@/app/otp/OtpPopup";
// import SignupTypePopup from "@/app/signup/SignupTypePopup";
// import SignupFormPopup from "@/app/signup-form/SignupFormPopup";

import dynamic from "next/dynamic";
const SigninPopup = dynamic(() => import("@/app/sign-in/SigninPopup"), { ssr: false });
const SignupTypePopup = dynamic(() => import("@/app/signup/SignupTypePopup"), { ssr: false });
const SignupFormPopup = dynamic(() => import("@/app/signup-form/SignupFormPopup"), { ssr: false });
const OtpPopup = dynamic(() => import("@/app/otp/OtpPopup"), { ssr: false });

import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LandingPageHeader({ onSigninClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignin, setShowSignin] = useState(false);

  const [signinEmail, setSigninEmail] = useState("");
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [referralCode, setReferralCode] = useState("");
  useEffect(() => {
    const referral = searchParams.get("r") || sessionStorage.getItem("referral");
    const showFlag = sessionStorage.getItem("showSignUp") || true;
    if (referral) {
      sessionStorage.setItem("referral", referral);
      sessionStorage.setItem("showSignUp", showFlag);
      setReferralCode(referral);
    }
  }, [])

  useEffect(() => {
    const showPop = sessionStorage.getItem("showSignUp") == "true";
    if (referralCode && showPop) {
      setShowSignupType(true)
    }
  }, [referralCode])

  const isActiveLink = (hrefPath) => {
    if (hrefPath === '/') return pathname === hrefPath;
    return pathname.startsWith(hrefPath);
  };



  useEffect(() => {
    if (menuOpen) {
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("position", "fixed", "important"); // stops touch scroll
      document.body.style.setProperty("width", "100%", "important");
    } else {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    }

    return () => {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    };
  }, [menuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some(entry => entry.isIntersecting);
        setIsLight(isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "5px 0px -85% 0px"
      }
    );

    const lightSections = document.querySelectorAll('[data-theme="light"]');
    lightSections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  const router = useRouter();

  const getPadding = () => {
    if (pathname === "/become-a-partner") return "20px 20px";
    if (pathname === "/deal-sourcing") return "20px 30px";
    return undefined;
  };

  return (
    <>
      <section className={`${styles.parentHeader} ${pathname.includes("/deals") && styles.notFixed} ${isLight ? styles.lightHeaderParent : ""}`}>
        <header className={`${styles.header} ${pathname.includes("/deals") || (pathname == "/become-a-partner" || pathname == "/deal-sourcing") && styles.newHeader} ${menuOpen ? styles.activeHeader : ""} ${isLight ? styles.lightHeader : ""}`} style={{ padding: getPadding() }}>
          <div className={styles.firstPart}>
            <Link 
              href="/"
              className={styles.logo} 
              style={{ cursor: 'pointer' }} 
              prefetch={true}
              onClick={() => {
                setMenuOpen(false)
              }}
            >
              <Image src={isLight ? "/logo.png" : "/landing-logo.svg"} height={32} width={102} alt="PrEqt logo - Private Equity and Pre-IPO Investment Platform" title="PrEqt logo - Private Equity and Pre-IPO Investment Platform" />
            </Link>
            <nav className={`${styles.nav} ${menuOpen ? styles.active : ""} ${isLight ? styles.lightNav : ""}`}>
              <Link 
                href="/deals" 
                prefetch={true}
                onMouseEnter={() => router.prefetch('/deals')}
                onTouchStart={() => router.prefetch('/deals')}
                onClick={() => { setMenuOpen(false) }} 
                className={isActiveLink('/deals') ? "" : ''} 
                title="View all private equity deals and investment opportunities on PrEqt"
              >
                {menuOpen ? <div className={styles.flexDiv}><p>Deals</p> <ChevronRight color="#4B5563" /> </div> : "Deals"}
              </Link>
              <Link 
                href="/community" 
                prefetch={true}
                onMouseEnter={() => router.prefetch('/community')}
                onTouchStart={() => router.prefetch('/community')}
                onClick={() => { setMenuOpen(false) }} 
                className={isActiveLink('/community') ? "" : ''} 
                title="Join PrEqt community for exclusive market discussions and investor insights"
              >
                {menuOpen ? <div className={styles.flexDiv}><p>Community</p> <ChevronRight color="#4B5563" /> </div> : "Community"}
              </Link>
              <div className={`${styles.containerBtn} ${styles.showOnMobile}`} onClick={() => { setMenuOpen(false) }}>
                <AuthAnimatedBtn children="Sign In" onClick={onSigninClick} theme={isLight ? 'light' : 'dark'} />
              </div>
              <div className={`${styles.headerMobileShine} ${menuOpen ? styles.active : ""}`}>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="430" height="426" viewBox="0 0 430 426" fill="none">
                    <g filter="url(#filter0_f_15280_27965)">
                      <ellipse cx="364.5" cy="391" rx="107.5" ry="117" fill="#B59131" />
                    </g>
                    <defs>
                      <filter id="filter0_f_15280_27965" x="-17" y="0" width="763" height="782" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                        <feGaussianBlur stdDeviation="137" result="effect1_foregroundBlur_15280_27965" />
                      </filter>
                    </defs>
                  </svg>
                </div></div>
            </nav>
          </div>

          <div className={`${styles.containerBtn} ${styles.hideOnMobile}`}>
            <AuthAnimatedBtn children="Sign In" onClick={onSigninClick} theme={isLight ? 'light' : 'dark'} />
          </div>
          <div
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
              <path d="M18 6.66992L6 18.6699" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6.66992L18 18.6699" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg> :
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                <path d="M4 12.3198H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 18.3198H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 6.31982H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>}
          </div>
        </header>
      </section>

      {/* Signin Popup */}

    </>
  );
}
