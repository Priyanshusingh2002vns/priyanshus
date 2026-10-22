import React from "react";
import Styles from "./components/PostDealContainer/postDealContainer.module.css";
import TopDeal from "./components/TopDealSection/TopDeal";
import ExploreTagsBanner from "./components/ExploreTagsBanner/ExploreTagsBanner";

export default function CommunityLayout({ children }) {
  return (
    <div>
      <ExploreTagsBanner />
      <div className={Styles.postDealInnerContainer}>
        <div style={{ width: "100%" }}>
          {children}
        </div>
        <div className={`${Styles.TopDealContainer} ${Styles.topDealPadding}`}>
          <TopDeal />
        </div>
      </div>
    </div>
  );
}