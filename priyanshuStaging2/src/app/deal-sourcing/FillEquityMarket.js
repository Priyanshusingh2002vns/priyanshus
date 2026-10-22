"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from './fillequitymarket.module.css'

function FillEquityMarket() {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [letters, setLetters] = useState([])
  const rafRef = useRef(null)

  const text = "PrEqt is a full-stack investment bank with a tech-first approach - enabling high-growth companies to access private/growth capital, get IPO ready and manage investor relations through a unified platform."

  useEffect(() => {
    // Split text into tokens: words, spaces, or <br/> tag
    // This regex matches <br/> OR sequences of non-whitespace characters
    const tokens = text.match(/(<br\s*\/?>|\S+)/g) || []

    const wordsWithLetters = tokens.map((token, index) => {
      const isBr = /<br\s*\/?>/.test(token)
      return {
        word: token,
        letters: isBr ? [] : token.split(""),
        isLastWord: index === tokens.length - 1,
        isBr: isBr
      }
    })
    setLetters(wordsWithLetters)

    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  useEffect(() => {
    let lastScrollProgress = 0

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current || !textRef.current) return

        const paragraph = textRef.current
        const rect = paragraph.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Start filling when section enters viewport (20% from top)
        // Start point: when section top is at 80% of viewport height (20% scrolled)
        // End point: when section top reaches viewport top
        const startPoint = windowHeight * 0.95 // Start when 20% scrolled into viewport
        const endPoint = 0 // End when section reaches top
        const scrollRange = startPoint - endPoint // windowHeight * 0.8

        // Calculate total letter count across all words
        const totalLetters = letters.reduce((sum, word, idx) => {
          if (word.isBr) return sum
          const hasSpaceAfter = !word.isLastWord && !letters[idx + 1]?.isBr
          return sum + word.letters.length + (hasSpaceAfter ? 1 : 0)
        }, 0)

        // Calculate progress: 0 when at startPoint, totalLetters when at endPoint
        let scrollProgress = 0
        if (rect.top <= startPoint && rect.top >= endPoint) {
          // Section is in the fill range
          const scrolled = startPoint - rect.top
          scrollProgress = (scrolled / scrollRange) * totalLetters
        } else if (rect.top < endPoint) {
          // Section has scrolled past - fully filled
          scrollProgress = totalLetters
        } else if (rect.top > startPoint) {
          // Section hasn't entered fill range yet - not filled
          scrollProgress = 0
        }

        // Smooth interpolation for smoother fill effect
        const smoothedProgress = lastScrollProgress + (scrollProgress - lastScrollProgress) * 0.15
        lastScrollProgress = smoothedProgress

        // Update each letter's color based on scroll position with smooth transition
        // Get all letter spans using data attribute
        const letterSpans = paragraph.querySelectorAll('[data-letter]')
        letterSpans.forEach((letterSpan, i) => {
          if (smoothedProgress > i) {
            letterSpan.style.color = "#F7FCFF"
            letterSpan.style.webkitTextStroke = "0px"
            letterSpan.style.opacity = "1"
          } else {
            letterSpan.style.color = "rgba(247, 252, 255, 0.50)"
            letterSpan.style.webkitTextStroke = "0px"
            letterSpan.style.opacity = "1"
          }
        })
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [letters])

  return (
    <>
      <section ref={containerRef} className={styles.fillSection}>
        <div className={`container ${styles.subcontainer}`} style={{ padding: "0" }}>
          <div className={styles.fillcontainer}>
            <div className={styles.visual}>
              {/* <div className={styles.goldenGlow}>
                <video src="/goldenGlow.mp4" autoPlay loop muted playsInline />
              </div> */}
            </div>

            <div className={styles.content}>
              {/* <button className={styles.badge}>About PrEqt</button> */}
              <h2 className={styles.heading}>
                <span ref={textRef} className={styles.textParagraph}>
                  {(() => {
                    let globalLetterIndex = 0
                    return letters.map((wordData, wordIndex) => {
                      if (wordData.isBr) {
                        return <br key={`br-${wordIndex}`} />
                      }
                      return (
                        <span key={wordIndex} className={styles.word}>
                          {wordData.letters.map((letter, idx) => {
                            const index = globalLetterIndex++
                            return (
                              <span
                                key={`${wordIndex}-${idx}`}
                                className={styles.letter}
                                data-letter={index}
                              >
                                {letter}
                              </span>
                            )
                          })}
                          {!wordData.isLastWord && !letters[wordIndex + 1]?.isBr && (
                            <span
                              className={styles.letter}
                              data-letter={globalLetterIndex++}
                            >
                              {'\u00A0'}
                            </span>
                          )}
                        </span>
                      )
                    })
                  })()}
                </span>
              </h2>
            </div>
          </div>
        </div>

      </section>

      {/* <div className={styles.sepratebox}>
<div className="container" style={{padding: "0"}}>
  <div className={styles.seprateboxcontent}></div>
</div>
</div> */}
    </>
  )
}

export default FillEquityMarket
