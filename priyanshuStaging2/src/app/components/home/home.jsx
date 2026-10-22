// "use client"
// import NavBar from "../../common/navBar/NavBar";
// import styles from "./home.module.css"
// import HeroSection from "./HeroSection/HeroSection";
// import FAQSection from "./FAQSection/FAQSection";
// import Footer from "../../common/navBar/Footer";
// import MarqueeCom from "./MarqueeSection/MarqueeCom";
// import Home from "@/app/account/footer/Accountfooter";
// import AnimateAccount from "@/app/account/footer/AnimateAccount";
// // import React, { useEffect, useRef } from "react";

// export default function home() {

//     // const marqueeRef = useRef();

//     // useEffect(() => {
//     //     const contentWidth = marqueeRef.current.scrollWidth;
//     //     marqueeRef.current.style.setProperty('--marquee-distance', `-${contentWidth / 2}px`);
//     //     // You may adjust the duration based on width for constant speed:
//     //     const speed = 250; // px/sec, adjust as needed
//     //     const duration = contentWidth / speed;
//     //     marqueeRef.current.style.setProperty('--marquee-duration', `${duration}s`);
//     // }, []);

//     return (
//         <section>
//             {/* <NavBar /> */}
//             {/* <MarqueeCom/> */}
//             <HeroSection />
//             <FAQSection />
//             <div className={styles.homeFootermob}>
//                 <AnimateAccount/>
//             </div>
//             {/* <Footer /> */}
//         </section>
//     )
// }

"use client";

import { useEffect, useState } from "react";
import NavBar from "../../common/navBar/NavBar";
import styles from "./home.module.css";
import HeroSection from "./HeroSection/HeroSection";
import FAQSection from "./FAQSection/FAQSection";
import Footer from "../../common/navBar/Footer";
import MarqueeCom from "./MarqueeSection/MarqueeCom";
import Home from "@/app/account/footer/Accountfooter";
import AnimateAccount from "@/app/account/footer/AnimateAccount";
import Loader from "@/app/components/Loader";

export default function home() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 50); // Smooth UX loader

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div style={{
                width: "100%",
                height: "60vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Loader />
            </div>
        );
    }

    return (
        <section>
            {/* <NavBar /> */}
            {/* <MarqueeCom/> */}

            <HeroSection />
            <FAQSection />

            {/* <div className={styles.homeFootermob}>
                <AnimateAccount />
            </div> */}

            {/* <Footer /> */}
        </section>
    );
}
