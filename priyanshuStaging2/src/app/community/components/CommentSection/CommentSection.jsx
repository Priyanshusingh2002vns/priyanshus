"use client";
import React, { useState, useEffect, useMemo } from "react";
import Styles from "./commentSection.module.css";
import { formatTimestamp } from "../../utils/dateUtils";
import Cookies from "js-cookie";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../components/ToastProvider";

const CommentSection = ({
  postId,
  commentsCount,
  comments = [],
  comment,
  refetch,
  setRefetch,
  commentRefetch,
  setCommentRefetch,
  // ⬇️ NEW: lifted from parent
  isComposerOpen,
  setIsComposerOpen,
}) => {
  const [commentonPost, setCommentonPost] = useState("");
  const [commentsList, setCommentsList] = useState(comments);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [currentUser, setCurrentUser] = useState(Cookies.get("investorName"));

  // mobile keyboard behavior
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleViewportResize = () => {
      if (!isMobile) return;

      const viewport = window.visualViewport;

      // how much the keyboard has pushed the viewport up
      const keyboardHeight =
        window.innerHeight - (viewport.height + viewport.offsetTop);

      if (keyboardHeight > 0) {
        // Position input bar at bottom of visible viewport (above keyboard)
        // The visible viewport bottom is at: viewport.offsetTop + viewport.height from top
        // From window bottom, that's: window.innerHeight - (viewport.offsetTop + viewport.height)
        // This equals keyboardHeight, which is correct
        // But we want it positioned relative to the viewport, so we use the viewport's bottom
        const visibleViewportBottom = viewport.offsetTop + viewport.height;
        const bottomFromWindow = window.innerHeight - visibleViewportBottom;
        setKeyboardOffset(bottomFromWindow);
        setIsKeyboardOpen(true);
      } else {
        setKeyboardOffset(0);
        setIsKeyboardOpen(false);
      }

      // 🧠 FIX: track the visual viewport scroll
      // this makes the floating bar "stick" with the keyboard when scrolling
      document.documentElement.style.setProperty(
        "--viewport-offset-top",
        `${viewport.offsetTop}px`
      );
    };


    viewport.addEventListener("resize", handleViewportResize);
    viewport.addEventListener("scroll", handleViewportResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      viewport.removeEventListener("resize", handleViewportResize);
      viewport.removeEventListener("scroll", handleViewportResize);
    };
  }, [isMobile]);


  // Extract user id from cookies
  const userId = useMemo(() => {
    const fromInvestorId = Cookies.get("investorId");
    if (fromInvestorId) return fromInvestorId;
    const fromId = Cookies.get("id");
    if (fromId) return fromId;
    const investor = Cookies.get("investor");
    if (!investor) return undefined;
    try {
      const decoded = decodeURIComponent(investor);
      const parsed = JSON.parse(decoded);
      if (parsed?.name && !currentUser) setCurrentUser(parsed.name);
      return parsed?.id;
    } catch (_e) {
      return undefined;
    }
  }, [currentUser]);

  // sync prop comments
  useEffect(() => {
    setCommentsList(comments || []);
  }, [comments]);

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  const submitReply = async (commentId) => {
    if (!replyText.trim()) {
      showErrorToast("Please enter a reply");
      return;
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/admin/api/community/posts/${postId}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: replyText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSuccessToast("Reply added successfully!");
        setReplyText("");
        setReplyingTo(null);
        setRefetch && setRefetch(!refetch);
      } else {
        showErrorToast(data.message || "Failed to add reply");
      }
    } catch (error) {
      showErrorToast("Network error: Unable to submit reply");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(
        `${baseUrl}/admin/api/community/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSuccessToast("Comment deleted successfully!");
        setCommentRefetch && setCommentRefetch(!commentRefetch);
      } else {
        showErrorToast("Failed to delete comment");
      }
    } catch (error) {
      showErrorToast("Network error: Unable to delete comment");
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "N/A";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const submitComment = async (e, postIdArg) => {
    e?.preventDefault();
    const idToUse = postIdArg ?? postId;
    console.log("[CommentSection] submitComment called", { postIdArg, postId, idToUse, commentonPost });
    if (!commentonPost.trim()) {
      showErrorToast("Please enter a comment");
      return;
    }
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      console.log("[CommentSection] Making API call to:", `${baseUrl}/admin/api/community/posts/${idToUse}/comment`);
      const response = await fetch(
        `${baseUrl}/admin/api/community/posts/${idToUse}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: commentonPost.trim(),
            postId: idToUse,
            userId: Cookies.get("investorId"),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showSuccessToast("Comment added successfully!");
        setCommentonPost("");
        setIsComposerOpen && setIsComposerOpen(false); // close after submit (mobile)
        setRefetch && setRefetch(!refetch);
      } else {
        showErrorToast(data.message || "Failed to add comment");
      }
    } catch (error) {
      showErrorToast("Network error: Unable to submit comment");
    }
  };

  return (
    <div className={Styles.commentSection}>
      <div className={Styles.commentList}>
        {commentsList.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userId={userId}
            currentUser={currentUser}
            replyingTo={replyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            setReplyingTo={setReplyingTo}
            handleReply={handleReply}
            handleDeleteComment={handleDeleteComment}
            submitReply={submitReply}
            getInitials={getInitials}
            formatTimestamp={formatTimestamp}
          />
        ))}
      </div>

      {/* Mobile Floating Comment Bar — only when composer is open */}
      {isMobile && isComposerOpen && (
        <div
          className={Styles.commentInputBar}
          style={{ 
            bottom: isKeyboardOpen ? `${keyboardOffset}px` : '0px'
          }}
        >
          <input
            type="text"
            value={commentonPost}
            placeholder="Add a comment..."
            className={Styles.commentInput}
            onFocus={() => setIsKeyboardOpen(true)}
            onBlur={() => {
              setIsKeyboardOpen(false);
              setIsComposerOpen && setIsComposerOpen(false);
            }}
            onChange={(e) => setCommentonPost(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                submitComment(postId);
              }
            }}
          />
          <button
            type="button"
            className={Styles.sendButton}
            disabled={!commentonPost.trim()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (commentonPost.trim()) {
                submitComment(postId);
              }
            }}
          >
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.2682 8.79734C19.2655 8.79461 19.2628 8.79194 19.26 8.78921L10.8696 0.387754C10.8029 0.321448 10.7293 0.262555 10.6499 0.212054L10.4083 0.0802665L10.2436 0.0253379H10.1228C9.93767 -0.00869009 9.74787 -0.00869009 9.5627 0.0253379H9.45289H9.3211L9.13439 0.124178C9.03035 0.180703 8.93429 0.25087 8.84883 0.332825L0.425445 8.78921C-0.138616 9.34879 -0.142271 10.2597 0.417311 10.8238C0.419988 10.8265 0.422716 10.8292 0.425445 10.8319C0.994036 11.3744 1.88854 11.3744 2.45719 10.8319L7.47608 5.82399C7.6926 5.61169 8.04029 5.61509 8.25259 5.83166C8.35138 5.9324 8.4076 6.06728 8.40956 6.20839V22.561C8.4095 23.3556 9.05356 23.9998 9.84815 23.9998C10.6427 23.9999 11.2868 23.3558 11.287 22.5612V22.561V6.20839C11.2912 5.90517 11.5405 5.66275 11.8437 5.66703C11.9848 5.66904 12.1197 5.7252 12.2204 5.82399L17.2174 10.8319C17.7874 11.3814 18.6901 11.3814 19.2601 10.8319C19.8242 10.2723 19.8278 9.3614 19.2682 8.79734Z" fill="white" />
            </svg>

          </button>
        </div>
      )}
    </div>
  );
};

