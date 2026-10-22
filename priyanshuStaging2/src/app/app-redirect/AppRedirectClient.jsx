"use client";

import { useEffect } from "react";

export default function AppRedirectClient({ playStoreUrl, appStoreUrl, initialTargetUrl }) {
  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const target = isIos ? appStoreUrl : playStoreUrl;
    window.location.replace(target || initialTargetUrl);
  }, [playStoreUrl, appStoreUrl, initialTargetUrl]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        color: "#ffffff",
      }}
    >
      <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Redirecting you to the PrEqt mobile app...
      </p>
      <p style={{ fontSize: "0.9rem", color: "#888888" }}>
        If you are not redirected automatically, select your store below:
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <a
          href={playStoreUrl}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#222222",
            borderRadius: "8px",
            color: "#ffffff",
            textDecoration: "none",
            border: "1px solid #444444",
            fontWeight: 500,
          }}
        >
          Google Play Store
        </a>
        <a
          href={appStoreUrl}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#222222",
            borderRadius: "8px",
            color: "#ffffff",
            textDecoration: "none",
            border: "1px solid #444444",
            fontWeight: 500,
          }}
        >
          Apple App Store
        </a>
      </div>
    </div>
  );
}
