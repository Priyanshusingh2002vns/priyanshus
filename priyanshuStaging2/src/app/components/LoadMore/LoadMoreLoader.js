import React from 'react';
import styles from './loader.module.css';

const LoadMoreLoader = () => {
    return (
        <div className={styles.loadingWave}>
            <div className={styles.loadingBar}></div>
            <div className={styles.loadingBar}></div>
            <div className={styles.loadingBar}></div>
            <div className={styles.loadingBar}></div>
        </div>
    );
};

export default LoadMoreLoader;
