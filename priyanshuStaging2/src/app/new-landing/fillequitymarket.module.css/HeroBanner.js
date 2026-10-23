"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './herobanner.module.css';
import { useRouter } from 'next/navigation';
// import SignupFormPopup from '@/app/signup-form/SignupFormPopup';
// import SignupTypePopup from '@/app/signup/SignupTypePopup';
// import OtpPopup from '@/app/otp/OtpPopup';
// import SigninPopup from '@/app/sign-in/SigninPopup';

import dynamic from 'next/dynamic';
const SigninPopup = dynamic(() => import('@/app/sign-in/SigninPopup'), { ssr: false });
const SignupTypePopup = dynamic(() => import('@/app/signup/SignupTypePopup'), { ssr: false });
const SignupFormPopup = dynamic(() => import('@/app/signup-form/SignupFormPopup'), { ssr: false });
const OtpPopup = dynamic(() => import('@/app/otp/OtpPopup'), { ssr: false });

export default function HeroBanner() {
  const [isMobileBarVisible, setIsMobileBarVisible] = React.useState(true);
  const [isManuallyClosed, setIsManuallyClosed] = React.useState(false);
  const [isPillarVisible, setIsPillarVisible] = React.useState(false);
  const [appLink, setAppLink] = React.useState("https://play.google.com/store/apps/details?id=com.preqt.app");

  const router = useRouter();
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
    if (isApple) {
      setAppLink("https://apps.apple.com/in/app/preqt/id6751903472");
    }

    // Auto-reload video source if viewport crosses mobile/desktop breakpoint (orientation or devtools)
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(max-width: 768px)");
      const handleMediaChange = () => {
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play().catch(() => {});
        }
      };
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }
  }, []);

  // REMOVED Scroll-hiding logic to keep bar visible on scroll
  // REMOVED IntersectionObserver for Pillar visibility to keep bar persistent

  const [showSignin, setShowSignin] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const [signinEmail, setSigninEmail] = useState("");
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [otpEmail, setOtpEmail] = useState(""); // ✅ single email for OTP
  const [otpSource, setOtpSource] = useState(""); // 'signin' | 'signup'
  const [otpPayload, setOtpPayload] = useState(null);

  const handleSigninOpen = () => setShowSignin(true);
  const handleSigninClose = () => setShowSignin(false);

  const handleOtpClose = () => {
    setShowOtp(false);
    setOtpPayload(null);
  };

  const handleSignupTypeOpen = () => setShowSignupType(true);

  // Called from Signup form
  const handleSignupShowOtp = (payload) => {
    setShowSignupForm(false);
    if (typeof payload === "object" && payload !== null) {
      setOtpPayload({ ...payload, flow: "signup" });
    } else {
      setSignupEmail(payload);
      setOtpEmail(payload);
      setOtpSource("signup");
      setShowOtp(true);
    }
  };

  // Called from Signin form
  const handleSigninShowOtp = (payload) => {
    setShowSignin(false);
    if (typeof payload === "object" && payload !== null) {
      setOtpPayload({ ...payload, flow: "signin" });
    } else {
      setSigninEmail(payload);
      setOtpEmail(payload);
      setOtpSource("signin");
      setShowOtp(true);
    }
  };


  return (
    <>
    {/* fix ind code  */}
    {/* <link rel="preload" as="image" href="/thumbnailhero.webp" fetchPriority='high' /> */}
    {/* fix ind code  */}
      <section className={styles.heroBanner}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/thumbnailhero.webp"
          // preload="auto"
          preload="none"
          className={styles.heroVideo}
        >
          <source
            src="/hero-video-comp2.mp4"
            type="video/mp4"
            media="(max-width: 768px)"
          />
          <source
            src="/herovideo.mp4"
            type="video/mp4"
          />
        </video>

        <div className={styles.overlay} />

        <div className={`container ${styles.inner}`}>
          <div className={styles.left}>
            <h1 className={styles.heading}>
              A Full Stack Investment Bank for Private and <span>Public Equity</span>
            </h1>

            <p className={styles.subheading}>
              PrEqt helps companies transition from private to public markets by enabling growth capital access, IPO readiness, investor visibility, and follow-on raises.
            </p>

            <div className={styles.actions}>
              <Link href="/deals" className={styles.primaryCta}>
                <span>Explore Live Deals</span>
                <span className={styles.ctaPlus}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
              <Link href="/deal-sourcing" className={styles.secondaryCta}>
                <span>Raise Capital Smarter</span>
                <span className={styles.ctaPlus}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>


            </div>
            <div className={styles.actionsToday}>

              <button className={styles.primaryCta} onClick={handleSigninOpen}>
                <span>Get Started Today</span>
                <span className={styles.ctaPlus}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4.79169V15.2084" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>


            <div className={styles.featuresContainerContent}>
              <div className={styles.featureContent}>
                <h2>15,000+</h2>
                <p>UHNI’s and Family Offices</p>
              </div>
              <div className={styles.featureContent}>
                <h2>75% less</h2>
                <p>Turnaround Time </p>
              </div>
              <div className={styles.featureContent}>
                <h2>{"<1%"}</h2>
                <p>Approval rate </p>
              </div>
              <div className={styles.featureContent}>
                <h2>INR 2,900 Crs+</h2>
                <p>Raised</p>
              </div>
              <div className={styles.featureContent}>
                <h2>0%</h2>
                <p>upfront fees</p>
              </div>
            </div>

            {/* <div className={styles.featuresContainer}>
            <p className={styles.featuresTitle}>Everything you need to raise capital with confidence</p>
            <div className={styles.features}>
              <span>Verified Deals</span>
              <span>Secure Data Rooms</span>
              <span>Investor Network</span>
              <span>Pre-IPO &amp; IPO Access</span>
              <span>Real-Time Analytics</span>
              <span>Smart Tracking</span>
            </div>
          </div> */}



          </div>

          <div className={styles.featuresContainerlines}></div>




        </div>
        <div className={styles.right}>
          <div className={styles.qrCard}>
            <img src="/preqtqr.png" alt="qrcode" />
            <div className={styles.qrContent}>
              <p className={styles.qrTitle}>Because Great Deals Hate Delays</p>
              <p className={styles.qrSubtitle}>Download PrEqT App</p>
            </div>
          </div>
        </div>

        {/* <button className={styles.scrollIndicator} aria-label="Scroll down">
        <span className={styles.scrollIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 12L12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button> */}

        {/* MOBILE STICKY BAR */}
        {isMobileBarVisible && (
          <div className={styles.mobileStickyBar}>
            <button
              className={styles.closeBar}
              onClick={() => {
                setIsMobileBarVisible(false);
                setIsManuallyClosed(true);
              }}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className={styles.appIcon}>
              <img src="/landing-logo.svg" alt="Logo" />
            </div>

            <div className={styles.mobileBarText}>
              <p className={styles.mobileBarTitle}>Because Great Deals Hate Delays</p>
              <p className={styles.mobileBarSubtitle}>Get PrEqt App</p>
            </div>

            <a
              href={appLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.getAppBtn}
            >
              Get App
            </a>
          </div>
        )}
      </section>

      {/* Signin Popup */}
      <SigninPopup
        show={showSignin}
        onHide={handleSigninClose}
        onShowOtp={(email) => handleSigninShowOtp(email)} // ✅ email passed
        onShowSignUp={() => {
          handleSigninClose();
          handleSignupTypeOpen();
        }}
        onEmailSubmit={(email) => setSigninEmail(email)} // optional
      />

      {/* OTP Popup */}
      {otpPayload ? (
        <OtpPopup
          {...otpPayload}
          show
          handleClose={handleOtpClose}
          handleBack={() => {
            const flow = otpPayload.flow;
            handleOtpClose();
            if (flow === "signup") {
              setShowSignupForm(true);
            } else {
              setShowSignin(true);
            }
          }}
          onVerified={() => {
            handleOtpClose();
            router.refresh();
          }}
        />
      ) : (
        <OtpPopup
          show={showOtp}
          email={otpEmail}
          handleClose={handleOtpClose}
          handleBack={() => {
            handleOtpClose();
            if (otpSource === "signup") {
              setShowSignupForm(true);
            } else if (otpSource === "signin") {
              setShowSignin(true);
            }
          }}
          onVerified={() => {
            handleOtpClose();
            router.refresh();
          }}
        />
      )}

      {/* Signup Type Selection */}
      <SignupTypePopup
        show={showSignupType}
        onHide={() => setShowSignupType(false)}
        onProceed={() => {
          setShowSignupType(false);
          setShowSignupForm(true);
        }}
        onBack={() => {
          handleSigninOpen();
          setShowSignupType(false);
        }}
      />

      {/* Signup Form */}
      <SignupFormPopup
        show={showSignupForm}
        onHide={() => setShowSignupForm(false)}
        onBack={() => {
          setShowSignupForm(false);
          setShowSignupType(true);
        }}
        onShowOtp={(email) => handleSignupShowOtp(email)} // ✅ email passed
        setSignupEmail={setSignupEmail} // optional
      />
    </>
  );
}