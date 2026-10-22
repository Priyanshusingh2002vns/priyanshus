'use client'
import React, { useState } from 'react';
import styles from './Faq.module.css';

const faqData = [
  { id: 1, question: 'Q1. Who can invest through PrEqt?', answer: 'Accredited investors, HNIs, family offices, and registered financial intermediaries can invest through PrEqt.' },
  { id: 2, question: 'Q2. How does PrEqt verify the deals listed?', answer: 'Every deal undergoes a multi-layered due diligence process covering legal, secretarial, financial, and operational aspects of the company before being listed on the platform.' },
  { id: 3, question: 'Q3. How do I track my investment after subscribing?', answer: 'Once your investment is processed, you can monitor deal status, allotment updates, and portfolio insights directly from your PrEqt dashboard.' },
  { id: 4, question: 'Q4. How do I start investing?', answer: 'Sign Up, Complete KYC, and start investing once your profile is approved. Login credentials will be shared via email upon successful verification.' },
  { id: 5, question: 'Q5. Is there any lock-in period?', answer: 'Yes, most Pre-IPO investments carry a lock-in period. The duration depends on the share class and timing of listing. Certain investments may carry a lock-in period, as mentioned on the deal page.' },
  { id: 6, question: 'Q6. Is there any principal guarantee of investments on PrEqt? ', answer: 'PrEqt does not offer any capital protection or return guarantee. The investments available on the platform are market-driven and inherently involve risk. Investors are requested to read all the documents carefully before investing.' },
];


const partnerFaqData = [
  { id: 1, question: 'Q1.  Who can become a PrEqtAssociate Partner?', answer: 'Any independent financial advisor, wealth manager, or intermediary with an existing investor network can apply.' },
  { id: 2, question: 'Q2. Is there a fee or eligibility requirement to join?', answer: 'No joining fee. However, all partners must undergo a short verification and compliance check before onboarding.' },
  { id: 3, question: 'Q3. How does the commission model work?', answer: 'You earn 50% of PrEqt’s platform revenue generated from every investor you onboard — for life. The earnings are automatically credited to your dashboard.' },
  { id: 4, question: 'Q4. How are investors linked to me?', answer: 'Every investor who joins through your referral link is permanently tagged to your profile. You continue earning each time they invest.' },
  { id: 5, question: 'Q5. What kind of opportunities will my investors access?', answer: 'Curated pre-IPO deals, unlisted shares, private equity placements, and structured fundraising rounds vetted by PrEqt’s investment team.' },
  { id: 6, question: 'Q6. Is it compliant with SEBI regulations?', answer: 'Yes. All investment transactions are facilitated through registered intermediaries and follow applicable SEBI guidelines.' },
  { id: 7, question: 'Q7. How and when do I get paid?', answer: 'Partner payouts are processed monthly, directly to your registered bank account. The dashboard provides real-time visibility on earnings.' },
  { id: 8, question: 'Q8. What kind of support will I get?', answer: 'Every partner is assigned a relationship manager and given full access to our onboarding, training, and support channels.' },
];


// ======================
// Fundraise FAQ
// ======================
const fundraiseFaqData = [
  { id: 1, question: 'Q1. Who can apply to raise capital on PrEqt?', answer: 'Private companies, startups, and SMEs seeking equity capital or strategic investors can raise funds via PrEqt.' },
  { id: 2, question: 'Q2. How long does the review process take?', answer: 'We work with early-growth, pre-IPO, and late-stage companies with a proven business model and clear scalability potential.' },
  { id: 3, question: 'Q3. Is there a listing fee or commission?', answer: 'After submitting your details, our investment team evaluates the opportunity, conducts due diligence, and approves the deal for listing.' },
  { id: 4, question: 'Q4. How secure is my pitch deck data?', answer: 'The timeline varies but typically ranges from 4–8 weeks depending on compliance, investor interest, and deal structure.' },
  { id: 5, question: 'Q5. What happens if my company isn’t shortlisted?', answer: 'PrEqt charges a small success-based fee only after the fundraising is complete — no upfront cost.' },
];


const FaqItem = ({ item, isOpen, onClick }) => (
  <div className={`${styles.faqCard} ${isOpen ? styles.open : ''}`}>
    <button className={styles.questionButton} onClick={onClick}>
      <span>{item.question}</span>
      <span className={`${styles.toggleIcon} ${isOpen ? styles.iconOpen : ''}`}>
        <img src={'/landing-asset/Arrow.svg'} alt='arrow' title="arrow" />
      </span>
    </button>
    <div
      className={styles.answerWrapper}
      style={{ maxHeight: isOpen ? '200px' : '0' }}
    >
      <p className={styles.answerText}>{item.answer}</p>
    </div>
  </div>
);

// ======================
// Main FAQ Component
// ======================
export default function Faq({ forPartner = false, forFundraise = false }) {
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId(openId === id ? null : id);

  // Select which FAQ data to use
  const dataToRender = forPartner
    ? partnerFaqData
    : forFundraise
    ? fundraiseFaqData
    : faqData;

  // For investor view: split into 2 columns
  const leftColumnData = !forPartner && !forFundraise ? dataToRender.slice(0, 3) : [];
  const rightColumnData = !forPartner && !forFundraise ? dataToRender.slice(3, 6) : [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": dataToRender.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <div className={styles.faqContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {forPartner || forFundraise ? (
        <div style={{ margin: 'auto 20px' }}>
          {dataToRender.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onClick={() => toggle(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.faqGrid}>
          <div className={styles.column}>
            {leftColumnData.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onClick={() => toggle(item.id)}
              />
            ))}
          </div>
          <div className={styles.column}>
            {rightColumnData.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onClick={() => toggle(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}