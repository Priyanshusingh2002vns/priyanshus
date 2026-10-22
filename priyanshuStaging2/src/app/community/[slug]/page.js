import Link from "next/link";
import PostDetails from "../components/PostDetails";
import Styles from './page.module.css';
import { notFound } from "next/navigation";
import { cache } from "react";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const revalidate = 60;

const FALLBACK_TITLE = "Preqt Community Post";
const FALLBACK_DESCRIPTION =
  "Dive into detailed insights, polls, and conversations from the Preqt community.";
const IMAGE_URL = (
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  process.env.NEXT_PUBLIC_USER_BASE ||
  "https://api.preqt.club"
).replace(/\/+$/, "");
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://www.preqt.club"
).replace(/\/+$/, "");
const PUBLISHER_NAME = "Preqt";

const normalizeSlug = (input) => {
  if (Array.isArray(input)) return input[0] ?? "";
  return typeof input === "string" ? input : "";
};

const stripHtml = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const formatDescription = (text) => {
  const source = stripHtml(text || FALLBACK_DESCRIPTION);
  if (!source) return FALLBACK_DESCRIPTION;
  if (source.length > 155) {
    return `${source.slice(0, 152).trim()}...`;
  }
  return source;
};

const ensureTitleLength = (text) => {
  const base = stripHtml(text || FALLBACK_TITLE);
  if (base.length >= 25) return base;
  const suffix = " | Preqt Community";
  const padded = `${base}${suffix}`;
  return padded.length >= 25 ? padded : `${padded} Insights`;
};

// Cached post fetcher to prevent duplicate requests across generateMetadata and Page
const fetchPostBySlug = cache(async (slug) => {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
  if (!baseUrl) return null;

  let authHeader = {};
  let isAuthed = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
      isAuthed = true;
    }
  } catch (_e) {
    // static generation context without request cookies
  }

  try {
    const fetchOptions = isAuthed
      ? {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...authHeader,
          },
        }
      : {
          next: { revalidate: 60 },
          headers: {
            Accept: "application/json",
          },
        };

    const res = await fetch(
      `${baseUrl}/admin/api/community/posts/slug/${encodeURIComponent(normalized)}`,
      fetchOptions
    );
    if (!res.ok) return null;
    const payload = await res.json();
    const rawData = payload?.data?.data ?? payload?.data ?? payload;
    const post = Array.isArray(rawData) ? rawData[0] : (rawData?.posts?.[0] ?? rawData);
    return post ?? null;
  } catch (error) {
    console.error("Failed to fetch post by slug:", error);
    return null;
  }
});

