import React from 'react';
import styles from './StepsComponent.module.css'; // Adjust path as necessary
import ButtonAnimation from '@/app/components/LandingPage/ButtonAnimation';

const StepsComponent = () => {
  return (
    <div className={styles.container}>
      {/* Left Section: Sticky Image/UI */}
      <div className={styles.leftSection}>
        <div className={styles.leftImageCard}>
          {/* TODO: Replace the src with your actual image path 
            In Next.js, consider using the <Image /> component for optimization 
          */}
          <div className={styles.leftImage}>
            <img
              src="/landing-asset/signin.png"
              alt="PrEqt sign up interface showing exclusive private market opportunities discovery"
              title="PrEqt sign up interface showing exclusive private market opportunities discovery"
            />
          </div>

          <div className={styles.signUpText}>
            <div className={styles.Heading3TagReplace}>Discover Exclusive Private Market Opportunities</div>
            <p>Create your account and access the deals and opportunities</p>
          </div>
        </div>
      </div>

      {/* Right Section: Steps Cards */}
      <div className={styles.rightSection}>
        <div className={styles.processHeader}>
          {/* <span className={styles.dot}></span> Process */}
          <ButtonAnimation text="Types of Investments" />
        </div>
        <div className={styles.HeadingTagReplace}>Investment Avenues We Offer</div>

        {/* Step Card 1 */}
        <div className={styles.stepCard}>
          <div className={styles.cardImagePlaceholder}>
            {/* TODO: Replace the src with your actual image path */}
            <img
              src="/landing-asset/step1.png"
              alt="Pre-IPO investment opportunity - invest in companies targeting IPO within 1-2 years"
              title="Pre-IPO investment opportunity - invest in companies targeting IPO within 1-2 years"
            />
          </div>
          <div className={styles.cardContent}>
            <h2>Pre-IPO</h2>
            <p>Invest in companies targeting IPO within 1 year (SME) or 2 years (Main Board). Early access, high visibility</p>
          </div>
        </div>

        {/* Step Card 2 */}
        <div className={styles.stepCard}>
          <div className={styles.cardImagePlaceholder}>
            {/* TODO: Replace the src with your actual image path */}
            <img
              src="/landing-asset/step2.png"
              alt="Roadshows - exclusive access to founder insights and financials for upcoming IPOs"
              title="Roadshows - exclusive access to founder insights and financials for upcoming IPOs"
            />
          </div>
          <div className={styles.cardContent}>
            <h2>Roadshows</h2>
            <p>Exclusive access to founder insights, financials, and growth plans for upcoming IPOs — before you invest</p>
          </div>
        </div>

        {/* Step Card 3 */}
        <div className={styles.stepCard}>
          <div className={styles.cardImagePlaceholder}>
            {/* TODO: Replace the src with your actual image path */}
            <img
              src="/landing-asset/step3.png"
              alt="QIPs and Preferential shares - join targeted private placements for select investors"
              title="QIPs and Preferential shares - join targeted private placements for select investors"
            />
          </div>
          <div className={styles.cardContent}>
            <h2>QIPs / Preferentials</h2>
            <p>Join targeted private placements offered by companies to select investors</p>
          </div>
        </div>


        {/* Step Card 4 */}
        <div className={styles.stepCard}>
          <div className={styles.cardImagePlaceholder}>
            {/* TODO: Replace the src with your actual image path */}
            <img
              src="/landing-asset/step5.png"
              alt="Early stage investments - back startups at growth stage with clear traction visibility"
              title="Early stage investments - back startups at growth stage with clear traction visibility"
            />
          </div>
          <div className={styles.cardContent}>
            {/* <h2>Private Funding</h2> */}
            <h2>Early Stage Investments</h2>
            <p>Back startups at their growth stage with clear visibility of traction and profitability</p>
          </div>
        </div>

        {/* Step Card 5 */}
        <div className={styles.stepCard}>
          <div className={styles.cardImagePlaceholder}>
            {/* TODO: Replace the src with your actual image path */}
            <img
              src="/landing-asset/step4.png"
              alt="Secondaries - buy unlisted shares and unlock liquidity in the private market"
              title="Secondaries - buy unlisted shares and unlock liquidity in the private market"
            />
          </div>
          <div className={styles.cardContent}>
            <h2>Secondaries</h2>
            <p>Buy unlisted shares and unlock liquidity in the private market</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepsComponent;