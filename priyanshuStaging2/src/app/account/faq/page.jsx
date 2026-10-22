"use client";
import { useState } from "react";
import styles from "./page.module.css";

const faqs = [
  {
    question: "What is PrEqt?",
    answer:
      "PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.",
  },
  { question: "How does PrEqt select IPO deals?",
    answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.'
   },
  { question: "Can I invest directly through the app?",
     answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.' 
   },
  { question: "What does “Show Interest” mean?" ,
     answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.' 
  },
  { question: "Is my data safe on PrEqt?",
     answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.'
   },
  { question: "What is the Lock-in Tracker?",
     answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.' 
   },
  { question: "Who can use PrEqt?",
     answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.'
   },
  { question: "Do I need to be SEBI registered to use this platform?",
    answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.'
   },
  { question: "Are there any fees to use PrEqt?",
    answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert research.' 
   },
  { question: "How do I get notified about new IPOs?",
     answer: 'PrEqt is a curated platform that connects investors with pre-vetted IPO opportunities. We help you discover high-potential deals, backed by data and expert '
   },
];

export default function page() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Frequently Asked Questions</h2>
      <div className={styles.divider}></div>

      {faqs.map((faq, index) => (
        <div key={index} className={styles.faqItem}>
          <div
            className={styles.questionRow}
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          >
            <p className={styles.question}>{faq.question}</p>
            <span className={styles.icon}>
              {openIndex === index ? <span><img src="/assets/pictures/drop-up.svg" alt="drop-up" /></span> : <span><img src="/assets/pictures/DropDown.svg" alt="drop-down" /></span> }
            </span>
          </div>
          {openIndex === index && faq.answer && (
            <p className={styles.answer}>{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
