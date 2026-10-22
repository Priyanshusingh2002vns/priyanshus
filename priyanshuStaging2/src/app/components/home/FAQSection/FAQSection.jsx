'use client';

import { useState } from 'react';
import styles from './FAQSection.module.css';

const faqData = [
  { question: 'Who can invest through PrEqt?', answer: 'Accredited investors, HNIs, family offices, and registered financial intermediaries can invest through PrEqt.' },
  { question: 'How does PrEqt verify the deals listed?', answer: 'Every deal undergoes a multi-layered due diligence process covering legal, secretarial, financial, and operational aspects of the company before being listed on the platform.' },
  { question: 'How do I track my investment after subscribing?', answer: 'Once your investment is processed, you can monitor deal status, allotment updates, and portfolio insights directly from your PrEqt dashboard.' },
  { question: 'How do I start investing?', answer: 'Sign Up, Complete KYC, and start investing once your profile is approved. Login credentials will be shared via email upon successful verification.' },
  { question: 'Is there any lock-in period?', answer: 'Yes, most Pre-IPO investments carry a lock-in period. The duration depends on the share class and timing of listing. Certain investments may carry a lock-in period, as mentioned on the deal page.' },
  { question: 'Is there any principal guarantee of investments on PrEqt? ', answer: 'PrEqt does not offer any capital protection or return guarantee. The investments available on the platform are market-driven and inherently involve risk. Investors are requested to read all the documents carefully before investing.' },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <section className={styles.mainContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className={styles.card}>
        <header className={styles.headingWrap}>
          <h2 className={styles.heading}>
            <span className={styles.headingLight}>Frequently asked </span>
            <span className={styles.headingBold}>Questions</span>
          </h2>
        </header>

        <div className={styles.qaList}>
          {faqData.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`${styles.qaItem} ${isOpen ? styles.open : ''}`}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                role="button"
                aria-expanded={isOpen}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setOpenIndex(isOpen ? null : idx);
                  }
                }}
              >
                <div className={styles.qaRow}>
                  <span className={styles.question}>{item.question}</span>
                  <span className={styles.chevron} aria-hidden="true"><img src="/assets/pictures/DropDown.svg" alt="DropDown" /></span>
                </div>

                <div className={styles.answerWrap} aria-hidden={!isOpen}>
                  <p className={styles.answer}>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
