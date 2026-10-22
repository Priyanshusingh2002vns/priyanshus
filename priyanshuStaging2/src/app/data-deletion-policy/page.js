import styles from "../privacy-policy/page.module.css";
import { getRobotsDirectives } from "../utils/seoUtils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

export const metadata = {
  title: "Data Deletion Instructions | PrEqt",
  description: "Learn how to request deletion of your account and personal data from the PrEqt platform.",
  alternates: {
    canonical: `${SITE_URL}/data-deletion-policy`,
  },
  robots: getRobotsDirectives(),
};

export default function page() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Data Deletion Instructions</h1>
      <div className={styles.hr}></div>

      <section className={styles.section}>
        <h3>1. How to Request Data Deletion</h3>
        <p>
          We value your privacy and provide a simple process to request the
          deletion of your personal data associated with our app. If you want to
          delete your account or request removal of any personal information,
          please follow the steps below.
        </p>
      </section>

      <section className={styles.section}>
        <h3>2. Send Us an Email</h3>
        <p>To request data deletion, send an email to:</p>
        <p>
          <a href="mailto:info@preqt.com" className={styles.email}>
            info@preqt.com
          </a>
        </p>
        <p>Please include the following details:</p>
        <ul>
          <li>Your registered email address or mobile number</li>
          <li>Your full name</li>
          <li>A clear request asking for account and data deletion</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>3. Verification Process</h3>
        <p>
          After receiving your request, our team will verify your identity to
          ensure the security of your account and information.
        </p>
      </section>

      <section className={styles.section}>
        <h3>4. Confirmation of Deletion</h3>
        <p>
          Once verification is complete, we will delete your account and all
          associated data from our system. You will receive a confirmation email
          once the process is completed.
        </p>
      </section>

      <section className={styles.section}>
        <h3>5. Processing Time</h3>
        <p>Data deletion requests are typically processed within:</p>
        <ul>
          <li>7–14 business days</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>6. Important Notes</h3>
        <ul>
          <li>Once deleted, your account cannot be recovered.</li>
          <li>
            Some data may be retained if required by applicable law (e.g.,
            security or compliance purposes).
          </li>
          <li>We do not sell or share your personal data with third parties.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>7. Need Help?</h3>
        <p>
          For any questions or support regarding account or data deletion,
          contact us at:
        </p>
        <p>
          <a href="mailto:info@preqt.com" className={styles.email}>
            info@preqt.com
          </a>
        </p>
      </section>
    </div>
  );
}
