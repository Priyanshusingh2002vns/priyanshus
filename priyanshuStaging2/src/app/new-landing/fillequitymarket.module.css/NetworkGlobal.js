"use client"
import React from 'react'
import Link from 'next/link'
import styles from './NetworkGlobal.module.css'

import Image from 'next/image';

export default function NetworkGlobal() {
  return (
    <>
      {/* <div className={styles.extraspace}></div> */}
      <section className={styles.networkglobalsection}>
        <div className='container'>
          <div className={styles.networkglobalcontent}>
            <h2>Connect with a Network of Trusted Investors</h2>
            <p>Join our community to access verified investors, funding opportunities, and peer insights.</p>

            <Link href="/community" className={styles.cta}>
              Join Our COMMUNITY
              <span className={styles.arrow}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4.7915V15.2082" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>

        </div>
        {/* <div className={styles.networkglobalimage}>
          <img src="/earthimg.png" alt="Network Global" />
        </div>
        <div className={`${styles.networkglobalimage} ${styles.networkglobalimagemob}`}>
          <img src="/earthimgmob.png" alt="Network Global" />
        </div> */}
         <div className={styles.networkglobalimage}>
          <Image 
            src="/earthimg.png" 
            alt="Network Global" 
            width={900} 
            height={520} 
            sizes="(max-width: 1024px) 100vw, 900px" 
            loading="lazy"
          />
        </div>
        <div className={`${styles.networkglobalimage} ${styles.networkglobalimagemob}`}>
          <Image 
            src="/earthimgmob.png" 
            alt="Network Global" 
            width={390} 
            height={227} 
            sizes="208px" 
            loading="lazy"
          />
        </div>

      </section>
    </>

  )
}   