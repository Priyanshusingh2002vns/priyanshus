"use client"
import { useEffect, useRef, useState } from "react"
import styles from "./scrollshowcase.module.css"
import Image from "next/image";

export default function ScrollShowcase() {
  const sectionRef = useRef(null)

  const state = useRef({
    targetProgress: 0,
    currentProgress: 0,
    isAnimating: false,
    metrics: { top: 0, height: 0 } 
  })

  const rafRef = useRef(null)
  const problemRefs = useRef([])
  const solutionRefs = useRef([])
  const scaleFactorRef = useRef(1)

  const [isOurWay, setIsOurWay] = useState(false)

  const problemPositions = [
    [-520, -257],
    [398, -227],
    [-345, 248],
    [225, 248],
  ]

  const solutionPositions = [
    [-440, -260],
    [0, 265],
    [398, -230],
  ]

  const problemTexts = [
    "No clear fundraising pathway",
    "No Accountability of results in private markets",
    "Outdated or surface-level diligence",
    "Quality companies buried in WhatsApp forwards and emails"
  ]

  const solutionTexts = [
    "Exclusive Deal Rooms with Direct KMP Access",
    "Comprehensive Diligence Across Financial, Legal, Operational and Technical Aspects",
    "Quarterly performance reporting across private and public markets"
  ]

  useEffect(() => {
    // 1. Measure Layout (Only on load/resize)
    const updateMetrics = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      state.current.metrics.top = rect.top + scrollTop
      state.current.metrics.height = sectionRef.current.offsetHeight - window.innerHeight
    }

    // 2. The Animation Loop (Runs only when moving)
    const tick = () => {
      const s = state.current

      // LERP: Move 'current' towards 'target' by 10% each frame
      // This creates the smooth "gliding" feel on mobile
      // On Desktop, we can make it faster (0.2), on Mobile slower (0.08) for more smoothing
      const isMobile = window.innerWidth < 1000
      const lerpFactor = isMobile ? 0.08 : 0.15

      s.currentProgress += (s.targetProgress - s.currentProgress) * lerpFactor

      // If we are close enough, snap to target to save CPU
      if (Math.abs(s.targetProgress - s.currentProgress) < 0.0001) {
        s.currentProgress = s.targetProgress
        s.isAnimating = false // Stop loop
      } else {
        s.isAnimating = true
        rafRef.current = requestAnimationFrame(tick)
      }

      // --- DRAW THE FRAME ---
      const p = s.currentProgress

      // Logic: Phase Switch (React State)
      // We use a small buffer to prevent rapid toggling
      const phaseThreshold = 0.35
      if (p >= phaseThreshold && !isOurWay) setIsOurWay(true)
      else if (p < phaseThreshold && isOurWay) setIsOurWay(false)

      // Logic: Transforms
      const currentScale = scaleFactorRef.current

      // Problem Cards (Collapse)
      const collapse = p >= 0.02 ? Math.min(1, (p - 0.02) / 0.3) : 0

      for (let i = 0; i < problemRefs.current.length; i++) {
        const el = problemRefs.current[i]
        const pos = problemPositions[i]
        if (el && pos) {
          const x = pos[0] * currentScale * (1 - collapse)
          const y = pos[1] * currentScale * (1 - collapse)
          const scale = 1 - collapse * 0.25
          // Fade out slightly faster to avoid visual clutter
          const opacity = p >= 0.33 ? 0 : 1

          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`
          el.style.opacity = opacity
        }
      }

      // Solution Cards (Expand)
      const cardStart = 0.3
      const cardEnd = 0.8
      const cardExpand = p >= cardStart
        ? Math.min(1, (p - cardStart) / (cardEnd - cardStart))
        : 0

      for (let i = 0; i < solutionRefs.current.length; i++) {
        const el = solutionRefs.current[i]
        const pos = solutionPositions[i]
        if (el && pos) {
          const sx = pos[0] * currentScale * cardExpand
          const sy = pos[1] * cardExpand
          const scale = 0.9 + cardExpand * 0.1

          let opacity = 0
          if (p >= cardStart) opacity = 1
          else if (collapse >= 0.7) opacity = collapse

          el.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`
          el.style.opacity = opacity
        }
      }
    }

    // 3. Scroll Listener (Just updates Target)
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const { top, height } = state.current.metrics

      // Calculate pure scroll position
      const relativeScroll = scrollTop - top
      const rawProgress = Math.min(1, Math.max(0, relativeScroll / (height || 1)))

      state.current.targetProgress = rawProgress

      // Start loop if not running
      if (!state.current.isAnimating) {
        state.current.isAnimating = true
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    // 4. Resize Listener
    const onResize = () => {
      const width = window.innerWidth
      let factor = 1
      if (width < 710) factor = 0.5
      else if (width < 991) factor = 0.6
      else if (width < 1040) factor = 0.65
      else if (width < 1180) factor = 0.8
      else if (width < 1360) factor = 0.85

      scaleFactorRef.current = factor
      updateMetrics()

      // Force a single tick to update positions immediately
      state.current.isAnimating = true
      tick()
    }

    // Init
    setTimeout(() => {
      updateMetrics()
      onResize()
    }, 100)

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isOurWay])

  return (
    <>
      <div className={styles.sepratebox}>
       
          <div className={styles.seprateboxcontent} style={{margin:"auto"}} ></div>
        
      </div>
      <section ref={sectionRef} className={styles.section}>
        <div className={styles.sticky}>

          {/* 🔒 CENTER TEXT */}
          <div className={styles.centerContent}>
            <div className={styles.badgeContainer}>
              <span className={`${styles.badge} ${!isOurWay ? styles.titleVisible : styles.titleHidden}`}>
                The Old Problem
              </span>
              <span className={`${styles.badge} ${isOurWay ? styles.titleVisible : styles.titleHidden}`}>
                Our Way
              </span>
            </div>

            <div className={styles.titleContainer}>
              <h2 className={`${styles.title} ${!isOurWay ? styles.titleVisible : styles.titleHidden}`}>
                Problems with the traditional way
              </h2>
              <h2 className={`${styles.title} ${isOurWay ? styles.titleVisible : styles.titleHidden}`}>
                PrEqt replaces chaos with clarity
              </h2>
            </div>
          </div>

          {/* 🎭 ANIMATION LAYER */}
          <div className={styles.stage}>

            {/* SVG DECORATION */}
            <div className={styles.svgDecoration} style={{ opacity: isOurWay ? 1 : 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="201" height="115" viewBox="0 0 201 115" fill="none">
                <g filter="url(#filter0_f_843_7926)">
                  <path d="M165.792 62.7893L172.792 56.8896L166.892 63.8892L172.792 70.8882L165.792 64.9885L158.793 70.8882L164.692 63.8892L158.793 56.8896L165.792 62.7893Z" fill="white" />
                  <path d="M166.049 63.6333L172.307 63.8828L166.049 64.1455L165.8 70.4032L165.537 64.1455L159.279 63.8965L165.537 63.6339L165.786 57.3755L166.049 63.6333Z" fill="white" />
                </g>
                <g filter="url(#filter1_d_843_7926)">
                  <path d="M165.792 62.7893L172.792 56.8896L166.892 63.8892L172.792 70.8882L165.792 64.9885L158.793 70.8882L164.692 63.8892L158.793 56.8896L165.792 62.7893Z" fill="white" />
                  <path d="M166.049 63.6333L172.307 63.8828L166.049 64.1455L165.8 70.4032L165.537 64.1455L159.279 63.8965L165.537 63.6339L165.786 57.3755L166.049 63.6333Z" fill="white" />
                </g>
                <g filter="url(#filter2_f_843_7926)">
                  <path d="M21.3617 89.0067L33.832 78.4961L23.3214 90.9664L33.832 103.436L21.3617 92.9249L8.89258 103.436L19.4021 90.9664L8.89258 78.4961L21.3617 89.0067Z" fill="white" />
                  <path d="M21.8179 90.51L32.9677 90.9546L21.819 91.4226L21.3744 102.571L20.9065 91.4226L9.75781 90.9791L20.9065 90.5111L21.35 79.3613L21.8179 90.51Z" fill="white" />
                </g>
                <g filter="url(#filter3_d_843_7926)">
                  <path d="M23.0278 91.5683L35.498 81.0576L24.9874 93.5279L35.498 105.997L23.0278 95.4864L10.5586 105.997L21.0681 93.5279L10.5586 81.0576L23.0278 91.5683Z" fill="white" />
                  <path d="M23.4839 93.0715L34.6337 93.5161L23.4851 93.9841L23.0405 105.133L22.5725 93.9841L11.4238 93.5406L22.5725 93.0726L23.016 81.9229L23.4839 93.0715Z" fill="white" />
                </g>
                <path d="M82.8136 23.4912L83.6376 25.1632L85.4836 25.4312L84.1476 26.7322L84.4626 28.5702L82.8136 27.7032L81.1626 28.5702L81.4776 26.7322L80.1426 25.4312L81.9876 25.1632L82.8136 23.4912Z" fill="url(#paint0_linear_843_7926)" />
                <path d="M106.306 51.2529L107.854 54.3889L111.314 54.8929L108.81 57.3329L109.402 60.7799L106.306 59.1529L103.21 60.7799L103.801 57.3329L101.297 54.8929L104.758 54.3889L106.306 51.2529Z" fill="url(#paint1_linear_843_7926)" />
                <path d="M196.504 98.6218L197.787 101.222L200.657 101.639L198.58 103.663L199.07 106.521L196.504 105.171L193.937 106.521L194.427 103.663L192.35 101.639L195.22 101.222L196.504 98.6218Z" fill="url(#paint2_linear_843_7926)" />
                <path d="M174.832 0L175.658 1.672L177.503 1.94L176.168 3.241L176.483 5.079L174.832 4.211L173.182 5.079L173.498 3.241L172.162 1.94L174.007 1.672L174.832 0Z" fill="url(#paint3_linear_843_7926)" />
                <path d="M7.14728 9.4521L12.4333 5.0791L8.06128 10.3651L12.4333 15.6501L7.14728 11.2781L1.86328 15.6501L6.23428 10.3651L1.86328 5.0791L7.14728 9.4521Z" fill="white" />
                <defs>
                  <filter id="filter0_f_843_7926" x="153.802" y="51.8984" width="23.9805" height="23.981" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="2.49561" result="effect1_foregroundBlur_843_7926" />
                  </filter>
                  <filter id="filter1_d_843_7926" x="153.802" y="51.8984" width="23.9805" height="23.981" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2.49561" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_843_7926" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_843_7926" result="shape" />
                  </filter>
                  <filter id="filter2_f_843_7926" x="0.000323296" y="69.6038" width="42.724" height="42.724" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="4.44613" result="effect1_foregroundBlur_843_7926" />
                  </filter>
                  <filter id="filter3_d_843_7926" x="1.66634" y="72.1654" width="42.724" height="42.724" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="4.44613" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_843_7926" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_843_7926" result="shape" />
                  </filter>
                  <linearGradient id="paint0_linear_843_7926" x1="80.143" y1="26.0309" x2="85.4835" y2="26.0309" gradientUnits="userSpaceOnUse">
                    <stop offset="0.0056" stopColor="#EDC73D" />
                    <stop offset="0.2528" stopColor="#FDFACC" />
                    <stop offset="0.3081" stopColor="#F4EEBB" />
                    <stop offset="0.418" stopColor="#DECD8E" />
                    <stop offset="0.5708" stopColor="#BA9946" />
                    <stop offset="0.5955" stopColor="#B4903A" />
                    <stop offset="0.8708" stopColor="#E6D48A" />
                    <stop offset="1" stopColor="#FDFACC" />
                  </linearGradient>
                  <linearGradient id="paint1_linear_843_7926" x1="101.297" y1="56.0165" x2="111.314" y2="56.0165" gradientUnits="userSpaceOnUse">
                    <stop offset="0.0056" stopColor="#EDC73D" />
                    <stop offset="0.2528" stopColor="#FDFACC" />
                    <stop offset="0.3081" stopColor="#F4EEBB" />
                    <stop offset="0.418" stopColor="#DECD8E" />
                    <stop offset="0.5708" stopColor="#BA9946" />
                    <stop offset="0.5955" stopColor="#B4903A" />
                    <stop offset="0.8708" stopColor="#E6D48A" />
                    <stop offset="1" stopColor="#FDFACC" />
                  </linearGradient>
                  <linearGradient id="paint2_linear_843_7926" x1="192.35" y1="102.571" x2="200.656" y2="102.571" gradientUnits="userSpaceOnUse">
                    <stop offset="0.0056" stopColor="#EDC73D" />
                    <stop offset="0.2528" stopColor="#FDFACC" />
                    <stop offset="0.3081" stopColor="#F4EEBB" />
                    <stop offset="0.418" stopColor="#DECD8E" />
                    <stop offset="0.5708" stopColor="#BA9946" />
                    <stop offset="0.5955" stopColor="#B4903A" />
                    <stop offset="0.8708" stopColor="#E6D48A" />
                    <stop offset="1" stopColor="#FDFACC" />
                  </linearGradient>
                  <linearGradient id="paint3_linear_843_7926" x1="172.162" y1="2.5393" x2="177.503" y2="2.5393" gradientUnits="userSpaceOnUse">
                    <stop offset="0.0056" stopColor="#EDC73D" />
                    <stop offset="0.2528" stopColor="#FDFACC" />
                    <stop offset="0.3081" stopColor="#F4EEBB" />
                    <stop offset="0.418" stopColor="#DECD8E" />
                    <stop offset="0.5708" stopColor="#BA9946" />
                    <stop offset="0.5955" stopColor="#B4903A" />
                    <stop offset="0.8708" stopColor="#E6D48A" />
                    <stop offset="1" stopColor="#FDFACC" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* PROBLEM CARDS */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={`problem-${i}`}
                ref={el => problemRefs.current[i] = el}
                className={styles.problemCard}
                style={{ transform: 'translate3d(0,0,0) scale(1)' }}
              >
                <div className={styles.cardTextOverlay}>
                  <p className={styles.cardText}>{problemTexts[i]}</p>
                </div>
                {/* <img src={`/buyr${i + 1}.png`} alt="buy" decoding="async" loading="eager" /> */}
                <Image 
                src={`/buyr${i + 1}.png`} 
                alt="buy" 
                width={274} 
                height={238} 
                sizes="111px" 
                loading="lazy" 
              />
              </div>
            )
            )}

            {/* SOLUTION CARDS */}
            {[0, 1, 2].map((i) => (
              <div
                key={`solution-${i}`}
                ref={el => solutionRefs.current[i] = el}
                className={styles.solutionCard}
                style={{ transform: 'translate3d(0,0,0) scale(1)', opacity: 0, zIndex: 20 - i }}
              >
                <div className={styles.cardTextOverlay}>
                  <p className={styles.cardText}>{solutionTexts[i]}</p>
                </div>
                {/* <img src={`/sell${i + 1}.png`} alt="sell" decoding="async" loading="eager" /> */}
                <Image 
                src={`/sell${i + 1}.png`} 
                alt="sell" 
                width={274} 
                height={238} 
                sizes="111px" 
                loading="lazy" 
              />
              </div>
            )
            )}

          </div>
        </div>
      </section>
    </>
  )
}