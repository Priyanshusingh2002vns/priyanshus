'use client';

import Sidenav from '@/app/account/Sidenav';
import Accountfooter from '@/app/account/footer/Accountfooter';
import styles from './account_layout.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import EditDetails from './editDetails/EditDetails';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import PreqtBanner from '../components/preqtBanner/AppPromoSection';
import { useUserContext } from '../context/UserContext';

export default function AccountClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showeditModal, setShowEditModal] = useState(false);
  const [sidebaropen, setSidebarOpen] = useState(false);
  const { investor, loading } = useUserContext();

  const getTitle = () => {
    if (pathname === "/account") return "My Account";
    if (pathname === "/account/details") return "Account Details";
    if (pathname === "/account/transation") return "Transactions";
    if (pathname === "/account/support") return "Support";
    if (pathname === "/account/notification") return "Notification Preference";
    if (pathname === "/account/terms&condition") return "Terms & Conditions";
    if (pathname === "/account/faq") return "Frequently Asked Questions";
    if (pathname === "/account/privacyPolicy") return "Privacy Policy";
    if (pathname === "/account/my-document") return "My Documents";

    return "My Account";
  };

  return (
    <div className={styles.mainaccount_layout}>
      <div className={styles.navbar}></div>
      <div className={styles.headar_button}></div>
      <div className={styles.arrow}>
        <div>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <img src="/account_sidenav/arrow icon.svg" alt="arrow-left" />
          </button>
          <span className={styles.arrow_heading}>{getTitle()}</span>
        </div>
        <div className={styles.edit_icon}>
          {pathname === "/account/details" && (
            <Link
              href=""
              className={styles.a}
              onClick={() => setShowEditModal(true)}
            >
              <div className={styles.responsive_edit_icon}>Edit</div>
            </Link>
          )}
          <EditDetails
            isOpen={showeditModal}
            onClose={() => setShowEditModal(false)}
            fullName={investor?.full_name}
            email={investor?.email}
            phoneNumber={investor?.phone_number}
            investorType={investor?.investor_type}
            organization={investor?.organization}
            location={investor?.location}
          />
        </div>
      </div>
      <div className={styles.account_layout}>
        <div className={styles.sidebar}>
          <Sidenav />
        </div>
        <div className={styles.accountwrapper}>{children}</div>
      </div>
      <PreqtBanner />
    </div>
  );
}
