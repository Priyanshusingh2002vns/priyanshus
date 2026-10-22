'use client';
import React, { useRef } from 'react';
import './GlowingButton.css';

const GlowingButton = ({ text = 'Get Started Today' }) => {
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    buttonRef.current.style.setProperty('--x', `${x}px`);
    buttonRef.current.style.setProperty('--y', `${y}px`);
  };

  const handleMouseLeave = () => {
    buttonRef.current.style.setProperty('--x', `50%`);
    buttonRef.current.style.setProperty('--y', `50%`);
  };

  return (
    <button
      className="button-creative"
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span className="glow" />
      <span className="btn-text">{text}</span>
    </button>
  );
};

export default GlowingButton;
