import { Suspense } from "react";
import PostDealcontainer from "./components/PostDealContainer/PostDealcontainer";
import { getRobotsDirectives } from "../utils/seoUtils";

export const revalidate = 300;
const PAGE_SIZE = 20;
const REVALIDATE_SECONDS = revalidate;
const FALLBACK_DESCRIPTION =
  "Join the Preqt community for exclusive market talks, live polls, and pre-IPO investing insights.";
const FALLBACK_TITLE = "PrEqt Community – Exclusive Market Discussions";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(
  /\/$/,
  ""
);
const PUBLISHER_NAME = "Preqt";
const PUBLISHER_URL = `${SITE_URL}/`;
const PUBLISHER_LOGO = `${SITE_URL}/assets/pictures/preqtLogo.svg`;

const MIN_DESCRIPTION_LENGTH = 75;
const MAX_DESCRIPTION_LENGTH = 155;

const formatDescription = (text) => {
  const source = stripHtml(text || FALLBACK_DESCRIPTION)
    .replace(/\s+/g, " ")
    .trim();

  const ensureMin = (value, min, pad) => {
    if (value.length >= min) return value;
    const needed = min - value.length;
    const padding = (pad.repeat(Math.ceil(needed / pad.length))).slice(0, needed);
    return `${value} ${padding}`.trim();
  };

  const ensured = ensureMin(source, MIN_DESCRIPTION_LENGTH, FALLBACK_DESCRIPTION);
  if (ensured.length <= MAX_DESCRIPTION_LENGTH) return ensured;
  return `${ensured.slice(0, MAX_DESCRIPTION_LENGTH - 3).trim()}...`;
};

const ensureTitleLength = (text) => {
  const base = text || FALLBACK_TITLE;
  if (base.length >= 25) return base;
  const suffix = " | Preqt Community";
  const padded = `${base}${suffix}`;
  return padded.length >= 25 ? padded : `${padded} Insights`;
};

const extractMediaUrl = (input) => {
  if (!input) return undefined;
  const first = Array.isArray(input) ? input[0] : input;
  return typeof first === "string" ? first : first?.url;
};

const sanitizeTitle = (value) => {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = stripHtml(value).trim();
  if (!trimmed) return undefined;
  const lowered = trimmed.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return undefined;
  return trimmed;
};

const stripHtml = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};


async function fetchCommunityPosts({ limitToOne = false } = {}) {
  const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
  if (!baseUrl) {
    return { posts: [], noPosts: true };
  }

  const params = new URLSearchParams({
    page: "1",
    limit: String(limitToOne ? 1 : PAGE_SIZE),
  });
  try {
    const response = await fetch(
      `${baseUrl}/admin/api/community/posts?${params.toString()}`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Community fetch failed with ${response.status}`);
    }

    const payload = await response.json();
    const rawPosts = Array.isArray(payload?.data?.data)
      ? payload.data.data
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.posts)
      ? payload.data.posts
      : Array.isArray(payload?.posts)
      ? payload.posts
      : Array.isArray(payload)
      ? payload
      : [];

    const posts = rawPosts.map((post) => ({
      ...post,
      isLiked: !!(post.isLiked || post.is_liked),
      likesCount: Number(post.likesCount) || 0,
    }));

    return { posts, noPosts: posts.length === 0 };
  } catch (error) {
    // console.error("Community page fetch error:", error);  
    return { posts: [], noPosts: true };
  }
}

export async function generateMetadata() {
  const { posts } = await fetchCommunityPosts({ limitToOne: true });
  const primaryPost = posts?.[0];
  const safeTitle = sanitizeTitle(primaryPost?.title);
  const rawTitle = safeTitle
    ? `${safeTitle} | Preqt Community`
    : FALLBACK_TITLE;
  const title = ensureTitleLength(rawTitle);
  const description = formatDescription(
    stripHtml(primaryPost?.excerpt || primaryPost?.content || FALLBACK_DESCRIPTION)
  );
  const image = extractMediaUrl(primaryPost?.mediaUrl);

  return {
    title,
    description,
    keywords: [
      "Preqt community",
      "pre-IPO investing",
      "startup investing insights",
      "private markets",
      "market sentiment polls",
      "private equity deals",
      "investor discussions",
      "exclusive deal flow",
      "venture investing community"
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/community`,
      type: "website",
      locale: "en_IN",
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: primaryPost?.title ?? FALLBACK_TITLE }]
        : undefined,
      siteName: PUBLISHER_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    authors: [{ name: PUBLISHER_NAME }],
    publisher: PUBLISHER_NAME,
    robots: getRobotsDirectives(),
    alternates: {
      canonical: `${SITE_URL}/community`,
    },
  };
}

export default async function CommunityPage() {
  const { posts, noPosts } = await fetchCommunityPosts();
  const pageDescription = formatDescription(FALLBACK_DESCRIPTION);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: FALLBACK_TITLE,
    url: `${SITE_URL}/community`,
    description: pageDescription,
    publisher: {
      "@type": "Organization",
      name: PUBLISHER_NAME,
      url: PUBLISHER_URL,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
    },
    hasPart: (posts || []).slice(0, 10).map((post) => ({
      "@type": "DiscussionForumPosting",
      headline: post?.title ?? "Community post",
      url: `${SITE_URL}/community/${post?.slug ?? ""}`,
      datePublished: post?.createdAt,
      dateModified: post?.updatedAt ?? post?.createdAt,
      author: {
        "@type": "Person",
        name: post?.authorName ?? PUBLISHER_NAME,
      },
      image: extractMediaUrl(post?.mediaUrl),
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post?.likesCount ?? 0,
      },
    })),
  };

  return (
    <>
      <h1 className="sr-only">{FALLBACK_TITLE}</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={null}>
        <PostDealcontainer initialPosts={posts} initialNoPosts={noPosts} />
      </Suspense>
    </>
  );
}