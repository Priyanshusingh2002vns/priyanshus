"use client"
import Styles from './TopDeal.module.css'
import { useRouter, usePathname } from 'next/navigation'
import { PackageOpen, ArrowUpRight } from 'lucide-react'
import React, { useState, useEffect, useMemo } from 'react'
import Cookies from 'js-cookie';
import SigninPopup from '../../../sign-in/SigninPopup'
import OtpPopup from '../../../otp/OtpPopup'
import SignupTypePopup from '../../../signup/SignupTypePopup'
import SignupFormPopup from '../../../signup-form/SignupFormPopup'
import Link from 'next/link'
import { showSuccessToast, showErrorToast } from '../../../components/ToastProvider'
import { useDeals } from '@/app/context/DealContext'
import { formatDealCountText } from '@/app/utils/formatUtils';
import { formatDate } from "@/app/utils/FormatDate";
import UnlockTeaser from '@/app/components/home/DealShowcase/UnlockTeaser';
import RatingBadge from '@/app/deals/components/DealCard/ui/RatingBadge';

const truncateDescription = (text) => {
  if (!text || typeof text !== 'string') return '';
  const maxLength = 200;
  if (text.length <= maxLength) return text;
  let truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace);
  }
  return `${truncated}....`;
};

const DEFAULT_PUBLIC_DEALS = [];

const EXPLORE_TAGS = [
  "SME",
  "IPO",
  "High Conviction",
  "Manufacturing",
  "Healthcare",
  "SaaS",
  "EV"
];