// CommentItem component
const CommentItem = ({
  comment,
  userId,
  currentUser,
  replyingTo,
  replyText,
  setReplyText,
  setReplyingTo,
  handleReply,
  handleDeleteComment,
  submitReply,
  getInitials,
  formatTimestamp,
  isReply = false, // Track if this is already a reply
}) => {
  const isAdmin = comment?.user_name?.toLowerCase() === 'admin';
  
  return (

    <div className={`${Styles.commentItem} ${isAdmin ? Styles.adminComment : ''}`}>
      <div 
      className={Styles.commentItemContainerParent}
    >

     
      <div className={Styles.commentAvatar}>
        {getInitials(comment?.user_name)}
      </div>

      <div className={Styles.commentHeader}>
        <div 
        className={Styles.commentNameContainerParent}
        
       >
          <span className={Styles.commentAuthor}>
            {comment.user_name || "N/A"}
          </span>
          <span className={Styles.commentTime}>
            {formatTimestamp(comment.createdAt)}
          </span>
          </div>
          <div className={Styles.commentText}>{comment?.content}</div>
          <div className={Styles.commentActions}>
          {comment.userId === userId && (
            <span

              className={`${Styles.DeleteButton} ${comment.userId === userId ? " " :  Styles.deleteButtonUser}`}
              onClick={() => handleDeleteComment(comment.id)}
            >
              Delete
            </span>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className={Styles.replyInputContainer}>
            <div className={Styles.userDetailsParent}>
              <div className={Styles.userAvatar}>
                {getInitials(currentUser)}
              </div>
              <div className={Styles.userDetails}>
                <div className={Styles.userName}>
                  {currentUser || "Current user"}
                </div>
                <div className={Styles.commentTime}>
                  {formatTimestamp(new Date().toISOString())}
                </div>
              </div>
            </div>
            <div className={Styles.inputcommentcontainer}>
              <input
                type="text"
                value={replyText}
                placeholder="Write a reply..."
                className={Styles.inputcomment}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    submitReply(comment.id);
                  }
                }}
              />
              <div className={Styles.replyActions}>
                <button
                  className={Styles.submitCommentBtn}
                  onClick={() => submitReply(comment.id)}
                  disabled={!replyText.trim()}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className={Styles.repliesContainer}>
            {comment.replies
              .filter((reply) => reply?.user_name?.toLowerCase() === 'admin')
              .slice(0, 1)
              .map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  userId={userId}
                  currentUser={currentUser}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  setReplyingTo={setReplyingTo}
                  handleReply={handleReply}
                  handleDeleteComment={handleDeleteComment}
                  submitReply={submitReply}
                  getInitials={getInitials}
                  formatTimestamp={formatTimestamp}
                  isReply={true}
                />
              ))}
          </div>
        )}

        </div>

        </div>

       
      <div className={Styles.commentContent}>
        {/* <div className={Styles.commentHeader}>
          <span className={Styles.commentAuthor}>
            {comment.user_name || "N/A"}
          </span>
          <span className={Styles.commentTime}>
            {formatTimestamp(comment.createdAt)}
          </span>
        </div> */}
        {/* <div className={Styles.commentText}>{comment?.content}</div> */}

        {/* <div className={Styles.commentActions}>
          {comment.userId === userId && (
            <span

              className={`${Styles.DeleteButton} ${comment.userId === userId ? " " :  Styles.deleteButtonUser}`}
              onClick={() => handleDeleteComment(comment.id)}
            >
              Delete
            </span>
          )}
        </div> */}

     
      </div>
    </div>

  );
};

export default CommentSection;
