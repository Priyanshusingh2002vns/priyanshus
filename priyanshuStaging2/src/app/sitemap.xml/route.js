export const revalidate = 3600;

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.preqt.club'
).replace(/\/+$/, "");

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_USER_BASE ||
  'https://api.preqt.club/'
).replace(/\/+$/, "");

// Endpoints
const DEALS_ENDPOINT = '/admin/api/deals/all-deals';
const DEALS_FALLBACK_ENDPOINT = '/admin/api/deals/list-all-deals';
const POSTS_ENDPOINT = '/admin/api/community/posts';

// Fixed baseline date for content missing an explicit database timestamp
// (prevents Googlebot from detecting synthetic "now" timestamps on unchanged content)
const FALLBACK_STATIC_DATE = new Date("2025-01-01T00:00:00.000Z");

// Priority and Frequency constants
const SEO_CONFIG = {
  home: { priority: 1.0, changeFrequency: 'daily' },
  dealsList: { priority: 0.9, changeFrequency: 'daily' },
  dealDetail: { priority: 0.9, changeFrequency: 'daily' },
  staticPage: { priority: 0.8, changeFrequency: 'weekly' },
  communityList: { priority: 0.7, changeFrequency: 'daily' },
  communityDetail: { priority: 0.7, changeFrequency: 'daily' },
};

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  // Fetch with pagination and timeout
  async function fetchAllPages(endpoint, extraParams = {}, type = "item") {
    let allData = [];
    let page = 1;
    let hasMore = true;
    const limit = 500;
    const MAX_PAGES = 50; // Safety limit

    while (hasMore && page <= MAX_PAGES) {
      const params = new URLSearchParams({ ...extraParams, limit: String(limit), page: String(page) });
      const apiUrl = `${API_BASE_URL}${endpoint}?${params.toString()}`;

      try {
        const fetchPromise = fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 3600 }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request Timeout')), 15000)
        );

        const res = await Promise.race([fetchPromise, timeoutPromise]);

        if (!res.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[Sitemap] Failed to fetch ${type}, URL: ${apiUrl}, Status: ${res.status}`);
          }
          break;
        }

        const data = await res.json();
        const items = Array.isArray(data?.data?.data)
          ? data.data.data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.deals)
          ? data.data.deals
          : Array.isArray(data?.deals)
          ? data.deals
          : Array.isArray(data)
          ? data
          : [];

        if (Array.isArray(items) && items.length > 0) {
          allData = [...allData, ...items];
          if (items.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Sitemap] Error fetching ${type} from ${apiUrl}:`, error.message);
        }
        break;
      }
    }

    return allData;
  }

  // 1. Parallel fetching for dynamic content
  let dealsResult = [];
  let postsResult = [];

  try {
    const fetchDeals = async () => {
      let deals = await fetchAllPages(DEALS_ENDPOINT, {}, 'deals');
      if (!deals || deals.length === 0) {
        // Resilient fallback if primary endpoint returns empty
        deals = await fetchAllPages(DEALS_FALLBACK_ENDPOINT, {}, 'deals fallback');
      }
      return deals;
    };

    [dealsResult, postsResult] = await Promise.all([
      fetchDeals(),
      fetchAllPages(POSTS_ENDPOINT, { type: 'post' }, 'community posts')
    ]);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("[Sitemap] Parallel API fetch error:", err);
    }
  }

  // Sort deals so live deals come first
  const statusPriority = { live: 1, closed: 2 };
  const sortedDeals = [...dealsResult].sort((a, b) => {
    const priorityA = statusPriority[a?.status?.toLowerCase()] ?? 3;
    const priorityB = statusPriority[b?.status?.toLowerCase()] ?? 3;
    return priorityA - priorityB;
  });

  const extractItemDate = (item) => {
    if (!item || typeof item !== 'object') return null;

    const dateVal =
      item.updatedAt ||
      item.updated_at ||
      item.deal_setpData?.updated_at ||
      item.deal_overview?.updated_at ||
      item.updated_on ||
      item.createdAt ||
      item.created_at ||
      item.created_on ||
      item.deal_setpData?.created_at ||
      item.deal_overview?.created_at ||
      item.deal_setpData?.live_at ||
      item.live_at ||
      item.published_at ||
      item.date;

    if (dateVal) {
      const parsed = new Date(dateVal);
      // Ensure date is valid and not in the future
      if (!isNaN(parsed.getTime()) && parsed.getTime() <= Date.now()) {
        return parsed;
      }
    }
    return null;
  };

  // Helper to validate and map dynamic routes
  const mapDynamicRoutes = (items, basePath) => {
    return items
      .filter(item => item && item.slug && typeof item.slug === 'string' && item.slug.trim() !== "")
      .map(item => {
        const cleanSlug = item.slug.trim().replace(/^\/+|\/+$/g, '');
        const itemDate = extractItemDate(item);
        return {
          url: `${BASE_URL}${basePath}/${cleanSlug}`,
          lastModified: itemDate || FALLBACK_STATIC_DATE,
          hasRealDate: Boolean(itemDate),
        };
      });
  };

  const dealUrls = mapDynamicRoutes(sortedDeals, '/deals');
  const communityUrls = mapDynamicRoutes(postsResult, '/community');

  // Compute latest content timestamps for aggregate index pages using only authentic DB dates
  const validDealDates = dealUrls.filter(d => d.hasRealDate).map(d => d.lastModified.getTime());
  const latestDealDate = validDealDates.length > 0
    ? new Date(Math.max(...validDealDates))
    : FALLBACK_STATIC_DATE;

  const validPostDates = communityUrls.filter(c => c.hasRealDate).map(c => c.lastModified.getTime());
  const latestPostDate = validPostDates.length > 0
    ? new Date(Math.max(...validPostDates))
    : FALLBACK_STATIC_DATE;

  const latestSiteDate = (validDealDates.length > 0 || validPostDates.length > 0)
    ? new Date(Math.max(latestDealDate.getTime(), latestPostDate.getTime()))
    : FALLBACK_STATIC_DATE;

  // 2. Define static routes with accurate, real modification dates
  const staticRoutes = [
    { path: '', lastMod: latestSiteDate },
    { path: '/deals', lastMod: latestDealDate },
    { path: '/deals/upcoming-ipo', lastMod: latestDealDate },
    { path: '/deals/ipo', lastMod: latestDealDate },
    { path: '/deals/unlisted-shares', lastMod: latestDealDate },
    { path: '/deals/private-deals', lastMod: latestDealDate },
    { path: '/deals/startup-deals', lastMod: latestDealDate },
    { path: '/community', lastMod: latestPostDate },
    { path: '/market-analysis', lastMod: latestDealDate },
    { path: '/privacy-policy', lastMod: new Date("2026-08-15T00:00:00.000Z") },
    { path: '/terms-and-condition', lastMod: new Date("2026-08-15T00:00:00.000Z") },
    { path: '/become-a-partner', lastMod: new Date("2026-08-15T00:00:00.000Z") },
    { path: '/deal-sourcing', lastMod: new Date("2026-08-15T00:00:00.000Z") },
    { path: '/support', lastMod: new Date("2026-08-15T00:00:00.000Z") },
    { path: '/data-deletion-policy', lastMod: new Date("2026-08-15T00:00:00.000Z") },
  ].map(({ path, lastMod }) => ({
    url: path === '/' ? `${BASE_URL}/` : `${BASE_URL}${path}`,
    lastModified: lastMod,
  }));

  // 3. Combine and Deduplicate
  const allUrls = [...staticRoutes, ...dealUrls, ...communityUrls];

  const uniqueUrlsMap = new Map();
  for (const item of allUrls) {
    if (!uniqueUrlsMap.has(item.url)) {
      uniqueUrlsMap.set(item.url, item);
    }
  }

  const finalUrls = Array.from(uniqueUrlsMap.values());

  // 4. Generate XML format (clean loc and lastmod tags only)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${finalUrls.map(urlObj => `  <url>
    <loc>${escapeXml(urlObj.url)}</loc>
    <lastmod>${urlObj.lastModified.toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
