import React, { useState } from "react";
import "./bod.css";
import { Collapse } from "react-bootstrap";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useDealStore } from "@/store/dealStore";

const Bod = ({ isPrivateDeal }) => {
  const [openItems, setOpenItems] = useState([]);
  const dealDetails = useDealStore((state) => state.dealDetails);
  const directors = dealDetails?.data?.deal_overview?.board_of_directors?.data || [];

  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (directors.length === 0) return null; // nothing to show

  return (
    <section className={`bod-section ${isPrivateDeal ? "private-bod-section" : ""}`}>
      <h3>Board of Directors</h3>

      {/* src={`${process.env.NEXT_PUBLIC_USER_BASE}admin${deal.company_logo[0]?.path.replace("public", "")}` */}

      {directors.map((director, index) => {
        const imgSrc = director.profile_image?.path
          ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${director.profile_image.path.replace("public", "")}`
          : "/logo-fallback.png";

        const linkedinUrl = director.linkedin || director.linkedin_url;

        return (
          <div key={index} className="bod-item">
            <button className="dropdown-header" onClick={() => toggleItem(index)}>
              <div className="our-directors">
                <img src={imgSrc} alt={director.name} />
                <section>
                  <h4 className="director-name">{director.name}</h4>
                  <p>{director.designation}</p>
                </section>
              </div>
              <span className={`arrow-icon ${openItems.includes(index) ? "open" : ""}`}>
                <ChevronDown width={32} height={20} color={isPrivateDeal ? "white" : "black"} />
              </span>
            </button>

            <Collapse in={openItems.includes(index)}>
              <div className="dropdown-body">
                <span className="bg-head">Background</span>
                <div 
                  className="bg-content"
                  dangerouslySetInnerHTML={{ __html: director.background || "" }} 
                />
                {linkedinUrl &&
                  linkedinUrl.trim() !== "" &&
                  linkedinUrl.toLowerCase() !== "n.a" && (

                    <Link
                      href={linkedinUrl}
                      target="_blank"
                      className="linkedin-btn"
                      style={{ color: "white", display: "flex", gap: "10px" , textDecoration: "none" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clipPath="url(#clip0_18822_11319)">
                          <path d="M15.9958 16.0005L15.9998 15.9998V10.1318C15.9998 7.26114 15.3818 5.0498 12.0258 5.0498C10.4125 5.0498 9.32985 5.93514 8.88785 6.77447H8.84118V5.3178H5.65918V15.9998H8.97251V10.7105C8.97251 9.31781 9.23651 7.97114 10.9612 7.97114C12.6605 7.97114 12.6858 9.56047 12.6858 10.7998V16.0005H15.9958Z" fill="white" />
                          <path d="M0.26416 5.31836H3.58149V16.0004H0.26416V5.31836Z" fill="white" />
                          <path d="M1.92133 0C0.860667 0 0 0.860667 0 1.92133C0 2.982 0.860667 3.86067 1.92133 3.86067C2.982 3.86067 3.84267 2.982 3.84267 1.92133C3.842 0.860667 2.98133 0 1.92133 0Z" fill="white" />
                        </g>
                        <defs>
                          <clipPath id="clip0_18822_11319">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      View on LinkedIn
                    </Link>

                  )}


                {/* <p>{director.background}</p>
                {isPrivateDeal && director.linkedin && (
                  <button>
                    <Link
                      href={director.linkedin}
                      target="_blank"
                      style={{ color: "white", display: "flex", alignItems: "center", gap: "5px" }}
                    >
                     
                      View on LinkedIn
                    </Link>
                  </button>
                )} */}
              </div>
            </Collapse>
          </div>
        );
      })}
    </section>
  );
};

export default Bod;
