"use client";
import { usePathname, useRouter } from "next/navigation";
import NavBar from "./common/navBar/NavBar";
import NewFooter from "./common/navBar/new-footer/NewFooter";
import { useEffect, useState, Suspense } from "react";
import LandingPageHeader from "./components/LandingPage/LandingPageHeader";
import Cookies from "js-cookie";

// making the dynamico
import dynamic from "next/dynamic";




// import SigninPopup from "./sign-in/SigninPopup";
// import SignupTypePopup from "./signup/SignupTypePopup";
// import SignupFormPopup from "./signup-form/SignupFormPopup";
// import OtpPopup from "./otp/OtpPopup";
import { useDealType } from "@/app/utils/DealTypeContext";

const SigninPopup = dynamic(() => import("./sign-in/SigninPopup"), { ssr: false });
const SignupTypePopup = dynamic(() => import("./signup/SignupTypePopup"), { ssr: false });
const SignupFormPopup = dynamic(() => import("./signup-form/SignupFormPopup"), { ssr: false });
const OtpPopup = dynamic(() => import("./otp/OtpPopup"), { ssr: false });

export default function ClientChrome({ children, initialHasToken }) {
  const pathname = usePathname();
  const router = useRouter();
  const [windowWidth, setWindowWidth] = useState(0);
  const { dealType } = useDealType();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // normalize for case differences like /deal-sourcing vs /deal-sourcing
  const path = (pathname || "").toLowerCase();

  // pages with NO chrome at all (exact matches) — your existing behavior
  const HIDE_ALL_ROUTES = [
    "/sign-in",
    "/login",
    "/otp",
    "/signup",
    "/signup-form",
  ];
  const hideAll = HIDE_ALL_ROUTES.includes(path);

  // pages where ONLY the top nav should be hidden
  // includes /deal-sourcing (and any subpaths)
  const HIDE_NAV_PREFIXES = ["/transaction-failed"];
  const hideNavBar = HIDE_NAV_PREFIXES.some((p) => path.startsWith(p));

  const isDealPage = path.startsWith("/deals/");
  const isPrivateDeal = isDealPage && (dealType === "private" || dealType === "ccps");

  if (hideAll) {
    return <>{children}</>;
  }

  const [hasToken, setHasToken] = useState(initialHasToken);

  useEffect(() => {
    // In case the token changes purely client-side without a full navigation
    const checkToken = () => {
      const currentToken = !!Cookies.get("accessToken");
      if (currentToken !== hasToken) {
        setHasToken(currentToken);
        router.refresh();
      }
    };

    window.addEventListener("focus", checkToken);
    window.addEventListener("tokenChanged", checkToken);

    return () => {
      window.removeEventListener("focus", checkToken);
      window.removeEventListener("tokenChanged", checkToken);
    };
  }, [hasToken, router]);

  const shouldShowLandingHeader =
    !hasToken && (path === "/" || path === "/become-a-partner" || path.startsWith("/deal-sourcing"));

  const [showSignin, setShowSignin] = useState(false);
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  // OTP STATE (single source of truth)
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

  return (
    <>
      <div
        className={isPrivateDeal ? "private-deal-theme" : ""}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: path === "/become-a-partner" && "black",
        }}
      >
        {/* Hide both LandingPageHeader and NavBar on deal-sourcing paths */}
        {!hideNavBar && (
          <Suspense fallback={shouldShowLandingHeader ? null : <div style={{minHeight:"72px", width:"100%"}}/>}>

            {shouldShowLandingHeader ? (
              <LandingPageHeader onSigninClick={handleSigninOpen} hasToken={hasToken} />
            ) : (
              <NavBar onSigninClick={handleSigninOpen} hasToken={hasToken} />
            )}
          </Suspense>
        )}

        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", marginTop: (pathname == "/" || hasToken || pathname.includes("/deals") || pathname.includes("/community")) ? "0px" : '0px' }}>
          {children}
        </div>

        <div
          className="newNav"
          style={{
            marginTop: "auto",
            marginBottom: isPrivateDeal && windowWidth <= 920 ? "110px" : "0px",
          }}
        >
          <NewFooter />
        </div>
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
        <Suspense fallback={null}>
          <SignupFormPopup
            show
            onHide={() => setShowSignupForm(false)}
            onBack={() => {
              setShowSignupForm(false);
              setShowSignupType(true);
            }}
            onShowOtp={handleSignupShowOtp}
          />
        </Suspense>
      )}

      {/* OTP POPUP (NO showOtp FLAG) */}
      {otpPayload && (
        <OtpPopup
          {...otpPayload}
          show
          handleClose={closeOtp}
          handleBack={() => {
            const flow = otpPayload.flow;
            closeOtp();
            flow === "signin"
              ? setShowSignin(true)
              : setShowSignupForm(true);
          }}
          onVerified={() => {
            setHasToken(true);
            closeOtp();
            router.refresh();
          }}

        />
      )}
    </>
  );
}
