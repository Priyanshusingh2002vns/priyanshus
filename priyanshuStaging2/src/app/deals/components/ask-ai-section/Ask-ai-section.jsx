import React from "react";
import Chatbot from "./chatbot/chatbot";
import Ipotimeline from "./ipo-timeline/ipo-timeline";
import QuestionAnswer from "./ques-ans-section/question-answer/QuestionAnswer";
import { useState } from "react";
import { useDealStore } from "@/store/dealStore";

const AskAiSection = ({ isPrivateDeal, onData, handleAskAI, isAskAiActive = false, qaCount }) => {
  const [showQuesAns, setShowQuesAns] = useState(false);
  const [showchatbot, setShowChatBot] = useState(false);
  const dealDetails = useDealStore((state) => state.dealDetails)
  const dealType = dealDetails?.data?.deal_type;

  const handleQuesAns = (value) => {
    setShowQuesAns(value);
  };

  console.log("This is the Ai section Check for Is private deal", isPrivateDeal);

  //   const handleBack = () => {
  //     console.log("back pressed")
  // setShowChatBot(false)
  //   }

  return (
    // <div className="righ-section">
    <div className={`righ-section ${isPrivateDeal ? "private-deal" : ""}`}>
      {isAskAiActive ? (
        <Chatbot
          isPrivate={isPrivateDeal}
          onBack={handleAskAI}
          isPrivateDeal={isPrivateDeal}
          dealType={dealType}
        />
      ) : showQuesAns ? (
        <QuestionAnswer handleQuesAns={handleQuesAns} handleAskAI={handleAskAI} qaCount={qaCount} />
      ) : (
        <Ipotimeline handleAskAI={handleAskAI} handleQuesAns={handleQuesAns} isPrivateDeal={isPrivateDeal} qaCount={qaCount} />
      )}
    </div>
  );
};

export default AskAiSection;
