import React from 'react'
import Styles from './postDealContainer.module.css'
import PostSection from '../PostSection/PostSection'
import TopDeal from '../TopDealSection/TopDeal'

const PostDealcontainer = ({ initialPosts = null, initialNoPosts = false }) => {
  return (
    <div className={Styles.postDealMainContainer}>
     
        <PostSection initialPosts={initialPosts} initialNoPosts={initialNoPosts} />
       
    </div>
  )
}

export default PostDealcontainer;