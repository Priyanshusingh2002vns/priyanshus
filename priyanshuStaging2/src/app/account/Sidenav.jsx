"use client";
import react, { useState, useEffect } from "react";

import Link from "next/link";
import Faq_svg from "./account-svg/Faq_svg";
import Logout_svg from "./account-svg/Logout_svg";
import My_document_svg from "./account-svg/My_document_svg";
import Notification_perference_svg from "./account-svg/Notification_preference_svg";
import Transactions_svg from "./account-svg/Transactions_svg";
import UserSvg from "./account-svg/UserSvg";
import styles from "./Sidenav.module.css";
import Cookies from "js-cookie";

// import { useRouter } from 'next/router';
import { usePathname, useRouter } from "next/navigation";
import LogoutModal from "../components/LogoutModal";
import { useUserContext } from "../context/UserContext";
import { useMeetingContext } from "../context/MeetingContext";
import Meeting_svg from "./account-svg/Meeting_svg";
// import { FaUser, FaMoneyCheckAlt, FaBell, FaFileAlt, FaQuestionCircle, FaFileSignature, FaSignOutAlt, FaHeadset } from 'react-icons/fa';

export default function Sidenav() {
  const [shortName, setShortName] = useState("");
  const [fullName, setFullName] = useState("");
  const [id, setId] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [showLogout, setShowLogout] = useState(false);
  const [activeItem, setActiveItem] = useState("/account/details");
  const { investor, loading } = useUserContext()
  const { showMeetingPage } = useMeetingContext();

  useEffect(() => {
    if (!investor) return;

    const fullName = investor.full_name;
    setFullName(fullName);

    const lastSix = investor.id
      ? investor.id.slice(-6).toUpperCase()
      : "";
    setId(lastSix);

    const initials = fullName
      ?.trim()
      .split(/\s+/)
      .map((n) => n[0].toUpperCase())
      .join("");
    setShortName(initials);
  }, [investor]);

  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  return (
    <div className={styles.account_details}>
      <div className={styles.sidebar}>
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <p>{shortName}</p>
          </div>
          <div className={styles.avatardetails}>
            <div className={styles.id}>{id}</div>
            <div className={styles.name}>{fullName ? fullName.charAt(0).toUpperCase() + fullName.slice(1) : ""}</div>
          </div>
        </div>

        <ul className={styles.nav}>
          <li
            className={`${styles.item} ${activeItem === "/account/details" ? styles.active : ""}`}
            onClick={() => {
              setActiveItem("/account/details");
              router.push("/account/details");
            }}
          >
            <UserSvg className={styles.UserSvg} />
            <div className={styles.responsive_btn}>
              <span>Account Details </span>
              <button className={styles.rightarrow}>
                <img
                  className={styles.arrowimg}
                  src="/account_sidenav/chevron-right-arrow.svg"
                  alt="arrow-right account-details"
                />
              </button>
            </div>
          </li>
          <div className={styles.line}></div>

          {showMeetingPage && (
            <li className={`${styles.item} ${activeItem === "/account/management-meeting" ? styles.active : ""}`}
              onClick={() => {
                setActiveItem("/account/management-meeting");
                router.push("/account/management-meeting")
              }}>
              <Meeting_svg className={styles.UserSvg} />
              <div className={styles.responsive_btn}>
                <span>Management Meeting</span>
                <button className={styles.rightarrow}>
                  <img
                    className={styles.arrowimg}
                    src="/account_sidenav/chevron-right-arrow.svg"
                    alt="arrow-right management-meeting"
                  />
                </button>
              </div>
            </li>
          )}

          <li
            id={styles.Transactions}
            className={`${styles.item} ${activeItem === "/account/transation" ? styles.active : ""}`}
            onClick={() => {
              setActiveItem("/account/transation");
              router.push("/account/transation");
            }}
          >
            <Transactions_svg className={styles.UserSvg} />
            <div className={styles.responsive_btn}>
              <span>Transactions</span>
              <button className={styles.rightarrow}>
                <img
                  className={styles.arrowimg}
                  src="/account_sidenav/chevron-right-arrow.svg"
                  alt="arrow-right transactions"
                />
              </button>
            </div>
          </li>
          <div className={styles.line}></div>

          <li
            className={`${styles.item} ${activeItem === "/account/notification" ? styles.active : ""}`}
            onClick={() => {
              setActiveItem("/account/notification");
              router.push("/account/notification");
            }}
          >

            <Notification_perference_svg className={styles.UserSvg} />
            <div className={styles.responsive_btn}>
              <span>Notification preference</span>
              <button className={styles.rightarrow}>
                <img
                  className={styles.arrowimg}
                  src="/account_sidenav/chevron-right-arrow.svg"
                  alt="arrow-right notification-preference"
                />
              </button>
            </div>
          </li>
          <div className={styles.line}></div>

          <li
            className={`${styles.item} ${activeItem === "/account/faq" ? styles.active : ""}`}
            onClick={() => {
              setActiveItem("/account/faq");
              router.push("/account/faq");
            }}
          >
            <Faq_svg className={styles.UserSvg} />
            <div className={styles.responsive_btn}>
              <span>Frequently Asked Questions</span>
              <button className={styles.rightarrow}>
                <img
                  className={styles.arrowimg}
                  src="/account_sidenav/chevron-right-arrow.svg"
                  alt="arrow-right faq"
                />
              </button>
            </div>
          </li>
          <div className={styles.line}></div>

          <li
            className={`${styles.item} ${activeItem === "/account/my-document" ? styles.active : ""}`}
            onClick={() => {
              setActiveItem("/account/my-document");
              router.push("/account/my-document");
            }}
          >
            <My_document_svg className={styles.UserSvg} />
            <div className={styles.responsive_btn}>
              <span>My documents</span>
              <button className={styles.rightarrow}>
                <img
                  className={styles.arrowimg}
                  src="/account_sidenav/chevron-right-arrow.svg"
                  alt="arrow-right my-document"
                />
              </button>
            </div>
          </li>
          {/* <div className={styles.line}></div> */}
        </ul>

        <div className={styles.logout_section}>
          {/* <div className={styles.lagout_hr}></div> */}
          {/* <div className={styles.hr}></div>  */}
          <div className={styles.logout} onClick={() => { setShowLogout(true) }}>
            {/* <div className={styles.hr}></div>  */}
            <Logout_svg className={styles.UserSvg} />

            <span className={styles.span}>Log Out</span>
          </div>
        </div>
      </div>

      {showLogout && <LogoutModal
        show={showLogout}
        onClose={() => setShowLogout(false)}
        onLogout={() => {
          Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName);
          });
          sessionStorage.clear();
          localStorage.clear();
          setShowLogout(false)
          router.push("/");
          router.refresh();
        }}
      />}
    </div>
  );
}
