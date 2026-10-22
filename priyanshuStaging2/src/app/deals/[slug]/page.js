import Namedetailsection from "../components/name-section/Namesection";
import AllDeals from "../components/AllDeals/AllDeals";
import { cookies } from "next/headers";
import { cache, Suspense } from "react";
import { notFound } from "next/navigation";
import { getRobotsDirectives, getDealCategoryInfo } from "../../utils/seoUtils";
import { pruneDealForListing } from "../../utils/dealUtils";

export const DEAL_CATEGORIES = {
  "upcoming-ipo": {
    type: "Upcoming",
    label: "Upcoming IPO",
    title: "Upcoming IPO Deals & Issues | PrEqt",
    description: "Discover upcoming IPOs and pre-IPO investment opportunities on PrEqt. Access live analytics, timeline tracking, and issue size details.",
    canonicalPath: "/deals/upcoming-ipo",
  },
  "upcoming": {
    type: "Upcoming",
    label: "Upcoming IPO",
    title: "Upcoming IPO Deals & Issues | PrEqt",
    description: "Discover upcoming IPOs and pre-IPO investment opportunities on PrEqt. Access live analytics, timeline tracking, and issue size details.",
    canonicalPath: "/deals/upcoming-ipo",
  },
  "upcoming-ipos": {
    type: "Upcoming",
    label: "Upcoming IPO",
    title: "Upcoming IPO Deals & Issues | PrEqt",
    description: "Discover upcoming IPOs and pre-IPO investment opportunities on PrEqt. Access live analytics, timeline tracking, and issue size details.",
    canonicalPath: "/deals/upcoming-ipo",
  },
  "ipo": {
    type: "Public",
    label: "IPO Deals",
    title: "Live IPO Deals & Investment Opportunities | PrEqt",
    description: "Access verified IPO opportunities with live GMP, valuation scores, financials, and company analytics on PrEqt.",
    canonicalPath: "/deals/ipo",
  },
  "public": {
    type: "Public",
    label: "IPO Deals",
    title: "Live IPO Deals & Investment Opportunities | PrEqt",
    description: "Access verified IPO opportunities with live GMP, valuation scores, financials, and company analytics on PrEqt.",
    canonicalPath: "/deals/ipo",
  },
  "ipos": {
    type: "Public",
    label: "IPO Deals",
    title: "Live IPO Deals & Investment Opportunities | PrEqt",
    description: "Access verified IPO opportunities with live GMP, valuation scores, financials, and company analytics on PrEqt.",
    canonicalPath: "/deals/ipo",
  },
  "unlisted-shares": {
    type: "Unlisted",
    label: "Unlisted Shares",
    title: "Unlisted Shares & Pre-IPO Investments | PrEqt",
    description: "Invest in verified unlisted company shares, explore valuations, price trends, and financial reports on PrEqt.",
    canonicalPath: "/deals/unlisted-shares",
  },
  "unlisted": {
    type: "Unlisted",
    label: "Unlisted Shares",
    title: "Unlisted Shares & Pre-IPO Investments | PrEqt",
    description: "Invest in verified unlisted company shares, explore valuations, price trends, and financial reports on PrEqt.",
    canonicalPath: "/deals/unlisted-shares",
  },
  "private-deals": {
    type: "Private",
    label: "Private Deals",
    title: "Exclusive Private Equity Deals | PrEqt",
    description: "Explore institutional-grade private equity opportunities and exclusive co-investment deals on PrEqt.",
    canonicalPath: "/deals/private-deals",
  },
  "private": {
    type: "Private",
    label: "Private Deals",
    title: "Exclusive Private Equity Deals | PrEqt",
    description: "Explore institutional-grade private equity opportunities and exclusive co-investment deals on PrEqt.",
    canonicalPath: "/deals/private-deals",
  },
  "startup-deals": {
    type: "Startup",
    label: "Startup Deals",
    title: "Curated Startup Deals & Venture Investments | PrEqt",
    description: "Invest in high-growth startups and venture-backed companies. Verified deal flow for early-stage capital.",
    canonicalPath: "/deals/startup-deals",
  },
  "startup": {
    type: "Startup",
    label: "Startup Deals",
    title: "Curated Startup Deals & Venture Investments | PrEqt",
    description: "Invest in high-growth startups and venture-backed companies. Verified deal flow for early-stage capital.",
    canonicalPath: "/deals/startup-deals",
  },
};

