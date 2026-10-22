"use client";

import React from 'react';
import styles from './UnlockTeaser.module.css';
import DealCard from '@/app/deals/components/DealCard';
import Image from 'next/image';

// Dummy Mock Data representing CricStudio (Private) and Neokred (Series A) cards for background visuals
const privateDealMock1 = {
    id: "teaser-private-1",
    deal_type: "Private",
    hidden_status: "live",
    exclusive_deal: true,
    company_name: "CricStudio Pvt. Ltd.",
    tag_line: "Digitally-enabled cricket equipment brand scaling across global markets",
    round_size_in_cr: 8.0,
    stage: "Pre-Series A",
    valuation_in_cr: 750.0,
    rev_arr_in_cr: 135.0,
    gross_margin_percent: 48.0,
    growth_yoy: 1.5,
    min_ticket_in_inr: 50000.0,
    revenue_fy25_in_cr: 135.0,
    pat_fy25_in_cr: 12.5,
    pe_multiple: 12.0,
    listing_timeline: "2027-09-01",
    cagr_growth_3y_percent: 48.0,
    raised_amount: 4.8,
    target_funding_in_cr: 8.0,
    tags: ["PROFITABLE", "DIVIDEND PAYING", "MATURE"],
    qa_count: 12,
    qa_freshness: "Last 3 Days",
    dummy_initials: ["A", "A", "A", "AE"],
    is_featured: true,
    sector_industry: "Sports Technology",
    slug: "cricstudio-pvt-ltd"
};

const privateDealMock2 = {
    id: "teaser-private-2",
    deal_type: "Private",
    hidden_status: "live",
    exclusive_deal: true,
    company_name: "AeroSpace Tech India",
    tag_line: "Pioneering private satellite launch vehicles and aerospace manufacturing solutions.",
    round_size_in_cr: 10.0,
    stage: "Venture Round",
    valuation_in_cr: 980.0,
    rev_arr_in_cr: 165.0,
    gross_margin_percent: 54.0,
    growth_yoy: 1.8,
    min_ticket_in_inr: 100000.0,
    revenue_fy25_in_cr: 165.0,
    pat_fy25_in_cr: 15.0,
    pe_multiple: 15.4,
    listing_timeline: "2027-12-01",
    cagr_growth_3y_percent: 54.0,
    raised_amount: 7.0,
    target_funding_in_cr: 10.0,
    tags: ["HIGH GROWTH", "DEEP TECH", "EXCLUSIVE"],
    qa_count: 8,
    qa_freshness: "Last 5 Days",
    dummy_initials: ["S", "R", "N", "K"],
    is_featured: true,
    sector_industry: "Aerospace",
    slug: "aerospace-tech-india"
};

const startupDealMock = {
    id: "teaser-startup-1",
    deal_type: "Private",
    exclusive_deal: false,
    hidden_status: "live",
    company_name: "Neokred Technologies",
    tag_line: "Embedded fintech infrastructure powering 50+ Indian banking partners",
    round_size_in_cr: 120.0,
    stage: "Series A",
    valuation_in_cr: 1500.0,
    rev_arr_in_cr: 12.5,
    gross_margin_percent: 38.0,
    growth_yoy: 4.2,
    min_ticket_in_inr: 1000.0,
    raised_amount: 4.8,
    target_funding_in_cr: 8.0,
    tags: ["ASSET-LIGHT", "FAST MOVER", "HIGH MARGIN"],
    qa_count: 15,
    qa_freshness: "Last 5 Days",
    dummy_initials: ["N", "E", "O"],
    is_featured: true,
    sector_industry: "Fintech Infrastructure",
    slug: "neokred-technologies"
};

