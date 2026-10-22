import styles from './page.module.css';
import { getRobotsDirectives } from '../utils/seoUtils';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

export const metadata = {
  title: "Terms & Conditions | PrEqt",
  description: "Review the platform terms and conditions for using PrEqt private equity and investment platform.",
  alternates: {
    canonical: `${SITE_URL}/terms-and-condition`,
  },
  openGraph: {
    title: "Terms & Conditions | PrEqt",
    description: "Review the platform terms and conditions for using PrEqt private equity and investment platform.",
    url: `${SITE_URL}/terms-and-condition`,
    siteName: "PrEqt",
    locale: "en_IN",
    type: "website",
  },
  robots: getRobotsDirectives(),
};

export default function page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Terms & Conditions</h1>
      <div  className={styles.hr}></div> 
      <p className={styles.date}>Effective Date: <span>July 2025</span></p>

      <p className={styles.intro}>
        Welcome to Preqt
      </p>
      <p className={styles.text}>
        By accessing or using the PrEqtmobile or web platform, you agree to be bound by the following terms and conditions. Please read them carefully.
      </p>

      <h2 className={styles.h2}>1. Eligibility</h2>
      <p className={styles.p}>
        You must be at least 18 years of age and legally capable of entering into a binding contract in order to use Preqt. 
        By using our services, you confirm that all information provided by you is accurate and true to the best of your knowledge.
      </p >

      <h2 className={styles.h2}>2. Use of Platform</h2>
      <p  className={styles.p}>
        PrEqtis an IPO discovery and investment readiness platform. We do not directly facilitate transactions or guarantee investment returns. 
        Users are responsible for conducting their own due diligence before showing interest or making investment decisions.
      </p>

      <h2 className={styles.h2}>3. User Conduct</h2>
      <p  className={styles.p}>You agree not to misuse the platform, including (but not limited to):</p>
      <ul className={styles.ul}>
        <li className={styles.li}>Uploading false or misleading information</li>
        <li className={styles.li}>Impersonating another user or entity</li>
        <li className={styles.li}>Attempting to hack, disrupt, or reverse-engineer our services</li>
      </ul>

      <h2 className={styles.h2}>4. Intellectual Property</h2>
      <p  className={styles.p}>
        All content, branding, design, and features on the PrEqtplatform are the intellectual property of WebNinjaz Technologies Pvt. Ltd. 
        and may not be copied or reused without prior written permission.
      </p>

      <h2 className={styles.h2}>5. Third-Party Links</h2>
      <p  className={styles.p}>
        Our platform may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of those websites.
      </p>

      <h2 className={styles.h2}>6. Termination</h2>
      <p  className={styles.p}>
        We reserve the right to suspend or terminate your account if any terms are violated or suspicious activity is detected.
      </p>

      <h2 className={styles.h2}>7. Changes to Terms</h2>
      <p  className={styles.p}>
        We may update these terms periodically. Continued use of the platform indicates your agreement with any modified terms.
      </p>
    </div>
  );
}
