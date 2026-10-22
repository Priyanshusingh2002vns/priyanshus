"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/deals/components/ask-ai-section/ques-ans-section/question-answer/QuestionAnswer.module.css";
import Cookies from "js-cookie";
import { useDealStore } from "@/store/dealStore";
import SigninPopup from "@/app/sign-in/SigninPopup";
import OtpPopup from "@/app/otp/OtpPopup";
import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import { formatDateForTime } from "@/app/utils/FormatDate";
import { useMediaQuery } from "react-responsive";
import LoadMoreLoader from "@/app/components/LoadMore/LoadMoreLoader";

const QuestionAnswer = ({ handleQuesAns, handleAskAI, qaCount, setShowPrivateQna }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [otpPayload, setOtpPayload] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 920 });
  const [initialLoading, setInitialLoading] = useState(false);

  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealId = dealDetails?.data?.deal_id;
  const [replies, setReplies] = useState(null); // Store replies data
  const isPrivateDeal = dealDetails?.data?.deal_type === "private" || dealDetails?.data?.deal_type === "ccps";

  const API_URL = `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/investor-questionaire/${dealId}`;

  const formatQuestions = (questions = []) =>
    questions
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((q) => ({
        question: {
          id: q.id,
          user: q.investor_name || "Anonymous",
          message: q.questionaire,
          time: formatDateForTime(q.createdAt),
          createdAt: q.createdAt,
          isReply: false,
        },
        replies: (q.replies || [])
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((r) => ({
            id: r.id,
            user: r.solver || "Admin",
            message: r.answer,
            time: formatDateForTime(r.createdAt),
            createdAt: r.createdAt,
            isReply: true,
          })),
      }));

  useEffect(() => {
    if (!dealId) {
      console.warn('[QnA] Skipping fetch: dealId not ready.');
      return;
    }

    const fetchQandA = async () => {
      setInitialLoading(true);
      try {

        const token = Cookies.get("accessToken");

        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch Q&A: ${res.status}`);

        const result = await res.json();
        console.log("result", result);

        if (result?.data?.questions) {
          setMessages(formatQuestions(result.data.questions));
        } else {
          setMessages([]); // ensure empty when no questions
        }
      } catch (err) {
        console.error("Error fetching Q&A history:", err);
        setMessages([]);
      }
      finally {
        setInitialLoading(false); // stop initial loader
      }
    };

    fetchQandA();
  }, [API_URL]);

  // Fetch replies data for initials
  useEffect(() => {
    const fetchRepliesCount = async () => {
      if (!dealId) return;

      try {
        const token = isPrivateDeal ? Cookies.get("accessToken") : null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/replies-count/${dealId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();
        // Store replies data for initials
        setReplies(data);
      } catch (err) {
        console.error("Error fetching replies count:", err);
      }
    };

    fetchRepliesCount();
  }, [dealId, isPrivateDeal]);

  // Function to calculate days until live
  function daysUntilLive(liveAt) {
    if (!liveAt) return 0;
    const liveDate = new Date(liveAt);
    const today = new Date();

    // Convert to start of day to avoid time-zone partial day issues
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfLive = new Date(liveDate.getFullYear(), liveDate.getMonth(), liveDate.getDate());

    const diffTime = startOfToday - startOfLive; // milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays; // Could be 0 or negative
  }

  // Function to get latest reply initials
  const getLatestReplyInitials = (questions = []) => {
    const allReplies = [];

    questions.forEach(q => {
      if (q.replies && q.replies.length > 0) {
        q.replies.forEach(r => {
          allReplies.push({
            solver: r.solver,
            createdAt: r.createdAt
          });
        });
      }
    });

    // Sort by newest first
    allReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Take top 5
    const latestFive = allReplies.slice(0, 5);

    // Convert name → initials
    return latestFive.map(r => {
      if (!r.solver) return "A"; // default like your old PNG  
      const parts = r.solver.trim().split(" ");
      let initials = parts[0][0];
      if (parts.length > 1) initials += parts[1][0];
      return initials.toUpperCase();
    });
  };

  const liveAt = dealDetails?.data?.deal_setpData?.live_at;


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: "You",
      message: inputValue,
      time: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
      isReply: false,
    };

    // Optimistically show message
    setMessages((prev) => [...prev, { question: newMessage, replies: [] }]);
    setInputValue("");
    setLoading(true);

    try {
      const token = Cookies.get("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/questionaire/${dealId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ question: inputValue }),
        }
      );

      const result = await res.json();

      // 🔹 Handle unauthorized (even if backend returns 200 with status=401)
      if (res.status === 401 || result?.status === 401 || result?.data?.status === 401) {
        console.warn("Unauthorized — showing SignIn popup");
        handleUnauthorized();


        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
        return;
      }

      if (!res.ok) throw new Error(`Failed to post question: ${res.status}`);

      // ✅ Refresh Q&A after posting
      const tokenRefetch = Cookies.get("accessToken");
      const updated = await fetch(
        `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/investor-questionaire/${dealId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(tokenRefetch && { Authorization: `Bearer ${tokenRefetch}` }),
          },
        }
      );

      const updatedResult = await updated.json();

      if (
        updated.status === 401 ||
        updatedResult?.status === 401 ||
        updatedResult?.data?.status === 401
      ) {
        console.warn("Unauthorized on refetch — opening SignIn popup");
        setShowSignin(true);
        return;
      }

      if (updatedResult?.data?.questions) {
        setMessages(formatQuestions(updatedResult.data.questions));
      }
    } catch (err) {
      console.error("Error posting question:", err);
      // remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Enter = send (no new line) | Shift+Enter = new line
  const handleKeyPress = (e) => {
    const isEnter = e.key === "Enter";
    const isShift = e.shiftKey;

    if (isEnter && !isShift) {
      e.preventDefault(); // Stop new line
      handleSendMessageWrapper();
    }
  };

  // Central send handler with reset height
  const handleSendMessageWrapper = () => {
    if (!inputValue.trim()) return;

    handleSendMessage(inputValue); // your function

    // Reset text + collapse textarea
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // back to one row
    }
  };


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

  return (
    <>
      <div className={styles.container}>
        <div className={styles.headar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" onClick={() => handleQuesAns(false)}
            style={{ cursor: "pointer" }}>
            <path d="M12 19L5 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className={styles["image-stack"]}>
            <>
            {qaCount > 0 && (
              <div className={styles.initialsContainer}>
                {getLatestReplyInitials(replies?.data?.questions_by || []).map((i, index) => (
                  <div key={index} className={styles.initialBadge}>
                    {i}
                  </div>
                ))}
              </div>
            )}
              <span className={styles.s1}>{qaCount > 0 ? `${qaCount} Q&A answered in last ${daysUntilLive(liveAt)} days`:  "Do you have any question? Ask now"}  {} </span>
            </>
            <span className={styles.s2}>
              <img
                src="/assets/pictures/8e3073ca31264b3cb0bd9cb1e07af102b937cb5c.gif"
                alt="gif"
              />
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.answerContainer}>
          <h3 className={styles.title}>Know what people are talking about</h3>

          <div className={styles.activitySection}>

            <div className={styles.activityList}>
              <div className={styles.activityText}>Activity</div>



              {
                initialLoading ? (
                  <LoadMoreLoader />
                ) : messages.length > 0
                  ?
                  (
                    messages.map(({ question, replies }) => {
                      const nameParts = question?.user?.trim().split(" ") || [];
                      const firstName = nameParts[0] || "";
                      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

                      const avatarText =
                        (firstName.charAt(0) || "") + (lastName.charAt(0) || "");

                      const displayName =
                        firstName.charAt(0).toUpperCase() + (lastName ? "/" + lastName : "");

                      const isAdmin =
                        question?.user?.toLowerCase().includes("admin") ||
                        question?.user?.toLowerCase().includes("preqt");

                      const finalName = isAdmin ? "Preqt" : displayName;

                      return (
                        <div key={question?.id}>
                          <div
                            className={`${styles.activityItem} ${question?.isReply ? styles.replyBody : ""
                              }`}
                          >
                            <div
                              className={`${styles.avatar} ${question?.isReply ? styles.replyAvatar : styles.userAvatar
                                }`}
                            >
                              {isAdmin ? (
                                <img
                                  src="/preqtAdminIcon.svg"
                                  alt="Preqt"
                                  className={styles.adminAvatarImg}
                                />
                              ) : (
                                <p>{avatarText.toUpperCase()}</p>
                              )}
                            </div>

                            <div className={styles.messageContent}>
                              <div className={styles.messageHeader}>
                                <div className={styles.userName}>
                                  {finalName}
                                  {isAdmin && (
                                    <img
                                      src="/verifyIcon.svg"
                                      alt="verified"
                                      className={styles.verifiedIcon}
                                    />
                                  )}
                                </div>
                                <div className={styles.time}>{question?.time}</div>
                              </div>
                              <div className={styles.message}>{question?.message}</div>
                            </div>
                          </div>

                          {replies?.map((reply) => {
                            const replyNameParts = reply?.user?.trim().split(" ") || [];
                            const replyFirst = replyNameParts[0] || "";
                            const replyLast = replyNameParts.length > 1
                              ? replyNameParts[replyNameParts.length - 1]
                              : "";
                            const replyAvatar =
                              (replyFirst.charAt(0) || "") + (replyLast.charAt(0) || "");
                            const replyDisplay =
                              replyFirst.charAt(0).toUpperCase() + (replyLast ? "/" + replyLast : "");
                            const replyIsAdmin =
                              reply?.user?.toLowerCase().includes("admin") ||
                              reply?.user?.toLowerCase().includes("preqt");
                            const replyName = replyIsAdmin ? "Preqt" : replyDisplay;

                            return (
                              <div
                                key={reply?.id}
                                className={`${styles.activityItem} ${reply?.isReply ? styles.replyBody : ""
                                  }`}
                              >
                                <div
                                  className={`${styles.avatar} ${reply?.isReply ? styles.replyAvatar : styles.userAvatar
                                    }`}
                                >
                                  {replyIsAdmin ? (
                                    <img
                                      src="/preqtAdminIcon.svg"
                                      alt="Preqt"
                                      className={styles.adminAvatarImg}
                                    />
                                  ) : (
                                    <p>{replyAvatar.toUpperCase()}</p>
                                  )}
                                </div>

                                <div className={styles.messageContent}>
                                  <div className={styles.messageHeader}>
                                    <div className={styles.userName}>
                                      {replyName}
                                      {replyIsAdmin && (
                                        <img
                                          src="/verifyIcon.svg"
                                          alt="verified"
                                          className={styles.verifiedIcon}
                                        />
                                      )}
                                    </div>
                                    <div className={styles.time}>{reply?.time}</div>
                                  </div>
                                  <div className={styles.message}>{reply?.message}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })

                  ) : (
                    <div className={styles.noQnaYet}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="176" height="160" viewBox="0 0 176 160" fill="none">
                        <path d="M59.0904 20.7883C59.3022 20.7857 59.507 20.8044 59.7176 20.8221C60.0075 21.011 60.0395 21.0387 60.1825 21.3523C60.1793 21.7615 60.0727 21.9738 59.8519 22.3133C59.7115 22.2884 59.5654 22.2675 59.4307 22.2178C59.1345 22.1085 58.9872 21.9585 58.8495 21.6832C58.8092 21.2921 58.896 21.124 59.0904 20.7883Z" fill="#E4C575" />
                        <path d="M127.019 135.281C127.272 135.264 127.59 135.249 127.829 135.344C128.112 135.457 128.2 135.62 128.327 135.88C128.339 136.29 128.226 136.502 128.028 136.856C127.816 136.852 127.569 136.863 127.363 136.809C127.029 136.721 126.923 136.538 126.757 136.259C126.735 135.845 126.824 135.643 127.019 135.281Z" fill="#E4C575" />
                        <path d="M131.098 124.704C132.156 124.472 133.123 124.583 134.05 125.172C134.899 125.711 135.537 126.567 135.755 127.554C135.972 128.534 135.675 129.463 135.126 130.275C134.573 131.092 133.748 131.527 132.796 131.681C132.564 131.719 132.41 131.727 132.187 131.636C132.13 131.436 132.117 131.436 132.217 131.251C132.971 129.862 135.669 130.901 134.896 127.622C134.737 126.946 134.247 126.26 133.638 125.917C132.964 125.537 132.164 125.378 131.414 125.614C131.235 125.671 131.06 125.736 130.887 125.809L131.098 124.704Z" fill="url(#paint0_linear_21856_48738)" />
                        <path d="M25.3487 22.9485C25.337 21.9646 25.2174 20.7237 25.5365 19.7844L25.814 19.669L25.5774 19.6377L25.8192 19.6486C26.1523 20.7491 26.1067 21.8052 26.0675 22.9387C27.1076 22.9267 28.2642 22.8261 29.2386 23.2488L29.1478 23.5127C28.258 23.8972 27.0373 23.7763 26.0824 23.7525C26.1009 24.7427 26.1713 25.6042 25.8115 26.5491L25.6433 26.5907C25.1363 25.8395 25.3098 24.5769 25.3291 23.706C24.3286 23.7114 22.9042 23.8671 22.0098 23.3835L21.9941 23.2714C22.9332 22.7739 24.3109 22.9372 25.3487 22.9485Z" fill="#C9A74E" />
                        <path d="M41.9057 31.7168C42.0964 31.7652 42.1868 31.8411 42.3334 31.9694C42.589 32.8701 42.4421 34.0373 42.4255 34.9775C43.3928 34.9587 44.7066 34.7974 45.565 35.3073L45.5682 35.4562C44.7365 35.9981 43.3924 35.8676 42.4319 35.881C42.44 36.7302 42.6704 38.4901 42.1256 39.1517C41.9397 39.0322 41.9999 39.0856 41.8536 38.9396C41.4583 38.5451 41.622 36.4669 41.6224 35.8418C40.6313 35.8456 39.3051 35.979 38.4274 35.4614L38.4199 35.3145C39.3102 34.7955 40.6773 34.9625 41.6772 34.9779C41.655 34.0723 41.4231 32.4852 41.9057 31.7168Z" fill="url(#paint1_linear_21856_48738)" />
                        <path d="M130.887 125.809C129.999 127.148 128.577 128.284 127.932 129.747C127.496 130.737 127.946 132.225 127.424 133.018L127.609 132.823L127.349 132.987C127.167 132.849 127.075 132.674 126.991 132.466C125.736 129.354 129.263 127.673 130.129 125.254C130.162 125.161 130.19 125.067 130.212 124.971C130.235 124.876 130.253 124.779 130.266 124.682C130.279 124.584 130.286 124.486 130.289 124.388C130.291 124.29 130.289 124.192 130.281 124.094C130.273 123.996 130.261 123.898 130.243 123.802C130.225 123.705 130.202 123.609 130.174 123.515C130.146 123.421 130.113 123.328 130.076 123.238C130.038 123.147 129.996 123.058 129.949 122.972C129.906 122.892 129.86 122.815 129.809 122.741C129.759 122.666 129.705 122.594 129.647 122.525C129.59 122.456 129.529 122.39 129.465 122.327C129.4 122.264 129.333 122.204 129.263 122.148C129.193 122.092 129.12 122.039 129.045 121.99C128.969 121.941 128.891 121.896 128.811 121.855C128.731 121.814 128.649 121.777 128.566 121.744C128.482 121.711 128.397 121.682 128.31 121.658C128.222 121.633 128.132 121.613 128.042 121.597C127.952 121.582 127.861 121.57 127.769 121.564C127.677 121.557 127.586 121.555 127.494 121.558C127.402 121.561 127.311 121.568 127.22 121.579C127.129 121.591 127.039 121.607 126.949 121.628C126.86 121.649 126.772 121.674 126.685 121.704C126.598 121.733 126.513 121.767 126.429 121.805C126.346 121.843 126.264 121.885 126.185 121.931C125.33 122.432 125.245 122.998 124.944 123.835C124.853 124.088 124.728 124.138 124.495 124.24L124.256 124.144C124.191 124.032 124.174 124.018 124.143 123.875C124.021 123.306 124.543 122.345 124.902 121.935C125.501 121.25 126.433 120.852 127.335 120.802C127.397 120.798 127.46 120.797 127.523 120.797C127.585 120.797 127.648 120.799 127.71 120.802C127.773 120.805 127.835 120.81 127.898 120.817C127.96 120.824 128.022 120.832 128.084 120.842C128.146 120.852 128.207 120.863 128.268 120.876C128.33 120.889 128.391 120.904 128.451 120.92C128.512 120.936 128.572 120.954 128.631 120.974C128.691 120.993 128.75 121.014 128.808 121.036C128.867 121.059 128.925 121.083 128.982 121.108C129.039 121.134 129.095 121.161 129.151 121.189C129.207 121.218 129.262 121.248 129.316 121.279C129.371 121.31 129.424 121.343 129.477 121.377C129.529 121.411 129.581 121.447 129.631 121.483C129.682 121.52 129.732 121.558 129.78 121.598C129.829 121.637 129.877 121.678 129.923 121.72C129.97 121.762 130.015 121.805 130.06 121.849C130.902 122.682 131.094 123.572 131.098 124.704L130.887 125.809Z" fill="#E4C575" />
                        <path d="M58.3264 5.914C58.7583 5.86445 59.2101 5.81378 59.6454 5.84411C60.6637 5.91478 61.6854 6.34372 62.3431 7.14395C62.8087 7.71043 63.0305 8.3903 63.0738 9.11613C63.2307 11.7489 60.9475 12.6939 60.1222 14.8282C59.7309 15.8398 59.7895 17.2885 59.7003 18.3738C59.5275 18.5198 59.5241 18.5056 59.2952 18.5032C59.2199 18.4261 59.2057 18.4212 59.1506 18.3091C58.754 17.5045 58.9921 15.655 59.2317 14.819L59.2717 14.6826C59.9399 13.1465 61.3136 12.0918 61.9322 10.5909C62.2536 9.81158 62.2988 8.99383 61.9629 8.21093C61.7014 7.60168 61.2719 7.10513 60.6467 6.85872C60.1444 6.66094 59.6004 6.63265 59.0667 6.64188C56.5853 6.68483 57.612 8.73461 56.1685 9.34026C55.89 9.25135 55.8697 9.21612 55.683 8.98665C55.6316 8.73195 55.6691 8.56485 55.7735 8.33295C56.2915 7.18142 57.1524 6.34673 58.3264 5.914Z" fill="#E4C575" />
                        <path d="M166.143 101.799C166.445 101.717 166.62 101.699 166.925 101.763C167.144 101.905 167.262 102.009 167.357 102.257C167.617 102.933 167.522 104.146 167.232 104.792C168.014 104.79 168.967 104.645 169.71 104.898C170.066 105.02 170.278 105.116 170.452 105.445L170.322 105.677C169.385 106.266 168.306 106.137 167.245 106.133C167.536 106.71 167.571 107.762 167.428 108.396C167.345 108.766 167.178 108.849 166.891 109.049C166.759 109.163 166.626 109.161 166.458 109.198C165.565 108.698 166.157 106.969 165.748 106.12C165.06 106.121 164.267 106.182 163.63 105.894C163.303 105.746 163.103 105.621 162.982 105.285L163.154 105.038C164.047 104.558 164.876 104.688 165.848 104.737C166.202 104.043 166.047 102.607 166.143 101.799Z" fill="#C9A74E" />
                        <path d="M6.68951 46.8805C7.4679 46.8072 8.18809 46.8027 8.91562 47.1284C9.01846 47.1735 9.11888 47.2237 9.21683 47.279C9.31465 47.3342 9.40947 47.3943 9.50128 47.4591C9.59321 47.5237 9.68162 47.5929 9.76652 47.6666C9.85142 47.7402 9.93235 47.8179 10.0093 47.8997C10.0864 47.9814 10.1593 48.0669 10.2278 48.1561C10.2963 48.2451 10.3601 48.3374 10.4194 48.4328C10.4787 48.5284 10.533 48.6266 10.5823 48.7276C10.6317 48.8286 10.6759 48.9318 10.715 49.0371C11.0614 49.9568 11.0166 51.0568 10.5729 51.9358C10.0572 52.9574 9.24858 53.4289 8.21873 53.7898C7.49985 53.8497 6.78761 53.8819 6.10226 53.6144C5.20914 53.2657 4.53661 52.6 4.18134 51.7089C3.82321 50.8107 3.80534 49.7377 4.21449 48.8534C4.72073 47.7597 5.61181 47.2564 6.68951 46.8805Z" fill="#C9A74E" />
                        <path d="M7.42046 47.5996C7.81286 47.6463 8.21996 47.7166 8.5745 47.8991C8.66114 47.9431 8.74531 47.9913 8.82693 48.0438C8.9087 48.0964 8.98751 48.153 9.06334 48.2137C9.13917 48.2744 9.21176 48.3388 9.28111 48.4068C9.3503 48.475 9.41587 48.5465 9.47777 48.6214C9.53967 48.6963 9.59756 48.7741 9.65147 48.855C9.70535 48.9359 9.75497 49.0193 9.80028 49.1052C9.84562 49.1911 9.88638 49.2791 9.92254 49.3693C9.95885 49.4593 9.99042 49.5511 10.0173 49.6445C10.2153 50.3284 10.1424 51.0834 9.78179 51.7013C9.28805 52.5479 8.5236 52.8542 7.61975 53.0625C7.01336 53.0431 6.45556 52.9518 5.93485 52.6191C5.30886 52.219 4.89782 51.5956 4.76406 50.8664C4.74735 50.7727 4.73551 50.6784 4.72844 50.5834C4.7213 50.4886 4.7191 50.3936 4.72184 50.2984C4.72462 50.2033 4.73223 50.1086 4.74465 50.0143C4.7572 49.9199 4.77456 49.8264 4.79663 49.7338C4.81875 49.6413 4.84549 49.5501 4.87691 49.4603C4.90843 49.3705 4.94448 49.2825 4.98504 49.1964C5.02548 49.1103 5.07033 49.0266 5.11953 48.9451C5.16862 48.8636 5.22184 48.7848 5.27911 48.7088C5.8501 47.9555 6.53637 47.7439 7.42046 47.5996Z" fill="#FFFDF7" />
                        <path d="M107.634 134.045C109.029 133.936 110.364 134.166 111.523 134.985C111.597 135.037 111.67 135.092 111.741 135.148C111.812 135.204 111.882 135.262 111.95 135.322C112.018 135.382 112.085 135.443 112.15 135.506C112.215 135.569 112.278 135.634 112.34 135.7C112.402 135.767 112.462 135.834 112.521 135.904C112.579 135.973 112.636 136.044 112.691 136.116C112.746 136.188 112.799 136.261 112.851 136.336C112.902 136.411 112.951 136.487 112.999 136.564C113.046 136.641 113.092 136.72 113.135 136.799C113.179 136.879 113.221 136.959 113.26 137.041C113.3 137.123 113.337 137.205 113.372 137.289C113.408 137.372 113.441 137.457 113.472 137.542C113.504 137.627 113.533 137.713 113.559 137.799C113.586 137.886 113.611 137.973 113.633 138.061C113.656 138.149 113.676 138.237 113.694 138.326C113.712 138.415 113.728 138.504 113.742 138.594C113.97 140.029 113.647 141.585 112.784 142.762C111.856 144.028 110.519 144.699 108.996 144.943C107.634 144.949 106.418 144.766 105.254 144.01C105.178 143.96 105.103 143.909 105.03 143.856C104.957 143.802 104.885 143.747 104.814 143.691C104.744 143.634 104.675 143.575 104.607 143.515C104.539 143.454 104.473 143.392 104.409 143.328C104.344 143.265 104.282 143.199 104.22 143.133C104.159 143.066 104.1 142.997 104.042 142.927C103.984 142.858 103.929 142.786 103.874 142.714C103.82 142.641 103.768 142.567 103.718 142.491C103.667 142.416 103.619 142.34 103.572 142.262C103.526 142.184 103.481 142.105 103.438 142.025C103.396 141.945 103.355 141.864 103.317 141.782C103.278 141.7 103.242 141.617 103.208 141.533C103.173 141.449 103.141 141.365 103.111 141.279C103.081 141.194 103.053 141.107 103.028 141.02C103.002 140.933 102.979 140.846 102.957 140.758C102.936 140.67 102.917 140.581 102.9 140.492C102.882 140.404 102.866 140.315 102.853 140.226C102.839 140.137 102.828 140.048 102.819 139.958C102.81 139.869 102.803 139.779 102.798 139.689C102.794 139.599 102.791 139.51 102.791 139.42C102.791 139.329 102.793 139.24 102.797 139.15C102.801 139.06 102.808 138.97 102.816 138.881C102.825 138.791 102.836 138.702 102.849 138.612C102.862 138.524 102.878 138.435 102.895 138.347C102.913 138.258 102.932 138.171 102.954 138.083C102.976 137.996 103 137.909 103.026 137.823C103.052 137.737 103.081 137.652 103.111 137.567C103.141 137.482 103.174 137.398 103.209 137.315C103.243 137.232 103.28 137.15 103.318 137.068C103.357 136.987 103.397 136.907 103.44 136.828C103.483 136.748 103.527 136.67 103.574 136.593C103.62 136.516 103.668 136.44 103.719 136.366C104.66 134.987 106.035 134.343 107.634 134.045Z" fill="url(#paint2_linear_21856_48738)" />
                        <path d="M107.547 134.859C108.69 134.745 109.74 134.852 110.748 135.446C111.852 136.097 112.601 137.166 112.906 138.404C113.2 139.596 113.05 140.855 112.398 141.905C111.635 143.133 110.421 143.807 109.043 144.119C107.967 144.193 106.962 144.053 106.01 143.521C104.917 142.91 104.07 141.865 103.751 140.648C103.731 140.573 103.713 140.497 103.697 140.421C103.681 140.345 103.667 140.268 103.655 140.191C103.643 140.114 103.633 140.037 103.625 139.959C103.617 139.882 103.61 139.804 103.606 139.726C103.602 139.648 103.6 139.571 103.6 139.493C103.599 139.415 103.601 139.337 103.605 139.259C103.609 139.181 103.614 139.104 103.622 139.026C103.63 138.949 103.639 138.871 103.651 138.794C103.663 138.717 103.676 138.64 103.692 138.564C103.707 138.488 103.725 138.412 103.744 138.336C103.763 138.261 103.785 138.186 103.808 138.112C103.831 138.037 103.856 137.963 103.883 137.89C103.91 137.817 103.939 137.745 103.969 137.673C104 137.602 104.032 137.531 104.066 137.461C104.101 137.391 104.137 137.322 104.174 137.254C104.212 137.185 104.251 137.118 104.293 137.052C105.064 135.786 106.149 135.212 107.547 134.859Z" fill="#FFFDF7" />
                        <path d="M85.4809 13.6897C87.0392 13.5599 88.6414 13.6413 90.2056 13.6452L98.2802 13.655L123.526 13.6464L143.998 13.6449C147.25 13.6411 151.463 13.3807 154.597 13.7477C157.527 14.0902 160.526 15.1453 163.001 16.7317C166.535 18.9988 169.372 22.44 170.26 26.6142C170.708 28.7261 170.525 31.0935 170.535 33.2516L170.544 43.6467L170.563 58.0776C170.561 61.605 170.693 65.1769 170.18 68.6761C169.726 71.7701 168.764 74.8543 167.059 77.493C163.719 82.6609 157.687 84.7745 151.788 84.8101C150.163 84.8199 147.845 84.5381 146.312 84.919C145.736 85.062 145.276 85.3968 145.056 85.9594C144.594 87.1402 144.847 89.596 144.848 90.9117L144.861 101.51C144.869 103.362 145.021 105.329 144.844 107.168C144.818 107.439 144.759 107.659 144.606 107.888C144.317 108.316 143.767 108.689 143.26 108.787C142.652 108.904 142.132 108.489 141.685 108.119C140.116 106.82 138.254 104.418 136.819 102.851L124.981 89.8569C123.536 88.2813 122.01 86.1821 120.237 84.9844C120.202 84.9605 120.165 84.9379 120.13 84.9145C116.879 84.6781 113.132 84.8934 109.822 84.9012L109.86 101.584C109.862 104.541 110.038 107.566 109.749 110.508C109.673 111.296 109.553 112.077 109.39 112.852C109.226 113.627 109.02 114.39 108.772 115.142C106.586 121.893 102.032 126.791 95.7753 130C92.9923 131.441 89.7569 132.248 86.6491 132.543C82.9998 132.89 79.2312 132.685 75.5631 132.668C74.2363 132.662 72.8511 132.567 71.5343 132.71C70.8516 132.785 70.145 132.953 69.5435 133.296C68.2819 134.014 66.315 136.602 65.2866 137.749C61.8984 141.513 58.4909 145.26 55.0641 148.99C53.0465 151.212 51.0702 153.915 48.6322 155.679C48.2 155.992 47.4932 156.539 46.959 156.617C46.6131 156.668 46.1868 156.499 45.9357 156.264C45.5621 155.914 45.4233 155.41 45.3558 154.919C45.146 153.386 45.3475 151.258 45.3453 149.658L45.3609 135.702C45.3566 134.954 45.4581 133.63 44.7278 133.184C43.3566 132.348 39.5428 132.742 37.8219 132.713C37.6166 132.71 37.4113 132.705 37.2061 132.697C37.001 132.689 36.796 132.679 36.591 132.666C36.386 132.653 36.1813 132.638 35.9767 132.62C35.7721 132.603 35.5678 132.583 35.3637 132.56C35.1596 132.537 34.9559 132.512 34.7524 132.485C34.5488 132.457 34.3457 132.427 34.143 132.395C33.9401 132.362 33.7379 132.327 33.536 132.29C33.3341 132.253 33.1326 132.213 32.9317 132.171C32.7307 132.129 32.5303 132.084 32.3303 132.037C32.1304 131.99 31.9311 131.94 31.7324 131.889C31.5337 131.837 31.3357 131.783 31.1384 131.726C30.941 131.669 30.7444 131.61 30.5484 131.549C30.3524 131.487 30.1571 131.424 29.9628 131.358C29.7684 131.292 29.5748 131.223 29.382 131.152C29.1892 131.082 28.9974 131.009 28.8065 130.933C28.6155 130.858 28.4254 130.78 28.2363 130.7C28.0471 130.62 27.859 130.538 27.6719 130.453C27.4846 130.369 27.2985 130.282 27.1135 130.193C26.9285 130.104 26.7446 130.013 26.5617 129.919C26.3789 129.826 26.1971 129.73 26.0165 129.632C25.8359 129.535 25.6566 129.435 25.4785 129.332C25.3004 129.23 25.1236 129.126 24.9478 129.019C24.7723 128.913 24.598 128.804 24.4251 128.694C24.252 128.583 24.0803 128.47 23.91 128.356C23.7399 128.241 23.571 128.124 23.4035 128.005C23.2361 127.886 23.0701 127.765 22.9056 127.643C22.7411 127.52 22.578 127.395 22.4164 127.268C22.2549 127.141 22.095 127.012 21.9366 126.882C21.7781 126.751 21.6213 126.619 21.4662 126.484C21.311 126.35 21.1574 126.213 21.0054 126.075C20.8534 125.937 20.7032 125.797 20.5546 125.655C20.4061 125.513 20.2593 125.37 20.1142 125.225C15.3918 120.529 12.9802 114.236 12.9653 107.614L12.9773 88.8465C12.9654 77.9836 11.5927 69.5041 19.9608 61.1298C21.5366 59.5528 23.2969 58.267 25.2286 57.1578C30.6193 54.0629 35.1015 53.759 41.1924 53.737L49.5089 53.7294L69.5784 53.7372C69.6434 48.6667 69.6234 43.5896 69.6146 38.5183C69.6091 35.42 69.3092 31.9751 69.9148 28.9359C70.4073 26.4649 71.5114 24.0014 72.9926 21.9665C75.9949 17.842 80.3609 14.5059 85.4809 13.6897Z" fill="#E4C575" />
                        <path d="M70.3737 53.7143C70.2671 49.8379 70.3982 45.9415 70.3939 42.0625C70.3898 38.1321 69.945 32.0212 70.8682 28.3828C71.6657 25.2404 73.2419 22.6358 75.4514 20.2984C78.6146 16.9519 82.3611 14.5088 87.1106 14.3831C92.0859 14.2515 97.1033 14.4506 102.084 14.4559L130.901 14.3971L145.738 14.3835C148.965 14.3784 152.392 14.1416 155.58 14.6977C155.81 14.7359 156.038 14.7784 156.265 14.8252C156.494 14.8722 156.721 14.9234 156.946 14.9788C157.172 15.0341 157.396 15.0938 157.62 15.1577C157.843 15.2216 158.066 15.2898 158.287 15.3621C158.509 15.4345 158.729 15.5109 158.946 15.5916C159.165 15.6722 159.381 15.7569 159.596 15.8457C159.811 15.9345 160.024 16.0273 160.237 16.1241C160.448 16.2209 160.657 16.3218 160.866 16.4267C161.073 16.5314 161.278 16.64 161.482 16.7526C161.685 16.8651 161.887 16.9815 162.086 17.1016C162.285 17.2218 162.481 17.3457 162.676 17.4733C162.871 17.6009 163.063 17.7321 163.253 17.8668C163.442 18.0017 163.629 18.1401 163.814 18.282C163.997 18.4239 164.179 18.5693 164.358 18.7182C164.537 18.8668 164.712 19.0189 164.886 19.1744C165.059 19.3298 165.229 19.4884 165.396 19.6503C168.582 22.7034 169.674 26.1683 169.748 30.4792C169.87 37.7738 169.759 45.0811 169.769 52.377L169.763 60.8428C169.748 63.9559 169.787 67.1069 169.145 70.1695C168.469 73.4051 167.118 76.6536 164.79 79.0449C161.467 82.4579 157.14 83.9353 152.468 83.97C150.724 83.983 147.346 83.6938 145.83 84.1561C145.456 84.2705 145.128 84.4982 144.85 84.7699C144.798 84.8196 144.749 84.8714 144.701 84.9253C144.654 84.9793 144.608 85.035 144.566 85.0926C144.523 85.1502 144.482 85.2095 144.444 85.2706C144.407 85.3315 144.371 85.3939 144.339 85.4578C144.306 85.5216 144.276 85.5867 144.248 85.6532C144.221 85.7195 144.196 85.7869 144.174 85.8553C144.153 85.9237 144.134 85.9929 144.118 86.0629C144.102 86.1329 144.088 86.2034 144.078 86.2745C143.792 88.1447 144.019 90.5179 144.025 92.4511L144.04 105.603C144.037 106.192 144.071 107.904 143.246 107.918C142.551 107.929 141.768 107.109 141.324 106.633C136.156 101.096 131.203 95.3528 126.047 89.8038C124.697 88.3514 122.537 85.6844 121.036 84.576C120.462 84.1524 119.872 84.1077 119.184 84.0787C116.09 83.9483 112.938 84.08 109.838 84.077C109.786 79.1165 110.219 74.4767 108.503 69.6982C107.038 65.5873 104.199 62.2047 100.983 59.3441C100.485 59.0001 100.014 58.5823 99.5381 58.2065C94.6935 54.9211 89.7748 53.6347 83.9559 53.6957C79.4328 53.7953 74.8987 53.6985 70.3737 53.7143Z" fill="#FFFDF7" />
                        <path d="M100.982 59.3436C109.145 59.2167 117.308 59.1802 125.471 59.234L132.41 59.2485C133.731 59.253 135.121 59.1631 136.428 59.3654C137.592 59.5459 138.7 60.0257 139.555 60.8501C140.581 61.8385 141.016 63.2064 141.026 64.6072C141.035 65.9117 140.65 67.1631 139.722 68.1064C138.225 69.6274 136.295 69.6984 134.295 69.6912C125.704 69.6607 117.091 69.5705 108.503 69.6976C107.038 65.5868 104.199 62.2042 100.982 59.3436Z" fill="url(#paint3_linear_21856_48738)" />
                        <path d="M83.957 53.6951C84.0282 52.0961 84.3978 50.6652 85.6119 49.5436C86.5684 48.6599 87.8088 48.1831 89.0932 48.0493C91.5064 47.7982 94.848 48.0077 97.3681 48.0072L114.728 47.9974L139.032 48.0085L146.403 48.003C147.932 47.9904 149.497 47.9022 151.022 47.9853C152.482 48.0648 153.851 48.5346 154.84 49.6525C155.86 50.8048 156.259 52.1472 156.165 53.6738C156.086 54.9545 155.441 56.1296 154.486 56.972C153.729 57.6398 152.906 57.9128 151.921 58.0507C150.567 58.2404 149.127 58.1443 147.759 58.1468L140.556 58.1572L112.372 58.1689L104.01 58.1634C102.557 58.1607 100.981 58.0458 99.5392 58.2059C94.6946 54.9206 89.776 53.6341 83.957 53.6951Z" fill="url(#paint4_linear_21856_48738)" />
                        <path d="M103.301 36.7936L136.558 36.7836L146.31 36.7772C148.25 36.7762 150.278 36.6491 152.199 36.9309C153.05 37.0556 153.864 37.616 154.476 38.2006C154.538 38.2592 154.598 38.3194 154.657 38.3811C154.716 38.4427 154.773 38.5058 154.828 38.5704C154.884 38.6348 154.938 38.7007 154.99 38.768C155.042 38.8353 155.092 38.9039 155.141 38.9737C155.19 39.0436 155.237 39.1146 155.282 39.1868C155.328 39.259 155.371 39.3323 155.412 39.4067C155.454 39.481 155.493 39.5564 155.531 39.6329C155.569 39.7093 155.605 39.7866 155.638 39.8648C155.672 39.9429 155.704 40.0219 155.733 40.1018C155.763 40.1816 155.79 40.2621 155.815 40.3433C155.842 40.4244 155.866 40.5062 155.887 40.5886C155.908 40.671 155.928 40.7539 155.945 40.8372C155.963 40.9206 155.978 41.0044 155.991 41.0886C156.004 41.1728 156.016 41.2573 156.025 41.3419C156.033 41.4266 156.04 41.5115 156.043 41.5966C156.048 41.6817 156.051 41.7668 156.051 41.8519C156.055 43.0871 155.667 44.4587 154.778 45.3466C154.188 45.9349 153.28 46.4806 152.479 46.6954C150.522 47.2191 147.982 46.9442 145.95 46.9442L136.576 46.9384L103.761 46.9531L94.4225 46.9465C92.5832 46.9441 90.6255 47.0597 88.8067 46.812C87.5982 46.6472 86.5858 46.254 85.6793 45.4191C85.6182 45.3634 85.5585 45.3063 85.5002 45.2477C85.4419 45.189 85.3852 45.1289 85.3299 45.0674C85.2746 45.0057 85.221 44.9428 85.169 44.8786C85.117 44.8143 85.0667 44.7487 85.0179 44.6818C84.9692 44.615 84.9222 44.547 84.877 44.4778C84.8318 44.4084 84.7884 44.3381 84.7467 44.2668C84.705 44.1953 84.6651 44.1229 84.6272 44.0494C84.5893 43.9759 84.5532 43.9015 84.5189 43.8262C84.4847 43.7508 84.4525 43.6747 84.4223 43.5978C84.3919 43.5209 84.3635 43.4432 84.3371 43.3648C84.3107 43.2863 84.2864 43.2073 84.264 43.1276C84.2417 43.048 84.2214 42.9679 84.2032 42.8873C84.1848 42.8066 84.1686 42.7256 84.1544 42.6441C84.1403 42.5626 84.1282 42.4807 84.1182 42.3986C84.1082 42.3165 84.1002 42.2342 84.0945 42.1516C84.0887 42.0691 84.085 41.9865 84.0834 41.9039C84.0815 41.8224 84.0816 41.7409 84.0837 41.6594C84.086 41.5779 84.0902 41.4965 84.0964 41.4151C84.1025 41.3338 84.1108 41.2527 84.1211 41.1717C84.1312 41.0908 84.1434 41.0103 84.1576 40.93C84.1718 40.8496 84.188 40.7697 84.2062 40.6902C84.2244 40.6107 84.2446 40.5317 84.2665 40.4532C84.2886 40.3747 84.3126 40.2968 84.3385 40.2194C84.3645 40.1422 84.3924 40.0655 84.4221 39.9896C84.4518 39.9136 84.4833 39.8384 84.5167 39.7641C84.5502 39.6897 84.5855 39.6163 84.6226 39.5437C84.6596 39.471 84.6985 39.3993 84.7392 39.3286C84.7797 39.2579 84.8221 39.1882 84.8661 39.1196C84.9102 39.051 84.956 38.9835 85.0035 38.9171C85.0508 38.8508 85.0998 38.7857 85.1504 38.7217C85.2012 38.6578 85.2535 38.5952 85.3072 38.5339C85.3608 38.4726 85.416 38.4127 85.4728 38.354C85.5511 38.2736 85.6323 38.196 85.7162 38.1212C85.7999 38.0465 85.8862 37.9747 85.975 37.9058C86.0638 37.837 86.1548 37.7714 86.2481 37.709C86.3415 37.6464 86.4369 37.5873 86.5343 37.5315C86.6317 37.4757 86.731 37.4232 86.8321 37.3742C86.9331 37.3253 87.0357 37.2799 87.14 37.2381C87.2442 37.1962 87.3498 37.1581 87.4566 37.1235C87.5635 37.089 87.6715 37.0582 87.7805 37.0312C89.7447 36.5467 92.1138 36.7871 94.1346 36.7878L103.301 36.7936Z" fill="url(#paint5_linear_21856_48738)" />
                        <path d="M71.0977 54.5755L81.2181 54.5419C83.7197 54.5378 86.2402 54.4506 88.727 54.7768C93.6852 55.4275 98.4802 58.0129 102.051 61.4708C106.252 65.5378 108.964 71.089 109.059 76.9814C109.171 83.95 109.097 90.9415 109.094 97.9118L109.084 104.814C109.081 107.559 109.19 110.318 108.551 113.009C108.486 113.275 108.416 113.54 108.343 113.804C108.269 114.067 108.191 114.33 108.108 114.591C108.026 114.852 107.939 115.111 107.848 115.37C107.757 115.628 107.662 115.884 107.562 116.139C107.462 116.394 107.359 116.648 107.251 116.899C107.143 117.151 107.031 117.401 106.914 117.648C106.798 117.896 106.678 118.142 106.553 118.386C106.429 118.63 106.301 118.872 106.168 119.111C106.036 119.351 105.899 119.588 105.759 119.823C105.619 120.058 105.475 120.291 105.327 120.521C105.179 120.751 105.027 120.979 104.872 121.205C104.716 121.43 104.557 121.653 104.394 121.873C104.231 122.092 104.065 122.31 103.894 122.524C103.724 122.739 103.551 122.95 103.374 123.159C103.197 123.368 103.016 123.573 102.832 123.776C102.648 123.979 102.461 124.178 102.27 124.375C101.807 124.85 101.325 125.305 100.823 125.74C100.322 126.174 99.8026 126.587 99.2663 126.978C98.73 127.369 98.1783 127.737 97.6112 128.081C97.044 128.426 96.4634 128.746 95.8694 129.042C88.2284 132.893 80.5313 131.679 72.2947 131.848C71.224 131.87 69.9735 132.033 69.0664 132.648C67.2408 133.887 64.3295 137.565 62.7192 139.359L54.8164 148.061C53.0938 149.964 51.4172 151.913 49.6387 153.765C48.9692 154.414 48.1952 155.092 47.3932 155.57C47.0692 155.763 46.8808 155.846 46.5212 155.758C46.2669 155.376 46.22 154.905 46.1834 154.457C46.0101 152.323 46.1503 150.079 46.1557 147.933L46.1397 135.356C46.1292 134.345 45.9321 132.845 44.9369 132.333C43.5137 131.601 41.3782 131.885 39.8266 131.893C38.2906 131.9 36.7304 131.925 35.2013 131.753C34.8717 131.713 34.5429 131.666 34.2151 131.613C33.8874 131.56 33.5608 131.5 33.2354 131.434C32.91 131.367 32.5861 131.294 32.2637 131.215C31.9413 131.135 31.6206 131.049 31.3016 130.957C30.9826 130.864 30.6657 130.766 30.3509 130.66C30.0359 130.555 29.7232 130.443 29.4127 130.325C29.1023 130.207 28.7944 130.083 28.4889 129.953C28.1835 129.822 27.8808 129.686 27.5809 129.543C27.281 129.401 26.9841 129.252 26.6902 129.097C26.3964 128.943 26.1058 128.782 25.8184 128.616C25.531 128.449 25.247 128.277 24.9666 128.099C24.6861 127.921 24.4094 127.738 24.1365 127.549C23.8635 127.359 23.5944 127.165 23.3291 126.965C23.064 126.765 22.803 126.56 22.5462 126.349C22.2894 126.139 22.0369 125.923 21.7887 125.702C21.5406 125.481 21.297 125.256 21.058 125.025C20.9173 124.891 20.7784 124.754 20.6411 124.616C20.5038 124.478 20.3683 124.338 20.2346 124.197C20.1007 124.056 19.9687 123.913 19.8384 123.768C19.7082 123.623 19.5797 123.477 19.453 123.329C19.3264 123.181 19.2017 123.032 19.0787 122.881C18.9557 122.73 18.8346 122.578 18.7155 122.424C18.5963 122.27 18.4791 122.114 18.3638 121.958C18.2483 121.801 18.1349 121.642 18.0235 121.483C17.9121 121.323 17.8028 121.162 17.6954 121C17.5878 120.837 17.4824 120.674 17.3791 120.509C17.2757 120.344 17.1744 120.178 17.0752 120.01C16.976 119.843 16.8788 119.674 16.7837 119.504C16.6885 119.334 16.5955 119.163 16.5048 118.991C16.414 118.819 16.3253 118.646 16.2388 118.471C16.1522 118.297 16.0678 118.121 15.9856 117.945C15.9033 117.768 15.8233 117.591 15.7456 117.413C15.6677 117.234 15.5921 117.055 15.5188 116.874C15.4453 116.694 15.3742 116.513 15.3053 116.331C15.2364 116.149 15.1698 115.966 15.1055 115.782C15.0411 115.598 14.979 115.414 14.9192 115.228C14.8594 115.043 14.8019 114.857 14.7468 114.67C14.6915 114.484 14.6386 114.296 14.5882 114.108C14.5376 113.92 14.4893 113.732 14.4435 113.543C14.3976 113.353 14.3541 113.164 14.3129 112.973C14.2718 112.783 14.2329 112.592 14.1965 112.401C14.16 112.21 14.1258 112.018 14.0942 111.826C14.0624 111.634 14.0331 111.441 14.0062 111.249C13.9792 111.056 13.9546 110.863 13.9325 110.669C13.9103 110.476 13.8905 110.282 13.8732 110.088C13.8559 109.894 13.8409 109.7 13.8283 109.506C13.8158 109.312 13.8056 109.117 13.7978 108.923C13.79 108.728 13.7847 108.534 13.7818 108.339C13.7157 102.185 13.7737 96.0205 13.7705 89.8651L13.7714 81.7334C13.7748 78.4129 13.6725 75.1474 14.5338 71.9091C15.5658 68.0295 17.6144 64.6925 20.4157 61.8474C20.6116 61.6521 20.8107 61.4602 21.013 61.2715C21.2154 61.0829 21.4207 60.8977 21.6292 60.7158C21.8376 60.5339 22.0489 60.3555 22.2633 60.1806C22.4777 60.0058 22.6949 59.8345 22.9149 59.6669C23.135 59.4992 23.3577 59.3352 23.5831 59.175C23.8085 59.0147 24.0366 58.8583 24.2673 58.7055C24.4979 58.5528 24.731 58.404 24.9666 58.2589C25.2022 58.1139 25.4401 57.9729 25.6804 57.8358C25.9205 57.6986 26.1629 57.5656 26.4075 57.4366C26.6523 57.3075 26.8991 57.1825 27.1479 57.0615C27.3967 56.9407 27.6473 56.824 27.8999 56.7113C28.1526 56.5988 28.407 56.4904 28.6632 56.3862C28.9195 56.282 29.1775 56.1822 29.4371 56.0867C29.6966 55.9911 29.9576 55.8998 30.2202 55.8127C30.4828 55.7258 30.7467 55.6432 31.012 55.565C31.2773 55.4868 31.5439 55.413 31.8117 55.3437C35.0181 54.5359 38.1132 54.5856 41.3928 54.5946L48.4072 54.5918L71.0977 54.5755Z" fill="#FFFDF7" />
                        <path d="M60.7538 68.2261C60.7873 68.2218 60.8207 68.2167 60.8542 68.2131C67.8136 67.4756 74.8295 70.164 80.1368 74.5631C80.2921 74.6896 80.4459 74.818 80.5981 74.9483C80.7503 75.0786 80.9009 75.2107 81.0499 75.3447C81.1988 75.4787 81.3462 75.6146 81.4918 75.7523C81.6374 75.89 81.7812 76.0294 81.9234 76.1705C82.0656 76.3117 82.2059 76.4546 82.3444 76.5993C82.4831 76.744 82.6199 76.8903 82.7549 77.0384C82.8899 77.1865 83.0231 77.3362 83.1545 77.4875C83.2857 77.6389 83.4151 77.7918 83.5427 77.9462C83.6702 78.1008 83.7958 78.2569 83.9195 78.4145C84.0432 78.5721 84.165 78.7313 84.2848 78.8921C84.4045 79.0527 84.5222 79.2148 84.638 79.3783C84.7538 79.5418 84.8675 79.7068 84.9792 79.8732C85.0908 80.0396 85.2004 80.2073 85.3081 80.3763C85.4156 80.5453 85.521 80.7157 85.6244 80.8874C85.7277 81.059 85.8289 81.232 85.9278 81.4062C86.027 81.5804 86.1239 81.7558 86.2187 81.9324C86.3134 82.1089 86.4059 82.2866 86.4962 82.4655C86.5866 82.6443 86.6748 82.8242 86.7607 83.0052C86.8466 83.1863 86.9303 83.3683 87.0116 83.5515C87.0932 83.7344 87.1723 83.9185 87.2492 84.1036C87.3261 84.2886 87.4006 84.4746 87.4728 84.6616C87.5452 84.8485 87.6151 85.0362 87.6827 85.2249C87.7504 85.4134 87.8157 85.6027 87.8786 85.793C87.9417 85.9833 88.0023 86.1743 88.0606 86.366C88.1188 86.5577 88.1747 86.7501 88.2282 86.9433C88.2818 87.1364 88.3329 87.3301 88.3816 87.5244C88.4303 87.7188 88.4766 87.9138 88.5204 88.1093C88.5644 88.3048 88.6059 88.5007 88.645 88.6973C88.684 88.8938 88.7206 89.0909 88.7547 89.2884C88.7891 89.4859 88.8208 89.6836 88.8501 89.8818C88.8794 90.0801 88.9063 90.2787 88.9307 90.4775C88.9552 90.6764 88.9771 90.8756 88.9966 91.075C89.6228 98.0088 87.8324 104.615 83.3308 109.992C79.2115 114.912 72.6629 118.597 66.2201 119.156C66.0339 119.183 65.8471 119.206 65.6599 119.225C65.4558 119.245 65.2515 119.262 65.047 119.277C64.8425 119.292 64.6378 119.304 64.4331 119.314C64.2283 119.324 64.0234 119.332 63.8184 119.336C63.6134 119.341 63.4083 119.344 63.2034 119.344C62.9983 119.344 62.7933 119.341 62.5883 119.336C62.3833 119.331 62.1785 119.323 61.9736 119.313C61.7689 119.303 61.5643 119.29 61.3597 119.275C61.1552 119.26 60.9509 119.242 60.7469 119.222C60.5429 119.202 60.3392 119.179 60.1356 119.154C59.9321 119.129 59.729 119.102 59.5261 119.072C59.3233 119.042 59.1209 119.009 58.9188 118.974C58.7167 118.939 58.5152 118.902 58.3141 118.862C58.113 118.822 57.9124 118.78 57.7122 118.735C57.5122 118.69 57.3127 118.643 57.1137 118.593C56.9148 118.543 56.7165 118.491 56.5188 118.437C56.3211 118.382 56.1241 118.325 55.9278 118.266C55.7316 118.207 55.536 118.145 55.3412 118.081C55.1464 118.017 54.9525 117.951 54.7593 117.882C54.5662 117.813 54.3738 117.742 54.1825 117.668C53.9911 117.595 53.8006 117.519 53.6111 117.441C53.4215 117.363 53.2329 117.282 53.0452 117.199C52.8576 117.117 52.671 117.032 52.4855 116.944C52.3 116.857 52.1156 116.767 51.9322 116.676C51.7489 116.584 51.5667 116.49 51.3856 116.394C51.2046 116.297 51.0247 116.199 50.846 116.098C50.6673 115.998 50.4899 115.895 50.3138 115.79C50.1376 115.685 49.9628 115.578 49.7892 115.469C49.6158 115.359 49.4436 115.248 49.2726 115.135C49.1018 115.021 48.9325 114.906 48.7645 114.788C48.5965 114.67 48.4299 114.551 48.2648 114.429C48.0998 114.308 47.9362 114.184 47.7741 114.058C47.6121 113.933 47.4516 113.805 47.2926 113.676C41.9419 109.335 38.4011 103.342 37.7043 96.4309C37.6811 96.2204 37.6604 96.0097 37.6425 95.7987C37.6247 95.5877 37.6094 95.3766 37.5967 95.1652C37.584 94.9538 37.574 94.7423 37.5666 94.5307C37.5591 94.3191 37.5542 94.1074 37.5521 93.8956C37.5499 93.6839 37.5505 93.4722 37.5536 93.2604C37.5567 93.0487 37.5625 92.837 37.5709 92.6253C37.5793 92.4139 37.5904 92.2024 37.6041 91.9911C37.6178 91.7798 37.6341 91.5687 37.653 91.3577C37.6719 91.1469 37.6934 90.9363 37.7176 90.7259C37.7418 90.5155 37.7686 90.3055 37.7981 90.0957C37.8275 89.8862 37.8594 89.6769 37.894 89.4679C37.9286 89.259 37.9659 89.0506 38.0057 88.8426C38.0455 88.6346 38.0879 88.4272 38.1328 88.2202C38.1779 88.0134 38.2255 87.8071 38.2756 87.6014C38.3257 87.3955 38.3784 87.1904 38.4337 86.9861C38.4888 86.7816 38.5466 86.5779 38.607 86.375C38.6673 86.1721 38.73 85.9699 38.7954 85.7684C38.8607 85.567 38.9285 85.3664 38.9988 85.1667C39.0693 84.967 39.1421 84.7682 39.2173 84.5703C39.2927 84.3724 39.3704 84.1755 39.4506 83.9796C39.5308 83.7835 39.6134 83.5885 39.6985 83.3946C39.7835 83.2007 39.871 83.0079 39.9609 82.8163C40.0507 82.6245 40.1429 82.434 40.2374 82.2446C40.3321 82.055 40.4291 81.8668 40.5283 81.6798C40.6276 81.4928 40.7292 81.307 40.8331 81.1226C40.9371 80.9381 41.0433 80.7549 41.1519 80.5731C41.2602 80.3912 41.3709 80.2108 41.484 80.0318C41.597 79.8527 41.7122 79.6751 41.8295 79.4989C41.9469 79.3227 42.0665 79.1479 42.1883 78.9746C42.31 78.8014 42.4339 78.6297 42.56 78.4596C42.686 78.2896 42.8141 78.121 42.9443 77.954C43.0746 77.7871 43.2068 77.6218 43.3412 77.4581C47.7223 72.1149 53.8965 68.9011 60.7538 68.2261Z" fill="#C9A74E" />
                        <path d="M62.6174 108.466C63.5054 108.396 64.2769 108.441 65.0807 108.867C66.0367 109.374 66.73 110.296 67.0176 111.332C67.0365 111.399 67.0536 111.467 67.0691 111.535C67.0845 111.603 67.0983 111.671 67.1103 111.74C67.1224 111.809 67.1327 111.878 67.1413 111.947C67.1498 112.016 67.1566 112.086 67.1618 112.155C67.1669 112.225 67.1703 112.295 67.1719 112.364C67.1735 112.434 67.1734 112.504 67.1715 112.574C67.1697 112.643 67.1661 112.713 67.1608 112.783C67.1554 112.852 67.1483 112.922 67.1395 112.991C67.1307 113.06 67.1203 113.129 67.1081 113.198C67.0958 113.267 67.0818 113.335 67.0663 113.403C67.0506 113.471 67.0332 113.539 67.0141 113.606C66.9951 113.673 66.9744 113.74 66.9519 113.806C66.9295 113.872 66.9055 113.937 66.8799 114.002C66.8543 114.067 66.827 114.131 66.7981 114.195C66.7693 114.259 66.7389 114.321 66.707 114.383C66.675 114.445 66.6414 114.507 66.6064 114.567C65.9612 115.666 65.0422 116.147 63.8611 116.452C63.0503 116.548 62.3173 116.516 61.5564 116.183C61.4974 116.158 61.439 116.13 61.3812 116.101C61.3236 116.073 61.2667 116.042 61.2105 116.01C61.1544 115.979 61.0991 115.946 61.0447 115.911C60.9904 115.876 60.9368 115.841 60.8842 115.803C60.8316 115.766 60.78 115.727 60.7294 115.687C60.6788 115.647 60.6293 115.606 60.5807 115.564C60.5323 115.521 60.4848 115.478 60.4385 115.433C60.3923 115.388 60.3472 115.342 60.3032 115.294C60.2593 115.247 60.2166 115.199 60.1752 115.149C60.1337 115.1 60.0936 115.05 60.0548 114.998C60.0159 114.947 59.9783 114.894 59.9421 114.841C59.906 114.787 59.8712 114.733 59.8378 114.678C59.8044 114.623 59.7724 114.567 59.7419 114.51C59.7112 114.453 59.6821 114.396 59.6547 114.337C59.627 114.279 59.6009 114.22 59.5763 114.161C59.5517 114.101 59.5286 114.041 59.5071 113.98C59.4839 113.916 59.4622 113.852 59.4422 113.787C59.422 113.722 59.4036 113.656 59.3868 113.59C59.3699 113.524 59.3548 113.458 59.3413 113.392C59.3278 113.325 59.3159 113.258 59.3057 113.191C59.2956 113.124 59.2871 113.056 59.2803 112.988C59.2735 112.921 59.2684 112.853 59.2651 112.785C59.2617 112.717 59.2599 112.649 59.2598 112.581C59.2598 112.513 59.2615 112.445 59.2649 112.377C59.2683 112.309 59.2733 112.242 59.2799 112.174C59.2867 112.106 59.2951 112.039 59.3052 111.972C59.3153 111.904 59.3271 111.837 59.3406 111.771C59.354 111.704 59.3691 111.638 59.3858 111.572C59.4026 111.506 59.421 111.441 59.441 111.376C59.4609 111.311 59.4825 111.246 59.5057 111.182C59.529 111.119 59.5538 111.055 59.5802 110.993C59.6065 110.93 59.6345 110.868 59.664 110.807C60.2813 109.533 61.3244 108.91 62.6174 108.466Z" fill="#FFFDF7" />
                        <path d="M62.5993 71.2803C63.1818 71.2442 63.7624 71.2193 64.346 71.2399C67.1327 71.3376 69.5433 72.5955 71.4162 74.6413C72.9423 76.3081 73.8186 78.4827 74.1581 80.6976C74.8939 85.4996 72.9731 88.87 69.736 92.2039C68.642 93.3307 67.512 94.4187 66.9673 95.9328C66.2978 97.7943 66.7149 103.617 66.616 105.958C64.4762 105.945 62.3364 105.943 60.1965 105.953C60.1308 103.345 60.1174 100.738 60.1564 98.1302C60.1592 96.7976 60.1805 95.4932 60.5177 94.1933C61.8375 89.1064 67.1644 87.1154 67.5165 83.1673C67.6408 81.7725 67.3352 80.207 66.4033 79.1225C65.7951 78.4144 64.9394 77.943 63.9983 77.8973C63.9417 77.8945 63.8852 77.8932 63.8285 77.8933C63.7719 77.8936 63.7153 77.8953 63.6588 77.8984C63.6021 77.9015 63.5457 77.9061 63.4895 77.9121C63.4332 77.9182 63.3771 77.9258 63.3212 77.9347C63.2652 77.9438 63.2096 77.9543 63.1543 77.9662C63.099 77.9781 63.0439 77.9915 62.9893 78.0063C62.9346 78.0211 62.8803 78.0373 62.8266 78.0549C62.7727 78.0727 62.7194 78.0917 62.6666 78.1122C62.6137 78.1326 62.5615 78.1544 62.5099 78.1776C62.4581 78.2007 62.407 78.2252 62.3567 78.2511C62.3063 78.2769 62.2567 78.3041 62.2077 78.3325C62.1587 78.361 62.1105 78.3907 62.063 78.4216C62.0155 78.4526 61.969 78.4847 61.9232 78.518C61.8775 78.5514 61.8327 78.586 61.7887 78.6219C61.7448 78.6575 61.7018 78.6944 61.6599 78.7324C61.6178 78.7704 61.5768 78.8094 61.5368 78.8496C60.2171 80.159 60.1722 81.9705 60.1924 83.7065C57.9368 83.6999 55.6813 83.6792 53.4259 83.6443C53.2593 80.5371 53.771 77.5013 55.7292 75.0004C57.4407 72.8147 59.8691 71.5985 62.5993 71.2803Z" fill="#FFFDF7" />
                        <defs>
                          <linearGradient id="paint0_linear_21856_48738" x1="130.887" y1="128.149" x2="135.422" y2="129.503" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFF2D0" />
                            <stop offset="1" stopColor="#8E6B0F" />
                          </linearGradient>
                          <linearGradient id="paint1_linear_21856_48738" x1="38.4199" y1="35.4342" x2="44.5247" y2="37.9583" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFF2D0" />
                            <stop offset="1" stopColor="#8E6B0F" />
                          </linearGradient>
                          <linearGradient id="paint2_linear_21856_48738" x1="102.791" y1="139.482" x2="112.067" y2="143.506" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFF2D0" />
                            <stop offset="1" stopColor="#8E6B0F" />
                          </linearGradient>
                          <linearGradient id="paint3_linear_21856_48738" x1="100.982" y1="64.4538" x2="111.817" y2="82.2433" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFF2D0" />
                            <stop offset="1" stopColor="#8E6B0F" />
                          </linearGradient>
                          <linearGradient id="paint4_linear_21856_48738" x1="83.957" y1="53.0659" x2="91.0886" y2="74.6109" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFF2D0" />
                            <stop offset="1" stopColor="#8E6B0F" />
                          </linearGradient>
                          <linearGradient id="paint5_linear_21856_48738" x1="84.082" y1="41.8719" x2="91.2444" y2="63.4165" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FFF2D0" />
                            <stop offset="1" stopColor="#8E6B0F" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className={styles.noQnaYetText}>
                        <h4 className={styles.emptyTitle}>No questions have been asked yet</h4>
                        <p>Be the first one to ask what matters about this deal.</p>
                      </div>
                    </div>
                  )}
              {loading && <p className={styles.loading}>Posting your question...</p>}

            </div>
          </div>

        </div>

        {/* Input */}
        <div className={styles.ask_your_ques_wrap}>
          <div className={styles.ask_your_ques}>
            <textarea
              rows="1"
              ref={textareaRef}
              placeholder="Looking forward to the detailed prospectus."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />

            <div className={styles.img}>
              <img
                src="/assets/pictures/send-ques-logo.svg"
                alt="send"
                onClick={handleSendMessageWrapper}
              />
            </div>
          </div>

              {/* Optional Ask AI button hidden inside Q&A to prevent UI overlay */}
        </div>

      </div>
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
    </>
  );
};

export default QuestionAnswer;
