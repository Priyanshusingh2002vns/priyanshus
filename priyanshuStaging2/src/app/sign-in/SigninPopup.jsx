"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Signin from "./Signin";
// hypothetical component
import styles from "./Signin.module.css";
import { IoClose } from "react-icons/io5";
import { useMultiStepContext } from "../utils/MultiStepContext";


export default function SigninPopup({ show, onHide, onShowOtp, onShowSignUp, onEmailSubmit }) {
  const [email, setEmail] = useState("");

  const { clearFormData } = useMultiStepContext();

  const handleEmailSubmit = (emailValue) => {
    setEmail(emailValue);
    if (onEmailSubmit) onEmailSubmit(emailValue);
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
     sessionStorage.setItem("showSignUp", false);
  clearFormData(); // ✅ FULL CLEAR (including email)
  onHide();
  }

  return (
    <>
      <Modal show={show} onHide={handleHidePopUp} centered dialogClassName={styles.customModalWrapper} backdrop="static" >
        <div className={styles.customModalContent}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleHidePopUp}
          >
            <IoClose />
          </button>
          <Signin
            onShowOtp={onShowOtp}
            onShowSignUp={onShowSignUp}
            onEmailSubmit={handleEmailSubmit}
          />
        </div>
      </Modal>
    </>
  );
}
