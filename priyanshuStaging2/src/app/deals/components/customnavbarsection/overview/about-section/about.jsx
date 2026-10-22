"use client";
import { useDealStore } from '@/store/dealStore';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const About = ({ isPrivateDeal }) => {
  const searchParams = useSearchParams();
  const dealId = searchParams?.get("dealId");
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_overview;

  // If no data, return null
  if (!dealData?.about?.status || !dealData?.about?.data) return null;

  return (
    <section className="about-section">
      <h3>About</h3>

      {/* Render HTML safely */}
      <div
        dangerouslySetInnerHTML={{
          __html: dealData?.about?.data,
        }}
      />
    </section>
  );
};

export default About;
