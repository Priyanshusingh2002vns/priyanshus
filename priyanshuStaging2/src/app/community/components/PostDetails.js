"use client";
import Styles from "./PostSection/postSection.module.css";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import CommentSection from "./CommentSection/CommentSection";
import { showErrorToast, showSuccessToast } from "../../components/ToastProvider";

import ImageSlide from "./ImageSlide";
import imageStyles from "./imageSide.module.css";
import { X, ExternalLink } from "lucide-react";
import { formatPostContent } from "../utils/contentFormatter";
import ShareModal from "./CommentSection/ShareModal";
import Loader from "../../components/Loader";
import SigninPopup from "../../sign-in/SigninPopup";
import OtpPopup from "../../otp/OtpPopup";
import SignupTypePopup from "../../signup/SignupTypePopup";
import SignupFormPopup from "../../signup-form/SignupFormPopup";

const getInitial = (fullName) => {
  if (!fullName || typeof fullName !== "string") return "A";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return `${first}${last}`.toUpperCase();
};

const normalizePostData = (post) => {
  if (!post) return null;
  const currentUserId = typeof window !== "undefined" ? Cookies.get("investorId") : null;
  const rawLikes = post.likesCount ?? post.likes_count ?? post.like_count ?? (Array.isArray(post.likes) ? post.likes.length : undefined);
  const likesCount = rawLikes !== undefined && rawLikes !== null ? Number(rawLikes) : 0;
  const isLiked = !!(
    post.isLiked ||
    post.is_liked ||
    (currentUserId && Array.isArray(post.likes) && post.likes.some((l) => (typeof l === "string" ? l === currentUserId : l?.userId === currentUserId || l?.user_id === currentUserId)))
  );
  return {
    ...post,
    isLiked,
    likesCount: isNaN(likesCount) ? 0 : likesCount,
  };
};

