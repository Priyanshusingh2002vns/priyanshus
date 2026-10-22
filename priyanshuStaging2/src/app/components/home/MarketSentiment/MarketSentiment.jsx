import Link from "next/link"
import styles from "./MarketSentiment.module.css"
import PostSection from "@/app/community/components/PostSection/PostSection"
import ViewAllAnimation from "../ViewAllAnimation"
import { ArrowUpRight } from "lucide-react"

export default function MarketSentiment() {
    console.log("MarketSentiment rendered");

    return (
        <section className={styles.MarketSentimentMainContainer}>
            {/* 
                ARCHIVED: Market Sentiment Section 
                This code block represents the Market Sentiment (MMI gauge) feature. 
                It is currently hidden/archived as per UI requirements but kept here for future reference.
            */}
            {/* <div className={styles.MarketSentimentGreed}>
                <div className={styles.MarketSentimentInnerContainer}>
                    <div className={styles.MarketSentimentHeadingContainer}>
                        <div className={styles.Heading}>Market Sentiment</div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M16 7H22V13" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className={styles.MarketSentimentDescription}>MMI is in the <span>greed zone</span>. It suggests that investors are acting greedy in the market, but the action to be taken depends on the MMI trajectory.</p>
                    
                    <div className={styles.ColorGraph}>
                        <div className={styles.MainColorGraphDiv}>
                            <div className={styles.GreenColor1}></div>
                            <div className={styles.greenColor2}></div>
                            <div className={styles.yellowColor}></div>
                            <div className={styles.OrangeColor}></div>
                            <div className={styles.lastColor}></div>
                            <img src="/assets/pictures/pinScale.svg" alt="pinScale" className={`${styles.PinScaleImage} ${styles.slideOnce}`} />
                        </div>

                        <div className={styles.ColorLevelMainContainer}>
                            <div className={styles.ExtremeFear}><p>Extreme Fear</p></div>
                            <div className={styles.ExtremeFear}><p>Fear</p></div>
                            <div className={styles.ExtremeFear}><p>Neutral</p></div>
                            <div className={styles.ExtremeFear}><p>Greed</p></div>
                            <div className={styles.ExtremeFear}><p>Extreme Greed</p></div>
                        </div>
                    </div>

                    <div className={styles.greedDiv}>
                        <div className={styles.greed}>
                            <p className={styles.greedText}>Extreme Greed</p>
                            <p className={styles.CurrentSentement}>Current Sentiment</p>
                        </div>
                        <i className={styles.highMomentum}>High momentum, cautious entry advised.</i>
                    </div>
                </div>
            </div> */}

            {/* 15+ new deals */}
            {/* <div className={styles.newDeals}>
                <div className={styles.newDealsHeading}>
                    <div className={styles.greenDot}></div>

                    <div className={styles.plusDeals}>We have 15+ new deals</div>
                </div>

               
                <div className={styles.viewAllBtnContainer}>
                        <p className={styles.ViewAllText} onClick={() => router.push('/deals')}>View All</p>
                        <img src="/assets/pictures/redirect.svg" alt="" className={styles.upperRightArrow} />
  
                    </div>
            </div> */}
            <ViewAllAnimation />

            {/* Recent Post from COmmunity */}
            <div className={styles.RecentPostContainer}>
                <div className={styles.RecentPostHeader}>
                    <p className={styles.recentPostsHeading}>Recent posts from community</p>
                    <Link href={"/community"} style={{ textDecoration: 'unset' }}>
                        <div className={styles.ExploreStyles}>
                            <p className={styles.ExploreBtn}>Explore</p>
                            <img src="/assets/pictures/rightUpperArrow2.png" alt="rightUpperArrow2" className={styles.arrowImg} />
                        </div>
                    </Link>
                </div>

                {/* posts */}
                {false && <div className={styles.prqtPostConatiner}>
                    {/* logo and Time Div */}
                    <div className={styles.logoAndTimeDiv}>
                        <div className={styles.LogoNew}>
                            <img src="/assets/pictures/pqtLogo2.png" alt="pqtLogo2" className={styles.NewLogoImg} />

                            <p className={styles.preqtLogoText}>Preqt</p>
                        </div>
                        <div className={styles.DateAndTime}>
                            <p className={styles.DateAndTimeText}>12:30 PM · Apr 21, 2021</p>
                        </div>
                    </div>

                    {/* post description */}
                    <div className={styles.postDescriptionMainContainer}>
                        <div className={styles.PostDescriptionHeading}>🚀 It’s Official! Join Us for the Launch of Anthem Bioscience’s IPO with preqt</div>
                        <img src="/assets/pictures/preqtCandidImage.png" alt="preqtCandidImage" className={styles.preqtCandidImage} />
                    </div>

                    {/* like Comment And Share */}
                    <div className={styles.LikeCommentAndShare}>
                        {/* like and comment div */}
                        <div className={styles.LikeAndCommentContainer}>
                            {/* like */}
                            <div className={styles.LikeBtnContainer}>
                                <img src="/assets/pictures/like.png" alt="like" className={styles.likeImage} />
                                <p className={styles.likesCount}>1,260 Likes</p>
                            </div>

                            {/* comment */}
                            <div className={styles.commentBtnContainer}>
                                <img src="/assets/pictures/comment.png" alt="comment" className={styles.likeImage} />
                                <p className={styles.commentsCount}>360 comments</p>
                            </div>
                        </div>

                        {/* share div */}
                        <div className={styles.ShareButton}>
                            <img src="/assets/pictures/share.png" alt="share" className={styles.likeImage} />
                            <p className={styles.commentsCount}>Share</p>
                        </div>
                    </div>
                </div>}
                <div style={{ background: 'white', borderRadius: '20px' }}>
                    <PostSection limit={true} resetSpace={false} isMarketSentiment={true} />
                </div>
                <div className={styles.exploreCommunityContainer}>
                    <Link href="/community" style={{ textDecoration: 'none' }}>
                        <button className={styles.exploreCommunityBtn}>
                            Explore Community <ArrowUpRight size={16} className={styles.actionIcon} />
                        </button>
                    </Link>
                </div>


            </div>

        </section>
    )
}