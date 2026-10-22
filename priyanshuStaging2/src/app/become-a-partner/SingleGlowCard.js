import Image from 'next/image'
import React from 'react'
import styles from "./page.module.css"

const SingleGlowCard = ({ data = {} }) => {
    return (
        <div className={styles.parentGlowCard}>
            <div className={styles.imageGlowParent}>
                <Image src={data.path} className={styles.glowCardImg} height={200} width={200} alt={data.head}/>
            </div>
            <h3 className={styles.glowCardHead}>{data.head}</h3>
            <p className={styles.glowCardPara}>{data.para}</p>
        </div>
    )
}

export default SingleGlowCard
