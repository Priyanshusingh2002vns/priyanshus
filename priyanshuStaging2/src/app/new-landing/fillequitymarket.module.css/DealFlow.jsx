"use client"
import { useEffect, useRef, useState } from "react"
import styles from "./DealFlow.module.css"

const DATA = [
  {
    label: "Funnel 1",
    percentage: "100%",
    title: "Inbound Requests",
    desc: " Proprietary & inbound deals screened at source",
  },
  {
    label: "Funnel 2",
    percentage: "10%",
    title: "AI Enabled Deal Filtering & Screening",
    desc: "90% of opportunities are eliminated through AI-driven evaluation based on promoter quality, sector fit, scalability, and core business fundamentals",
  },
  {
    label: "Funnel 3",
    percentage: "3%",
    title: "In-Depth Due Diligence",
    desc: "Shortlisted deals undergo 40-parameter due diligence across all critical business dimensions to ensure institutional readiness.",
  },
  {
    label: "Funnel 4",
    percentage: " 1–1.5%",
    title: "Investor Match & Circulation",
    desc: "Only select deals with strong fundamentals, high growth potential, and execution credibility are presented to PrEqt’s curated investor network.",
  },
]

export default function DealFlow() {
  const ref = useRef(null)
  const [active, setActive] = useState(false)
  const [funnelActive, setFunnelActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.3) setActive(true)
        else if (entry.intersectionRatio === 0) setActive(false)
      },
      { threshold: [0, 0.3] }
    )

    const funnelObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.9) setFunnelActive(true)
        else if (entry.intersectionRatio === 0) setFunnelActive(false)
      },
      { threshold: [0, 0.9] }
    )

    if (ref.current) {
      observer.observe(ref.current)
      funnelObserver.observe(ref.current)
    }

    return () => {
      observer.disconnect()
      funnelObserver.disconnect()
    }
  }, [])

  return (
    <>
      <div className={styles.dealflowheadingcontainer}>

        <h2 className={styles.dealflowheading}>Where Serious Deals Separate Themselves</h2>
      </div>

      <section className={styles.sectionbg}>
        <div ref={ref} className={styles.section}>
          <div className={`container ${styles.dealflowcontainer}`}>




            {/* TEXT */}
            <div className={styles.content}>
              {DATA.map((item, i) => (
                <div className={styles.colborder} key={i}>

                  <div
                    key={i}
                    className={`${styles.col} ${active ? styles.active : ""}`}
                    style={{ transitionDelay: `${i * 0.15}s` }}
                  >
                    <div className={styles.colcontent}>
                      <span className={styles.label}>{item.label}</span>
                      <span className={styles.percentage}>{item.percentage}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <div className={styles.colcontentbottom}>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FUNNEL IMAGE */}
            <div className={`${styles.funnelWrap} ${funnelActive ? styles.show : ""}`}>
              <img src="/funnel.png" alt="Deal funnel" width={1185} height={282} />
            </div>

            <div className={`${styles.funnelWraptwo} ${active ? styles.show : ""}`}>
              <img src="/funnels2.png" alt="Deal funnel" width={94} height={1040}/>
            </div>
          </div>


        </div>
      </section>
    </>
  )
}