const techMahindraTeaserMock = {
    id: "teaser-list-1",
    deal_type: "Private",
    hidden_status: "live",
    exclusive_deal: true,
    company_name: "Ola Electric Mobility Ltd.",
    tag_line: "India's leading EV two-wheeler manufacturer with deep vertical integration",
    round_size_in_cr: 750.0,
    stage: "Series C",
    valuation_in_cr: 750.0,
    rev_arr_in_cr: 135.0,
    gross_margin_percent: 48.0,
    growth_yoy: 1.5,
    min_ticket_in_inr: 50000.0,
    revenue_fy25_in_cr: 135.0,
    pat_fy25_in_cr: 12.5,
    pe_multiple: 12.0,
    listing_timeline: "2027-09-01",
    cagr_growth_3y_percent: 48.0,
    raised_amount: 450.0,
    target_funding_in_cr: 750.0,
    tags: ["PROFITABLE", "DIVIDEND PAYING", "MATURE"],
    qa_count: 12,
    qa_freshness: "Last 3 Days",
    dummy_initials: ["A", "A", "A", "AE"],
    is_featured: true,
    company_stage: "Series C",
    sector_industry: "EV Mobility",
    slug: "ola-electric-mobility-ltd"
};

export default function UnlockTeaser({ className = "", isAllDeals = false, isListView = false, isGridCard = false, isTopDeal = false, isCompactList = false }) {
    const handleGooglePlayClick = () => {
        window.open("https://play.google.com/store/apps/details?id=com.preqt.app", "_blank");
    };

    const handleAppStoreClick = () => {
        window.open("https://apps.apple.com/in/app/preqt/id6751903472", "_blank");
    };

    if (isTopDeal) {
        return (
            <div className={`${styles.topDealsTeaser} ${className}`}>
                <div className={styles.frostedOverlay}></div>
                <div className={styles.foreground}>
                    <div className={styles.phoneWrapper}>
                        <img
                            src="/downloadPreqt.png"
                            className={styles.phoneGraphic}
                            alt="Download PreQT App"
                            draggable={false}
                        />
                        <img
                            src="/preqtylogo.png"
                            className={styles.phoneLogo}
                            alt="PreQT Logo"
                            draggable={false}
                        />
                    </div>
                    <div className={styles.textSection}>
                        <h3 className={styles.actionTitle}>Unlock Exclusive Private Deals</h3>
                        <p className={styles.actionDesc}>
                            Download the mobile app to unlock verified private market opportunities, startup deals, and exclusive IPO access.
                        </p>
                        <div className={styles.badgeContainer}>
                            <Image
                                src="/downloadapplePreqt.png"
                                width={80}
                                height={22}
                                alt="Download on the App Store"
                                className={styles.storeBadge}
                                onClick={handleAppStoreClick}
                                draggable={false}
                            />
                            <Image
                                src="/androiddownloadpreqt.png"
                                width={80}
                                height={22}
                                alt="Get it on Google Play"
                                className={styles.storeBadge}
                                onClick={handleGooglePlayClick}
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isGridCard) {
        return (
            <div className={`${styles.teaserContainer} ${styles.gridCardTeaser} ${className}`}>
                {/* Background Layer - CricStudio Private Card */}
                <div className={styles.gridSingleCardBackdrop} aria-hidden="true">
                    <DealCard 
                        deal={privateDealMock1} 
                        isAuthenticated={true} 
                        isListView={false} 
                        disableLink={true}
                        qaCount={privateDealMock1.qa_count || 0}
                        replies={{}}
                    />
                </div>

                {/* Frosted Glass Overlay */}
                <div className={styles.gridFrostedOverlay} aria-hidden="true"></div>

                {/* Foreground Content */}
                <div className={styles.gridForeground}>
                    {/* Glowing Phone Outline with Logo */}
                    <div className={styles.gridPhoneWrapper}>
                        <img
                            src="/downloadPreqt.png"
                            className={styles.gridPhoneGraphic}
                            alt="Download PreQT App"
                            draggable={false}
                        />
                        <img
                            src="/preqtylogo.png"
                            className={styles.gridPhoneLogo}
                            alt="PreQT Logo"
                            draggable={false}
                        />
                    </div>

                    {/* Text Details */}
                    <div className={styles.gridTextSection}>
                        <h3 className={styles.gridActionTitle}>
                            Unlock Exclusive<br />Private Deals
                        </h3>
                        <p className={styles.gridActionDesc}>
                            Download the mobile app to unlock verified private market opportunities, startup deals, and exclusive IPO access.
                        </p>
                    </div>

                    {/* App Badges */}
                    <div className={styles.gridBadgeContainer}>
                        <img
                            src="/downloadapplePreqt.png"
                            className={styles.gridStoreBadge}
                            onClick={handleAppStoreClick}
                            alt="Download on the App Store"
                            draggable={false}
                        />
                        <img
                            src="/androiddownloadpreqt.png"
                            className={styles.gridStoreBadge}
                            onClick={handleGooglePlayClick}
                            alt="Get it on Google Play"
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (isCompactList) {
        return (
            <div className={`${styles.compactListTeaser} ${className}`}>
                {/* Background Layer with Blurred & Faded Cards */}
                <div className={styles.compactListBgContainer} aria-hidden="true">
                    <div className={styles.compactListBackdrop}>
                        <table className={styles.compactListTable}>
                            <DealCard 
                                deal={techMahindraTeaserMock} 
                                isAuthenticated={true} 
                                isListView={true} 
                                isTableView={true}
                                disableLink={true}
                                qaCount={techMahindraTeaserMock.qa_count || 0}
                                replies={{}}
                            />
                        </table>
                    </div>
                </div>

                {/* Frosted Glass Overlay */}
                <div className={styles.compactListOverlay} aria-hidden="true"></div>

                {/* Foreground Content */}
                <div className={styles.compactListForeground}>
                    {/* Glowing Gold Phone Graphic */}
                    <div className={styles.compactListPhoneWrapper}>
                        <img
                            src="/downloadPreqt.png"
                            className={styles.compactListPhoneGraphic}
                            alt="PreQT App"
                            draggable={false}
                        />
                    </div>

                    {/* PreQT Logo: White pr. + Gold .eqt. */}
                    <img
                        src="/landing-logo.svg"
                        className={styles.compactListLogo}
                        alt="pr.eqt."
                        draggable={false}
                    />

                    {/* Two-Line Action Text */}
                    <div className={styles.compactListText}>
                        <span>Download The Mobile App To Unlock Verified Private Market Opportunities,</span>
                        <span>Startup Deals, And Exclusive IPO Access.</span>
                    </div>

                    {/* App Store & Google Play Badges */}
                    <div className={styles.compactListBadges}>
                        <img
                            src="/downloadapplePreqt.png"
                            alt="Download on the App Store"
                            className={styles.compactListBadge}
                            onClick={handleAppStoreClick}
                            draggable={false}
                        />
                        <img
                            src="/androiddownloadpreqt.png"
                            alt="Get it on Google Play"
                            className={styles.compactListBadge}
                            onClick={handleGooglePlayClick}
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.teaserContainer} ${isAllDeals ? styles.allDealsContainer : ''} ${isListView ? styles.allDealsTeaser : ''} ${className}`}>
            {/* If on hero section, show the header clearly on top of the teaser container */}
            {!isAllDeals && (
                <div className={styles.heroHeader}>
                    <p className={styles.headerTitle} style={{ marginBottom: '0px', paddingBottom: '0px' }}>Exclusive</p>
                    <h2 className={styles.headerTitle}>
                        <span className={styles.privateHighlight}>Private</span> Assets
                    </h2>
                    <p className={styles.headerDesc}>
                        Institutional-grade assets with verified liquidity and zero-barrier execution interfaces. Available exclusively on mobile.
                    </p>
                </div>
            )}

            {/* Background Layer with Blurred & Faded Cards */}
            <div className={`${styles.bgContainer}`} aria-hidden="true">
                {isListView ? (
                    <div className={styles.singleCardBackdrop} aria-hidden="true">
                        <DealCard 
                            deal={techMahindraTeaserMock} 
                            isAuthenticated={true} 
                            isListView={true} 
                            disableLink={true}
                            qaCount={techMahindraTeaserMock.qa_count || 0}
                            replies={{}}
                        />
                    </div>
                ) : (
                    <>
                        {isAllDeals && (
                            <div className={styles.bgHeader}>
                                <p className={styles.headerTitle} style={{ marginBottom: '0px' }}>Exclusive</p>
                                <h2 className={styles.headerTitle}>
                                    <span className={styles.privateHighlight}>Private</span> Assets
                                </h2>
                                <p className={styles.headerDesc}>
                                    Institutional-grade assets with verified liquidity and zero-barrier execution interfaces. Available exclusively on mobile.
                                </p>
                            </div>
                        )}
                        {/* Column 1: Private Deals (2 Cards side by side) */}
                        <div className={`${styles.bgColumn} ${styles.bgColumnPrivate}`}>
                            <div className={styles.bgSectionHeader}>
                                <div className={styles.bgSectionTitleRow}>
                                    <h2 className={`${styles.bgSectionTitle} ${styles.bgSectionTitleGold}`}>
                                        Private Deals <span className={styles.bgSectionArrow}>↗</span>
                                    </h2>
                                </div>
                                <p className={styles.bgSectionSubtitle}>EXCLUSIVE PRIVATE ASSETS</p>
                            </div>

                            <div className={styles.bgFilterContainer}>
                                <div className={`${styles.bgFilterButton} ${styles.bgFilterButtonActive}`}>
                                    PRIVATE
                                </div>
                                <div className={styles.bgFilterButton}>
                                    OFS
                                </div>
                                <div className={styles.bgFilterButton}>
                                    CCPS
                                </div>
                            </div>

                            <div className={styles.bgCardsRow}>
                                <div className={styles.bgCardWrapper}>
                                    <DealCard 
                                        deal={privateDealMock1} 
                                        isAuthenticated={true} 
                                        isListView={isListView} 
                                        disableLink={true}
                                        qaCount={privateDealMock1.qa_count || 0}
                                        replies={{}}
                                    />
                                </div>
                                <div className={`${styles.bgCardWrapper} ${styles.hideOnMobile}`}>
                                    <DealCard 
                                        deal={privateDealMock2} 
                                        isAuthenticated={true} 
                                        isListView={isListView} 
                                        disableLink={true}
                                        qaCount={privateDealMock2.qa_count || 0}
                                        replies={{}}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Startups (1 Card) */}
                        <div className={`${styles.bgColumn} ${styles.bgColumnStartup}`}>
                            <div className={styles.bgSectionHeader}>
                                <div className={styles.bgSectionTitleRow}>
                                    <h2 className={`${styles.bgSectionTitle} ${styles.bgSectionTitleGold}`}>
                                        Start up Deals <span className={styles.bgSectionArrow}>↗</span>
                                    </h2>
                                </div>
                                <p className={styles.bgSectionSubtitle}>VENTURE STAGE COMPANIES</p>
                            </div>

                            {/* Spacer to align with Private Deals filter row */}
                            <div style={{ height: '38px' }}></div>

                            <div className={styles.bgCardsRow}>
                                <div className={styles.bgCardWrapper}>
                                    <DealCard 
                                        deal={startupDealMock} 
                                        isAuthenticated={true} 
                                        isListView={isListView} 
                                        disableLink={true}
                                        qaCount={startupDealMock.qa_count || 0}
                                        replies={{}}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Custom Frosted Glass Overlay with Exact Styles requested by User */}
            <div className={styles.frostedOverlay}></div>

            {/* Foreground Content */}
            <div className={styles.foreground}>
                {/* Glowing Gold Phone Download Graphic with overlaid logo */}
                <div className={styles.phoneWrapper}>
                    <img
                        src="/downloadPreqt.png"
                        className={styles.phoneGraphic}
                        alt="Download PreQT App"
                        draggable={false}
                    />
                    <img
                        src="/preqtylogo.png"
                        className={styles.phoneLogo}
                        alt="PreQT Logo"
                        draggable={false}
                    />
                </div>

                <div className={styles.textSection}>
                    <h3 className={styles.actionTitle}>Unlock Exclusive Private Deals</h3>
                    <p className={styles.actionDesc}>
                        Download the mobile app to unlock verified private market opportunities, startup deals, and exclusive IPO access.
                    </p>
                </div>
                {/* App Badges */}
                    <div className={styles.badgeContainer}>
                        <Image
                            src="/downloadapplePreqt.png"
                            width={188}
                            height={64}
                            alt="Download on the App Store"
                            className={styles.storeBadge}
                            onClick={handleAppStoreClick}
                            draggable={false}
                        />
                        <Image
                            src="/androiddownloadpreqt.png"
                            width={188}
                            height={64}
                            alt="Get it on Google Play"
                            className={styles.storeBadge}
                            onClick={handleGooglePlayClick}
                            draggable={false}
                        />
                    </div>
            </div>
        </div>
    );
}
