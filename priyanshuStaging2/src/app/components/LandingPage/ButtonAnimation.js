import React from 'react';
import styles from "./animatedBtn.module.css";

const ButtonAnimation = ({ text = "Testimonials" }) => {
    return (
        <div className={styles.circularAnimation}>
            <span className={styles.bullet}>•</span>
            {text}
        </div>
    );
}

export default ButtonAnimation;