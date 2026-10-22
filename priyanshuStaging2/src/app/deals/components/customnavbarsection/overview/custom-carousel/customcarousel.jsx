import React, { useState } from "react";
import "./customcarousel.css";
import { Carousel } from "react-bootstrap";
import { useDealStore } from "@/store/dealStore";

const FirstCarousel = () => {
  const [index, setIndex] = useState(0);
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_overview;

  // ✅ Check if we have valid company intro videos
  const hasCompanyVideos =
    dealData?.company_intro_videos?.status === true &&
    Array.isArray(dealData?.company_intro_videos?.data) &&
    dealData?.company_intro_videos?.data.length > 0;

  if (!hasCompanyVideos) return null;

  // ✅ Extract video URLs
  const media = dealData.company_intro_videos.data.map(
    (item) => `${process.env.NEXT_PUBLIC_USER_BASE}admin${item.path.replace("public", "")}`
  );

  const getYoutubeEmbedUrl = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1`
      : null;
  };

  const showControls = media.length > 1; // ✅ Show next/prev buttons only if more than one media

  return (
    <div className="customcars">
      <Carousel
        activeIndex={index}
        onSelect={() => {}}
        controls={false}
        indicators={false}
        interval={null}
      >
        {media.map((item, i) => {
          const isYoutube =
            item.includes("youtube.com") || item.includes("youtu.be");
          const isVideo = item.endsWith(".mp4") || item.endsWith(".mov") || item.endsWith(".webm");

          return (
            <Carousel.Item key={i}>
              {isYoutube ? (
                <div className="video-wrapper">
                  <iframe
                    width="100%"
                    height="400"
                    src={getYoutubeEmbedUrl(item)}
                    title={`YouTube video ${i + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : isVideo ? (
                <video
                  width="100%"
                  height="400"
                  controls
                  className="carouselVideos"
                  style={{ objectFit: "contain" }}
                >
                  <source src={item} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </Carousel.Item>
          );
        })}
      </Carousel>

      {/* ✅ Show navigation + indicators only if multiple media */}
      {showControls && (
        <div className="d-flex buttons justify-content-center align-items-center lastbtns">
          {/* Prev */}
          <button
            className="custom-carousel-prev"
            onClick={() =>
              setIndex((prevIndex) =>
                prevIndex === 0 ? media.length - 1 : prevIndex - 1
              )
            }
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1L1.5 6L6.5 11"
                stroke="#B18C07"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Indicators */}
          <div className="custom-carousel-indicators d-flex justify-content-center">
            {media.map((_, i) => (
              <span
                key={i}
                className={`indicator-shape ${index === i ? "active" : ""}`}
                onClick={() => setIndex(i)}
              ></span>
            ))}
          </div>

          {/* Next */}
          <button
            className="custom-carousel-next"
            onClick={() =>
              setIndex((prevIndex) => (prevIndex + 1) % media.length)
            }
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 11L6.5 6L1.5 1"
                stroke="#B18C07"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FirstCarousel;
