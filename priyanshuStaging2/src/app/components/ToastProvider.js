"use client";

import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./customToast.css";
import ErrorIcon from "./ErrorIcon";
import SuccessIcon from "./SuccessIcon";
import { usePathname } from "next/navigation";
// ✅ Custom reusable functions
export const showErrorToast = (message) =>
  toast.error(
    <div className="toastContent">
      <div className="toastIcon">
        <ErrorIcon />
      </div>
      <div className="toastMessage">{message}</div>
    </div>,
    {
      icon: false,
      closeButton: false
      // closeButton: <CloseButton type="error" />, // ✅ Custom close icon for error
    }
  );

export const showSuccessToast = (message) =>
  toast.success(
    <div className="toastContent">
      <div className="toastIcon">
        <SuccessIcon />
      </div>
      <div className="toastMessage">{message}</div>
    </div>,
    {
      icon: false,
      closeButton: false
      // closeButton: <CloseButton type="success" />,
    }
  );

// ✅ Custom close icon component
const CloseButton = ({ type }) => {
  if (type === "success") {
    return (
      <button className="customCloseBtn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 30 30"
          fill="none"
        >
          <path
            d="M22.5 7.5L7.5 22.5"
            stroke="url(#paint0_linear_13401_29008)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 7.5L22.5 22.5"
            stroke="url(#paint1_linear_13401_29008)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="paint0_linear_13401_29008"
              x1="6.02273"
              y1="6.47727"
              x2="21.4773"
              y2="22.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF2D0" />
              <stop offset="1" stopColor="#8E6B0F" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_13401_29008"
              x1="6.02273"
              y1="6.47727"
              x2="21.4773"
              y2="22.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFF2D0" />
              <stop offset="1" stopColor="#8E6B0F" />
            </linearGradient>
          </defs>
        </svg>
      </button>
    );
  }

  // Default: error close icon
  return (
    <button className="customCloseBtn">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 30 30"
        fill="none"
      >
        <path
          d="M22.5 7.5L7.5 22.5"
          stroke="#C8746A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 7.5L22.5 22.5"
          stroke="#C8746A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

// ✅ Toast container configuration
export default function ToastProvider() {
  const pathname = usePathname();
  const dealsData = {
    "acmpl-deals": { deal: "public" },
    "hvr-solar-deals": { deal: "private" },
  };

  let isPrivateDeal = false;
  if (pathname.startsWith("/deals/")) {
    const slug = pathname.split("/deals/")[1];
    const activeDeal = dealsData[slug];
    isPrivateDeal = activeDeal?.deal === "private" || "ccps";
  }

  return (
    <ToastContainer
      className={isPrivateDeal ? "toastContainer privateDeal" : ""}
      toastClassName={(context) =>
        context?.type === "success"
          ? "customToast successToast"
          : context?.type === "error"
            ? "customToast errorToast"
            : "customToast"
      }
      bodyClassName="customBody"
      progressClassName="customProgressTop"
      position="top-right"
      autoClose={isPrivateDeal ? 5000 : 3000}
      hideProgressBar={true}
      closeOnClick
      pauseOnHover
      draggable
      icon={false}
    />
  );
}
