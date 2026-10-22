import React from 'react'
import DealSourcingBanner from './DealSourcingBanner'
import FillEquityMarket from './FillEquityMarket'
import DealsDiffPreqt from './DealsDiffPreqt'
import DealsDiffPreqtVideo from './DealsVideos'
import BenefitSection from '../new-landing/fillequitymarket.module.css/BenefitSection'
import DealRaiseCapital from './DealRaiseCapital'
import { getRobotsDirectives } from '../utils/seoUtils'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");
const PUBLISHER_NAME = "PrEqt";
const PAGE_TITLE = "Preqt | Deal Sourcing - Raise Capital Smarter";
const PAGE_DESCRIPTION = "Start your funding journey with India's most trusted private market platform. Designed to help promoters achieve faster listings, stronger valuations, and market credibility.";

export const metadata = {
  robots: getRobotsDirectives(),
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "deal sourcing",
    "raise capital",
    "private market platform",
    "pre-ipo funding",
    "startup funding",
    "private equity",
    "promoter funding",
    "india investment platform"
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/deal-sourcing`,
    siteName: PUBLISHER_NAME,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: PAGE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    creator: "@preqt",
    site: "@preqt",
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/deal-sourcing`,
  },
};

const page = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: PAGE_TITLE,
      url: `${SITE_URL}/deal-sourcing`,
      description: PAGE_DESCRIPTION,
      publisher: {
        "@type": "Organization",
        name: PUBLISHER_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.svg`,
        }
      },
      mainEntity: {
        "@type": "Service",
        name: "Deal Sourcing & Capital Raising",
        description: "Platform for promoters to achieve faster listings, stronger valuations, and market credibility.",
        provider: {
          "@type": "Organization",
          name: PUBLISHER_NAME
        }
      }
    };

    return (
        <div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <DealSourcingBanner />
            <FillEquityMarket />
            <DealsDiffPreqt />
            <DealsDiffPreqtVideo />
            <BenefitSection />
            <DealRaiseCapital />
        </div>
    )
}

export default page