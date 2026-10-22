"use client"
import React, { useRef } from "react";
import styles from "./animatedBtn.module.css";
import { MoveRight } from "lucide-react";
import Link from "next/link";
// import Image from "next/image"; // Image is not used

const AnimatedBtn = ({ text = "Get Started Today", link = "", fullWidth = false, handleSigninOpen }) => {
    const btnRef = useRef(null);
    const glowRef = useRef(null);

    const handleMouseMove = (e) => {
        const btn = btnRef.current;
        const glow = glowRef.current;
        if (!btn || !glow) return;

        const rect = btn.getBoundingClientRect();
        // Cursor position relative to button center
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Move glow
        // The glow will stay at its last position due to CSS transition on mouse leave
        glow.style.transform = `translateX(${x * 1.1}px) translateY(-50%)`;

        // Move box shadow with glow (x * 0.4 for less drastic movement)
        const shadowX = x * 0.4;

        // Increased blur and opacity for better visibility
        btn.style.boxShadow = `
            ${shadowX}px 5px 25px rgba(0, 0, 0, 0.6)
        `;
    };

    // NOTE: Removed handleMouseLeave function to keep the glow at its last position.

    return (
        <div className={styles.wrapper} style={{ display: fullWidth ? "block" : "inline-block", maxWidth: fullWidth && 'unset' }}>
            <div className={`${styles.borderBlur} ${styles.borderLayer2}`}>
                <div className={styles.border}></div>
            </div>
            <div
                // href={link}
                className={styles.button}
                ref={btnRef}
                onClick={handleSigninOpen}
                onMouseMove={handleMouseMove}
            >
                <div className={styles.glowWrapper} ref={glowRef}>
                    <div className={styles.glow1}></div>
                    <div className={styles.glow2}></div>
                </div>
                <div className={styles.btnWrap}>
                    <span className={styles.text}>{text}</span>
                    <div className={styles.btnIcon}>
                        <MoveRight size={20} strokeWidth={2} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimatedBtn;
