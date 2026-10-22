import React, { useState } from "react";
import "./valuation.css";
import Nonaiipooverview from "./non-ai-ipo-overview/non-ai-ipo-overview-section";
import AiIpoOverview from "./ai-ipo-overview/ai-ipo-overview";
import { Drhp } from "../name-section/svgicon";
import Chatbot from "../ask-ai-section/chatbot/chatbot";
import { useDealStore } from "@/store/dealStore";
import CcpsDealsData from "./CcpsDealsData";
import Cookies from "js-cookie";
import SigninPopup from "@/app/sign-in/SigninPopup";
import OtpPopup from "@/app/otp/OtpPopup";

const Valuation = ({ isPrivateDeal, isccps, isofs, dealDetails: dealDetailsProp }) => {
  const [showChatBot, setShowChatBot] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [otpPayload, setOtpPayload] = useState(null);
  const authToken = Cookies.get("accessToken") || "";
  const dealDetailsFromStore = useDealStore((state) => state.dealDetails);
  const dealDetails = dealDetailsProp || dealDetailsFromStore;
  const dealData = dealDetails?.data?.deal_setpData;

  const minLots = Number(dealData?.min_investment?.data?.lot_size) || 1;
  const lotSize = Number(dealData?.lot_size?.data) || 1;
  const sharesPerLot = lotSize;
  const perSharePrice = Number(dealData?.per_share_price?.data || dealData?.offer_price?.data || 0);
  const pricePerCcps = Number(dealData?.price_per_ccps?.data) || 0;
  const dealType = dealDetails?.data?.deal_type;
  const isunlisted = dealType === "unlisted";
  const isDarkTheme = isPrivateDeal || isofs || isccps;

  const pricePerLot = dealType === "ccps"
    ? pricePerCcps * lotSize * minLots
    : perSharePrice * lotSize * minLots;
  const formatCommaseparated = (num) => {
    if (!num) return "-";
    const numStr = String(num);
    const [integerPart, decimalPart] = numStr.split(".");
    
    // Indian formatting: first comma after 3 digits, then every 2 digits
    const x = integerPart;
    const lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    const formattedInteger = (otherNumbers !== "" ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," : "") + lastThree;
    
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };
  const formatNumber = (val) => {
    let value = val;
    // Unwrap if the value is accidentally wrapped in { status, data }
    if (value && typeof value === 'object' && value.data !== undefined) {
      value = value.data;
    }
    if (value === null || value === undefined || isNaN(Number(value))) return value && typeof value === 'string' ? value : "-";
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  };

  const raisedAmount =
    dealData?.company_name === "Cricstudio Pvt. Ltd." || dealData?.company_name === "avineet"
      ? 4.5
      : Number(dealDetails?.data?.raised_amount || 0);

  const targetAmount = Number(dealData?.target_funding_in_cr?.data || 0);

  const progressPercent =
    targetAmount > 0
      ? ((raisedAmount / targetAmount) * 100).toFixed(2)
      : "0.00";


  return (
    <div>
      {(isPrivateDeal || isofs || isunlisted) && (
        <div className={`investmentCard ${isDarkTheme ? '' : 'lightCard'}`}>
          {dealData?.min_investment?.status && (
            <div className="investmentHeader">
              <div>
                <p className="label">{dealData?.min_investment?.label_name || "Minimum Investment"}</p>
                <div className="amt">
                  ₹{formatCommaseparated(typeof pricePerLot === 'number' && !isNaN(pricePerLot) ? pricePerLot.toFixed(1) : pricePerLot)} / {formatCommaseparated(sharesPerLot * minLots)} shares
                </div>
              </div>
            </div>
          )}

          {isPrivateDeal && (
            <div className="progressWrapper">
              <div className="progressStack">
                <p className="subtext">
                  {formatNumber(raisedAmount)} Cr / {formatNumber(targetAmount)} Cr
                </p>
                <span className="progressPercent">{progressPercent}%</span>
              </div>

              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

        </div>
      )}

      <div className="ask-ai-mob-div">
        {/* Ask AI Button conditionally rendered based on chat_bot_supported */}
        {/* {dealDetails?.data?.chat_bot_supported && (
          <button
            className="ask-ai-button"
            onClick={() => {
              if (!authToken) {
                setShowSignin(true);
                return;
              }
              setShowChatBot(!showChatBot);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9.9688 5.57749L10.571 7.24999C11.24 9.10624 12.7018 10.568 14.558 11.237L16.2305 11.8392C16.3813 11.894 16.3813 12.1077 16.2305 12.1617L14.558 12.764C12.7018 13.433 11.24 14.8947 10.571 16.751L9.9688 18.4235C9.91405 18.5742 9.7003 18.5742 9.6463 18.4235L9.04405 16.751C8.37505 14.8947 6.9133 13.433 5.05705 12.764L3.38455 12.1617C3.2338 12.107 3.2338 11.8932 3.38455 11.8392L5.05705 11.237C6.9153 10.568 8.37505 9.10624 9.04405 7.24999L9.6463 5.57749C9.7003 5.42599 9.91405 5.42599 9.9688 5.57749Z" fill="#E4C575" />
              <path d="M17.4973 1.55794L17.8026 2.40469C18.1416 3.34444 18.8818 4.08469 19.8216 4.42369L20.6683 4.72894C20.7448 4.75669 20.7448 4.86469 20.6683 4.89244L19.8216 5.19769C18.8818 5.53669 18.1416 6.27694 17.8026 7.21669L17.4973 8.06344C17.4696 8.13994 17.3616 8.13994 17.3338 8.06344L17.0286 7.21669C16.6896 6.27694 15.9493 5.53669 15.0096 5.19769L14.1628 4.89244C14.0863 4.86469 14.0863 4.75669 14.1628 4.72894L15.0096 4.42369C15.9493 4.08469 16.6896 3.34444 17.0286 2.40469L17.3378 1.55794C17.3616 1.48069 17.4703 1.48069 17.4973 1.55794Z" fill="#E4C575" />
              <path d="M17.4973 15.9382L17.8026 16.785C18.1416 17.7247 18.8818 18.465 19.8216 18.804L20.6683 19.1092C20.7448 19.137 20.7448 19.245 20.6683 19.2727L19.8216 19.578C18.8818 19.917 18.1416 20.6572 17.8026 21.597L17.4973 22.4437C17.4696 22.5202 17.3616 22.5202 17.3338 22.4437L17.0286 21.597C16.6896 20.6572 15.9493 19.917 15.0096 19.578L14.1628 19.2727C14.0863 19.245 14.0863 19.137 14.1628 19.1092L15.0096 18.804C15.9493 18.465 16.6896 17.7247 17.0286 16.785L17.3378 15.9382C17.3616 15.8617 17.4703 15.8617 17.4973 15.9382Z" fill="#E4C575" />
            </svg>
            Ask AI About This Deal
          </button>
        )} */}
      </div>

      {showChatBot && (
        <Chatbot
          onBack={() => setShowChatBot(false)}
          onClose={() => setShowChatBot(false)}
          isPrivateDeal={false}
          showInModal={true}
          isPrivate={false}
        />
      )}

      {showSignin && (
        <SigninPopup
          show={showSignin}
          onHide={() => setShowSignin(false)}
          onShowOtp={(payload) => {
            setShowSignin(false);
            setOtpPayload({ ...payload, flow: "signin" });
          }}
        />
      )}

      {otpPayload && (
        <OtpPopup
          {...otpPayload}
          show
          handleClose={() => setOtpPayload(null)}
          handleBack={() => {
            setOtpPayload(null);
            setShowSignin(true);
          }}
          onVerified={() => {
            setOtpPayload(null);
            setShowChatBot(true);
          }}
        />
      )}

      {isccps ? (
        <>
          {dealData?.min_investment?.status && (
            <div className="investmentHeader investmentHeaderMobile">
              <div>
                <div className="labelWithTooltip">
                  <p className="label">{dealData?.min_investment?.label_name || "Minimum Investment"}</p>

                  {/* Tooltip condition */}
                  {dealData?.min_investment?.tool_tip?.status &&
                    dealData?.min_investment?.tool_tip?.data?.trim() !== "" && (
                      <div className="tooltipWrapper">
                        <span className="tooltipIcon"><img src="/tooltip.svg" alt="info" /></span>
                        <div className="tooltipBox">
                          {dealData?.min_investment?.tool_tip?.data}
                        </div>
                      </div>
                    )}
                </div>

                <div className="amt">
                  ₹{formatCommaseparated(typeof pricePerLot === 'number' && !isNaN(pricePerLot) ? pricePerLot.toFixed(1) : pricePerLot)} / {formatCommaseparated(sharesPerLot * minLots)} shares
                </div>
              </div>
            </div>
          )}

          <div className="ccps-deals-data-wrapper">
            <CcpsDealsData isccps={isccps} dealDetails={dealDetails} />
          </div>

        </>

      ) : (
        <AiIpoOverview isPrivateDeal={isPrivateDeal} isccps={isccps} isofs={isofs} dealDetails={dealDetails} />
      )}

    </div>
  );
};

export default Valuation;
