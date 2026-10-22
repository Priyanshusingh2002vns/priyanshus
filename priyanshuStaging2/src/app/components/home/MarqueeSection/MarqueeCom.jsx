"use client"

import styles from './marqueeSection.module.css'
import React, { useEffect, useRef, useState } from "react";
import marketData from './marketData.json';

const MarqueeCom = () => {
    const marqueeRef = useRef();
    const [isLoaded, setIsLoaded] = useState(false);
    const [marketItems, setMarketItems] = useState([]);
    
    useEffect(() => {
        // Set the market data from JSON file
        setMarketItems(marketData);
        
        const updateMarquee = () => {
            if (marqueeRef.current && marketItems.length > 0) {
                const contentWidth = marqueeRef.current.scrollWidth;
                
                // Calculate the distance needed to move the content
                // We want to move it by the width of one complete set of items
                const singleSetWidth = contentWidth / 2; // Since we have 2 sets
                
                marqueeRef.current.style.setProperty('--marquee-distance', `-${singleSetWidth}px`);
                
                // Calculate duration based on desired speed
                const speed = 50; // pixels per second - adjust this value to control speed
                const duration = singleSetWidth / speed;
                marqueeRef.current.style.setProperty('--marquee-duration', `${duration}s`);
                
                setIsLoaded(true);
            }
        };

        // Update marquee after data is set
        if (marketItems.length > 0) {
            // Small delay to ensure DOM is updated
            setTimeout(updateMarquee, 100);
        }
        
        // Update on window resize
        const handleResize = () => {
            updateMarquee();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [marketItems]);

    // Function to render a single market item
    const renderMarketItem = (item) => (
        <div key={item.id} className={styles.marqueeItem}>
            <div className={styles.NiftySection}>
                <p>{item.name}</p>
                <span className={styles.NiftyPoints}>{item.value}</span>
                <span className={item.changeType === 'positive' ? styles.spanedNiftySections : styles.spanedNiftySection}>
                    {item.change}
                </span>
            </div>
        </div>
    );

    return (
        <div>
            <div className={styles.marqueeSectionContainer}>
                <div className={styles.marqueeSection}>
                    <div 
                        className={`${styles.marqueeContent} ${isLoaded ? styles.animate : ''}`} 
                        ref={marqueeRef}
                    >
                        {/* First set of items */}
                        {marketItems.map(renderMarketItem)}
                        
                        {/* Duplicate set for seamless loop */}
                        {marketItems.map(renderMarketItem)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MarqueeCom;