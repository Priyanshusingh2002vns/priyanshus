"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./carousel.module.css";
import ButtonAnimation from "./ButtonAnimation";
import Image from "next/image";
import PropTypes from "prop-types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// dynamic import (client only)
const Slider = dynamic(() => import("react-slick"), { ssr: false });

const SingleCard = ({ img = "", text = "", name = "", position = "" }) => (
    <div className={styles.cardWrapper}>
        <div className={styles.cardBody}>
            <blockquote className={styles.cardTextxt}>“{text}”</blockquote>
            <div className={styles.cardFooter}>
                <Image src={img} height={65} width={65} alt={`${name}'s profile picture`} />
                <div className={styles.personDetails}>
                    <h3>{name}</h3>
                    <p>{position}</p>
                </div>
            </div>
        </div>
    </div>
);

SingleCard.propTypes = {
    img: PropTypes.string,
    text: PropTypes.string,
    name: PropTypes.string,
    position: PropTypes.string,
};

const InvestorsCarousel = () => {
    const sectionRef = useRef(null);
    const carouselRef = useRef(null);
    const [isMobileOrTab, setIsMobileOrTab] = useState(false);

    // NEW: explicit slidesToShow state driven by window size
    const [slidesToShow, setSlidesToShow] = useState(2);

    const carouselData = [
        { id: 1, text: "The platform streamlined my entire investment process — from evaluating deals to engaging with founders. It's efficient, transparent, and built for serious investors.", name: "Rahul Khanna", position: "Managing Director, Crestpoint Ventures", img: "/user-1.png" },
        { id: 2, text: "Through PrEqtI discovered high-quality pre-IPO opportunities before they went mainstream. The due diligence tools and secure data rooms gave me confidence to move quickly.", name: "Anita Mehra", position: "Angel Investor & Partner at Horizon Capital", img: "/user-2.png" },
        { id: 3, text: "PrEqtis a game-changer! The curated deal flow and advanced analytics tools gave me an edge. I've expanded my portfolio with confidence and seen impressive returns.", name: "Marcus Vieri", position: "Partner, Greybrook Investments", img: "/user-1.png" },
        { id: 4, text: "An excellent platform to explore structured pre-IPO investment opportunities with transparency and precision.", name: "David Lee", position: "Venture Partner, Apex Equity", img: "/user-2.png" },
        { id: 5, text: "Highly curated deals and frictionless access. PrEqtmade early investing feel intuitive.", name: "Sophia Turner", position: "Private Investor", img: "/user-1.png" },
    ];

    // determine viewport categories & slidesToShow on client
    useEffect(() => {
        const updateSizes = () => {
            const w = window.innerWidth;
            setIsMobileOrTab(w <= 1024);
            if (w < 768) {
                setSlidesToShow(1);
            } else if (w <= 1024) {
                setSlidesToShow(2);
            } else {
                setSlidesToShow(2); // this value is only used when rendering Slider (desktop uses GSAP)
            }
        };

        updateSizes();
        window.addEventListener("resize", updateSizes);
        return () => window.removeEventListener("resize", updateSizes);
    }, []);

    // GSAP horizontal scroll (desktop only)
    useEffect(() => {
        if (isMobileOrTab) return;

        const mm = gsap.matchMedia();
        const section = sectionRef.current;
        const carousel = carouselRef.current;

        mm.add("(min-width: 1025px)", () => {
            if (!carousel || !section) return;

            const totalCards = carouselData.length;
            const visibleCards = 3.5;
            const wrapperWidth = carousel.offsetWidth;
            const cardWidth = wrapperWidth / visibleCards;

            const scrollDistance = (cardWidth + 20) * totalCards - window.innerWidth + 100;

            const tween = gsap.to(carousel, {
                x: -scrollDistance,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: `+=${scrollDistance}`,
                    scrub: 1.2,
                    pin: true,
                    anticipatePin: 1,
                },
            });

            ScrollTrigger.refresh();
            return () => {
                tween.kill();
                ScrollTrigger.getAll().forEach((t) => t.kill());
            };
        });

        return () => mm.revert();
    }, [isMobileOrTab, carouselData]);

    // slider settings use slidesToShow state (guaranteed)
    const sliderSettings = {
        dots: true,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        // keep responsive as fallback but primary control is slidesToShow state
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <section ref={sectionRef} className={styles.carouselSection}>
            <div className={styles.parentWrapper}>
                <ButtonAnimation text="Testimonials" />
                <div className={styles.HeadingTagReplace}>What investors are saying</div>

                {isMobileOrTab ? (
                    <div className={styles.slickWrapper}>
                        <Slider {...sliderSettings}>
                            {carouselData.map((data) => (
                                <div key={data.id} className={styles.slideItem}>
                                    {/* slideItem wrapper ensures correct sizing */}
                                    <SingleCard {...data} />
                                </div>
                            ))}
                        </Slider>
                    </div>
                ) : (
                    <div ref={carouselRef} className={styles.carouselWrapper}>
                        {carouselData.map((data) => (
                            <SingleCard key={data.id} {...data} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default InvestorsCarousel;
