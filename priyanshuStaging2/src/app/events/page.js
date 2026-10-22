import React from 'react'
import MarqueeCom from '../components/home/MarqueeSection/MarqueeCom'
import CommingSoon from '../components/CommingSoon'
import Footer from '../common/navBar/Footer'
import { getRobotsDirectives } from "../utils/seoUtils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

export const metadata = {
  title: "Events & Investor Sessions | PrEqt",
  description: "Stay informed with upcoming investor webinars, masterclasses, and private market events on PrEqt.",
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
  robots: getRobotsDirectives(),
};

const page = () => {
    return (
        <>
            <h1 className="sr-only">PrEqt Events & Investor Sessions</h1>
            {/* <MarqueeCom /> */}
            <CommingSoon />
        </>
    )
}

export default page
