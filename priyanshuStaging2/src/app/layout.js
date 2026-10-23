import { Geist, Geist_Mono } from "next/font/google";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import "react-toastify/dist/ReactToastify.css";
import { MultiStepProvider } from "./utils/MultiStepContext";
import { DealTypeProvider } from "./utils/DealTypeContext";
import { Playfair_Display,Inter,Manrope } from "next/font/google";
// import { Inter } from "next/font/google";
import Script from "next/script";
import ClientChrome from "./ClientChrome";
import ToastProvider from "./components/ToastProvider";
import ReCaptchaProviderWrapper from "./components/ReCaptchaProviderWrapper";
import { UserProvider } from "./context/UserContext";
import { DealsProvider } from "./context/DealContext";
import { MeetingProvider } from "./context/MeetingContext";
import { getRobotsDirectives } from "./utils/seoUtils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display:"swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  style: ["italic", "normal"],       // <-- REQUIRED for italic
  weight: ["400", "500", "600", "700"], // <-- choose what you need
  display:"swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display:"swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});


const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(
  /\/$/,
  ""
);
const SITE_IMAGE = `${SITE_URL}/favicon.png`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PrEqt",
  description: "PrEqt - Private Equity Platform",
  robots: getRobotsDirectives(),
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "PrEqt",
    siteName: "PrEqt",
    description: "PrEqt - Private Equity Platform",
    url: SITE_URL,
    type: "website",
    locale: "en_IN",
    images: [{ url: SITE_IMAGE, width: 512, height: 512, alt: "PrEqt logo" }],
  },
  twitter: {
    card: "summary",
    title: "PrEqt",
    images: [SITE_IMAGE],
    description: "PrEqt - Private Equity Platform",
  },
};

import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has("accessToken");

  return (
    <html lang="en">
       <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable}  ${manrope.variable}` }>
        {/* Google Tag Manager */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HFYE65KM18"
          // strategy="afterInteractive"
          strategy="lazyOnload"
        />

        {/* <Script id="gtag-init" strategy="afterInteractive"> */}
        <Script id="gtag-init" strategy="lazyOnload">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-HFYE65KM18');
        `}
        </Script>
        <ReCaptchaProviderWrapper>
          <MultiStepProvider>
            <DealTypeProvider>
              <DealsProvider> 
                <MeetingProvider>
                  <UserProvider>
                    <ClientChrome initialHasToken={hasAccessToken}>{children}</ClientChrome>
                  </UserProvider>
                </MeetingProvider>
              </DealsProvider>
            </DealTypeProvider>
          </MultiStepProvider>
        </ReCaptchaProviderWrapper>
        <ToastProvider />
      </body>
    </html>
  );
}
