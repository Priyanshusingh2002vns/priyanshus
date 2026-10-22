"use client";
import React from "react";
import styles from "./AppPromoSection.module.css";
import Image from "next/image";

export default function AppPromoSection() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
      <div className={styles.textSection}>
        <h2>
          Get the <span className={styles.bold}>PrEqt</span> App and keep in touch around the clock!
        </h2>
        <ul className={styles.features}>
          <li>
            <Image
            src="/greenTick.svg" // replace with your QR phone image
            alt="Maikia One App QR"
            width={16}
            height={24} 
            />
            Monitor your investments in real time.</li>
          <li>
          <Image
            src="/greenTick.svg" // replace with your QR phone image
            alt="Maikia One App QR"
            width={16}
            height={24}
            /> 
            Receive tailored deal suggestions.</li>
          <li>
          <Image
            src="/greenTick.svg" // replace with your QR phone image
            alt="Maikia One App QR"
            width={16}
            height={24}
            />
            Get real-time updates and alerts.</li>
        </ul>
      </div>

      
        <div className={styles.phoneContainer}>
          <img
            src="/promoImg.png" // replace with your QR phone image
            alt="Maikia One App QR"
            className={styles.phoneImage}
            unoptimized="true"
          />
        </div>
      </div>
    </section>
  );
}
