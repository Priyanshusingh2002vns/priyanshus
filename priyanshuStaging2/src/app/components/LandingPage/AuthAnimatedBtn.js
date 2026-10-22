import React from 'react';
import styles from './AuthAnimatedBtn.module.css';

/**
 * AnimatedButton component with a continuous 'circular shine' tracing the perimeter 
 * of an oval (pill-shaped) button, using only standard internal CSS.
 */
const AuthAnimatedBtn = ({ children, onClick, className = '', theme = 'dark' }) => {
  return (
    <>
      <button
        onClick={onClick}
        className={`${theme === 'light' ? styles['light-theme-button'] : styles['without-border-button']} ${className}`}
      >
        <span className={styles["without-border-button-content"]}>
          {children}
        </span>
      </button>
    </>
  );
};

export default AuthAnimatedBtn;
