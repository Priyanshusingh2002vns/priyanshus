"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Handshake, Award, Key, Users, User } from "lucide-react";
import styles from "./iconcarousel.module.css";
import Image from "next/image";

const icons = ["/check.svg", "/hand.svg", "/handshake.svg", "/highFive.svg", "/people.svg", "/thumbh.svg"];

const IconCarousel = () => {
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);
    const iconCount = icons.length;

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setIndex((prev) => (prev + 1) % iconCount);
        }, 2000);

        return () => clearInterval(intervalRef.current);
    }, []);

    const getDistance = (i) => {
        let dist = i - index;
        if (dist > iconCount / 2) dist -= iconCount;
        if (dist < -iconCount / 2) dist += iconCount;
        return dist;
    };

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.carousel}>
                {icons.map((Icon, i) => {
                    const distance = getDistance(i);

                    // Correct scale: active largest, neighbors medium, others small
                    let scale = 0.6;
                    if (distance === 0) scale = 1.2;        // Active icon
                    else if (Math.abs(distance) === 1) scale = 0.9; // Neighbors

                    // Opacity
                    const opacity = distance === 0 ? 1 : Math.abs(distance) === 1 ? 0.7 : 0.3;

                    // x position
                    const x = distance * 120;

                    return (
                        <motion.div
                            key={i}
                            className={styles.iconWrapper}
                            animate={{ scale, x, opacity }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <div className={styles.iconCircle}>
                                <Image src={Icon} height={50} width={50} alt="PrEqt investor network icon" title="PrEqt investor network icon"/>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default IconCarousel;
