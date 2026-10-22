"use client";

import styles from "./LetsHearFromThem.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useState, useRef } from "react";

export default function LetsHearFromThem() {
    const [testimonials, setTestimonials] = useState([]);
    const [swiperReady, setSwiperReady] = useState(false);
    const [hasMoreSlides, setHasMoreSlides] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(null);

    const swiperRef = useRef(null);
    const slideRefs = useRef({});
    const videoRefs = useRef({});

    /* ---------------- FETCH DATA ---------------- */
    const handleFetchTestimonials = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/ama-videos`
            );
            const result = await response.json();
            if (response.ok) {
                setTestimonials(result.data.data || []);
            }
        } catch (error) {
            console.log("unable to fetch testimonials");
        }
    };

    useEffect(() => {
        handleFetchTestimonials();
    }, []);

    /* ---------------- STOP VIDEO WHEN SLIDE NOT IN VIEW ---------------- */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.dataset.id;

                    if (!entry.isIntersecting) {
                        // Stop iframe video by unmounting
                        if (activeVideoId === id) {
                            setActiveVideoId(null);
                        }

                        // Stop local video
                        if (videoRefs.current[id]) {
                            videoRefs.current[id].pause();
                            videoRefs.current[id].currentTime = 0;
                        }
                    }
                });
            },
            { threshold: 0.6 }
        );

        Object.values(slideRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [activeVideoId]);

    /* ---------------- SWIPER SLIDE COUNT ---------------- */
    const checkIfHasMoreSlides = () => {
        if (swiperRef.current) {
            setHasMoreSlides(!swiperRef.current.isEnd);
        }
    };

    useEffect(() => {
    if (swiperRef.current && testimonials.length > 0) {
        swiperRef.current.update();
        setHasMoreSlides(!swiperRef.current.isEnd);
    }
}, [testimonials]);


    /* ---------------- NEXT ARROW ---------------- */
    const NextArrow = () => (
        <div
            className={styles.customNextArrow}
            onClick={() => swiperRef.current?.slideNext()}
        >
            <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
                <path
                    d="M9 18.168L15 12.168L9 6.16797"
                    stroke="#7E60FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );

    /* ---------------- YOUTUBE ID EXTRACT ---------------- */
    const extractYouTubeId = (url) => {
        const short = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
        const watch = /v=([a-zA-Z0-9_-]{11})/;
        const shorts = /shorts\/([a-zA-Z0-9_-]{11})/;
        return (
            url?.match(short)?.[1] ||
            url?.match(watch)?.[1] ||
            url?.match(shorts)?.[1] ||
            null
        );
    };

    /* ---------------- RENDER ---------------- */
    return (
        <section className={styles.testimonailMainContainer}>
            <div className={styles.headingSection}>Let's hear from them!</div>

            <div className={styles.videoTestimonialSection}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={false}
                    navigation={false}
                    pagination={false}
                    autoplay={false}
                   onSwiper={(swiper) => {
    swiperRef.current = swiper;
    setSwiperReady(true);
}}

                    onSlideChange={() => {
                        setActiveVideoId(null);
                        checkIfHasMoreSlides();
                    }}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        640: { slidesPerView: 1.5 },
                        1025: { slidesPerView: 2 },
                        1380: { slidesPerView: 2.3 },
                        1730: { slidesPerView: 3 },
                    }}
                    className={styles.testimonialSwiper}
                >
                    {testimonials.map((testimonial) => {
                        const videoData = testimonial.videoUrls?.[0];
                        const videoType = videoData?.type;
                        const videoPath = videoData?.path;
                        const thumbnail =
                            videoData?.thumbnail?.[0]?.path || "";

                        const videoId =
                            videoType === "youtube"
                                ? extractYouTubeId(videoPath)
                                : null;

                        const embedUrl = videoId
                            ? `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0`
                            : "";

                        return (
                            <SwiperSlide key={testimonial.id}>
                                <div
                                    className={styles.testimonialCard}
                                    ref={(el) =>
                                        (slideRefs.current[testimonial.id] = el)
                                    }
                                    data-id={testimonial.id}
                                >
                                    {/* THUMBNAIL */}
                                    {thumbnail && activeVideoId !== testimonial.id && (
                                        <div
                                            className={styles.thumbnailWrapper}
                                            onClick={() =>
                                                setActiveVideoId(testimonial.id)
                                            }
                                        >
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_USER_BASE}${thumbnail}`.replace(
                                                    "public",
                                                    "admin"
                                                )}
                                                className={styles.thumbnailImage}
                                                alt="thumbnail"
                                            />
                                            <div className={styles.playButton}>▶</div>
                                        </div>
                                    )}

                                    {/* LOCAL VIDEO */}
                                    {activeVideoId === testimonial.id &&
                                        (videoType === "ama-videos" ||
                                            videoType === "ama-video") && (
                                            <video
                                                ref={(el) =>
                                                    (videoRefs.current[testimonial.id] = el)
                                                }
                                                src={`${process.env.NEXT_PUBLIC_USER_BASE}${videoPath}`.replace(
                                                    "public",
                                                    "admin"
                                                )}
                                                className={styles.testimonialvideo2}
                                                autoPlay
                                                playsInline
                                                controls
                                            />
                                        )}

                                    {/* YOUTUBE */}
                                    {activeVideoId === testimonial.id &&
                                        videoType === "youtube" &&
                                        videoId && (
                                            <iframe
                                                src={embedUrl}
                                                className={styles.testimonialvideo2}
                                                allow="autoplay; encrypted-media"
                                                allowFullScreen
                                            />
                                        )}

                                    {/* TEXT */}
                                    <div className={styles.titleContainer}>
                                        <p className={styles.videoTitle2}>
                                            {testimonial.videoQuotes}
                                        </p>
                                        <p className={styles.titleBy2}>
                                            {testimonial.name}
                                            <br />
                                            <span className={styles.spanTitleBy2}>
                                                {testimonial.designation}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {swiperReady && hasMoreSlides && <NextArrow />}
            </div>
        </section>
    );
}