const PostDetails = ({ slug, initialPost }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  // const [showDot, setShowDot] = useState(false);
  const [posts, setPosts] = useState(() => (initialPost ? [normalizePostData(initialPost)] : []));
  const [dotId, setDotId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentonPost, setCommentonPost] = useState("");
  const [refetch, setRefetch] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [mounted, setMounted] = useState(false);
  const [investorName, setInvestorName] = useState("");
  const [investorEmail, setInvestorEmail] = useState("");
  const [isLoading, setIsLoading] = useState(!initialPost);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showSignin, setShowSignin] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSource, setOtpSource] = useState(""); // 'signin' | 'signup'
  const [otpPayload, setOtpPayload] = useState(null);
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupType, setSignupType] = useState("individual");
  const [currentTime, setCurrentTime] = useState(null);
  const isFetchingRef = useRef(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(initialPost?.id || undefined);
  const [commentRefetch, setCommentRefetch] = useState(false);
  const [contentModalImage, setContentModalImage] = useState(null);

  useEffect(() => {
    if (contentModalImage) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setContentModalImage(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [contentModalImage]);

  const handleContentClick = (e) => {
    if (e.target && e.target.tagName === "IMG") {
      const src = e.target.currentSrc || e.target.src;
      if (src) {
        e.stopPropagation();
        setContentModalImage(src);
      }
    }
  };

  // Function to calculate time remaining for poll
  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return "Poll ended";
    const expiryDate = new Date(expiresAt);
    const now = currentTime || new Date();

    if (isNaN(expiryDate.getTime())) return "Invalid date";

    const timeDiff = expiryDate.getTime() - now.getTime();

    if (timeDiff <= 0) return "Poll ended";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      if (hours > 0) {
        return `${days} ${days === 1 ? "day" : "days"} ${hours}hrs left`;
      } else {
        return `${days} ${days === 1 ? "day" : "days"} ${minutes}mins left`;
      }
    } else if (hours > 0) {
      return `${hours}hrs left`;
    } else if (minutes > 0) {
      return `${minutes}mins left`;
    } else {
      return "Poll ended";
    }
  };
  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) return "";

    // Format: "12:30 PM · Apr 21, 2021"
    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const dateOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const time = date.toLocaleTimeString("en-US", timeOptions);
    const dateStr = date.toLocaleDateString("en-US", dateOptions);

    return `${time} · ${dateStr}`;
  };
  // const toggleDot = (id) => {
  //   // setShowDot(!showDot);
  //   setDotId(id);
  // };

  const pollData = [
    { id: 1, label: "Option #1", votes: 2969, percentage: 97 },
    { id: 2, label: "Option #2", votes: 92, percentage: 3 },
    { id: 3, label: "Option #3", votes: 122, percentage: 4 },
    { id: 4, label: "Option #4", votes: 122, percentage: 4 },
  ];

  const totalVotes = pollData.reduce((sum, option) => sum + option.votes, 0);

  const handleVote = (optionId) => {
    if (!hasVoted) {
      setSelectedOption(optionId);
      // setHasVoted(true)
    }
  };

  const handleLike = async (e, id) => {
    e.stopPropagation();
    if (!Cookies.get("accessToken")) {
      setShowSignin(true);
      return;
    }
    // Find the post and update UI optimistically
    const postIndex = posts.findIndex((post) => post.id === id);
    if (postIndex === -1) return;

    const currentPost = posts[postIndex];
    const isCurrentlyLiked = currentPost.isLiked;

    // Update UI immediately (optimistic update)
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = {
      ...currentPost,
      isLiked: !isCurrentlyLiked,
      likesCount: isCurrentlyLiked
        ? currentPost.likesCount - 1
        : currentPost.likesCount + 1,
    };
    setPosts(updatedPosts);

    try {
      // Hit the API
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/admin/api/community/posts/${id}/like`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            postId: id,
            userId: Cookies.get("investorId"),
          }),
        }
      );

      const data = await response.json();
      console.log("Like API response:", data);

      // If API call fails, revert the optimistic update
      if (!response.ok) {
        const revertedPosts = [...posts];
        revertedPosts[postIndex] = {
          ...currentPost,
          isLiked: isCurrentlyLiked,
          likesCount: currentPost.likesCount,
        };
        setPosts(revertedPosts);
        // console.error('Like failed:', data);
      }
    } catch (error) {
      // If API call fails, revert the optimistic update
      const revertedPosts = [...posts];
      revertedPosts[postIndex] = {
        ...currentPost,
        isLiked: isCurrentlyLiked,
        likesCount: currentPost.likesCount,
      };
      setPosts(revertedPosts);
      // console.error('Like error:', error);
    }
  };

  const handleComment = async (e, id) => {
    e.stopPropagation();
    if (!Cookies.get("accessToken")) {
      setShowSignin(true);
      return;
    }
    const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
    const response = await fetch(
      `${baseUrl}/admin/api/community/posts/${id}/comments`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        method: "POST",
        body: JSON.stringify({
          postId: id,
          userId: Cookies.get("investorId"),
          content: "Keep it Up!",
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    console.log(id);
  };

  const handleShare = async (e, id) => {
    e.stopPropagation();
    const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
    const response = await fetch(
      `${baseUrl}/admin/api/community/posts/${id}/share`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    console.log(id);
  };

  const openShareModal = (e, post) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/community/${post?.slug ?? ""}`;
    setShareUrl(url);
    setIsShareOpen(true);
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccessToast("Link copied to clipboard");
    } catch (err) {
      showErrorToast("Failed to copy link");
    }
  };

  const VoteForPoll = async (e, id, postId) => {

    e.stopPropagation();
    if (!Cookies.get('accessToken')) {
      setShowSignin(true);
      return;
    }
    
    if (hasVoted) return;

    const targetPost = posts.find(p => p.id === postId);
    if (targetPost && targetPost.pollExpiresAt) {
      if (new Date(targetPost.pollExpiresAt).getTime() <= new Date().getTime()) {
        showErrorToast("Poll expired");
        return;
      }
    }

    // Save previous state for rollback
    const previousPosts = [...posts];

    // Optimistic Update
    setSelectedOption(id);
    setHasVoted(true);
    
    setPosts(prevPosts => {
      return prevPosts.map(post => {
        if (post.id === postId) {
          const newTotalVotes = (post.totalVotes || 0) + 1;
          const updatedOptions = (post.pollOptions || []).map(opt => {
            if (opt.id === id) {
              const newVotes = (opt.votesCount || 0) + 1;
              return {
                ...opt,
                votesCount: newVotes,
                votesPercent: newTotalVotes > 0 ? Math.round((newVotes / newTotalVotes) * 100) : 0,
                isVoted: true
              };
            } else {
              const currentVotes = opt.votesCount || 0;
              return {
                ...opt,
                votesPercent: newTotalVotes > 0 ? Math.round((currentVotes / newTotalVotes) * 100) : 0
              };
            }
          });
          return {
            ...post,
            totalVotes: newTotalVotes,
            pollOptions: updatedOptions
          };
        }
        return post;
      });
    });

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/admin/api/community/polls/${postId}/vote`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            userId: Cookies.get("investorId"),
            optionId: id,
          }),
        }
      );

      const data = await response.json();
      console.log("Vote API response:", data);

      if (response.ok && data.message !== "Poll expired") {
        // Show success message
        showSuccessToast("Vote recorded successfully!");

        // We no longer strictly need to refetch since we did an optimistic update,
        // but it's good practice to sync if the actual numbers changed rapidly.
        // getAllPosts();
      } else {
        console.log("Showing error toast:", data.message);
        showErrorToast(data.message || "Vote failed");
        // Rollback state
        setPosts(previousPosts);
        setHasVoted(false);
        setSelectedOption(null);
      }
    } catch (error) {
      console.error("Vote error:", error);
      showErrorToast("Network error: Unable to vote");
      // Rollback state
      setPosts(previousPosts);
      setHasVoted(false);
      setSelectedOption(null);
    }
  };

  const getAllComments = async (postId) => {
    if (!postId) return;
    try {
      console.log("Fetching comments for postId:", postId);

      const token = Cookies.get("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/admin/api/community/posts/${postId}/comments`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Comments API response:", data);

      // Handle different response structures
      let commentsData = [];
      if (data.data?.comments) {
        commentsData = data.data.comments;
      } else if (data.comments) {
        commentsData = data.comments;
      } else if (Array.isArray(data.data)) {
        commentsData = data.data;
      } else if (Array.isArray(data)) {
        commentsData = data;
      }

      console.log("Setting comments:", commentsData);
      setComments(commentsData);
    } catch (error) {
      console.error("Network Error:", error);
      showErrorToast("Network error: Unable to fetch comments");
    }
  };

  useEffect(() => {
    if (commentRefetch) {
      getAllComments(currentPostId);
      setCommentRefetch(false);
    }
  }, [commentRefetch]);

  useEffect(() => {
    if (!refetch) return;
    if (!slug) return;
    getAllPosts();
    setRefetch(false);
  }, [refetch, slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof document !== "undefined") {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [slug]);

  // Update current time every second for poll countdown
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to submit a new comment
  const submitComment = async (postId) => {
    if (!commentonPost.trim()) {
      showErrorToast("Please enter a comment");
      return;
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/admin/api/community/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: commentonPost.trim(),
            postId: postId,
            userId: Cookies.get("investorId"),
          }),
        }
      );

      const data = await response.json();
      console.log("Comment submission response:", data);

      if (response.ok) {
        showSuccessToast("Comment added successfully!");
        setCommentonPost(""); // Clear the input

        // Refresh comments to show the new one
        console.log("Refreshing comments for postId:", postId);
        await getAllComments(postId);

        // Also refresh the main post data to update comment count
        // await getAllPosts();

        // Trigger refetch for CommentSection
        // setRefetch(!refetch);
      } else {
        showErrorToast(data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      showErrorToast("Network error: Unable to submit comment");
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (e, postId) => {
    if (e.key === "Enter") {
      submitComment(postId);
    }
  };

  const getAllPosts = async () => {
    if (!slug) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      if (!initialPost) {
        setIsLoading(true);
      }
      const token = Cookies.get("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || '').replace(/\/$/, '');
      const response = await fetch(
        `${baseUrl}/admin/api/community/posts/slug/${slug}`,
        {
          headers,
        }
      );
      const data = await response.json();
      console.log("API Response:", data);

      const rawList = data?.data?.data ?? data?.data ?? data;
      const fetchedPosts = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

      if (response.ok && fetchedPosts.length > 0) {
        setPosts(fetchedPosts.map(normalizePostData));
        if (fetchedPosts[0]?.id) {
          getAllComments(fetchedPosts[0].id);
          setCurrentPostId(fetchedPosts[0].id);
        }
      } else if (data.data?.status === 404 || data?.status === 404) {
        showErrorToast(data?.message || "Post not found");
        if (!initialPost) setPosts(null);
      } else {
        console.error("API Error:", data);
        if (!initialPost) {
          showErrorToast(data?.message || "Failed to fetch post");
          setPosts(null);
        }
      }
    } catch (error) {
      // console.error('Network Error:', error)
      if (!initialPost) {
        showErrorToast("Network error: Unable to fetch post");
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };
  useEffect(() => {
    setMounted(true);
    const name = Cookies.get("investorName") || "";
    setCurrentUser(name);
    setInvestorName(name);
    try {
      const inv = Cookies.get("investor") ? JSON.parse(Cookies.get("investor")) : null;
      if (inv?.email) setInvestorEmail(inv.email);
    } catch (_e) {}

    if (initialPost?.id) {
      setPosts([normalizePostData(initialPost)]);
      getAllComments(initialPost.id);
      setCurrentPostId(initialPost.id);
    } else if (slug) {
      getAllPosts();
    }
  }, [slug, initialPost]);

  return (
    <>

      {isLoading ? (
        // <div className={Styles.postsMainContainer2}>
        //   <div className={Styles.IndividualPostContainer}>
        //     <p className={Styles.timeContent}>Loading post…</p>
        //   </div>
        // </div>
        <Loader />
      ) : !posts || posts === null ? (
        <div className={Styles.pageNotFoundContainer}>
          <div className={Styles.pageNotFoundContent}>
            <div className={Styles.pageNotFoundIcon}>
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="40" cy="40" r="40" fill="url(#gradient)" />
                <path
                  d="M25 25L55 55M55 25L25 55"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFF2D0" />
                    <stop offset="100%" stopColor="#8E6B0F" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className={Styles.pageNotFoundTitle}>Post Not Found</h1>
            <p className={Styles.pageNotFoundDescription}>
              The post you're looking for doesn't exist or may have been
              removed.
            </p>
          </div>
        </div>
      ) : (
        <div className={Styles.postsMainContainer3}>
          {posts.map((post) => (
            <div key={post.id} className={Styles.postDetailsContainer}>
              {post.type === "poll" ? (
                <div
                  className={`${Styles.IndividualPostContainer} ${Styles.postsMainContainer} ${Styles.IndividualPostContainerMobile}`}
                >
                  <div className={Styles.votingContainer2}>
                    {/* voting timer container */}
                    <article className={Styles.votingDescription}>
                      <div className={Styles.logoAndTime}>
                        {/* logo */}
                        <article className={Styles.preqtLogoContainer}>
                          <img
                            src="/assets/pictures/preqtLogo.svg"
                            alt="Preqt logo"
                            title="Preqt logo"
                            className={Styles.logoImage}
                          />
                          <span className={Styles.PreqtLogoHeading}>{'Preqt' || 'N/A'}</span>
                        </article>

                        {/* time */}
                        <article className={Styles.TimeContainer}>
                          <div className={Styles.timerClockAndHoursLeft}>
                            <img src="/assets/pictures/timerClock.svg" alt="Timer icon" title="Countdown timer" />
                            <p className={Styles.HoursLeft}>
                              {getTimeRemaining(post?.pollExpiresAt)}
                            </p>
                          </div>
                          <div className={Styles.timeContent}>
                            {formatTimestamp(post?.createdAt)}
                          </div>
                        </article>
                      </div>
                    </article>

                    {/* voting options */}
                    <article className={Styles.votingQuestionWithOptions}>
                      <div className={Styles.VotingQuestion}>
                        <h1 className={Styles.Question}>{post?.pollQuestion || "Community Poll"}</h1>
                      </div>

                      <div>
                        {/* option buttons */}
                        <div></div>

                        {/* vote count div */}
                        <div className={Styles.pollContainer}>
                          {post?.pollOptions?.map((option) => (
                            <div
                              key={option.id}
                              className={`${Styles.pollOption} ${selectedOption === option.id || option?.isVoted
                                ? Styles.selected
                                : ""
                                } ${hasVoted ? Styles.voted : ""}`}
                            >
                              <div className={Styles.optionContent}>
                                <div
                                  className={Styles.radioButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!hasVoted) {
                                      VoteForPoll(e, option.id, post?.id);
                                    }
                                  }}
                                >
                                  <input
                                    type="radio"
                                    id={`option-${option.id}`}
                                    name="poll"
                                    checked={
                                      selectedOption === option.id ||
                                      !!option?.isVoted
                                    }
                                    disabled={hasVoted}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Prevent bubbling to radioButton div when triggered by label
                                    }}
                                  />
                                  <span className={Styles.customRadio}></span>
                                </div>

                                <label
                                  htmlFor={`option-${option.id}`}
                                  className={Styles.optionLabel}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!hasVoted) {
                                      VoteForPoll(e, option.id, post?.id);
                                    }
                                  }}
                                >
                                  {option.optionText}
                                </label>

                                <span className={Styles.percentage}>
                                  {option.votesPercent}%
                                </span>
                              </div>

                              <div
                                className={Styles.progressBar}
                                style={{
                                  width: `${option?.votesPercent ?? 0}%`,
                                }}
                              ></div>
                            </div>
                          ))}

                          <div className={Styles.pollFooter}>
                            {post?.pollOptions?.some(option => option?.isVoted) ? (
                              <span className={Styles.votingText}>You have already voted.</span>
                            ) : (
                              <span className={Styles.votingText}>Vote now and make your voice heard!</span>
                            )}
                            <span className={Styles.totalVotes}>
                              {post?.totalVotes?.toLocaleString()} votes
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>

                    {/* like comment and share */}
                    {/* <div className={Styles.LCScontainer}> */}

                    {/* <div className={Styles.likeAndComment}> */}

                    {/* <div
                          className={Styles.likeContainer}
                          onClick={(e) => handleLike(e, post?.id)}
                        >
                          <img
                            src={
                              post?.isLiked
                                ? "/assets/pictures/liked.svg"
                                : "/assets/pictures/like.svg"
                            }
                            alt="Like icon"
                            title="Like this post"
                            style={{
                              opacity: post?.isLiked ? 1 : 0.7,

                              padding: post?.isLiked ? "2px" : "0px",
                            }}
                          />
                          <p
                            className={Styles.likesCount}
                            style={{
                              color: post?.isLiked ? "#64748B" : "#64748B",
                            }}
                          >
                            {post?.likesCount} Likes
                          </p>
                        </div> */}

                    {/* comment */}
                    {/* <div
                          className={Styles.likeContainer}
                          onClick={(e) => handleComment(e, post?.id)}
                        >
                          <img src="/assets/pictures/comment.svg" alt="Comment icon" title="View comments" />
                          <p className={Styles.likesCount}>
                            {post?.commentsCount} comments
                          </p>
                        </div> */}
                  </div>

                  {/* share */}
                  {/* <div
                        className={Styles.likeContainer}
                        onClick={(e) => openShareModal(e, post)}
                      >
                        <img src="/assets/pictures/share-logo.svg" alt="Share icon" title="Share this post" />
                        <p className={Styles.likesCount}>Share</p>
                      </div> */}
                  {/* </div> */}
                  {/* </div> */}
                </div>
              ) : (
                <div
                  className={`${Styles.IndividualPostContainer} ${Styles.postsMainContainer} ${Styles.IndividualPostContainerMobile}`}
                  style={{ cursor: 'default' }}
                >
                  <div>
                    <div className={Styles.logoAndTime}>
                      {/* logo */}
                      <article className={Styles.preqtLogoContainer}>
                        <img
                          src="/assets/pictures/preqtLogo.svg"
                          alt="Preqt logo"
                          title="Preqt logo"
                          className={Styles.logoImage}
                        />
                        <span className={Styles.PreqtLogoHeading}>{'Preqt' || 'N/A'}</span>
                      </article>

                      {/* time */}
                      <p className={Styles.timeContent}>
                        {formatTimestamp(post?.createdAt)}
                      </p>
                    </div>

                    <div
                      className={`${Styles.postsAndDescriptionContainer} ${Styles.postsAndDescriptionContainer_details}`}
                    >
                      <h1 className={Styles.postTitle}>
                        {post?.title || "Community Post"}
                      </h1>
                      {typeof post?.content === "string" && post.content.trim() ? (
                        <div
                          className={`${Styles.postText} ${Styles.postText_details}`}
                          dangerouslySetInnerHTML={{ __html: formatPostContent(post.content) }}
                          onClick={handleContentClick}
                        />
                      ) : (
                        <div className={`${Styles.postText} ${Styles.postText_details}`}>
                          {post?.content || "No content available."}
                        </div>
                      )}

                      <div
                        className={`${Styles.postImageWrapper} ${Styles.postImageWrapper_details}`}
                      >
                        <ImageSlide images={post?.mediaUrl} title={post?.title} isOpenPost={true} />
                      </div>

                      {(() => {
                        const rawTags = post?.tags || post?.hashtags || post?.tag_names || [];
                        const tagsList = Array.isArray(rawTags) 
                          ? rawTags 
                          : (typeof rawTags === 'string' ? rawTags.split(',').map(s => s.trim()) : []);
                        if (tagsList.length === 0) return null;
                        return (
                          <div className={Styles.postTagsContainer} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px', marginBottom: '12px' }}>
                            {tagsList.map((tag, idx) => {
                              const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.title || tag?.tag_name || '');
                              if (!tagName) return null;
                              const cleanTag = tagName.replace(/^#/, '').trim();
                              return (
                                <Link
                                  key={idx}
                                  href={`/community?tags=${encodeURIComponent(cleanTag)}`}
                                  className={Styles.postTagItem}
                                  style={{
                                    background: 'rgba(100, 116, 139, 0.12)',
                                    color: '#475569',
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    transition: 'all 0.2s ease'
                                  }}
                                  title={`View community posts tagged with ${cleanTag}`}
                                >
                                  #{cleanTag}
                                </Link>
                              );
                            })}
                          </div>
                        );
                      })()}
                      {/* <Image
                    src="/assets/pictures/preqtCandidImage.png"
                    alt="Post image"
                    className={Styles.postImage}
                    width={628}
                    height={400}
                  /> */}
                    </div>
                    {/* like comment and share */}
                    <div className={Styles.LCScontainer}>
                      {/* like and Comment  */}
                      <div className={Styles.likeAndComment}>
                        {/* like */}
                        <div
                          className={Styles.likeContainer}
                          onClick={(e) => handleLike(e, post?.id)}
                        >
                          <img
                            src={
                              post?.isLiked
                                ? "/assets/pictures/liked.svg"
                                : "/assets/pictures/like.svg"
                            }
                            alt="Like icon"
                            title="Like this post"
                            style={{
                              filter: post?.isLiked ? "none" : "none",
                              opacity: post?.isLiked ? 1 : 0.7,
                            }}
                          />
                          <p
                            className={Styles.likesCount}
                            style={{
                              color: post?.isLiked ? "#64748B" : "#64748B",
                            }}
                          >
                            {post?.likesCount} Likes
                          </p>
                        </div>

                        {/* comment */}
                        <div
                          className={Styles.likeContainer}
                          onClick={(e) => handleComment(e, post?.id)}
                        >
                          <img src="/assets/pictures/comment.svg" alt="Comment icon" title="View comments" />
                          <p className={Styles.likesCount}>
                            {post?.commentsCount} comments
                          </p>
                        </div>
                      </div>

                      {/* share */}
                      <div
                        className={Styles.likeContainer}
                        onClick={(e) => openShareModal(e, post)}
                      >
                        <img src="/assets/pictures/share-logo.svg" alt="Share icon" title="Share this post" />
                        <p className={Styles.likesCount}>Share</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={Styles.totalComments}>
                {post?.type === "post" && (
                  <div className={Styles.commentsCountHide}>  {comments.length || 0} Comments</div>
                )}
                {/* <div className={Styles.commentsCountHide}>  {comments.length || 0} Comments</div> */}
                {post?.type === "post" && (!isComposerOpen ? (
                  <div
                    onClick={() => {
                      if (!Cookies.get("accessToken")) {
                        setShowSignin(true);
                        return;
                      }
                      setIsComposerOpen(true);
                    }}
                    className={Styles.commentComposer}
                  >
                    <div className={Styles.commentComposerHeader}>
                      <span className={Styles.nameInitial} suppressHydrationWarning>
                        {getInitial(mounted ? investorName : "") || "A"}
                      </span>
                      <div className={Styles.commentComposerPlaceholderContainer}>
                        <div className={Styles.commentComposerPlaceholder}>
                          Add a comment...
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={Styles.commentComposer}>
                    <div className={Styles.commentComposerUserRow}>
                      <span className={Styles.nameInitial} suppressHydrationWarning>
                        {getInitial(mounted ? investorName : "") || "G/U"}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className={Styles.commentComposerUserName} suppressHydrationWarning>
                          {(mounted && investorName) || "Guest User"}
                        </span>
                        <span className={Styles.commentComposerUserEmail} suppressHydrationWarning>
                          {(mounted && investorEmail) || "your.email@example.com"}
                        </span>
                      </div>
                    </div>

                    <div className={Styles.commentComposerInputWrap}>
                      <input
                        type="text"
                        value={commentonPost}
                        placeholder=""
                        className={Styles.commentComposerInput}
                        onFocus={(e) => {
                          if (!Cookies.get("accessToken")) {
                            e.target.blur();
                            setShowSignin(true);
                            setIsComposerOpen(false);
                            return;
                          }
                        }}
                        onChange={(e) => setCommentonPost(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, post?.id)}
                      />
                    </div>

                    <div className={Styles.commentComposerActions}>
                      <button
                        className={Styles.commentCancelBtn}
                        onClick={() => {
                          setCommentonPost("");
                          setIsComposerOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className={Styles.commentSubmitBtn}
                        onClick={() => {
                          submitComment(post?.id);
                          setIsComposerOpen(false);
                        }}

                      >
                        Comment
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <CommentSection
                postId={post?.id}
                commentsCount={post?.commentsCount}
                comments={comments}
                refetch={refetch}
                setRefetch={setRefetch}
                isComposerOpen={isComposerOpen}
                setIsComposerOpen={setIsComposerOpen}
                commentRefetch={commentRefetch}
                setCommentRefetch={setCommentRefetch}
              />
              {post?.type === "post" && Array.isArray(comments) && comments.length === 0 && (
                <div className={Styles.noCommentsContainer}>
                  <p className={Styles.noCommentsText}>No comments yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={shareUrl}
        onCopy={copyShareUrl}
      />
      <SigninPopup
        show={showSignin}
        onHide={() => setShowSignin(false)}
        onShowOtp={(payload) => {
          setShowSignin(false);
          if (typeof payload === 'object' && payload !== null) {
            setOtpPayload({ ...payload, flow: 'signin' });
          } else {
            setOtpEmail(payload);
            setOtpSource('signin');
            setShowOtp(true);
          }
        }}
        onShowSignUp={() => {
          setShowSignin(false);
          setShowSignupType(true);
        }}
        onEmailSubmit={(email) => setSigninEmail(email)}
      />

      {otpPayload ? (
        <OtpPopup
          {...otpPayload}
          show
          handleClose={() => setOtpPayload(null)}
          handleBack={() => {
            const flow = otpPayload.flow;
            setOtpPayload(null);
            if (flow === 'signup') {
              setShowSignupForm(true);
            } else {
              setShowSignin(true);
            }
          }}
          onVerified={() => {
            setOtpPayload(null);
          }}
        />
      ) : (
        <OtpPopup
          show={showOtp}
          email={otpEmail}
          handleClose={() => setShowOtp(false)}
          handleBack={() => {
            setShowOtp(false);
            if (otpSource === "signup") {
              setShowSignupForm(true);
            } else if (otpSource === "signin") {
              setShowSignin(true);
            }
          }}
        />
      )}

      <SignupTypePopup
        show={showSignupType}
        onHide={() => setShowSignupType(false)}
        onProceed={() => {
          setShowSignupType(false);
          setShowSignupForm(true);
        }}
        onBack={() => {
          setShowSignupType(false);
          setShowSignin(true);
        }}
      />

      <SignupFormPopup
        show={showSignupForm}
        onHide={() => setShowSignupForm(false)}
        onBack={() => {
          setShowSignupForm(false);
          setShowSignupType(true);
        }}
        onShowOtp={(payload) => {
          setShowSignupForm(false);
          if (typeof payload === 'object' && payload !== null) {
            setOtpPayload({ ...payload, flow: 'signup' });
          } else {
            setOtpEmail(payload);
            setOtpSource('signup');
            setShowOtp(true);
          }
        }}
        setSignupEmail={setSignupEmail}
      />

      {/* Lightbox modal for inline content images in open post */}
      {contentModalImage && (
        <div
          className={imageStyles.modalOverlay}
          onClick={() => setContentModalImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size content image view"
        >
          <div
            className={imageStyles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={imageStyles.modalHeaderBar}>
              <button
                type="button"
                className={imageStyles.iconBtn}
                onClick={() => window.open(contentModalImage, "_blank")}
                title="Open original image in new tab"
                aria-label="Open original in new tab"
              >
                <ExternalLink size={18} />
              </button>
              <button
                type="button"
                className={imageStyles.iconBtn}
                onClick={() => setContentModalImage(null)}
                title="Close full view (Esc)"
                aria-label="Close full view"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={contentModalImage}
              alt="Full-size post content image"
              className={imageStyles.fullImage}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetails;
