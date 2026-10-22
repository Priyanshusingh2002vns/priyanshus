import styles from "./page.module.css";

export default function page() {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Privacy Policy</h2>
      <div className={styles.hr}></div>

      <section className={styles.section}>
        <h3>1. Data Collection</h3>
        <p>
          We collect data when you sign up, explore deals, show interest, or
          interact with our AI chatbot. This may include:
        </p>
        <ul>
          <li>Name, email, phone number</li>
          <li>Investment preferences</li>
          <li>Device and usage data</li>
          <li>Communication history with our support or chatbot</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>2. Use of Data</h3>
        <p>Your data is used to:</p>
        <ul>
          <li>Personalize your experience</li>
          <li>Recommend relevant IPOs</li>
          <li>Enable communication with fund managers</li>
          <li>Improve AI chatbot responses</li>
        </ul>
        <p>We do not sell your personal data to third parties.</p>
      </section>

      <section className={styles.section}>
        <h3>3. Data Sharing</h3>
        <p>Your data may be shared:</p>
        <ul>
          <li>With fund managers only when you express interest</li>
          <li>With regulators if required by law</li>
          <li>With trusted service providers who help operate our platform</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>4. Data Security</h3>
        <p>
          We use encryption, access controls, and secure storage methods to
          protect your information. While we take all reasonable precautions, no
          method of transmission is 100% secure.
        </p>
      </section>

      <section className={styles.section}>
        <h3>5. Cookie Policy</h3>
        <p>
          We may use cookies to enhance performance and personalize your
          experience. You can choose to accept or block cookies in your
          device/browser settings.
        </p>
      </section>

      <section className={styles.section}>
        <h3>6. Your Rights</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Request access to your data</li>
          <li>Ask us to correct or delete your data</li>
          <li>Opt out of marketing emails</li>
        </ul>
        <p>
          You can exercise these rights by contacting our support team.
        </p>
      </section>

      <section className={styles.section}>
        <h3>7. Contact Us</h3>
        <p>
          If you have questions about these Terms or our Privacy Policy, reach
          out to:{" "}
          <a href="mailto:info@preqt.com" className={styles.email}>
            info@preqt.com
          </a>
        </p>
      </section>
    </div>
  );
}
