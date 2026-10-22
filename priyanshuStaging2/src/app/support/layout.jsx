import { getRobotsDirectives } from "../utils/seoUtils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

export const metadata = {
  title: "Support & Help Desk | PrEqt",
  description:
    "Get in touch with the PrEqt support team for assistance with private equity deals, investment inquiries, and platform assistance.",
  keywords: [
    "PrEqt support",
    "private equity help",
    "investor support",
    "contact PrEqt",
    "customer support",
  ],
  alternates: {
    canonical: `${SITE_URL}/support`,
  },
  openGraph: {
    title: "Support & Help Desk | PrEqt",
    description:
      "Get in touch with the PrEqt support team for assistance with private equity deals, investment inquiries, and platform assistance.",
    url: `${SITE_URL}/support`,
    siteName: "PrEqt",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "PrEqt Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support & Help Desk | PrEqt",
    description:
      "Get in touch with the PrEqt support team for assistance with private equity deals, investment inquiries, and platform assistance.",
    images: [`${SITE_URL}/logo.png`],
  },
  robots: getRobotsDirectives(),
};

export default function SupportLayout({ children }) {
  return children;
}
