"use client";
import { useDealStore } from "@/store/dealStore";
import React, { useState } from "react";
import "./pitchdeck.module.css";

const Pitchdeck = ({ isPrivateDeal, pdfUrl }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_overview;
  const dealStepData = dealDetails?.data?.deal_setpData;

  const dealType = dealDetails?.data?.deal_type;
  const isPrivateLike = isPrivateDeal || dealType === "private" || dealType === "ccps" || dealType === "ofs" || dealType === "unlisted";

  // ✅ States for image and logo errors
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Helper to resolve absolute URLs
  const toAbsoluteUrl = (filePath) => {
    if (!filePath) return null;
    const baseUrl = process.env.NEXT_PUBLIC_USER_BASE || 'https://preqty.webninjaz.com';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanFilePath = filePath.replace(/^public\//, '');
    return `${cleanBaseUrl}/admin/${cleanFilePath}`;
  };

  // Resolve pitch deck from multiple possible locations
  const apiPitchDeck = dealStepData?.pitch_deck || dealData?.pitch_deck;
  let resolvedPdfUrl = pdfUrl;

  if (apiPitchDeck?.status) {
    const fileData = apiPitchDeck.data;
    if (Array.isArray(fileData) && fileData.length > 0) {
      // Handle data as an array - path might be in nested file array
      resolvedPdfUrl = toAbsoluteUrl(fileData[0].file?.[0]?.path || fileData[0].path);
    } else if (fileData?.file && Array.isArray(fileData.file) && fileData.file.length > 0) {
      resolvedPdfUrl = toAbsoluteUrl(fileData.file[0].path);
    } else if (fileData?.path) {
      resolvedPdfUrl = toAbsoluteUrl(fileData.path);
    }
  }

  if (!resolvedPdfUrl) return null;

  const baseUrl = process.env.NEXT_PUBLIC_USER_BASE;
  const companyName = dealDetails?.data?.deal_setpData?.company_name;
  const companyLogo = dealDetails?.data?.deal_setpData?.company_logo?.[0] ;
  const labelName = apiPitchDeck?.data?.label_name || "Pitch Deck";
  const ipoOpenDate =
    dealDetails?.data?.deal_setpData?.ipo_timeline?.data?.ipo_open_date;

  const isPdf = resolvedPdfUrl?.toLowerCase().split('?')[0].endsWith('.pdf');
  const showFallback = imgError || isPdf;

  const formattedDate = ipoOpenDate ? new Date(ipoOpenDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }) : "";

  // ✅ Use resolved URL
  const imageSrc = resolvedPdfUrl;

  // ✅ Build company logo URL (if available)
  const companyLogoUrl = companyLogo
    ? `${baseUrl}admin/${companyLogo.path.replace("public", "")}`
    : <svg width="152" height="152" viewBox="0 0 152 152" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M114 19C103.506 19 95 27.5066 95 38C95 48.4934 103.506 57 114 57C124.494 57 133 48.4934 133 38C133 27.5066 124.494 19 114 19Z" fill="#717171"/>
<path d="M85.227 83.6373L92.9454 72.4109C94.1266 70.692 96.0785 69.6654 98.1641 69.6654C100.25 69.6654 102.202 70.692 103.383 72.4109L138.216 123.078C139.549 125.016 139.697 127.532 138.602 129.614C137.507 131.695 135.35 132.999 132.997 132.999H18.9974C16.7654 132.999 14.6983 131.824 13.5561 129.906C12.414 127.988 12.3655 125.612 13.4286 123.649L54.5952 47.6489C55.7022 45.6052 57.8398 44.332 60.1641 44.332C62.4883 44.332 64.6259 45.6052 65.733 47.6489L85.227 83.6373Z" fill="#717171"/>
</svg>;

  return (
    <section className="pitch-deck">
      <div className="pitch-deck-header">
        <h3>Pitch Deck </h3>
        <a href={resolvedPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
          >
            <g clipPath="url(#clip0_10246_30457)">
              <path
                d="M14.4444 20.75H3.33331C2.44289 20.75 1.60584 20.4032 0.976279 19.7736C0.346722 19.144 0 18.307 0 17.4166V6.30555C0 5.41516 0.346761 4.57811 0.976318 3.94855C1.60587 3.319 2.44293 2.97224 3.33335 2.97224H7.77778C8.39147 2.97224 8.8889 3.46967 8.8889 4.08335C8.8889 4.69703 8.39147 5.19447 7.77778 5.19447H3.33331C3.03651 5.19447 2.75751 5.31006 2.54769 5.51988C2.33786 5.72971 2.22224 6.00874 2.22224 6.30555V17.4166C2.22224 17.7135 2.33782 17.9924 2.54769 18.2024C2.75751 18.4121 3.03651 18.5278 3.33331 18.5278H14.4444C14.7412 18.5278 15.0202 18.4122 15.23 18.2023C15.4399 17.9924 15.5555 17.7134 15.5555 17.4166V12.9722C15.5555 12.3585 16.0529 11.8611 16.6666 11.8611C17.2803 11.8611 17.7778 12.3586 17.7778 12.9722V17.4166C17.7778 18.307 17.431 19.144 16.8014 19.7737C16.1718 20.4032 15.3347 20.75 14.4444 20.75ZM7.77778 14.0833C7.4934 14.0833 7.20905 13.9748 6.99212 13.7579C6.55822 13.324 6.55822 12.6204 6.99212 12.1865L16.2064 2.97224H12.2222C11.6085 2.97224 11.1111 2.4748 11.1111 1.86112C11.1111 1.24744 11.6085 0.75 12.2222 0.75H18.8889C19.0425 0.75 19.1889 0.781206 19.322 0.837602C19.4463 0.890156 19.563 0.966308 19.665 1.0661L19.6651 1.06618C19.6659 1.06691 19.6666 1.06761 19.6673 1.06835C19.6675 1.06854 19.6678 1.06878 19.6679 1.06897C19.6685 1.06951 19.6691 1.0701 19.6697 1.07068C19.67 1.07107 19.6704 1.07142 19.6708 1.0718C19.6712 1.07223 19.6717 1.0727 19.672 1.07305C19.6728 1.07382 19.6737 1.07464 19.6744 1.07545C19.6752 1.07623 19.6761 1.07708 19.6768 1.07786C19.6773 1.07825 19.6777 1.07875 19.678 1.0791C19.6785 1.07949 19.6788 1.07984 19.6792 1.08023C19.6798 1.08081 19.6803 1.08135 19.6809 1.08197C19.6811 1.08213 19.6813 1.0824 19.6815 1.08259C19.6822 1.08333 19.683 1.08407 19.6837 1.08481L19.6837 1.08488C19.7835 1.18704 19.8597 1.30372 19.9122 1.42792C19.9686 1.56105 19.9998 1.70738 19.9998 1.86108V8.52774C19.9998 9.14143 19.5024 9.63886 18.8887 9.63886C18.275 9.63886 17.7776 9.14143 17.7776 8.52774V4.5436L8.56326 13.7579C8.34648 13.9749 8.06213 14.0833 7.77778 14.0833Z"
                fill="#C9A74E"
              />
            </g>
            <defs>
              <clipPath id="clip0_10246_30457">
                <rect width="20" height="20" fill="white" transform="translate(0 0.75)" />
              </clipPath>
            </defs>
          </svg>
        </a>
      </div>

      <div className="image-container">
        {/* ✅ Pitch deck image */}
        {!showFallback ? (
          <img src={imageSrc || null} alt="Pitch Deck" onError={() => setImgError(true)} />
        ) : (
          <div className="fallback-container">
            <img
              src="/pitchdeck-default.png"
              alt="Pitch Deck Fallback"
              className="fallback-image"
            />
            <div className="fallback-view" >
              <div className="fallback-view-content fallback-view-pitchdeck">
                {companyLogoUrl && !logoError ? (
                  <img
                    src={companyLogoUrl}
                    alt={companyName || "Company Logo"}
                    className="fallback-company-logo"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <img
                    src="/default-company-logo.png"
                    alt="Default Company Logo"
                    className="fallback-company-logo"
                  />
                )}
                <div style={{ margin: "auto 0" }}>
                  <div className="ipo-opendate">PITCH DECK {formattedDate}</div>
                  <div className="fallback-label">{companyName}</div>
                </div>
                
                <div className="pitch-deck-copyright">
                  <div className="current-year">
                    @{new Date().getFullYear()} {companyName} All Rights Reserved
                  </div>
                  {isPrivateLike && (
                    <div className="text-copyright">
                      For Internal Use Only Private & Confidential
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ✅ Overlay with open button */}
        <div className="overlay">
          <a
            href={resolvedPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <button className="pitch-overlay-btn">
              Open in Browser
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 2H14V5.5M8 8L14 2M14 14H2V2H8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pitchdeck;