const getInitialDeals = cache(async (categoryType = "", page = 1, limit = 16) => {
  try {
    const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");
    
    let dealTypeQuery = "";
    const t = (categoryType || "").toLowerCase();
    if (t === "unlisted") {
      dealTypeQuery = "deal_type=unlisted";
    } else if (t === "upcoming") {
      dealTypeQuery = "deal_type=public&is_upcoming=true";
    } else if (t === "public" || t === "ipo") {
      dealTypeQuery = "deal_type=public";
    } else if (t === "private") {
      dealTypeQuery = "deal_type=[private,ofs,ccps]";
    } else if (t === "startup") {
      dealTypeQuery = "deal_type=[startup]";
    } else {
      dealTypeQuery = "deal_type=[unlisted,public]";
    }

    const res = await fetch(`${baseUrl}/admin/api/deals/all-deals/?page=${page}&limit=${limit}&${dealTypeQuery}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching initial deals for category SSR:", error);
  }
  return { data: [], pagination: {} };
});

const getDealData = cache(async (slug, token) => {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/").replace(/\/$/, "");
    if (!baseUrl || !slug) return null;
    const res = await fetch(
      `${baseUrl}/admin/api/deals/public/detailsbyslug/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching deal on server:", error);
  }
  return null;
});

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = parseInt(resolvedSearchParams?.page, 10);
  const pageNum = !isNaN(pageParam) && pageParam > 1 ? pageParam : null;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

  // 1. Check if slug matches a Deal Category
  const categoryConfig = DEAL_CATEGORIES[slug?.toLowerCase()];
  if (categoryConfig) {
    const title = pageNum ? `${categoryConfig.title} - Page ${pageNum}` : categoryConfig.title;
    const canonical = pageNum ? `${siteUrl}${categoryConfig.canonicalPath}?page=${pageNum}` : `${siteUrl}${categoryConfig.canonicalPath}`;
    return {
      title,
      description: categoryConfig.description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description: categoryConfig.description,
        url: canonical,
        siteName: "PrEqt",
        locale: "en_IN",
        type: "website",
        images: [
          {
            url: `${siteUrl}/logo.png`,
            width: 1200,
            height: 630,
            alt: categoryConfig.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: categoryConfig.title,
        description: categoryConfig.description,
        images: [`${siteUrl}/logo.png`],
      },
      robots: getRobotsDirectives(),
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  try {
    const deal = await getDealData(slug, token);
    if (!deal) {
      return {
        title: "Deal Details | PrEqt",
        description: "Explore detailed deal information on PrEqt.",
        alternates: {
          canonical: `${siteUrl}/deals/${encodeURIComponent((slug || "").toLowerCase().trim())}`,
        },
        robots: getRobotsDirectives(),
      };
    }

    const dealData = deal?.data || deal;

    const dealName =
      dealData?.company_name ||
      dealData?.deal_setpData?.company_name ||
      dealData?.deal_overview?.company_name ||
      "";

    const rawDealType =
      dealData?.deal_type ||
      dealData?.deal_setpData?.deal_type ||
      dealData?.deal_overview?.deal_type ||
      dealData?.deal_sub_type ||
      "";

    const dealTypeMap = {
      public: "IPO Share",
      ipo: "IPO Share",
      unlisted: "Unlisted Share",
      private: "Private Share",
      ofs: "OFS Share",
      ccps: "CCPS Share",
    };

    const dealTypeLabel =
      dealTypeMap[rawDealType.toLowerCase()] || rawDealType || "";

    const rawSummary =
      dealData?.deal_setpData?.preqt_summary?.data ||
      dealData?.preqt_summary?.data ||
      "";

    const cleanSummary = rawSummary
      ? rawSummary.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
      : "";

    const rawTagline =
      dealData?.deal_setpData?.tag_line?.data ||
      (typeof dealData?.tag_line === "string"
        ? dealData?.tag_line
        : dealData?.tag_line?.data) ||
      "";

    const cleanTagline = rawTagline
      ? rawTagline.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
      : "";

    const rawMetaTitle =
      dealData?.meta_title ||
      dealData?.deal_setpData?.meta_title ||
      deal?.data?.meta_title ||
      "";
    const apiMetaTitle = (
      typeof rawMetaTitle === "string" ? rawMetaTitle : rawMetaTitle?.data || ""
    ).trim();

    const rawMetaDesc =
      dealData?.meta_description ||
      dealData?.deal_setpData?.meta_description ||
      deal?.data?.meta_description ||
      "";
    const apiMetaDescription = (
      typeof rawMetaDesc === "string" ? rawMetaDesc : rawMetaDesc?.data || ""
    ).trim();

    const getFallbackTitle = (name, type) => {
      if (!name) return "Deal Details | PrEqt";
      const t = (type || "").toLowerCase();
      if (t === "public" || t === "ipo" || t === "upcoming") {
        return `${name} IPO Share Price, Valuation & Review | PrEqt`;
      }
      if (t === "unlisted") {
        return `${name} Unlisted Share Price, Financials & Valuation | PrEqt`;
      }
      if (t === "private" || t === "ofs" || t === "ccps") {
        return `${name} Pre-IPO Share Price & Private Deal | PrEqt`;
      }
      if (t === "startup") {
        return `${name} Startup Investment & Deal Details | PrEqt`;
      }
      return `${name} Share Price, Financials & Deal Details | PrEqt`;
    };

    const title = apiMetaTitle || getFallbackTitle(dealName, rawDealType);

    const fallbackDescription =
      cleanSummary ||
      cleanTagline ||
      (dealName
        ? `Discover ${dealName} share price, valuation, key financials, and investment analysis on PrEqt. Explore verified opportunities.`
        : "Explore detailed deal information on PrEqt.");

    const description = apiMetaDescription || fallbackDescription;

    // Dynamic Meta Keywords extraction (handles array of strings/objects, wrapped data, or strings)
    const rawMetaKeywords =
      dealData?.meta_keywords ||
      dealData?.deal_setpData?.meta_keywords ||
      deal?.data?.meta_keywords ||
      dealData?.data?.meta_keywords ||
      deal?.meta_keywords;

    let apiKeywords = [];

    let keywordCandidate = rawMetaKeywords;
    if (
      keywordCandidate &&
      typeof keywordCandidate === "object" &&
      !Array.isArray(keywordCandidate)
    ) {
      if (Array.isArray(keywordCandidate.data)) {
        keywordCandidate = keywordCandidate.data;
      } else if (typeof keywordCandidate.data === "string") {
        keywordCandidate = keywordCandidate.data;
      }
    }

    if (Array.isArray(keywordCandidate)) {
      apiKeywords = keywordCandidate
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            return (
              item.name ||
              item.value ||
              item.label ||
              item.keyword ||
              item.title ||
              ""
            ).trim();
          }
          return String(item || "").trim();
        })
        .filter(Boolean);
    } else if (typeof keywordCandidate === "string" && keywordCandidate.trim()) {
      const trimmed = keywordCandidate.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            apiKeywords = parsed
              .map((item) => {
                if (typeof item === "string") return item.trim();
                if (item && typeof item === "object") {
                  return (
                    item.name ||
                    item.value ||
                    item.label ||
                    item.keyword ||
                    item.title ||
                    ""
                  ).trim();
                }
                return String(item || "").trim();
              })
              .filter(Boolean);
          }
        } catch (_) {
          apiKeywords = trimmed
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } else {
        apiKeywords = trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    // Helper to safely extract string array from fields formatted as { status, data: [...] } or plain arrays
    const extractArrayData = (field) => {
      if (!field) return [];
      let list = field;
      if (typeof field === "object" && !Array.isArray(field)) {
        if (field.status === false || field.status === "false") return [];
        if (Array.isArray(field.data)) {
          list = field.data;
        } else if (typeof field.data === "string" && field.data.trim()) {
          list = [field.data];
        } else {
          return [];
        }
      }
      if (!Array.isArray(list)) return [];
      return list
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            return (
              item.name ||
              item.label ||
              item.sector ||
              item.tag ||
              item.description ||
              item.point ||
              item.value ||
              item.title ||
              ""
            ).trim();
          }
          return String(item || "").trim();
        })
        .filter(Boolean);
    };

    // Fallback Keywords: Combination of tags, companies_sectors, and key_highlights
    const rawTags = [
      ...extractArrayData(dealData?.deal_setpData?.tags),
      ...extractArrayData(dealData?.tags),
      ...extractArrayData(dealData?.data?.tags),
    ];

    const rawSectors = [
      ...extractArrayData(dealData?.deal_setpData?.companies_sectors),
      ...extractArrayData(dealData?.companies_sectors),
      ...extractArrayData(dealData?.data?.companies_sectors),
      ...extractArrayData(dealData?.deal_setpData?.company_sectors),
      ...extractArrayData(dealData?.company_sectors),
    ];

    const rawHighlights = [
      ...extractArrayData(dealData?.deal_setpData?.key_highlights),
      ...extractArrayData(dealData?.key_highlights),
      ...extractArrayData(dealData?.data?.key_highlights),
    ];

    // Combine and deduplicate unique values across tags, sectors, and highlights
    const fallbackCombinedValues = Array.from(
      new Set([...rawTags, ...rawSectors, ...rawHighlights])
    ).filter(Boolean);

    const fallbackKeywordsList = [];
    if (dealName) {
      fallbackKeywordsList.push(dealName);
    }
    fallbackCombinedValues.forEach((val) => {
      if (!fallbackKeywordsList.includes(val)) {
        fallbackKeywordsList.push(val);
      }
    });

    const fallbackKeywords =
      fallbackKeywordsList.length > 0
        ? fallbackKeywordsList.join(", ")
        : "Deals, Investments, Opportunities";

    const keywords =
      apiKeywords.length > 0 ? apiKeywords.join(", ") : fallbackKeywords;

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");
    const normalizedSlug = encodeURIComponent((slug || "").toLowerCase().trim());
    const canonicalUrl = `${siteUrl}/deals/${normalizedSlug}`;

    const companyLogoPath =
      dealData?.deal_setpData?.company_logo?.[0]?.path ||
      dealData?.company_logo?.[0]?.path;

    const primaryOgImage = companyLogoPath
      ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${companyLogoPath.replace("public/", "")}`
      : `${siteUrl}/logo.png`;

    const introImages =
      dealData?.deal_overview?.company_intro_images?.data?.map((img) => ({
        url: `${process.env.NEXT_PUBLIC_USER_BASE}admin/${img?.path?.replace("public/", "")}`,
        alt: title,
      })) || [];

    const ogImages = [
      {
        url: primaryOgImage,
        width: 1200,
        height: 630,
        alt: `${dealName} - primary preview`,
      },
      ...introImages,
    ];

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: canonicalUrl,
      },
      robots: getRobotsDirectives(),
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "PrEqt",
        locale: "en_IN",
        type: "website",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [primaryOgImage],
      },
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "Deal Details | PrEqt",
      description: "Explore detailed deal information on PrEqt.",
      keywords: "Deals, Investments, Opportunities",
      alternates: {
        canonical: `${siteUrl}/deals/${encodeURIComponent((slug || "").toLowerCase().trim())}`,
      },
      robots: getRobotsDirectives(),
    };
  }
}

export default async function DealPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = parseInt(resolvedSearchParams?.page, 10);
  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const limitParam = parseInt(resolvedSearchParams?.limit, 10);
  const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 16;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

  // 1. Check if slug is a Deal Category (e.g. /deals/upcoming-ipo, /deals/unlisted-shares, /deals/ipo)
  const categoryConfig = DEAL_CATEGORIES[slug?.toLowerCase()];
  if (categoryConfig) {
    const initialDealsData = await getInitialDeals(categoryConfig.type, page, limit);
    const rawDeals = initialDealsData?.data || [];
    const deals = rawDeals.map(pruneDealForListing);
    const pagination = initialDealsData?.pagination || {};

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `PrEqt ${categoryConfig.label} Deals`,
      "description": categoryConfig.description,
      "numberOfItems": deals.length,
      "itemListElement": deals.map((deal, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteUrl}/deals/${deal.slug || ""}`,
        "name": deal.company_name || "Investment Opportunity",
        "description": deal.tag_line || deal.company_intro || `${deal.company_name} deal details on PrEqt.`,
      })),
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Deals",
          "item": `${siteUrl}/deals`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryConfig.label,
          "item": `${siteUrl}/deals/${slug}`,
        },
      ],
    };

    const collectionPageSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `PrEqt ${categoryConfig.label} Deals`,
      "url": `${siteUrl}/deals/${slug}`,
      "description": categoryConfig.description,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": deals.length,
        "itemListElement": itemListSchema.itemListElement,
      },
    };

    return (
      <div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <Suspense fallback={null}>
          <AllDeals initialDeals={deals} initialPagination={pagination} initialCategory={categoryConfig.type} />
        </Suspense>
      </div>
    );
  }

  

  // 2. Otherwise render individual Deal Detail Page
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const initialDealData = await getDealData(slug, token);
  if (!initialDealData) {
    notFound();
  }

  const dealData = initialDealData?.data || initialDealData;
  const dealName =
    dealData?.company_name ||
    dealData?.deal_setpData?.company_name ||
    dealData?.deal_overview?.company_name ||
    "Deal Details";

  const rawDealType = dealData?.deal_type || dealData?.deal_setpData?.deal_type || "";
  const dealCategory = getDealCategoryInfo(rawDealType, dealData);

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": siteUrl,
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Deals",
      "item": `${siteUrl}/deals`,
    },
  ];

  if (dealCategory && dealCategory.path !== "/deals") {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": dealCategory.label,
      "item": `${siteUrl}${dealCategory.path}`,
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 4,
      "name": dealName,
      "item": `${siteUrl}/deals/${slug}`,
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": dealName,
      "item": `${siteUrl}/deals/${slug}`,
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems,
  };

  const priceVal =
    dealData?.deal_setpData?.per_share_price?.data ||
    dealData?.deal_setpData?.issue_price_per_share?.data?.from ||
    dealData?.per_share_price?.data;

  const rawDateVal =
    dealData?.deal_setpData?.per_share_price?.as_of_date ||
    dealData?.updatedAt ||
    dealData?.createdAt;

  const rawMetaDesc =
    dealData?.meta_description ||
    dealData?.deal_setpData?.meta_description ||
    dealData?.data?.meta_description ||
    "";
  const apiMetaDescription = (
    typeof rawMetaDesc === "string" ? rawMetaDesc : rawMetaDesc?.data || ""
  ).trim();

  const reviewData = dealData?.ipo_review_rating?.data || dealData?.ipo_review_rating;
  const hasValidReview =
    (reviewData?.status === true || reviewData?.status === "true") &&
    reviewData?.weighted_composite_score;
  const scoreValue = hasValidReview ? parseFloat(reviewData.weighted_composite_score) : null;

  const normalizedSlug = encodeURIComponent((slug || "").toLowerCase().trim());

  const companyLogoPath =
    dealData?.deal_setpData?.company_logo?.[0]?.path ||
    dealData?.company_logo?.[0]?.path;
  const companyLogoUrl = companyLogoPath
    ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${companyLogoPath.replace("public/", "")}`
    : `${siteUrl}/logo.png`;

  const financialProductSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": dealName,
    "description":
      apiMetaDescription ||
      dealData?.deal_setpData?.tag_line?.data ||
      dealData?.tag_line ||
      `Explore ${dealName} investment opportunity on PrEqt.`,
    "url": `${siteUrl}/deals/${normalizedSlug}`,
    "image": companyLogoUrl,
    "provider": {
      "@type": "Organization",
      "name": "PrEqt",
      "url": siteUrl,
    },
    ...(scoreValue && !isNaN(scoreValue)
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": scoreValue.toFixed(1),
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": 1,
          },
        }
      : {}),
    ...(priceVal
      ? {
          "offers": {
            "@type": "Offer",
            "price": priceVal,
            "priceCurrency": "INR",
            "validFrom": rawDateVal
              ? new Date(rawDateVal).toISOString()
              : new Date().toISOString(),
          },
        }
      : {}),
  };

  const corporationSchema = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    "name": dealName,
    "url": `${siteUrl}/deals/${normalizedSlug}`,
    "description":
      apiMetaDescription ||
      dealData?.deal_setpData?.tag_line?.data ||
      dealData?.tag_line ||
      `Explore ${dealName} company details and investment opportunities on PrEqt.`,
    "logo": companyLogoUrl,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporationSchema) }}
      />
      <Suspense fallback={null}>
        <Namedetailsection slug={slug} initialDealData={initialDealData} />
      </Suspense>
    </div>
  );
}

