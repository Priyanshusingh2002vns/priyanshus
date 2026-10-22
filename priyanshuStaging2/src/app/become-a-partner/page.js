import React from 'react'
import PreqtAppSection from '../landing-page/preqtAppsection/page'
import Faq from '../landing-page/components/Faq'
import styles from "./page.module.css"
import BannerSection from './BannerSection'
import PartnerWithUs from './PartnerWithUs'
import { getRobotsDirectives } from "../utils/seoUtils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

export const metadata = {
  title: "Partner With Us | PrEqt Partner Program",
  description: "Join the PrEqt partner network to expand deal flow, syndicate transactions, and access verified private equity and pre-IPO opportunities.",
  alternates: {
    canonical: `${SITE_URL}/become-a-partner`,
  },
  openGraph: {
    title: "Partner With Us | PrEqt Partner Program",
    description: "Join the PrEqt partner network to expand deal flow, syndicate transactions, and access verified private equity and pre-IPO opportunities.",
    url: `${SITE_URL}/become-a-partner`,
    siteName: "PrEqt",
    locale: "en_IN",
    type: "website",
  },
  robots: getRobotsDirectives(),
};

const page = () => {
    return (
        <div style={{ background: '#111' }}>
            <BannerSection />

            <PartnerWithUs />

            <div className={styles.faqSections}>
                <h2>Frequently Asked <br /> Questions</h2>
                <p style={{ margin: 'auto 20px' }}>Everything you need to know about our partner program.</p>
                <Faq forPartner={true} />
            </div>


            <PreqtAppSection forPartner={true} />
        </div>
    )
}

export default page
