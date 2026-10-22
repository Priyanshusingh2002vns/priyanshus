"use client"
import { useEffect, useRef, useState } from "react"
import styles from "./BenefitSection.module.css"
import { useRouter } from "next/navigation"
import FundraiseFrom from "../../components/Fundraise/FundraiseFrom"

const STEPS = [
  {
    id: 1,
    title: "Access To Strong Investor Base",
    desc:
      "Access to institutional investors, HNIs, and family offices active in IPO markets. Drives faster fundraise and stronger listing demand.",
  },
  {
    id: 2,
    title: "IPO Readiness Report / Eligibility Checker",
    desc:
      "SEBI-aligned readiness and eligibility assessment. Clear gaps and action plan for IPO execution.",
  },
  {
    id: 3,
    title: "IR/PR, Drafting & Regulatory, Post-Listing Liquidity, Pricing & Distribution",
    desc:
      "End-to-end IR/PR, drafting, and regulatory support. Post-listing pricing, liquidity, and distribution management.",
  },
  {
    id: 4,
    title: "Bridge Gap from Private to Public Markets",
    desc:
      "Aligns promoters, structure, and disclosures for public markets. Ensures smooth transition to listed status.",
  },
  {
    id: 5,
    title: "50% Faster Turnaround Time",
    desc:
      "Parallel workflows eliminate delays. Cuts IPO timelines by up to 50%.",
  },
]

export default function BenefitSection() {
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const [maxActiveIndex, setMaxActiveIndex] = useState(0)
  const itemRefs = useRef([])
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index)

          if (entry.isIntersecting) {
            setMaxActiveIndex((prev) =>
              index > prev ? index : prev
            )
          } else {
            // 🔥 when scrolling back
            setMaxActiveIndex((prev) =>
              index === prev ? index - 1 : prev
            )
          }
        })
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    )

    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className={styles.section}>
      {/* <div className={styles.containerlinesarrow}>
        <p>03</p>
        <div className={styles.seprateboxcontent}></div>

        <button className={styles.scrollIndicator} aria-label="Scroll down">
          <span className={styles.scrollIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 12L12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div> */}



      <div className={styles.container}>

        {/* <div className={styles.featuresContainerlines}></div> */}
        <div className={styles.featuresContainerlines1}></div>

        {/* LEFT */}
        <div className={styles.left}>
          <h2 className={styles.heading}>
            How this will Benefit<br />Promoters
          </h2>

          <p className={styles.description}>
            Designed to help promoters achieve faster listings, stronger valuations, regulatory confidence, and long-term market credibility—without the inefficiencies of a traditional IPO process.
          </p>

          <button className={styles.cta} onClick={handleOpenModal}>
            Begin Your IPO Journey
            <span className={styles.arrow}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4.7915V15.2082" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.2082 10H4.7915" stroke="#F7FCFF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.timeline} />

          {STEPS.map((step, i) => (
            <div
              key={step.id}
              ref={(el) => (itemRefs.current[i] = el)}
              data-index={i}
              className={`${styles.step} ${i <= maxActiveIndex ? styles.active : ""
                }`}
            >
              <div className={styles.index}>{step.id}</div>

              <div className={styles.content}>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
      <FundraiseFrom isOpen={showModal} onClose={handleCloseModal} />
    </section>
  )
}
