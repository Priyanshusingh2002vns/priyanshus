"use client"
import Image from "next/image"
import styles from "./Footer.module.css"
import { useRouter } from "next/navigation";

export default function Footer() {

    const router = useRouter();

    function getCurrentYear() {
        return new Date().getFullYear();
    }


    return (
        <section className={styles.FooterMainContainer}>
            <div className={styles.FooterInnerDiv}>
                {/* upper div container */}
                <div className={styles.upperFooter}>

                    <article>
                        <Image src={'/footer-icon.svg'} width={153} height={50} alt={'Footer Image'} />
                    </article>

                    {/* right content part */}
                    <article className={styles.footerRightPart}>
                        {/* quick link div */}
                        <div className={styles.quickLink}>
                            <p className={styles.quickLinkHeading}>Quick links</p>

                            <article className={styles.quickLinkOptions}>
                                <div className={styles.seprate}>
                                    <a href="/deals" className={styles.quickLinks} title="View all private equity deals and investment opportunities on PrEqt">All Deals</a>
                                    <a href="/events" className={styles.quickLinks} title="View upcoming investment events and webinars on PrEqt">Events</a>
                                </div>
                                <div className={styles.seprate}>
                                    <a href="/community" className={styles.quickLinks} title="Join PrEqt community for exclusive market discussions and investor insights">Community</a>
                                    {/* <a href="/blogs" className={styles.quickLinks}>Blogs</a> */}
                                    <h4 className={styles.quickLinks}>Blogs</h4>
                                </div>
                                <div className={styles.seprate}>
                                    <h4 className={styles.quickLinks}>Contact Us</h4>
                                    <h4 className={styles.quickLinks}>Careers</h4>
                                </div>
                                {/* <a href="/contact-us" className={styles.quickLinks}>Contact Us</a> */}
                                {/* <a href="/careers" className={styles.quickLinks}>Careers</a> */}
                            </article>
                        </div>

                        {/* fund details div */}
                        <div className={styles.FundDetailsDiv}>
                            <p className={styles.FundDetailsHeading}>Fund Details</p>
                            <article className={styles.fundDetailsOptions}>
                                <a href="" className={styles.fundDetails} title="Fund Name: Makia Capital Trust">Fund Name: Makia Capital Trust</a>
                                <a href="" className={styles.fundDetails} title="Category: CAT I Alternative Investment Fund">Category: CAT I Alternative Investment Fund</a>
                                <a href="" className={styles.fundDetails} title="SEBI Registration Number: IN/AIF1/24-25/1666">SEBI Reg No.:IN/AIF1/24-25/1666</a>
                                <a href="" className={styles.fundDetails} title="Investment Manager: Makia Partners LLP">Investment Manager: Makia Partners LLP</a>
                                <a href="" className={styles.fundDetails} title="Scored ID: aifn00222 Us">Scored ID: aifn00222 Us</a>
                            </article>
                        </div>

                        {/* registered pffice div */}
                        <div className={styles.FundDetailsDiv}>
                            <p className={styles.FundDetailsHeading}>Registered Office</p>

                            <article className={styles.OfficeDetailsContainer}>
                                <p className={styles.OfficeDetails}>Makia Partners LLP D-38, South Extension, Part-1 New Delhi-110049, India</p>
                            </article>
                        </div>

                        {/* contact us div */}
                        <div className={styles.ContactDetailsDiv}>
                            <p className={styles.FundDetailsHeading}>Contact Us</p>
                            <article className={styles.ContactMainContainer}>

                                <div className={styles.contactRow}>
                                    <img src="/assets/pictures/location.svg" alt="location" className={styles.locationImage} />
                                    <p className={styles.locationDetails}>PrEqtlocation</p>
                                </div>

                                <div className={styles.contactRow}>
                                    <img src="/assets/pictures/call.svg" alt="call" className={styles.locationImage} />
                                    <p className={styles.locationDetails}>+91-9876543210</p>
                                </div>

                                <div className={styles.contactRow}>
                                    <img src="/assets/pictures/clock.svg" alt="time" className={styles.locationImage} />
                                    <p className={styles.locationDetails}>Hours: 8:00 - 17:00, Mon - Sat</p>
                                </div>

                                <div className={styles.contactRow}>
                                    <img src="/assets/pictures/mail.svg" alt="mail" className={styles.locationImage} />
                                    <p className={styles.locationDetails}>support@pr.eqt.com</p>
                                </div>

                            </article>
                        </div>
                    </article>

                </div>

                <div className={styles.hrLine}></div>
                {/* lower div container cc */}
                <div className={styles.CopyWriteContent}>© {getCurrentYear()} Makia Technologies Private Limited | Powered by Passion, Driven by Discovery.</div>
            </div>
        </section>
    )
}