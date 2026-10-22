"use client"
import React from 'react'
import Lottie from 'lottie-react'
import loaderAnimation from '../../../public/loader.json'
import styles from './commingsoon.module.css' // comment 

const Loader = () => {
    return (
        <div className={styles.loaderSection}>
            <Lottie 
                animationData={loaderAnimation} 
                loop={true} 
                className={styles.lottieLoader}
            />
        </div>
    )
}

export default Loader
