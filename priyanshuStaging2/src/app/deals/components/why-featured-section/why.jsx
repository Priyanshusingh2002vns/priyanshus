"use client";
import React from "react";
import { useDealStore } from "@/store/dealStore";

const Featured = ({ isPrivateDeal }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_setpData;

  const features = dealData?.features?.data || [];

  if (dealData?.featured?.status ) return null;

  return (
    <section className={`why-section ${isPrivateDeal ? "private" : "public"}`}>
      <h2>Why This is Featured on PrEqt</h2>
      <section>
        <div className="why-subsection">
          {features.slice(0, 2).map((feature, idx) => (
            <div key={idx} className="why-feature">
               {feature.attachments?.[0]?.path ? (
                <img
                src={`${process.env.NEXT_PUBLIC_USER_BASE}admin/${feature.attachments[0].path.replace(/^public\//, "")}`}
                  alt={feature.title || "Feature icon"}
                  className={`feature-icon ${isPrivateDeal ? "private-icon" : "public-icon"}`}
                />
              ) : (
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 152 152"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`feature-icon ${isPrivateDeal ? "private-icon" : "public-icon"}`}
                >
                  <path
                    d="M114 19C103.506 19 95 27.5066 95 38C95 48.4934 103.506 57 114 57C124.494 57 133 48.4934 133 38C133 27.5066 124.494 19 114 19Z"
                    fill="#717171"
                  />
                  <path
                    d="M85.227 83.6373L92.9454 72.4109C94.1266 70.692 96.0785 69.6654 98.1641 69.6654C100.25 69.6654 102.202 70.692 103.383 72.4109L138.216 123.078C139.549 125.016 139.697 127.532 138.602 129.614C137.507 131.695 135.35 132.999 132.997 132.999H18.9974C16.7654 132.999 14.6983 131.824 13.5561 129.906C12.414 127.988 12.3655 125.612 13.4286 123.649L54.5952 47.6489C55.7022 45.6052 57.8398 44.332 60.1641 44.332C62.4883 44.332 64.6259 45.6052 65.733 47.6489L85.227 83.6373Z"
                    fill="#717171"
                  />
                </svg>
              )}
              
              <p>{feature?.description || ""}</p>
            </div>
          ))}
        </div>

        <div className="why-subsection">
          {features.slice(2, 4).map((feature, idx) => (
            <div key={idx} className="why-feature">
               {feature.attachments?.[0]?.path ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_USER_BASE}admin/${feature.attachments[0].path.replace(/^public\//, "")}`}
                  alt={feature.title || "Feature icon"}
                  className={`feature-icon ${isPrivateDeal ? "private-icon" : "public-icon"}`}
                />
              ) : (
                <svg
                  width="152"
                  height="152"
                  viewBox="0 0 152 152"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`feature-icon ${isPrivateDeal ? "private-icon" : "public-icon"}`}
                >
                  <path
                    d="M114 19C103.506 19 95 27.5066 95 38C95 48.4934 103.506 57 114 57C124.494 57 133 48.4934 133 38C133 27.5066 124.494 19 114 19Z"
                    fill="#717171"
                  />
                  <path
                    d="M85.227 83.6373L92.9454 72.4109C94.1266 70.692 96.0785 69.6654 98.1641 69.6654C100.25 69.6654 102.202 70.692 103.383 72.4109L138.216 123.078C139.549 125.016 139.697 127.532 138.602 129.614C137.507 131.695 135.35 132.999 132.997 132.999H18.9974C16.7654 132.999 14.6983 131.824 13.5561 129.906C12.414 127.988 12.3655 125.612 13.4286 123.649L54.5952 47.6489C55.7022 45.6052 57.8398 44.332 60.1641 44.332C62.4883 44.332 64.6259 45.6052 65.733 47.6489L85.227 83.6373Z"
                    fill="#717171"
                  />
                </svg>
              )}
             
              <p>{feature?.description || ""}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default Featured;
