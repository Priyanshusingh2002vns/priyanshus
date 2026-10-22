"use client";
import styles from "./NavBar.module.css";
import Link from "next/link";
import { useDealStore } from "@/store/dealStore";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import LogoutModal from "@/app/components/LogoutModal";
import Image from "next/image";
import NotificationPopup from "@/app/components/Notifications/NotificationPopup";
import { useDealType } from "@/app/utils/DealTypeContext";
import AuthAnimatedBtn from "@/app/components/LandingPage/AuthAnimatedBtn";
import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import OtpPopup from "@/app/otp/OtpPopup";
import SigninPopup from "@/app/sign-in/SigninPopup";
import { useSearchParams } from "next/navigation";
import { useUserContext } from "@/app/context/UserContext";

export default function NavBar({ onSigninClick, hasToken }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dealType } = useDealType();
  const { clearAllFilters, setSelectedDealType } = useDealStore();

  const handleDealsClick = () => {
    clearAllFilters();
    if (setSelectedDealType) {
      setSelectedDealType("All");
    }
  };

  // Use hasToken passed from server via ClientChrome to prevent SSR hydration mismatch.
  // Fallback to reading cookie on client if hasToken is undefined (just in case).
  const [accessToken, setAccessToken] = useState(hasToken);

  useEffect(() => {
    // Sync React state directly from incoming props when it changes
    // Fallback to cookie check if not provided explicitly
    const tokenPresent = typeof hasToken !== 'undefined' ? hasToken : !!Cookies.get("accessToken");
    setAccessToken(tokenPresent);
  }, [hasToken, pathname]);
  const searchParams = useSearchParams();
  const { investor, setInvestor, loading } = useUserContext();
  const [shortName, setShortName] = useState("");
  const [investorName, setInvestorName] = useState("");
  const [id, setId] = useState("")
  const [showLogout, setShowLogout] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false);
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


  let isPrivateDeal = dealType == "private";
  let isccps = dealType == "ccps";
  let isofs = dealType == "ofs";
  let isunlisted = dealType == "unlisted";

  const isPrivateLike = isPrivateDeal || isccps || isofs || isunlisted || pathname == "/become-a-partner" || pathname == "/deal-sourcing";
  const isDarkTheme = isPrivateDeal || isccps || isofs || pathname == "/become-a-partner" || pathname == "/deal-sourcing";
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  useEffect(() => {
    if (menuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Apply styles to lock background
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("position", "fixed", "important");
      document.body.style.setProperty("top", `-${scrollY}px`, "important");
      document.body.style.setProperty("width", "100%", "important");
    } else {
      // Restore styles
      const scrollY = document.body.style.top;
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("top", "", "important");
      document.body.style.setProperty("width", "", "important");

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup (when component unmounts)
    return () => {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("top", "", "important");
      document.body.style.setProperty("width", "", "important");
    };
  }, [menuOpen]);


  const [allNotifications, setAllNotificaitons] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    const token = Cookies.get('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_BASE}admin/api/notifications/investor`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      const result = await response.json();
      if (response.ok && result.data.investorNotification.length > 0) {
        setAllNotificaitons(result.data.investorNotification);
        let number = result.data.investorNotification.filter((data) => !data.is_read);
        setUnreadCount(number.length);
      }
    } catch (error) {
      console.log("error in fetch notifications ", error);
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
    } else {
      setAllNotificaitons([]);
      setUnreadCount(0);
    }
  }, [accessToken]);


  useEffect(() => {
    if (!investor) return;

    // Full name
    const fullName = investor.full_name;
    setInvestorName(fullName);

    // Last 6 chars of ID
    const lastSix = investor.id
      ? investor.id.slice(-6).toUpperCase()
      : "";
    setId(lastSix);

    // Initials
    const initials = fullName
      ?.trim()
      .split(/\s+/)
      .map((n) => n[0].toUpperCase())
      .join("");

    setShortName(initials);
  }, [investor]);




  return (
    <div className={`${dealType == "private" || pathname == "become-a-partner" && styles.privateDeal} `}>
      <div className={`${styles.responsiveNav} ${isDarkTheme ? styles.privateDealTheme : ""}`}>
        <article className={styles.mainNavContainer}>
          {/* hamburger */}
          <div
            className={`${styles.hamburger} ${menuOpen ? styles.active : ""}`}
            onClick={toggleMenu}
            style={{ fontSize: "30px", zIndex: 999 }}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                <path d="M18 6.66992L6 18.6699" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 6.66992L18 18.6699" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) :
              (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="none"
                >
                  <path
                    d="M4 12.3301H20"
                    stroke={isDarkTheme ? "white" : "black"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 18.3301H20"
                    stroke={isDarkTheme ? "white" : "black"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 6.33008H20"
                    stroke={isDarkTheme ? "white" : "black"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
          </div>
          {/* logo */}
          <Link 
            href='/' 
            prefetch={true}
            onMouseEnter={() => router.prefetch('/')}
            onTouchStart={() => router.prefetch('/')}
          >  
            <img
              src={
                isDarkTheme
                  ? "/private-logo.png"
                  : "/logo.svg"
              }
              alt="logo"
              className={styles.logoImg} width={128} height={40}
            />
          </Link>


          {/* bell icon */}
          {/* {accessToken ? <div className={styles.NotificationIconContainerMob} onClick={() => { setOpenNotifications((prev) => !prev) }}>
            <img
              className={styles.icons}
              src="/assets/pictures/notification.svg"
              alt="notification"
            />
            {unreadCount > 0 && <div className={styles.notificationBadge}>{unreadCount}</div>}
          </div> : <div></div>} */}

        </article>
      </div>

      {/* <div
        className={`${styles.overlay} ${menuOpen ? styles.active : ""}`}
        onClick={toggleMenu}
      ></div> */}

      {/* side menu */}
      <nav className={`${styles.sideMenu} ${menuOpen ? styles.active : ""}`}>
        <div
          className={styles.openedSideMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Image
                src="/landing-logo.svg"
                alt="logo"
                width={128}   // set width as needed
                height={40}   // set height as needed
                priority
                style={{ paddingLeft: '10px' }} // makes sure logo loads fast
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" onClick={toggleMenu}>
                <path d="M18 6.66992L6 18.6699" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 6.66992L18 18.6699" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className={styles.menuContainer}>


              <div className={styles.menuContainer_main}>

                {accessToken && <Link className={styles.profile} href="/account/details" onClick={() => setMenuOpen(false)}>

                  <div className={styles.avatar}>{shortName}</div>
                  <div className={styles.avatardetails}>
                    <div className={styles.avatardetails_main}>
                      {/* <div className={styles.id}>CL273874</div> */}
                      <div className={styles.id}>{id}</div>
                      <div className={styles.name}>{investorName ? investorName.charAt(0).toUpperCase() + investorName.slice(1) : ""}</div>
                    </div>

                    <div className={styles.arrow}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M7.5 15L12.5 10L7.5 5"
                          stroke="#4B5563"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>}

                {/* <Link className={styles.homeNavButton} href="/">
                <img src="/assets/pictures/home.svg" alt="home" />
                <div className={styles.homebtn}>Home</div>
              </Link> */}
                <Link 
                  className={styles.homeNavButton} 
                  href="/deals" 
                  prefetch={true}
                  onMouseEnter={() => router.prefetch('/deals')}
                  onTouchStart={() => router.prefetch('/deals')}
                  onClick={() => { setMenuOpen(false); handleDealsClick(); }} 
                  title="View all private equity deals and investment opportunities on PrEqt"
                >
                  <div className={styles.homebtn}>Deals</div>
                  <div className={styles.arrow}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="#4B5563"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
                <Link
                  className={styles.homeNavButton}
                  href="/community"
                  prefetch={true}
                  onMouseEnter={() => router.prefetch('/community')}
                  onTouchStart={() => router.prefetch('/community')}
                  onClick={() => setMenuOpen(false)}
                  title="Join PrEqt community for exclusive market discussions and investor insights"
                >
                  <div className={styles.homebtn}>Community</div>
                  <div className={styles.arrow}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="#4B5563"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
                {/* {accessToken && <Link className={styles.homeNavButton} href="/events" onClick={() => setMenuOpen(false)}>
                  <div className={styles.homebtn}>Events</div>
                  <div className={styles.arrow}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="#4B5563"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>} */}
                {accessToken && <Link className={styles.homeNavButton} href={"/account"} onClick={() => setMenuOpen(false)}>
                  <div className={styles.homebtn}>Account</div>
                  <div className={styles.arrow}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="#4B5563"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>}
                {accessToken ? <div className={styles.NotificationIconContainerMob} onClick={() => { setOpenNotifications((prev) => !prev) }}>
                  {/* <img
              className={styles.icons}
              src="/assets/pictures/notification.svg" 
              alt="notification"
            /> */}
                  <div className={styles.homebtn}>Notification</div>
                  {unreadCount > 0 ? (
                    <div className={styles.notificationBadge}>
                      <p>{unreadCount}</p>
                    </div>
                  ) : (
                    <div className={styles.arrow}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M7.5 15L12.5 10L7.5 5"
                          stroke="#4B5563"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div> : <div></div>}
              </div>
            </div>
          </div>

          {/* logout */}
          {accessToken ?
            <div className={styles.sideMenuAuthBtn}>
              <AuthAnimatedBtn children="Log Out" onClick={() => { setMenuOpen(false); setShowLogout(true) }} theme="dark" />
            </div>
            : <div className={`${styles.containerBtn} ${styles.sideMenuAuthBtn}`}>
              <AuthAnimatedBtn 
                children="Sign In" 
                onClick={() => {
                  setMenuOpen(false);
                  if (onSigninClick) onSigninClick();
                }} 
                theme="dark" 
              />
            </div>}
        </div>
        <div className={styles.sidebarSvg}>
          <svg xmlns="http://www.w3.org/2000/svg" width="430" height="426" viewBox="0 0 430 426" fill="none"><g filter="url(#filter0_f_15280_27965)"><ellipse cx="364.5" cy="391" rx="107.5" ry="117" fill="#B59131"></ellipse></g><defs><filter id="filter0_f_15280_27965" x="-17" y="0" width="763" height="782" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feGaussianBlur stdDeviation="137" result="effect1_foregroundBlur_15280_27965"></feGaussianBlur></filter></defs></svg>
        </div>

      </nav>

      <section
        className={`${styles.mainContainer} ${isDarkTheme ? styles.privateDealTheme : ""
          }`}
      >
        <div className={styles.navLeftSection}>
          <Link 
            href="/"
            prefetch={true}
            onMouseEnter={() => router.prefetch('/')}
            onTouchStart={() => router.prefetch('/')}
          >
            {" "}
            <img
              src={
                isDarkTheme
                  ? "/private-logo.png"
                  : "/logo.png"
              }
              alt="logo"
              className={styles.logo}
            />
          </Link>

          <div className={styles.navigationButtonContainer}>
            <div className={styles.navigationButton}>
              {/* {accessToken && <Link
                className={`${styles.HomeNavButton} ${pathname === "/" ? styles.activeLink : ""
                  }`}
                href="/"
              >
                <p className={styles.home}>Home</p>
              </Link>} */}
              <Link
                href="/deals"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/deals')}
                onTouchStart={() => router.prefetch('/deals')}
                className={`${styles.HomeNavButton} ${pathname.includes("/deals") ? styles.activeLink : ""
                  }`}
                title="View all private equity deals and investment opportunities on PrEqt"
                onClick={handleDealsClick}
              >

                <p className={styles.home}>Deals</p>
              </Link>
              <Link
                href="/community"
                prefetch={true}
                onMouseEnter={() => router.prefetch('/community')}
                onTouchStart={() => router.prefetch('/community')}
                className={`${styles.HomeNavButton} ${pathname.includes("/community")
                  ? styles.activeLink
                  : ""
                  }`}
                title="Join PrEqt community for exclusive market discussions and investor insights"
              >

                <p className={styles.home}>Community</p>
              </Link>
              {/* {accessToken && <Link
                href="/events"
                className={`${styles.HomeNavButton} ${pathname.includes("/events") ? styles.activeLink : ""
                  }`}
              >

                <p className={styles.home}>Events</p>
              </Link>} */}
            </div>
          </div>
        </div>

        {accessToken ? <div className={styles.navRightSection}>
          <div className={styles.NotificationIconContainer} onClick={() => { setOpenNotifications((prev) => !prev) }}>
            <img
              className={styles.icons}
              src="/assets/pictures/notification.svg"
              alt="notification"
            />
            {unreadCount > 0 && <div className={styles.notificationBadge}><p>{unreadCount}</p></div>}
          </div>
          {/* <div className={styles.UserIconContainer}> */}
          <Link href={"/account/details"} className={`${styles.Link} ${styles.UserIconContainer}`}>
            {" "}
            <p className={styles.userInitials}>{shortName}</p>
          </Link>
          {/* </div> */}
        </div> : <div className={`${styles.containerBtn}`}>
          <AuthAnimatedBtn children="Sign In" onClick={onSigninClick} theme={isDarkTheme ? "dark" : "light"} />
        </div>}
      </section>
      {showLogout && <LogoutModal
        show={showLogout}
        onClose={() => setShowLogout(false)}
        onLogout={() => {
          Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName);
          });
          localStorage.clear();
          sessionStorage.clear();
          window.dispatchEvent(new Event("tokenChanged"));
          setShowLogout(false)
          router.push("/");
          router.refresh();
        }}
      />}
      {openNotifications && <NotificationPopup fetchNotifications={fetchNotifications} isOpen={openNotifications} onClose={() => setOpenNotifications(false)} allNotifications={allNotifications} />}


      {/* OTP Popup */}


      {/* Signup Type Selection */}


      {/* Signup Form */}

    </div>
  );
}
