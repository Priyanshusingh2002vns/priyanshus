'use client'

import React, { useEffect, useRef, useState } from "react";
import "./chatbot.css";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import SigninPopup from "@/app/sign-in/SigninPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import OtpPopup from "@/app/otp/OtpPopup";
import { useDealStore } from "@/store/dealStore";
import { useUserContext } from "@/app/context/UserContext";

const Chatbot = ({ onBack, showInModal = false, onClose, isPrivate, isPrivateLike, dealType}) => {
  const pathname = usePathname();
  const slug = pathname?.split("/deals/")[1] || "";
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealDocumentName = dealDetails?.data?.deal_setpData?.boat_document_name;
  const { investor } = useUserContext();


  // Map of deals to documents
  const documentMap = {
    "hvr-solar-deals": "HVR_Solar_extended",
    "ashwini-container-movers-limited": "Red_Herring_Prospectus_Ashwini_Container_Movers_Limited",
    "finbud-financial-services-ltd": "Finbud SME IPO RHP",
    "cricstudio-pvt-ltd": "Cric Studio Document PrEqt",
    "exato-technologies-ltd": "EXATOTECH_RHP"
  };

  // Select document based on slug
  const selectedDocument =
    documentMap[slug] || "Red_Herring_Prospectus_Ashwini_Container_Movers_Limited";

  const defaultquestions = [
    "What’s the valuation and revenue of this company?",
    "Who are the backers of this IPO?",
    "Is this deal SEBI compliant?",
    "What’s the estimated return if I invest ₹50,000?",
  ];

  const [userChat, setUserChat] = useState([]);
  const [question, setQuestion] = useState("");
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(-1);
  const [showSignin, setShowSignin] = useState(false);
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [otpPayload, setOtpPayload] = useState(null);

  const allData = Cookies.get("userData");
  const userId = allData ? JSON.parse(allData)?.id : "user";

  const dealId = dealDetails?.data?.deal_id ;
  


  useEffect(() => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop =
      userChat.length > 0 ? chatContainerRef.current.scrollHeight : 0;
  }, [userChat]);

  // Handle modal overflow
  // useEffect(() => {
  //   document.body.style.setProperty("overflow", showInModal ? "hidden" : "", "important");
  //   return () => document.body.style.setProperty("overflow", "", "important");
  // }, [showInModal]);

  useEffect(() => {
    if (showInModal) {
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
  }, [showInModal]);
  const authToken = Cookies.get("accessToken");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!investor?.id || !dealId) return;

        const historyRes = await fetch(
          `https://pdf.webninjaz.com/history_chat?skip=0&limit=50&user_id=${investor.id}&deal_id=${dealId}`
        );
        if (!historyRes.ok) return;
        const data = await historyRes.json();

        if (Array.isArray(data?.history)) {
          const mappedHistory = data.history.map(h => ({
            user: h?.response?.question || "",
            ai: h?.response?.answer || ""
          }));

          setUserChat(mappedHistory);
        }
      } catch (err) {
        console.warn("Error loading chat history:", err);
      }
    };

    fetchHistory();
  }, [investor?.id, dealId]);


  const askAI = async (userQuestion) => {
    try {
      const authToken = Cookies.get("accessToken");
      if (!authToken) {
        handleUnauthorized();
        return;
      }
      const payload = { question: userQuestion, top_k: 10, document: dealDocumentName };
      const response = await fetch("https://pdf.webninjaz.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return "Chat service unavailable. Please try again.";
      const data = await response.json();
      return data.answer || "No answer available.";
    } catch (error) {
      console.error("Error fetching AI answer:", error);
      return "Something went wrong. Please try again.";
    }
  };

  const saveChatHistory = async (question, answer) => {
  try {
    
    const user_id = investor?.id ;

    const session_id = "";  
    const deal_type = dealType  ;
    const deal_id = dealId

    const payload = {
      user_id,
      session_id,
      deal_type,
      deal_id,
      response: {
        question,
        answer
      }
    };

    await fetch("https://pdf.webninjaz.com/save_chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};


  // Handle send
  const handleSend = async (userQuestion) => {
    if (!authToken) {
      handleUnauthorized();
      return;
    }
    if (!userQuestion.trim()) return;
    const newChat = { user: userQuestion, ai: "" };
    setUserChat((prev) => [...prev, newChat]);
    setQuestion("");
    setLoading(userChat.length);

    const aiAnswer = await askAI(userQuestion);
    setLoading(-1);

    setUserChat((prev) =>
      prev.map((chat, idx) =>
        idx === prev.length - 1 ? { ...chat, ai: aiAnswer } : chat
      )
    );
     saveChatHistory(userQuestion, aiAnswer);
  };

  // Auto-resize + update state
  const textareaRef = useRef(null);

  // Auto-resize + update state
  const handleInputChange = (e) => {
    const el = e.target;
    setQuestion(el.value);

    // Auto-grow
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleKeyPress = (e) => {
    const isEnter = e.key === "Enter";
    const isShift = e.shiftKey;

    // Enter without Shift → send + reset height
    if (isEnter && !isShift) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!question.trim()) return;

    handleSend(question);

    // Reset text + height back to single line
    setQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  console.log("isPrivateLike:", isPrivateLike);

  const handleUnauthorized = () => {
    setShowSignin(true);
  };


  const handleSigninOpen = () => setShowSignin(true);
  const handleSigninClose = () => setShowSignin(false);

  const handleSigninShowOtp = (payload) => {
    if (!payload?.type || !payload?.identifier) {
      console.error("Invalid OTP payload", payload);
      return;
    }

    setOtpPayload({
      flow: "signin",
      ...payload,
    });

    setShowSignin(false);
  };


  const handleSignupTypeOpen = () => setShowSignupType(true);
  const handleSignupTypeClose = () => setShowSignupType(false);

  const handleSignupTypeProceed = () => {
    setShowSignupType(false);
    setShowSignupForm(true);
  };


  const handleSignupFormClose = () => setShowSignupForm(false);
  const handleSignupShowOtp = ({ email, phone }) => {
    if (!phone) return;

    setOtpPayload({
      flow: "signup",
      type: "mobile",
      identifier: phone,
      verifyEndpoint: "verify-register-otp",
      resendEndpoint: "resend-registeration-otp",
      email,
    });

    setShowSignupForm(false);
  };


  const handleOtpClose = () => setOtpPayload(null);



  // Render Chatbot UI
  const renderChatbotUI = () => (
    <div className={`chatbot-maincontainer ${isPrivateLike ? "private-deal privateChatBot" : ""}`}>
      {/* Header */}
      <section className="chatbot-head">
        <svg
          className="arrow"
          onClick={() => onBack && onBack(false)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 19L5 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>PrEqt AI Assistant</h2>
      </section>

      {/* Chat body */}
      <section className="chatbot-body" ref={chatContainerRef}>
        {userChat.length === 0 && (
          <>
            <section className="chatbot-body-section1">
              <h3>Discuss This Deal with Your Personal AI Assistant</h3>
              <p>Ask anything about this Pre-IPO Deal</p>
            </section>

            <section className="default-chatbot-data">
              {defaultquestions.map((q, index) => (
                <p
                  key={index}
                  onClick={() => handleSend(q)}
                  className="default-question cursor-pointer"
                >
                  {q}
                </p>
              ))}
            </section>
          </>
        )}

        {userChat.map((chat, idx) => (
          <div key={idx} className="chat-block">
            <div className="chat-bubble user-bubble animate">{chat.user}</div>
            {loading === idx ? (
              <div className="chat-bubble ai-bubble typing">
                <span></span><span></span><span></span>
              </div>
            ) : (
              chat.ai && (
                <div
                  className="chat-bubble ai-bubble animate"
                  dangerouslySetInnerHTML={{
                    __html: chat.ai.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
                  }}
                />
              )
            )}
          </div>
        ))}
      </section>

      {/* Input footer */}
      <section className="chatbot-body-section2">
        <textarea
          placeholder="Type your question here…"
          value={question}
          rows="1"
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          ref={textareaRef}
        />

        <img
          className="action-btn"
          src="/assets/pictures/send-ques-logo.svg"
          alt="send"
          onClick={sendMessage}
        />
      </section>

      <SigninPopup
        show={showSignin}
        onHide={handleSigninClose}
        onShowOtp={handleSigninShowOtp}
        onShowSignUp={() => {
          handleSigninClose();
          handleSignupTypeOpen();
        }}
      />


      <SignupTypePopup
        show={showSignupType}
        onHide={handleSignupTypeClose}
        onProceed={handleSignupTypeProceed}
        onBack={() => {
          handleSignupTypeClose();
          handleSigninOpen();
        }}
      />


      <SignupFormPopup
        show={showSignupForm}
        onHide={handleSignupFormClose}
        onBack={() => {
          handleSignupFormClose();
          setShowSignupType(true);
        }}
        onShowOtp={handleSignupShowOtp}
      />


      {otpPayload && (
        <OtpPopup
          {...otpPayload}
          show
          handleClose={handleOtpClose}
          handleBack={() => {
            const flow = otpPayload.flow;
            handleOtpClose();
            flow === "signin" ? setShowSignin(true) : setShowSignupForm(true);
          }}
          onVerified={() => {
            handleOtpClose();
          }}
        />
      )}
    </div>
  );

  // Render
  if (!showInModal) return renderChatbotUI();

  return (
    <div className="chatbot-modal-overlay">
      <div className="chatbot-modal">
        <button className="chatbot-modal-close" onClick={onClose}>✕</button>
        {renderChatbotUI()}
      </div>
    </div>
  );
};

export default Chatbot;