// SSG: Generate static params for pre-rendering top post slugs at build time
export async function generateStaticParams() {
  const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/admin/api/community/posts?page=1&limit=50`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const payload = await res.json();
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

    return rawPosts
      .filter((post) => post && post.slug && typeof post.slug === "string")
      .map((post) => ({
        slug: post.slug.trim(),
      }));
  } catch (error) {
    console.error("Failed to generateStaticParams for community posts:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | PrEqt",
      description: FALLBACK_DESCRIPTION,
      alternates: {
        canonical: `${SITE_URL}/community/${slug}`,
      },
    };
  }

  const rawTitle = post.title
    ? `${stripHtml(post.title)} | PrEqt`
    : "Community Post | PrEqt";

  const title = rawTitle;
  const description = formatDescription(
    post.excerpt || post.content || FALLBACK_DESCRIPTION
  );

  const rawImage = Array.isArray(post.mediaUrl)
    ? post.mediaUrl[0]
    : post.mediaUrl;

  const image =
    typeof rawImage === "string"
      ? rawImage
      : rawImage?.url;

  const absoluteImage =
    rawImage?.type === "image" || (image && typeof image === "string" && !image.endsWith(".mp4"))
      ? (`${IMAGE_URL}/${image}`).replaceAll("public/", "")
      : `${SITE_URL}/default_meta_image.png`;

  return {
    title,
    description,
    keywords: [
      "Preqt community",
      "pre-ipo investing",
      "private market insights",
      post.title ? stripHtml(post.title) : "",
    ].filter(Boolean),

    openGraph: {
      title,
      description,
      url: `${SITE_URL}/community/${post.slug || slug}`,
      type: "article",
      locale: "en_IN",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt ?? post.createdAt,
      authors: [post.authorName ?? PUBLISHER_NAME],
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: post.title ? stripHtml(post.title) : "Preqt Community Post",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },

    authors: [{ name: post.authorName ?? PUBLISHER_NAME }],
    publisher: PUBLISHER_NAME,
    alternates: {
      canonical: `${SITE_URL}/community/${post.slug || slug}`,
    },
  };
}

export default async function CommunityPostPage({ params }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const metadata = await fetchPostBySlug(slug);

  if (!metadata) {
    notFound();
  }

  const cleanHeadline = stripHtml(metadata.title || FALLBACK_TITLE);
  const cleanBody = stripHtml(metadata.content || metadata.excerpt || FALLBACK_DESCRIPTION);
  const rawImage = Array.isArray(metadata.mediaUrl) ? metadata.mediaUrl[0] : metadata.mediaUrl;
  const imageStr = typeof rawImage === "string" ? rawImage : rawImage?.url;
  const absoluteImage = imageStr
    ? (`${IMAGE_URL}/${imageStr}`).replaceAll("public/", "")
    : `${SITE_URL}/default_meta_image.png`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: cleanHeadline,
            datePublished: metadata.createdAt,
            dateModified: metadata.updatedAt ?? metadata.createdAt,
            author: {
              "@type": "Person",
              name: metadata.authorName ?? PUBLISHER_NAME,
            },
            publisher: {
              "@type": "Organization",
              name: PUBLISHER_NAME,
              url: SITE_URL,
            },
            mainEntityOfPage: `${SITE_URL}/community/${metadata.slug || slug}`,
            articleBody: cleanBody,
            image: [absoluteImage],
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: Number(metadata.likesCount) || 0,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${SITE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Community",
                item: `${SITE_URL}/community`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: cleanHeadline,
                item: `${SITE_URL}/community/${metadata.slug || slug}`,
              },
            ],
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className={Styles.breadcrumbNav}>
        <ol className={Styles.breadcrumbList}>
          <li className={Styles.breadcrumbItem}>
            <Link href="/" className={Styles.breadcrumbLink} aria-label="Home" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.0652 6.31555L12.5768 2.60451C11.0649 1.35449 8.93377 1.35449 7.42187 2.60451L2.93349 6.31555C2.12484 6.98415 1.66602 7.99787 1.66602 9.05558V14.8427C1.66602 16.722 3.11114 18.3337 4.99935 18.3337H6.66602C7.58649 18.3337 8.33268 17.5875 8.33268 16.667V13.9568C8.33268 12.9006 9.1261 12.1326 9.99935 12.1326C10.8726 12.1326 11.666 12.9006 11.666 13.9568V16.667C11.666 17.5875 12.4122 18.3337 13.3327 18.3337H14.9993C16.8876 18.3337 18.3327 16.722 18.3327 14.8427V9.05558C18.3327 7.99788 17.8738 6.98415 17.0652 6.31555Z" fill="url(#community_home_gradient)" />
                <defs>
                  <linearGradient id="community_home_gradient" x1="0.0246017" y1="0.530628" x2="17.1963" y2="18.3337" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF2D0" />
                    <stop offset="1" stopColor="#8E6B0F" />
                  </linearGradient>
                </defs>
              </svg>
            </Link>
          </li>
          <li className={Styles.breadcrumbSeparator} aria-hidden="true">
            <svg
              width="8"
              height="10"
              viewBox="0 0 8 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.14206 13.6663C0.898251 13.6663 0.654443 13.573 0.468734 13.3873C0.0963594 13.0149 0.0963594 12.413 0.468734 12.0407L5.50958 6.99976L0.468734 1.95893C0.0963594 1.58656 0.0963594 0.984664 0.468734 0.612289C0.841109 0.239914 1.443 0.239914 1.81538 0.612289L7.52958 6.32651C7.90192 6.69884 7.90192 7.30076 7.52958 7.67309L1.81538 13.3873C1.62967 13.573 1.38586 13.6663 1.14206 13.6663Z"
                fill="#6b7280"
              />
            </svg>
          </li>
          <li className={Styles.breadcrumbItem}>
            <Link href="/community" className={Styles.breadcrumbLink} title="Return to Community Discussions">
              Community
            </Link>
          </li>
          <li className={Styles.breadcrumbSeparator} aria-hidden="true">
            <svg
              width="8"
              height="10"
              viewBox="0 0 8 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.14206 13.6663C0.898251 13.6663 0.654443 13.573 0.468734 13.3873C0.0963594 13.0149 0.0963594 12.413 0.468734 12.0407L5.50958 6.99976L0.468734 1.95893C0.0963594 1.58656 0.0963594 0.984664 0.468734 0.612289C0.841109 0.239914 1.443 0.239914 1.81538 0.612289L7.52958 6.32651C7.90192 6.69884 7.90192 7.30076 7.52958 7.67309L1.81538 13.3873C1.62967 13.573 1.38586 13.6663 1.14206 13.6663Z"
                fill="#6b7280"
              />
            </svg>
          </li>
          <li className={`${Styles.breadcrumbItem} ${Styles.breadcrumbCurrent}`} aria-current="page">
            <span className={Styles.breadcrumbTruncate} title={cleanHeadline}>
              {cleanHeadline}
            </span>
          </li>
        </ol>
      </nav>
      <div className={Styles.postDealMainContainer}>
        <PostDetails slug={slug} initialPost={metadata} />
      </div>
    </>
  );
}
