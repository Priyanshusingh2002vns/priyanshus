import AnimatedBtn from '@/app/components/LandingPage/AnimatedBtn';
import Faq from '../components/Faq';
import styles from './PreqtAppSection.module.css';
import ButtonAnimation from '@/app/components/LandingPage/ButtonAnimation';

export default function PreqtAppSection({ forPartner = false }) {

  return (
    <section className={styles.preqtSection}>

      {!forPartner && <div className={styles.header}>
        {/* <h1>Get The Preqt. App The Deals You  <br className={styles.hideOnMobile} />Want, Wherever You Are.</h1> */}
        <div className={styles.HeadingTagReplace}>Get The PrEqt App Now</div>
      </div>}

      <div className={styles.appDisplayWrapper}>

        <div className={styles.animatedBorder}>

          {forPartner ?
            <div className={styles.appScreenshotContainer} style={{ minHeight: "unset" }}>

              <div className={`${styles.appContentPlaceholder}`}>
                <div className={styles.partnerDiv}>
                  <div>
                    <div className={styles.header}>
                      <h2 className={styles.HeadingTagReplace}>Join the revolution in private  <br className={styles.hideOnMobile} />market investing.</h2>
                    </div>

                    <div className={styles.bodyPartner}>
                      <span>Apply to become a verified PrEqtPartner today.</span>
                    </div>
                    <AnimatedBtn text='Apply for Partnership' />

                    <div className={styles.partnerFooter}>
                      <ButtonAnimation text='Bank-grade Security' />
                      <ButtonAnimation text='24/7 Support' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            : <div className={styles.appScreenshotContainer}>

              <div className={`${styles.appContentPlaceholder} ${styles.hideOnMobile}`}>
                <img src={'/landing-asset/app-section.png'} alt="PrEqt mobile app interface showcasing deal discovery and investment tracking features" title="PrEqt mobile app interface showcasing deal discovery and investment tracking features" />
                <div className={styles.appDowloadLink}>
                  <div className={styles.appDowloadLinkdiv}>
                    <img src={'/landing-asset/playstore-app.png'} alt="Download PrEqt app from Google Play Store" title="Download PrEqt app from Google Play Store" />
                  </div>
                  <div className={styles.appDowloadLinkdiv}>
                    <img src={'/landing-asset/apple-app.png'} alt="Download PrEqt app from Apple App Store" title="Download PrEqt app from Apple App Store" />
                  </div>
                </div>
              </div>
              <div className={`${styles.appContentPlaceholder} ${styles.showOnMobile}`}>
                <img src={'/mobile-view.png'} alt="PrEqt mobile app view on smartphone device" title="PrEqt mobile app view on smartphone device" />
              </div>
            </div>}
        </div>
      </div>


      {!forPartner && <div className={styles.faqSection}>
        <Faq />
      </div>}

    </section>
  );

}

