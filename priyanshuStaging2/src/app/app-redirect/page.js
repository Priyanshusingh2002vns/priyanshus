import { headers } from "next/headers";
import AppRedirectClient from "./AppRedirectClient";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.preqt.app";
const APP_STORE_URL = "https://apps.apple.com/in/app/preqt/id6751903472";

export const metadata = {
  title: "Redirecting to PrEqt App",
  description: "Download the PrEqt mobile app on Android or iOS.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppRedirectPage() {
  const headersList = await headers();
  const userAgent = (headersList.get("user-agent") || "").toLowerCase();

  let targetUrl = PLAY_STORE_URL;
  if (/iphone|ipad|ipod/.test(userAgent)) {
    targetUrl = APP_STORE_URL;
  }

  return (
    <AppRedirectClient
      playStoreUrl={PLAY_STORE_URL}
      appStoreUrl={APP_STORE_URL}
      initialTargetUrl={targetUrl}
    />
  );
}