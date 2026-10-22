
import AnimatedBtn from "@/app/components/LandingPage/AnimatedBtn";

import styles from "./footer.module.css";

export default function Footer({ handleSigninOpen }) {
    return (
        <footer className={styles.footer}>
            {/* Marquee Heading */}
            <div className={styles.marquee}>
                <div className={styles.marqueeInner}>
                    {
                        Array(100).fill().map((_, idx) => (
                            <span key={idx} className={styles.heading} id={idx}>
                                Connect with a <span>Network of Trusted Investors</span>
                            </span>
                        ))
                    }
                </div>

            </div>

            {/* Subtext */}
            <p className={styles.subText}>
                Join our community to access verified investors, funding opportunities, and peer insights.
            </p>

            {/* Button */}
            <AnimatedBtn  handleSigninOpen={handleSigninOpen}/>
            <div className={styles.earthImg}>
                <img src="/landing-asset/landing-footer.png" alt="PrEqt platform footer illustration - connect with network of trusted investors and access verified funding opportunities" style={{ maxWidth: '1200px', width: '100%' }} title="PrEqt platform footer illustration - connect with network of trusted investors and access verified funding opportunities" />
            </div>

        </footer>
    );
}
