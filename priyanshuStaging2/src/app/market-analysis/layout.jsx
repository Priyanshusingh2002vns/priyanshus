import { getRobotsDirectives } from "../utils/seoUtils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

export const metadata = {
  title: "Live Market Intelligence & Daily Market Pulse | PrEqt",
  description:
    "Track live Indian market pulse, Nifty 50, Gift Nifty indices, sector gainers, losers, and institutional market intelligence.",
  keywords: [
    "market intelligence",
    "market pulse",
    "nifty 50",
    "gift nifty",
    "daily market analysis",
    "indian macro securities",
    "sector gainers losers",
    "private equity market intelligence",
  ],
  alternates: {
    canonical: `${SITE_URL}/market-analysis`,
  },
  openGraph: {
    title: "Live Market Intelligence & Daily Market Pulse | PrEqt",
    description:
      "Track live Indian market pulse, Nifty 50, Gift Nifty indices, sector gainers, losers, and institutional market intelligence.",
    url: `${SITE_URL}/market-analysis`,
    siteName: "PrEqt",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "PrEqt Market Intelligence Terminal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Market Intelligence & Daily Market Pulse | PrEqt",
    description:
      "Track live Indian market pulse, Nifty 50, Gift Nifty indices, sector gainers, losers, and institutional market intelligence.",
    images: [`${SITE_URL}/logo.png`],
  },
  robots: getRobotsDirectives(),
};

export default function MarketAnalysisLayout({ children }) {
  return children;
}
