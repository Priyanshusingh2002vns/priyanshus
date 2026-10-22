import React from "react";
import { useState } from "react";
import "./questions.css";

const Questions = () => {

  const items = [
    { title: 'Q1. Who can invest through PrEqt?', content: 'Accredited investors, HNIs, family offices, and registered financial intermediaries can invest through PrEqt.' },
    { title: 'Q2. How does PrEqt verify the deals listed?', content: 'Every deal undergoes a multi-layered due diligence process covering legal, secretarial, financial, and operational aspects of the company before being listed on the platform.' },
    { title: 'Q3. How do I track my investment after subscribing?', content: 'Once your investment is processed, you can monitor deal status, allotment updates, and portfolio insights directly from your PrEqt dashboard.' },
    { title: 'Q4. How do I start investing?', content: 'Sign Up, Complete KYC, and start investing once your profile is approved. Login credentials will be shared via email upon successful verification.' },
    { title: 'Q5. Is there any lock-in period?', content: 'Yes, most Pre-IPO investments carry a lock-in period. The duration depends on the share class and timing of listing. Certain investments may carry a lock-in period, as mentioned on the deal page.' },
    { title: 'Q6. Is there any principal guarantee of investments on PrEqt? ', content: 'PrEqt does not offer any capital protection or return guarantee. The investments available on the platform are market-driven and inherently involve risk. Investors are requested to read all the documents carefully before investing.' },
  ];

  const [openQuestion, setOpenQuestion] = useState(null);
  const toggle = (index) => {
    if (openQuestion === index) {
      setOpenQuestion(null); // close if already open
    } else {
      setOpenQuestion(index); // open clicked question
    }
  };

  return (
    <div className="ques-main-div">
      <div className="questions-section">
        <h4>
          Frequently asked <span>Questions</span>
        </h4>
        <section>
          <div className="accordion">
            {items.map((item, i) => (
              <div className="accordion-item" key={i}>
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${openQuestion === i ? "" : "collapsed"
                      }`}
                    onClick={() => toggle(i)}
                  >
                    {item.title}
                  </button>
                </h2>
                <div
                  className={`accordion-collapse ${openQuestion === i ? "show" : ""
                    }`}
                >
                  <div className="accordion-body">{item.content}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Questions;
