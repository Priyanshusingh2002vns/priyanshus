// "use client";

// import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

// export default function ReCaptchaProviderWrapper({ children }) {
//   return (
//     <GoogleReCaptchaProvider
//       reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY || "6LezyRgsAAAAAOCQ0A9TsVlukuTUiWFl5WXuXbyu"}
//       scriptProps={{ async: true, defer: true }}
//     >
//       {children}
//     </GoogleReCaptchaProvider>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ReCaptchaProviderWrapper({ children }) {
  const [loadRecaptcha, setLoadRecaptcha] = useState(false);

  useEffect(() => {
    // Only load reCAPTCHA once user interacts with the page
    const triggerLoad = () => {
      setLoadRecaptcha(true);
      window.removeEventListener("scroll", triggerLoad);
      window.removeEventListener("mousemove", triggerLoad);
      window.removeEventListener("touchstart", triggerLoad);
      window.removeEventListener("click", triggerLoad);
    };

    window.addEventListener("scroll", triggerLoad, { passive: true, once: true });
    window.addEventListener("mousemove", triggerLoad, { passive: true, once: true });
    window.addEventListener("touchstart", triggerLoad, { passive: true, once: true });
    window.addEventListener("click", triggerLoad, { passive: true, once: true });

    return () => {
      window.removeEventListener("scroll", triggerLoad);
      window.removeEventListener("mousemove", triggerLoad);
      window.removeEventListener("touchstart", triggerLoad);
      window.removeEventListener("click", triggerLoad);
    };
  }, []);

  if (!loadRecaptcha) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY || "6LezyRgsAAAAAOCQ0A9TsVlukuTUiWFl5WXuXbyu"}
      scriptProps={{ async: true, defer: true, appendTo: "body" }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}


