import Image from 'next/image'
import React from 'react'
import styles from './commingsoon.module.css'

const CommingSoon = () => {
    return (
        <div className={styles.CommingSoonMainContainer}>
            <Image src="/assets/pictures/comming-soon.png" alt="comming-soon" height={450} width={400} />
        </div>
    )
}

export default CommingSoon