const TopDeal = () => {
  const router = useRouter()
  const pathname = usePathname()
  const isCommunityDetailPage = pathname?.startsWith('/community/') && pathname !== '/community'
  const slug = isCommunityDetailPage ? pathname.replace('/community/', '') : null;


  const { totalDeals } = useDeals();
  const [deals, setDeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalDealss, setTotalDealss] = useState(0)
  const [hoveredDealId, setHoveredDealId] = useState(null)
  const [currentTime, setCurrentTime] = useState(null)
  const [postTags, setPostTags] = useState([])

  // auth modal flow state

  const [showOtp, setShowOtp] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpSource, setOtpSource] = useState('signin') // 'signin' | 'signup'

  const [signinEmail, setSigninEmail] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)


  const [resetSpace, setResetSpace] = useState(false)
  const [post, setPost] = useState(
    {
      "id": "07ae70d2-6dfd-4f92-b0b9-0fea60e7b95c",
      "userId": "cfadeaaf-82a5-4512-8798-0c790b7d939f",
      "adminName": null,
      "type": "poll",
      "title": null,
      "content": null,
      "mediaUrl": null,
      "pollQuestion": "kalsar ",
      "pollExpiresAt": "2025-11-28T18:30:00.000Z",
      "slug": "kalsar",
      "status": "published",
      "createdAt": "2025-11-25T06:37:08.822Z",
      "likesCount": 0,
      "isLiked": false,
      "commentsCount": 0,
      "subscriptionCount": 0,
      "totalVotes": 2,
      "pollOptions": [
        {
          "id": "d90aec71-071a-4e46-b2ab-65492f0ab145",
          "optionText": "1",
          "votesCount": 2,
          "votesPercent": 100,
          "isVoted": false
        },
        {
          "id": "2bc05842-185e-4b53-a973-f17b1d4d51a4",
          "optionText": "2",
          "votesCount": 0,
          "votesPercent": 0,
          "isVoted": false
        },
        {
          "id": "d365e5b4-c8ff-418a-8f24-add19090dde2",
          "optionText": "5",
          "votesCount": 0,
          "votesPercent": 0,
          "isVoted": false
        },
        {
          "id": "6e656e75-1b93-4a35-afb2-002f8711fffc",
          "optionText": "3",
          "votesCount": 0,
          "votesPercent": 0,
          "isVoted": false
        }
      ]
    })


  const [showSignin, setShowSignin] = useState(false);
  const [showSignupType, setShowSignupType] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  // OTP STATE (single source of truth)
  const [otpPayload, setOtpPayload] = useState(null);

  const handleSigninOpen = () => {
    setShowSignin(true);
  };

  const formatNumberWithCommas = (number) => {
    if (!number) return "";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };


  // SIGN IN → EMAIL OTP
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

  // SIGN UP → MOBILE OTP
  const handleSignupShowOtp = ({ email, phone }) => {
    if (!phone) return;

    setOtpPayload({
      flow: "signup",
      type: "mobile",
      identifier: phone,
      verifyEndpoint: "verify-register-otp",
      resendEndpoint: "resend-registeration-otp",
      email, // keep for later
    });

    setShowSignupForm(false);
  };
  const closeOtp = () => {
    setOtpPayload(null);
  };

  const renderHiddenCard = (id) => {
    const isHovered = true
    return (
      <div className={Styles.privateCard}
        onMouseEnter={() => setHoveredDealId(id)}
        onMouseLeave={() => setHoveredDealId(null)}>
        <img src="/deal_card.png" alt="deal card" title="deal card" width={409} height={470}/>
        <div className={Styles.privateCardOverLay}>
          <div className={`${Styles.lockImg} ${isHovered ? Styles.hidden : Styles.visible
            }`}>
            <img src="lock-deal.png" className={Styles.lockImg2} alt="lock deal" title="lock deal" width={258} height={147} />
          </div>

          <div className={`${Styles.loginBtnContainer} ${!isHovered ? Styles.hidden : Styles.visible}`} onClick={handleSigninOpen}>
            <div className={Styles.loginBtnNew}>
              Login to Explore Private Deal <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
      </div>
    )

  }


  const fetchTopDeals = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/public/get/top/deals/`)
      const payload = await res.json()
      const list = payload.data || []
      setTotalDealss(payload.pagination?.totalRecords || list?.length || 0)
      setDeals(Array.isArray(list) ? list : [])
    } catch (e) {
      console.error('Failed to fetch top deals', e)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => { fetchTopDeals() }, [])

  const fetchRandomPoll = async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/admin/api/community/get/random/polls`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,

        },
        cache: 'no-store',
      })
      if (!response.ok) {
        console.error('Failed to fetch random poll', response.status)
        return
      }
      const payload = await response.json()
      const pollData = payload?.data?.data || payload?.data
      if (pollData) {
        const totalVotes = pollData?.pollOptions?.reduce(
          (sum, option) => sum + (option?.votesCount || 0),
          0
        ) || 0

        const normalizedOptions = pollData?.pollOptions?.map((option) => {
          const votes = option?.votesCount || 0
          const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
          return {
            ...option,
            votesPercent: percent,
          }
        }) || []

        setPost({
          ...pollData,
          pollOptions: normalizedOptions,
          totalVotes: totalVotes || pollData?.totalVotes || 0,
        })
      }
    } catch (error) {
      console.error('Random poll fetch error', error)

    }
  }

  useEffect(() => {
    fetchRandomPoll()
  }, [])

  const fetchPostTags = async () => {
    if (!slug) return;
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/admin/api/community/posts/slug/${encodeURIComponent(slug)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(Cookies.get('accessToken') ? { 'Authorization': `Bearer ${Cookies.get('accessToken')}` } : {}),
        },
        cache: 'no-store',
      });
      if (response.ok) {
        const payload = await response.json();
        const postData = payload?.data?.data?.[0];
        if (postData?.tags && Array.isArray(postData.tags)) {
          setPostTags(postData.tags);
        }
      }
    } catch (error) {
      console.error('Failed to fetch post tags by slug', error);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPostTags();
    }
  }, [slug]);

  const accessToken = Cookies.get("accessToken");

  const filteredDeals = useMemo(() => {
    const list = (Array.isArray(deals) ? deals : []).filter((deal) => {
      if (!deal || !deal.deal_type) return false;

      const type = deal.deal_type.toLowerCase();

      return type === "public" || type === "unlisted";
    });

    const combined = [...list];
    for (const defaultDeal of DEFAULT_PUBLIC_DEALS) {
      if (combined.length >= 2
      ) break;
      const isAlreadyPresent = combined.some(
        (d) => d.company_name?.toLowerCase() === defaultDeal.company_name.toLowerCase()
      );
      if (!isAlreadyPresent) {
        combined.push(defaultDeal);
      }
    }

    return combined.slice(0, 1);
  }, [deals]);

  const showOverlayDeal = useMemo(() => {
    const list = (Array.isArray(deals) ? deals : []).filter((deal) => {
      if (!deal || !deal.deal_type) return false;
      const type = deal.deal_type.toLowerCase();
      return type === "public" || type === "unlisted";
    });
    return list.length === 0;
  }, [deals]);



  // Function to calculate time remaining for poll
  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'Poll ended';
    if (!currentTime) return 'Updating...';

    const expiryDate = new Date(expiresAt);
    const now = currentTime;

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

    if (post && post.pollExpiresAt) {
      if (new Date(post.pollExpiresAt).getTime() <= new Date().getTime()) {
        showErrorToast("Poll expired");
        return;
      }
    }

    // Save previous state for rollback
    const previousPost = { ...post };

    // Optimistic Update
    setSelectedOption(id);
    setHasVoted(true);

    setPost(prevPost => {
      const newTotalVotes = (prevPost.totalVotes || 0) + 1;
      const updatedOptions = (prevPost.pollOptions || []).map(opt => {
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
        ...prevPost,
        totalVotes: newTotalVotes,
        pollOptions: updatedOptions
      };
    });

    setIsVoting(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
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

        // We already did an optimistic update
      } else {
        console.log('Showing error toast:', data.message);
        showErrorToast(data.message || 'Vote failed');
        // Rollback state
        setPost(previousPost);
        setHasVoted(false);
        setSelectedOption(null);
      }
    } catch (error) {
      console.error('Vote error:', error);
      showErrorToast('Network error: Unable to vote');
      // Rollback state
      setPost(previousPost);
      setHasVoted(false);
      setSelectedOption(null);
    } finally {
      setIsVoting(false);
    }
  }

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

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [])


  return (
    <div className={Styles.TopDealMainContainerWrapper}>
      {isCommunityDetailPage && postTags && postTags.length > 0 && (
        <div className={Styles.tagHeading}>
          Tags
          <div className={Styles.tagContainer}>
            {(() => {
              return (postTags || []).map((tag, index) => {
                const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.title || tag?.tag_name || '');
                if (!tagName) return null;
                const cleanTag = tagName.replace(/^#/, '').trim();
                return (
                  <Link
                    key={index}
                    href={`/community?tags=${encodeURIComponent(cleanTag)}`}
                    className={Styles.tag}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                    title={`View community posts tagged with ${cleanTag}`}
                  >
                    {tagName}
                  </Link>
                );
              });
            })()}
          </div>
        </div>
      )}


      <div className={Styles.TopDealMainContainer}>
        {/* top deal heading */}
        <div className={Styles.TopDealsHeading}>
          Top Deals
        </div>

        {/* anthem banner */}

        <UnlockTeaser isTopDeal={true} />

        {filteredDeals.map((deal, index) => {
          const type = deal?.deal_type?.toLowerCase()
          const isPrivateLike = type === 'private' || type === 'ccps' || type === 'ofs'
          const isDarkTheme = type === 'private' || type === 'ccps' || type === 'ofs'
          const isofs = type === 'ofs'
          const isPublic = type === 'public' || type === 'unlisted'
          const rating = (deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score);

          const numericRating = parseFloat(rating) || 0;

          if (!accessToken && isDarkTheme) {
            return (
              <React.Fragment key={deal?.id}>
                {renderHiddenCard(deal?.id)}
              </React.Fragment>
            )
          }

          return (
            <Link href={`/deals/${deal?.slug}`} className={isPublic ? Styles.AnthemBanner : (isofs ? Styles.privateDealThemeofs : Styles.privateDealTheme)} key={deal?.id}>
              {(isofs && deal?.exclusive_deal === true) && (
                <img src="/ofsdealGradient.svg" alt="ofsdealGradient" className={Styles.ofsGradient} />
              )}
              <div className={Styles.AnthemInnerContainer}>

                {isPublic && numericRating > 0 && (
                  <div className={Styles.ratingContainer}>
                    <RatingBadge rating={rating} />
                  </div>
                )}

                {deal?.exclusive_deal && (
                  <div className={Styles.exclusiveTagWrapperofs}>
                    <div className="exclusiveTagNew">
                      EXCLUSIVE DEAL
                    </div>
                  </div>
                )}

                <div className={Styles.AnthemSection}>
                  <img src={deal?.company_logo?.[0]?.path ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${(deal?.company_logo?.[0]?.path || '').replace(/^public\//, '')}` : '/assets/pictures/Anthem.png'} alt="anthem picture" title="anthem picture" className={Styles.anthemPicture} />
                  <p className={Styles.anthemHeading} style={{ color: isPublic ? "#1F2937" : "#FFF" }}>{deal?.company_name || 'N/A'}</p>
                </div>


                {deal?.tag_line && (
                  <div className={Styles.anthemDescription} style={{ color: isPublic ? "#6B7280" : "#FFF" }}>
                    {truncateDescription(deal.tag_line)}
                  </div>
                )}



                {((accessToken && isPrivateLike)) && (
                  <>

                    {(deal?.target_funding_in_cr || 0) > 0 && (
                      <div className={Styles.percentAndProgressBar}>
                        <div className={Styles.progessMainContainer}>
                          <p className={Styles.priceInCr} style={{ color: isPublic ? "#6B7280" : "#FFF" }}>{formatNumberWithCommas(deal?.raised_amount) || "0.0"} Cr / {deal?.target_funding_in_cr ? "₹" : ""}{formatNumberWithCommas(deal?.target_funding_in_cr) || "0.0"} {deal?.target_funding_in_cr ? "Cr" : ""}</p>
                          <p className={Styles.percent} style={{ color: isPublic ? "#1F2937" : "#FFF" }}>{(deal?.target_funding_in_cr ? ((deal?.raised_amount || 0) / deal.target_funding_in_cr * 100).toFixed(2) : "0.00")}% </p>
                        </div>

                        <div className={Styles.progressBarContainer}>
                          <div
                            className={Styles.progressBarFill}
                            style={{ width: `${Math.min((deal?.target_funding_in_cr ? (deal?.raised_amount || 0) / deal.target_funding_in_cr * 100 : 0), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </>
                )}


              </div>
            </Link>
          )
        })}


        {/* 15+ deals section */}
        {filteredDeals.length > 0 && (
          <div className={Styles.newDeals}>
            <div className={Styles.newDealsHeading}>
              <div className={Styles.greenDot}></div>


              <div className={Styles.plusDeals}>{formatDealCountText(totalDeals)}</div>
            </div>

            {/* view all button */}
            <div className={Styles.viewAllBtnContainer} onClick={() => router.push('/deals')}>
              <p className={Styles.ViewAllText} >View All</p>
              <img src="/assets/pictures/redirect.svg" alt="redirect" title="redirect" className={Styles.upperRightArrow} />

            </div>
          </div>
        )}



      </div>

      {!isCommunityDetailPage && (
        <div className={Styles.exploreTagsCard}>
          <h3 className={Styles.exploreTagsTitle}>Explore Tags</h3>
          <div className={Styles.exploreTagsList}>
            {EXPLORE_TAGS.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                className={Styles.exploreTagPill}
                onClick={() => {
                  if (isCommunityDetailPage) {
                    router.push(`/community?tags=${encodeURIComponent(tag)}`);
                  } else {
                    const url = new URL(window.location.href);
                    const existingTags = url.searchParams.get('tags')
                      ? url.searchParams.get('tags').split(',').map(s => s.trim()).filter(Boolean)
                      : (url.searchParams.get('tag') ? [url.searchParams.get('tag').trim()] : []);
                    
                    if (!existingTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
                      existingTags.push(tag);
                    }
                    url.searchParams.delete('tag');
                    url.searchParams.set('tags', existingTags.join(','));
                    window.history.pushState({}, '', url.toString());
                    window.dispatchEvent(new CustomEvent('communityTagChanged', { detail: { tags: existingTags, tag } }));
                  }
                }}
              >
                <span className={Styles.exploreTagHash}>#</span>
                <span className={Styles.exploreTagText}>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isCommunityDetailPage && (
        <div className={Styles.postwrapperBorder} key={post.id}>

          <div className={`${Styles.IndividualPostContainer} ${resetSpace && Styles.resetSpace}`} onClick={() => viewPostDetails(post.slug)}>
            <div className={Styles.votingContainer2}>

              {/* voting timer container */}
              <article className={Styles.votingDescription}>
                <div className={Styles.logoAndTime}>
                  {/* logo */}
                  <article className={Styles.preqtLogoContainer}>
                    <img src="/assets/pictures/preqtLogo.svg" alt="preqt logo" title="preqt logo" className={Styles.logoImage} />
                    <p className={Styles.PreqtLogoHeading}>{'Preqt' || 'N/A'}</p>
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
                <div className={Styles.VotingQuestion}>
                  <p className={Styles.Question}>{post?.pollQuestion}</p>
                </div>

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

              {/* {showCommentInput === post?.id && (
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
         )} */}

            </div>
          </div>

        </div>
      )}


      {showSignin && (
        <SigninPopup
          show={showSignin}
          onHide={() => setShowSignin(false)}
          onShowOtp={handleSigninShowOtp}
          onShowSignUp={() => {
            setShowSignin(false);
            setShowSignupType(true);
          }}
        />
      )}

      {/* SIGN UP TYPE */}
      {showSignupType && (
        <SignupTypePopup
          show
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
      )}

      {/* SIGN UP FORM */}
      {showSignupForm && (
        <SignupFormPopup
          show
          onHide={() => setShowSignupForm(false)}
          onBack={() => {
            setShowSignupForm(false);
            setShowSignupType(true);
          }}
          onShowOtp={handleSignupShowOtp}
        />
      )}

      {/* OTP POPUP (NO showOtp FLAG) */}
      {otpPayload && (
        <OtpPopup
          {...otpPayload}
          show
          handleClose={closeOtp}
          handleBack={() => {
            const flow = otpPayload.flow;
            closeOtp();
            flow === "signin"
              ? setShowSignin(true)
              : setShowSignupForm(true);
          }}
          onVerified={() => {
            closeOtp();
          }}
        />
      )}
    </div>
  )
}

export default TopDeal