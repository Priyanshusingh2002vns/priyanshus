"use client"
import { useEffect, useRef, useState } from "react"
import styles from "./AppDownload.module.css"

export default function AppDownload() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionHeight = rect.height

      // Show when 20% of section is visible (section bottom reaches 80% of viewport)
      // Section bottom = rect.top + sectionHeight
      // Show when: section bottom >= windowHeight * 0.8 (20% visible)
      const showPoint = windowHeight * 0.2

      // Hide when scrolling down past 80% of viewport (section top reaches 80% of viewport)
      const hidePoint = windowHeight * 0.6

      // Set progress to 1 (fully visible) when threshold is reached, 0 otherwise
      let progress = 0

      // Check if section bottom has reached 80% of viewport (20% visible)
      const sectionBottom = rect.top + sectionHeight

      if (sectionBottom >= showPoint && rect.top <= hidePoint) {
        // Section is visible and hasn't scrolled past hide point - fully visible
        progress = 1
      } else {
        // Before show point or scrolled past hide point - hidden
        progress = 0
      }

      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate translateY: starts at 100px (below), ends at 0 (final position)
  const translateY = (1 - scrollProgress) * 100
  const opacity = Math.min(1, scrollProgress * 1.5) // Fade in faster

  return (
    <>
      <section ref={sectionRef} className={styles.section}>
        <div className={`container ${styles.appdownloadcontainer}`}>

          {/* BACKGROUND VIDEO */}
          <div className={styles.gridmoves}>
            <video src="/gridmoves.mp4" autoPlay muted loop playsInline  preload="none" />
          </div>

          {/* BACKGROUND PHONE */}
          <div className={styles.phoneBg} />

          <div ref={imageRef} className={styles.appdownloadcontent}>
            <img
              src="/preqtmobap.png"
              width={287}
              height={398}
              alt="App Download"
              style={{
                transform: `translateY(${translateY}px)`,
                opacity: opacity,
                transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
              }}
            />
          </div>

          {/* FOREGROUND CONTENT */}
          <div className={styles.container}>

            {/* GOOGLE PLAY */}
            <a
              href="https://play.google.com/store/apps/details?id=com.preqt.app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.store}
            >
              <img src="/GooglePlay.png" alt="Google Play" width={259} height={75}/>
            </a>

            {/* APP STORE */}
            <a
              href="https://apps.apple.com/in/app/preqt/id6751903472"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.store}
            >
              <img src="/AppStore.png" alt="App Store" width={259} height={75} />
            </a>

          </div>

          {/* <div className={styles.featuresContainerlines}></div> */}

        </div>

      </section>
    </>

  )
}
