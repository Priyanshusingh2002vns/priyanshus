"use client"
import Styles from './postSection.module.css'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { showErrorToast, showSuccessToast } from '../../../components/ToastProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import ImageSlide from '../ImageSlide'
import ShareModal from '../CommentSection/ShareModal'
import Loader from '../../../components/Loader'
import SigninPopup from '../../../sign-in/SigninPopup'
import OtpPopup from '../../../otp/OtpPopup'
import SignupTypePopup from '../../../signup/SignupTypePopup'
import SignupFormPopup from '../../../signup-form/SignupFormPopup'
import LoadMoreLoader from "../../../components/LoadMore/LoadMoreLoader";
import CommingSoon from '@/app/components/CommingSoon'




const PostSection = ({
  limit = false,
  resetSpace = false,
  onLoadingChange,
  initialPosts = null,
  initialNoPosts = false,
  isMarketSentiment = false
}) => {
  const hasInitialPayload = Array.isArray(initialPosts);
  const pageSize = limit ? 7 : 20;

  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  // const [showDot, setShowDot] = useState(false);
  const [posts, setPosts] = useState(() => hasInitialPayload ? initialPosts : [])
  const [dotId, setDotId] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(null); // Track which post has comment input open
  const [commentonPost, setCommentonPost] = useState(""); // Comment input value
  const [isLoading, setIsLoading] = useState(() => !hasInitialPayload);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(() => {
    if (!hasInitialPayload) return true;
    if (initialNoPosts) return false;
    return initialPosts.length >= pageSize;
  });
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSource, setOtpSource] = useState(""); // 'signin' | 'signup'
  const [otpPayload, setOtpPayload] = useState(null);
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signinEmail, setSigninEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [noPosts, setNoPosts] = useState(() => hasInitialPayload ? initialNoPosts : false);

  // Explore tags filtering state
  const [selectedTags, setSelectedTags] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const rawTags = urlParams.get('tags');
      const rawTag = urlParams.get('tag');
      if (rawTags) {
        return rawTags.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (rawTag) {
        return [rawTag.trim()];
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState([
    "avengers", "power", "mind", "time", "kk", "dff", "mk", "ck", "rk", "ksdj", "lskd", "ksjd", "skjd"
  ]);
  const searchDropdownRef = useRef(null);

  const loadMoreRef = useRef(null);
  const router = useRouter();
  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) return '';

    // Format: "12:30 PM · Apr 21, 2021"
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    const dateOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };

    const time = date.toLocaleTimeString('en-US', timeOptions);
    const dateStr = date.toLocaleDateString('en-US', dateOptions);

    return `${time} · ${dateStr}`;
  };


  const fetchInlinePoll = async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const token = Cookies.get("accessToken");
      const res = await fetch(`${baseUrl}/admin/api/community/get/random/polls`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });
      if (res.ok) {
        const payload = await res.json();
        const pollData = payload?.data?.data || payload?.data;
        if (pollData && pollData.id) {
          const totalVotes = pollData?.pollOptions?.reduce(
            (sum, option) => sum + (option?.votesCount || 0),
            0
          ) || 0;

          const normalizedOptions = pollData?.pollOptions?.map((option) => {
            const votes = option?.votesCount || 0;
            const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            return {
              ...option,
              votesPercent: percent,
            };
          }) || [];

          const pollPost = {
            ...pollData,
            type: "poll",
            isInlinePoll: true,
            pollOptions: normalizedOptions,
            totalVotes: totalVotes || pollData?.totalVotes || 0,
          };

          setPosts((prevPosts) => {
            if (!prevPosts || prevPosts.some((p) => p.id === pollPost.id)) {
              return prevPosts;
            }
            const combined = [...prevPosts, pollPost];
            combined.sort((a, b) => {
              const timeA = new Date(a?.createdAt || a?.created_at || 0).getTime();
              const timeB = new Date(b?.createdAt || b?.created_at || 0).getTime();
              return timeB - timeA;
            });
            return combined;
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch inline poll:", e);
    }
  };

  useEffect(() => {
    if (posts && posts.length > 0 && !posts.some((p) => p.type === "poll")) {
      fetchInlinePoll();
    }
  }, [posts.length]);

  useEffect(() => {
    if (onLoadingChange) {
      console.log('PostSection → notifying layout', { isLoading, noPosts });
      onLoadingChange({ isLoading, noPosts });
    }
  }, [isLoading, noPosts]);


  // Function to calculate time remaining for poll
  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'Poll ended';
    const expiryDate = new Date(expiresAt);
    const now = currentTime || new Date();

    if (isNaN(expiryDate.getTime())) return 'Invalid date';

    const timeDiff = expiryDate.getTime() - now.getTime();

    if (timeDiff <= 0) return 'Poll ended';

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      if (hours > 0) {
        return `${days} ${days === 1 ? 'day' : 'days'} ${hours} hrs left`;
      } else {
        return `${days} ${days === 1 ? 'day' : 'days'} ${minutes} mins left`;
      }
    } else if (hours > 0) {
      return `${hours} hrs left`;
    } else if (minutes > 0) {
      return `${minutes} mins left`;
    } else {
      return 'Poll ended';
    }
  };
  // const toggleDot = (id) => {
  //   // setShowDot(!showDot);
  //   setDotId(id);
  // };

  const saveFeedState = () => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        posts,
        page,
        hasMore,
        scrollY: window.scrollY
      };
      sessionStorage.setItem('communityFeedState', JSON.stringify(stateToSave));
    }
  };

  const viewPostDetails = (slug) => {
    if (showSignin) return;
    saveFeedState();
    router.push(`/community/${slug}`)
  }



  const handleVote = (optionId) => {
    if (!hasVoted) {
      setSelectedOption(optionId)
      // setHasVoted(true)
    }
  }

  const getAllPosts = async (pageParam = 1, append = false, type = 'post', tagsParam = selectedTags) => {
    try {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || '').replace(/\/$/, '');
      let api = `${baseUrl}/admin/api/community/posts?page=${pageParam}`;
      if (limit) {
        api += "&limit=3";
      } else {
        api += "&limit=20";
      }
      // Ensure we always pass the post type to the API
      if (type) {
        api += `&type=${encodeURIComponent(type)}`;
      }
      // Filter posts by tags if provided
      if (Array.isArray(tagsParam) && tagsParam.length > 0) {
        api += `&tags=${encodeURIComponent(tagsParam.join(','))}`;
      }
      const token = Cookies.get('accessToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(api, { headers });
      const data = await response.json();
      console.log('PostSection getAllPosts response:', data);

      const rawPosts = Array.isArray(data?.data?.data)
        ? data.data.data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.posts)
        ? data.data.posts
        : Array.isArray(data?.posts)
        ? data.posts
        : Array.isArray(data)
        ? data
        : [];
      const normalizedPosts = rawPosts.map(post => ({
        ...post,
        isLiked: !!(post.isLiked || post.is_liked), // Normalize to boolean, checking both keys
        likesCount: Number(post.likesCount) || 0, // Ensure number
      }));
      if (normalizedPosts.length === 0 && pageParam === 1) {
        setNoPosts(true);
        setPosts([]);
        setHasMore(false);
        setIsLoading(false);   // <- IMPORTANT
        return;
      }

      setPosts(prev => {
        const postsToSet = append ? [...prev, ...normalizedPosts] : normalizedPosts;
        if (limit && postsToSet.length > pageSize) {
          return postsToSet.slice(0, pageSize);
        }
        return postsToSet;
      });
      if (normalizedPosts.length < pageSize) {
        setHasMore(false);
      }
      if (append) {
        setIsFetchingMore(false);
      }
    } catch (error) {
      console.log('Error fetching posts:', error);
      showErrorToast('Failed to fetch posts');
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleLike = async (e, id) => {
    e.stopPropagation();
    const token = Cookies.get('accessToken');
    if (!token) {
      setShowSignin(true);
      return;
    }

    // Optimistic Update with Functional State
    setPosts(prevPosts => {
      return prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1
          };
        }
        return post;
      });
    });

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || '').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/admin/api/community/posts/${id}/like`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          postId: id,
          userId: Cookies.get('investorId')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to like/unlike');
      }

    } catch (error) {
      console.error('Like error:', error);
      // Revert Optimistic Update
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.id === id) {
            return {
              ...post,
              isLiked: !post.isLiked, // Revert isLiked status
              likesCount: !post.isLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1 // Revert count
            };
          }
          return post;
        });
      });
      showErrorToast('Failed to update like status');
    }
  }

  // const handleComment = async (e, id) => {
  //   e.stopPropagation();
  //   if (!Cookies.get('accessToken')) {
  //     setShowSignin(true);
  //     return;
  //   }
  //   // Toggle comment input for this post
  //   if (showCommentInput === id) {
  //     setShowCommentInput(null); // Close if already open
  //     setCommentonPost(""); // Clear input
  //   } else {
  //     // setShowCommentInput(id); // Open for this post
  //   }
  // }
  const handleComment = (e, post) => {
    e.stopPropagation();
    if (!Cookies.get('accessToken')) {
      setShowSignin(true);
      return;
    }
    if (!post?.slug) return;
    saveFeedState();
    // For polls, navigate to details and request the composer to open
    if (post?.type === 'poll') {
      router.push(`/community/${post.slug}?openComment=1`);
      return;
    }
    viewPostDetails(post.slug);
  }

  const submitComment = async (postId) => {
    if (!commentonPost.trim()) {
      showErrorToast('Please enter a comment')
      return
    }

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || '').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/admin/api/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: commentonPost.trim(),
          postId: postId,
          userId: Cookies.get('investorId')
        })
      })

      const data = await response.json()
      console.log('Comment submission response:', data)

      if (response.ok) {
        showSuccessToast('Comment added successfully!')
        setCommentonPost('') // Clear the input
        setShowCommentInput(null) // Close the input
        // Refresh posts to update comment count
        getAllPosts()
      } else {
        showErrorToast(data.message || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      showErrorToast('Network error: Unable to submit comment')
    }
  }

  // Function to handle Enter key press
  const handleKeyPress = (e, postId) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      submitComment(postId)
    }
  }

  const handleShare = async (e, id) => {
    e.stopPropagation();
    const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || '').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/admin/api/community/posts/${id}/share`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('accessToken')}`
      }
    })
    const data = await response.json()
    console.log(data)
    console.log(id)
  }

  const openShareModal = (e, post) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/community/${post?.slug ?? ''}`
    setShareUrl(url)
    setIsShareOpen(true)
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      showSuccessToast('Link copied to clipboard')
    } catch (err) {
      showErrorToast('Failed to copy link')
    }
  }

  const VoteForPoll = async (e, id, postId) => {
    e.stopPropagation();

    if (!Cookies.get('accessToken')) {
      setShowSignin(true);
      return;
    }

    // Prevent multiple rapid calls
    if (hasVoted || isVoting) {
      console.log('Already voted or voting in progress, ignoring click');
      return;
    }

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

    setIsVoting(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || '').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/admin/api/community/polls/${postId}/vote`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          userId: Cookies.get('investorId'),
          optionId: id
        })
      });

      const data = await response.json();
      console.log('Vote API response:', data);

      if (response.ok && data.message !== "Poll expired") {
        // Show success message
        showSuccessToast('Vote recorded successfully!');

        // We no longer strictly need to refetch since we did an optimistic update
        // getAllPosts();
      } else {
        console.log('Showing error toast:', data.message);
        showErrorToast(data.message || 'Vote failed');
        // Rollback state
        setPosts(previousPosts);
        setHasVoted(false);
        setSelectedOption(null);
      }
    } catch (error) {
      console.error('Vote error:', error);
      showErrorToast('Network error: Unable to vote');
      // Rollback state
      setPosts(previousPosts);
      setHasVoted(false);
      setSelectedOption(null);
    } finally {
      setIsVoting(false);
    }
  }









  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (hasInitialPayload && !token) {
      setIsLoading(false);
      setNoPosts(initialNoPosts);
      return;
    }

    if (typeof window !== 'undefined' && !token) {
      const savedState = sessionStorage.getItem('communityFeedState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (parsedState && parsedState.posts?.length > 0) {
            setPosts(parsedState.posts);
            setPage(parsedState.page || 1);
            setHasMore(parsedState.hasMore !== undefined ? parsedState.hasMore : true);
            setIsLoading(false);

            setTimeout(() => {
              window.scrollTo(0, parsedState.scrollY || 0);
            }, 100);

            sessionStorage.removeItem('communityFeedState');
            return;
          }
        } catch (error) {
          console.error('Failed to parse saved feed state', error);
        }
      }
    }

    getAllPosts(1, false);
  }, []);

  useEffect(() => {
    const handleTokenChange = () => {
      if (Cookies.get('accessToken')) {
        getAllPosts(1, false);
      }
    };
    window.addEventListener('tokenChanged', handleTokenChange);
    return () => window.removeEventListener('tokenChanged', handleTokenChange);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isFetchingMore) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !isFetchingMore) {
        const next = page + 1;
        setPage(next);
        getAllPosts(next, true, 'post', selectedTags);
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, hasMore, isFetchingMore, posts, selectedTags]);

  // Update current time every second for poll countdown
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Re-fetch posts from API when selectedTags change
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (selectedTags && selectedTags.length > 0) {
        setPage(1);
        setHasMore(true);
        getAllPosts(1, false, 'post', selectedTags);
      }
      return;
    }
    setPage(1);
    setHasMore(true);
    getAllPosts(1, false, 'post', selectedTags);
  }, [selectedTags]);

  // Sync with searchParams
  useEffect(() => {
    const rawTags = searchParams?.get('tags');
    const rawTag = searchParams?.get('tag');
    let tagsFromUrl = [];
    if (rawTags) {
      tagsFromUrl = rawTags.split(',').map(s => s.trim()).filter(Boolean);
    } else if (rawTag) {
      tagsFromUrl = [rawTag.trim()];
    }
    setSelectedTags(tagsFromUrl);
  }, [searchParams]);

  // Listen to custom event from sidebar TopDeal
  useEffect(() => {
    const handleTagEvent = (e) => {
      const tag = e.detail?.tag;
      const tags = e.detail?.tags;
      if (tags && Array.isArray(tags)) {
        setSelectedTags(tags);
      } else if (tag) {
        setSelectedTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
      }
    };
    window.addEventListener('communityTagChanged', handleTagEvent);
    return () => window.removeEventListener('communityTagChanged', handleTagEvent);
  }, []);

  // Fetch community tags for the dropdown
  useEffect(() => {
    const fetchCommunityTags = async () => {
      try {
        const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
        const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
        const res = await fetch(`${baseUrl}admin/api/community/community-tags`);
        if (res.ok) {
          const result = await res.json();
          const tagsList = result?.data?.data || result?.data || [];
          if (Array.isArray(tagsList) && tagsList.length > 0) {
            setAvailableTags(tagsList);
          }
        }
      } catch (e) {
        // Fallback already in place
      }
    };
    fetchCommunityTags();
  }, []);

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateUrlTags = (tags) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (tags.length === 0) {
      url.searchParams.delete('tag');
      url.searchParams.delete('tags');
    } else {
      url.searchParams.delete('tag');
      url.searchParams.set('tags', tags.join(','));
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleAddTag = (tag) => {
    if (!tag) return;
    const trimmed = tag.trim();
    if (!selectedTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      const nextTags = [...selectedTags, trimmed];
      setSelectedTags(nextTags);
      updateUrlTags(nextTags);
    }
    setTagSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const nextTags = selectedTags.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase());
    setSelectedTags(nextTags);
    updateUrlTags(nextTags);
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
    updateUrlTags([]);
  };

  const suggestedTags = useMemo(() => {
    const q = tagSearchQuery.trim().toLowerCase();
    return availableTags.filter(t => {
      if (selectedTags.some(st => st.toLowerCase() === t.toLowerCase())) return false;
      if (!q) return true;
      return t.toLowerCase().includes(q);
    });
  }, [availableTags, tagSearchQuery, selectedTags]);

  const displayedPosts = posts;

  return (
    <>
      <div className={`${Styles.postsMainContainer} ${resetSpace && Styles.resetWidth} ${isMarketSentiment ? Styles.marketSentimentMode : ""}`}>

        {isLoading ? (
          <Loader />
        ) : displayedPosts && displayedPosts.length > 0 ? (
          displayedPosts.map((post) => (
            <div className={`${Styles.postwrapperBorder} ${post.isInlinePoll ? Styles.mobileOnlyPoll : ""}`} key={post.id}>
              {post.type === 'poll' ? (
                <div className={`${Styles.IndividualPostContainer} ${resetSpace && Styles.resetSpace}`} onClick={() => viewPostDetails(post.slug)}>
                  <div className={Styles.votingContainer2}>

                    {/* voting timer container */}
                    <article className={Styles.votingDescription}>
                      <div className={Styles.logoAndTime}>
                        {/* logo */}
                        <article className={Styles.preqtLogoContainer}>
                          <img src="/assets/pictures/preqtLogo.svg" alt="preqt logo" title="preqt logo" className={Styles.logoImage} width={24} height={24} />
                          <p className={Styles.PreqtLogoHeading}>{'PrEqt' || 'N/A'}</p>
                        </article>

                        {/* time */}
                        <article className={Styles.TimeContainer}>
                          <div className={Styles.timerClockAndHoursLeft}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M6.66699 1.33203H9.33366" stroke="#EF4444" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 9.33203L10 7.33203" stroke="#EF4444" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8.00033 14.6667C10.9458 14.6667 13.3337 12.2789 13.3337 9.33333C13.3337 6.38781 10.9458 4 8.00033 4C5.05481 4 2.66699 6.38781 2.66699 9.33333C2.66699 12.2789 5.05481 14.6667 8.00033 14.6667Z" stroke="#EF4444" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className={Styles.HoursLeft}>{getTimeRemaining(post?.pollExpiresAt)}</p>
                          </div>
                          <div className={Styles.timeContent}>{formatTimestamp(post?.createdAt)}</div>
                        </article>
                      </div>
                    </article>

                    {/* voting options */}
                    <article className={Styles.votingQuestionWithOptions}>
                      {Boolean(post?.pollQuestion) && (
                        <div className={Styles.VotingQuestion}>
                          <h2 className={Styles.Question}>
                            <Link
                              href={`/community/${post.slug}`}
                              className={Styles.postTitleLink}
                              onClick={(e) => {
                                if (showSignin) {
                                  e.preventDefault();
                                  return;
                                }
                                saveFeedState();
                              }}
                            >
                              {post.pollQuestion}
                            </Link>
                          </h2>
                        </div>
                      )}

                      <div>
                        {/* option buttons */}
                        <div></div>

                        {/* vote count div */}
                        <div className={Styles.pollContainer}>
                          {post?.pollOptions?.map((option) => (
                            <div
                              key={option.id}
                              className={`${Styles.pollOption} ${(selectedOption === option.id || option?.isVoted) ? Styles.selected : ''
                                } ${hasVoted ? Styles.voted : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!hasVoted && !isVoting) {
                                  // Trigger vote when clicking anywhere in the option row
                                  VoteForPoll(e, option.id, post?.id)
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!hasVoted && !isVoting) {
                                    VoteForPoll(e, option.id, post?.id)
                                  }
                                }
                              }}
                            >
                              <div className={`${Styles.optionContent} ${isVoting ? Styles.disabled : ''}`}>
                                <div className={Styles.radioButton} onClick={(e) => {
                                  e.stopPropagation();
                                  if (!hasVoted && !isVoting) {
                                    VoteForPoll(e, option.id, post?.id);
                                  }
                                }}>
                                  <input
                                    type="radio"
                                    id={`option-${option.id}`}
                                    name="poll"
                                    checked={selectedOption === option.id || !!option?.isVoted}
                                    disabled={hasVoted || isVoting}
                                    readOnly
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Prevent bubbling to radioButton div when triggered by label
                                    }}
                                  />
                                  <span className={Styles.customRadio}>
                                    {/* inner dot handled by CSS ::after; no extra element needed */}
                                  </span>
                                </div>

                                <label
                                  htmlFor={`option-${option.id}`}
                                  style={{ fontSize: "14px" }}
                                  className={Styles.optionLabel}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!hasVoted && !isVoting) {
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
                                style={{ width: `${option?.votesPercent ?? 0}%` }}
                              ></div>
                            </div>
                          ))}

                          <div className={Styles.pollFooter}>
                            {post?.pollOptions?.some(option => option?.isVoted) ? (
                              <span className={Styles.votingText}>You have already voted.</span>
                            ) : (
                              <span className={Styles.votingText}>Vote now and make your voice heard!</span>
                            )}


                            <span className={Styles.totalVotes}>{post?.totalVotes?.toLocaleString()} votes</span>
                          </div>
                        </div>
                      </div>


                    </article>


                    {/* like comment and share */}
                    {/* <div className={Styles.LCScontainer}> */}

                    {/* like and Comment  */}
                    {/* <div className={`${Styles.likeAndComment} ${Styles.likeAndCommentContainer}`} > */}
                    {/* like */}
                    {/* <div className={`${Styles.likeAndComment} `} > */}
                    {/* <div className={Styles.likeContainer} onClick={(e) => handleLike(e, post?.id)}>
                            <img
                              src={post?.isLiked ? "/assets/pictures/liked.svg" : "/assets/pictures/like.svg"}
                              alt="like icon" title="like icon"
                              style={{

                                opacity: post?.isLiked ? 1 : 0.7,

                                padding: post?.isLiked ? '2px' : '0px'
                              }}
                            />
                            <p className={Styles.likesCount} style={{
                              color: post?.isLiked ? '#64748B' : '#64748B'
                            }}>
                              {post?.likesCount} Likes
                            </p>
                          </div> */}

                    {/* comment */}
                    {/* <div className={Styles.likeContainer} onClick={(e) => handleComment(e, post)}>
                            <img src="/assets/pictures/comment.svg" alt="comment icon" title="comment icon" />
                            <p className={Styles.likesCount}>{post?.commentsCount} comments</p>
                          </div> */}
                    {/* </div> */}


                    {/* Comment Input - Only show when comment button is clicked */}


                    {/* </div> */}

                    {/* share */}
                    {/* <div className={Styles.likeContainer} onClick={(e) => openShareModal(e, post)}>
                        <img src="/assets/pictures/share-logo.svg" alt="share logo" title="share logo" />
                        <p className={Styles.likesCount}>Share</p>
                      </div> */}
                    {/* </div> */}

                    {showCommentInput === post?.id && (
                      <div className={Styles.totalComments} onClick={(e) => e.stopPropagation()}>
                        <div className={Styles.inputcommentcontainer}>
                          <span className={Styles.nameInitial}>
                            AB
                          </span>
                          <input
                            type="text"
                            value={commentonPost}
                            placeholder='Add a comment...'
                            className={Styles.inputcomment}
                            onChange={(e) => setCommentonPost(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, post?.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            className={Styles.submitCommentBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              submitComment(post?.id);
                            }}
                            disabled={!commentonPost.trim()}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              ) : (
                <div className={`${Styles.IndividualPostContainer} ${resetSpace && Styles.resetSpace}`} onClick={() => viewPostDetails(post.slug)}>

                  <div>



                    <div className={Styles.logoAndTime}>
                      {/* logo */}
                      <article className={Styles.preqtLogoContainer}>
                        <Image src="/assets/pictures/preqtLogo.svg" alt="preqt logo" title="preqt logo" className={Styles.logoImage} height={42} width={42} />
                        <p className={Styles.PreqtLogoHeading}>{'PrEqt' || 'N/A'}</p>
                      </article>

                      {/* time */}
                      <p className={Styles.timeContent}>{formatTimestamp(post?.createdAt)}</p>
                    </div>

                    <div className={Styles.postsAndDescriptionContainer}>
                      {Boolean(post?.title) && (
                        <h2 className={Styles.postTitle}>
                          <Link
                            href={`/community/${post.slug}`}
                            className={Styles.postTitleLink}
                            onClick={(e) => {
                              if (showSignin) {
                                e.preventDefault();
                                return;
                              }
                              saveFeedState();
                            }}
                          >
                            {post.title}
                          </Link>
                        </h2>
                      )}
                      {(() => {
                        const rawTags = post?.tags || post?.hashtags || [];
                        const tagsList = Array.isArray(rawTags) 
                          ? rawTags 
                          : (typeof rawTags === 'string' ? rawTags.split(',').map(s => s.trim()) : []);
                        if (tagsList.length === 0) return null;
                        return (
                          <div className={Styles.tagContainer}>
                            {tagsList.map((tag, index) => {
                              const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.title || tag?.tag_name || '');
                              if (!tagName) return null;
                              return (
                                <span
                                  key={index}
                                  className={Styles.tag}
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddTag(tagName);
                                  }}
                                >
                                  {tagName}
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* <p className={Styles.postDescription}>{post?.content}</p> */}
                      <div style={{ width: '100%' }}>
                        <ImageSlide images={post?.mediaUrl} title={post?.title} isOpenPost={false} />
                      </div>

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
                        <div className={Styles.likeContainer} onClick={(e) => handleLike(e, post?.id)}>
                          <img
                            src={post?.isLiked ? "/assets/pictures/liked.svg" : "/assets/pictures/like.svg"}
                            alt="like icon" title="like icon"
                            style={{
                              filter: post?.isLiked ? 'none' : 'none',
                              opacity: post?.isLiked ? 1 : 0.7
                            }}
                          />
                          <p className={Styles.likesCount} style={{
                            color: post?.isLiked ? '#64748B' : '#64748B'
                          }}>
                            {post?.likesCount} Likes
                          </p>
                        </div>

                        {/* comment */}
                        <div className={Styles.likeContainer} onClick={(e) => handleComment(e, post)}>
                          <img src="/assets/pictures/comment.svg" alt="comment icon" title="comment icon" width={14} height={13} />
                          <p className={Styles.likesCount}>{post?.commentsCount} comments</p>
                        </div>
                      </div>

                      {/* share */}
                      <div className={Styles.likeContainer} onClick={(e) => openShareModal(e, post)}>
                        <img src="/assets/pictures/share-logo.svg" alt="share icon" title="share icon" width={17} height={17} />
                        <p className={Styles.likesCount}>Share</p>
                      </div>
                    </div>

                    {/* Comment Input - Only show when comment button is clicked */}
                    {showCommentInput === post?.id && (
                      <div className={Styles.totalComments} onClick={(e) => e.stopPropagation()}>
                        <div className={Styles.inputcommentcontainer}>
                          <span className={Styles.nameInitial}>
                            AB
                          </span>
                          <input
                            type="text"
                            value={commentonPost}
                            placeholder='Add a comment...'
                            className={Styles.inputcomment}
                            onChange={(e) => setCommentonPost(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, post?.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            className={Styles.submitCommentBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              submitComment(post?.id);
                            }}
                            disabled={!commentonPost.trim()}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}



            </div>





          ))
        ) : (
          <div className={Styles.noFilteredPosts}>
            <p style={{ margin: 0 }}>No community posts found matching the selected tag(s).</p>
            <button
              type="button"
              className={Styles.clearAllTagsBtn}
              onClick={handleClearAllTags}
              style={{ marginTop: '12px', display: 'inline-block' }}
            >
              Clear Tags
            </button>
          </div>
        )}




        {!limit && hasMore && (
          <div ref={loadMoreRef} style={{ height: 1 }} />
        )}
        {isFetchingMore && (
          <div className={Styles.loadMoreWrapper}>
            <LoadMoreLoader />
          </div>
        )}

        <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} shareUrl={shareUrl} onCopy={copyShareUrl} />

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
              if (otpSource === 'signup') {
                setShowSignupForm(true);
              } else if (otpSource === 'signin') {
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

      </div>
    </>
  )
}

export default PostSection;