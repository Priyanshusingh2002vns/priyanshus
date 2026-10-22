
"use client"
import React, { useEffect } from 'react'
import Styles from './shareModal.module.css'

export default function ShareModal({ isOpen, onClose, shareUrl, onCopy }) {

useEffect(() => {
  if (isOpen) {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    document.body.dataset.scrollY = scrollY;
  } else {
    const scrollY = document.body.dataset.scrollY;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";

    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY));
    }
  }

  return () => {
    const scrollY = document.body.dataset.scrollY;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";

    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY));
    }
  };
}, [isOpen]);


  if (!isOpen) return null
  return (
    <div className={Styles.modalOverlay} onClick={onClose}>
      <div className={Styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={Styles.modalHeader}>
          <p className={Styles.modalTitle}>Share</p>
          <button className={Styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={Styles.modalBody}>
          <input className={Styles.input} value={shareUrl} readOnly />
          <button className={Styles.copyBtn} onClick={onCopy}>Copy</button>
        </div>
      </div>
    </div>
  )
}