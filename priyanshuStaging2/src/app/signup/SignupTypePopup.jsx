"use client";
import { Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import styles from "./onboarding.module.css";
import { useMultiStepContext } from "@/app/utils/MultiStepContext";
import { IoClose } from "react-icons/io5";

const investorTypes = [
  "Retail Investor",
  "UHNIs/Angel Investors",
  "Institutional - AIFs/QIBs",
  "Investment Advisors",
  "Family Office",
  "Others",
];

export default function SignupTypePopup({ show, onHide, onProceed, onBack }) {
  const [selected, setSelected] = useState(investorTypes[0]);
  const { updateFormData, registerFormData } = useMultiStepContext();

  useEffect(() => {
    if (registerFormData.investor_type) {
      setSelected(registerFormData.investor_type);
    }
  }, [registerFormData.investor_type]);

  const handleProceed = (e) => {
    e.preventDefault();
    updateFormData("investor_type", selected);
    onProceed(); // ✅ open next modal
  };

  useEffect(() => {
    if (show) {
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("position", "fixed", "important");
      // stops touch scroll 
      document.body.style.setProperty("width", "100%", "important");
    } else {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    } return () => {
      document.documentElement.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("overflow", "", "important");
      document.body.style.setProperty("position", "", "important");
      document.body.style.setProperty("width", "", "important");
    };
  }, [show]);

  const handleHidePopUp = () => {
    sessionStorage.setItem("showSignUp", false)
    onHide();
  }


  return (
    <Modal show={show} onHide={handleHidePopUp} centered dialogClassName={styles.customModalWrapper} backdrop="static">
      <section className={styles.wrapper}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleHidePopUp}
        >
          <IoClose />
        </button>


        <img src="/logo.png" alt="PrEqtLogo" className={styles.logo} />
        <div className={styles.titleWrapper}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ←
          </button>
          <div>
            <h2 className={styles.title}>Help Us Get To Know You</h2>
            <p className={styles.subtitle}>
              Tell us a little more about yourself so we can set up things for you.
            </p>
          </div>

        </div>


        <div className={styles.sectionLabel}>Investor Type</div>

        <div className={styles.options}>
          {investorTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.option} ${selected === type ? styles.active : ""}`}
              onClick={() => setSelected(type)}
            >
              <span className={styles.radioOuter}>
                <span
                  className={styles.radioInner}
                  style={{ opacity: selected === type ? 1 : 0 }}
                />
              </span>
              <span className={styles.optionText}>{type}</span>
            </button>
          ))}
        </div>

        <button className={styles.proceed} onClick={handleProceed}>
          Proceed
        </button>
      </section>
    </Modal>
  );
}
