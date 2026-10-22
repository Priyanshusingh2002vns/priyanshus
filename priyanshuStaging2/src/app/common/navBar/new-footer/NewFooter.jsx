"use client";
import React from "react";
import styles from "./NewFooter.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewFooter({ isPrivateDeals }) {
  const router = useRouter();

  function getCurrentYear() {
    return new Date().getFullYear();
  }


  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.logo}>
        <img src="/footerLogo.png" alt="PrEqt footer logo - Private Equity and Pre-IPO Investment Platform" title="PrEqt footer logo - Private Equity and Pre-IPO Investment Platform" width={288} height={90} />
      </Link>


      <nav className={styles.nav}>
        {/* <Link href="">Quick Links</Link> */}
        {/* <Link href="/">Home</Link> */}
        <Link href="/deals" title="View all private equity deals and investment opportunities on PrEqt">Deals</Link>
        <Link href="/community" title="Join PrEqt community for exclusive market discussions and investor insights">Community</Link>
        <Link href="/privacy-policy" title="Read PrEqt privacy policy and data protection information">Privacy Policy</Link>
        <Link href="/data-deletion-policy" title="Learn about PrEqt data deletion policy and user rights">Data Deletion Policy</Link>
        <Link href="/support" title="Get support and help from PrEqt customer service">Support</Link>
        <Link href="/terms-and-condition" title="Read PrEqt terms and conditions for platform usage">Terms And Conditions</Link>
        <Link href="/deal-sourcing" title="Source and submit private equity deals through PrEqt platform">Deal Sourcing</Link>
        <Link href="/become-a-partner" title="Apply to become a verified PrEqt associate partner">Become an Associate Partner</Link>
        {/* <Link href="/contact">Contact Us</Link> */}
        {/* <Link href="/account/details">Account</Link> */}
      </nav>
      <hr className={styles.line} />
      <div className={styles.copy}>
        © {getCurrentYear()} PrEqt Technologies Private Limited | Powered By Passion, Driven By Discovery.
      </div>
    </footer>
  );
}
