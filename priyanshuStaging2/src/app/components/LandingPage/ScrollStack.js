"use client";
import { useLayoutEffect, useRef, useState } from "react"; // <-- CHANGE: Import useState
import Lenis from "lenis";
import "./ScrollStack.css";

export const ScrollStackItem = ({ children, itemClassName = "" }) => (
    <div className={`scroll-stack-card ${itemClassName}`}>{children}</div>
);

const ScrollStack = ({ children, className = "" }) => { // <-- CHANGE: Accept className prop (optional, but good practice)
    const containerRef = useRef(null);
    const cardsRef = useRef([]);
    const [isIOS, setIsIOS] = useState(false); // <-- CHANGE: State for iOS detection

    useLayoutEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);
        // ----------------------------------------------------

        const lenis = new Lenis({
            smoothWheel: true,
            lerp: 0.1,
        });

        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const scrollY = -rect.top;
            const height = container.offsetHeight;
            const numCards = cardsRef.current.length;
            const cardHeight = height / numCards;

            // CHANGE: Prepare the hardware acceleration string for iOS
            const fixZ = isIosDevice ? ' translateZ(0)' : '';

            cardsRef.current.forEach((card, i) => {
                const depth = i * 100;
                const progress = Math.min(
                    Math.max(scrollY / (height - cardHeight), 0),
                    1
                );

                // Smooth stacking motion
                const translateY = Math.max(-scrollY + i * 120, depth);
                const opacity = 1;

                // CHANGE: Apply translateZ(0) fix inside the transform string on iOS
                card.style.transform = `translateY(${translateY}px) scale(${1})${fixZ}`;
                card.style.opacity = opacity;

                // CHANGE: Force backface-visibility for good measure
                if (isIosDevice) {
                    card.style.webkitBackfaceVisibility = 'hidden';
                    card.style.backfaceVisibility = 'hidden';
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            lenis.destroy();
        };
    }, [isIOS]); // <-- CHANGE: Added isIOS as a dependency

    return (
        // CHANGE: Apply conditional classes to the container
        <section ref={containerRef} className={`scroll-stack-container ${className} ${isIOS ? 'ios-scroll-fix' : ''}`}>
            {Array.isArray(children)
                ? children.map((child, i) => (
                    <div
                        key={i}
                        // CHANGE: Apply card-specific conditional class
                        className={`scroll-stack-card-wrapper ${isIOS ? 'ios-card-fix' : ''}`}
                        ref={(el) => (cardsRef.current[i] = el)}
                    >
                        {child}
                    </div>
                ))
                : children}
        </section>
    );
};

export default ScrollStack;