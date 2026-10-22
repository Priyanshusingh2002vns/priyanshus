/**
 * Utility to determine if the current environment is staging, preview, or development.
 * Used to block search engines and web crawlers from indexing non-production environments.
 */

export const checkIsStaging = (host = '') => {
  const normalizedHost = (host || '').toLowerCase();

  // Explicit production domain check
  const isProdHost = normalizedHost === 'preqt.club' || normalizedHost === 'www.preqt.club';

  const isStagingEnv =
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes('apistaging') ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes('staging') ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes('vercel.app') ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes('apistaging') ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes('staging') ||
    normalizedHost.includes('staging') ||
    normalizedHost.includes('vercel.app') ||
    normalizedHost.includes('webninjaz.com');

  // If host is provided and it's not production, or staging env detected
  if (normalizedHost && !isProdHost && !normalizedHost.startsWith('localhost:')) {
    return true;
  }

  return Boolean(isStagingEnv);
};

export const getRobotsDirectives = (host = '') => {
  const isStaging = checkIsStaging(host);

  if (isStaging) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        'max-video-preview': -1,
        'max-image-preview': 'none',
        'max-snippet': -1,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
};

/**
 * Maps raw deal type and deal metadata to category breadcrumb details and listing route.
 * Deal categories:
 * - Public / IPO -> Upcoming IPO (/deals/upcoming-ipo) or IPO Deals (/deals/ipo)
 * - Unlisted -> Unlisted Shares (/deals/unlisted-shares)
 * - Private / OFS / CCPS -> Private Deals (/deals/private-deals)
 * - Startup -> Startup Deals (/deals/startup-deals)
 */
export const getDealCategoryInfo = (rawDealType, dealData) => {
  const effectiveType = (
    rawDealType ||
    dealData?.deal_type ||
    dealData?.deal_setpData?.deal_type ||
    dealData?.data?.deal_type ||
    ""
  ).toString().trim().toLowerCase();

  const ipoTimelineData =
    dealData?.deal_setpData?.ipo_timeline?.data ||
    dealData?.ipo_timeline?.data ||
    dealData?.data?.deal_setpData?.ipo_timeline?.data;
    
  const ipoOpenDate = ipoTimelineData?.ipo_open_date;
  const isUpcoming = ipoOpenDate ? new Date(ipoOpenDate) > new Date() : false;

  if (effectiveType === "public" || effectiveType === "ipo") {
    return isUpcoming
      ? { label: "Upcoming IPO", path: "/deals/upcoming-ipo" }
      : { label: "IPO Deals", path: "/deals/ipo" };
  }
  if (effectiveType === "upcoming" || effectiveType === "upcoming-ipo") {
    return { label: "Upcoming IPO", path: "/deals/upcoming-ipo" };
  }
  if (effectiveType === "unlisted") {
    return { label: "Unlisted Shares", path: "/deals/unlisted-shares" };
  }
  if (effectiveType === "private" || effectiveType === "ofs" || effectiveType === "ccps") {
    return { label: "Private Deals", path: "/deals/private-deals" };
  }
  if (effectiveType === "startup") {
    return { label: "Startup Deals", path: "/deals/startup-deals" };
  }
  return { label: "All Deals", path: "/deals" };
};

