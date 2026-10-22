/**
 * Safely format and guard numerical values against null, undefined, NaN, or negative numbers.
 */

export const safeNumber = (val, fallback = 0) => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  if (isNaN(num)) return fallback;
  return num;
};

export const safePositiveNumber = (val, fallback = 0) => {
  const num = safeNumber(val, fallback);
  return Math.max(fallback, num);
};

export const formatDealCountText = (totalDeals, context = "general") => {
  const safeTotal = safePositiveNumber(totalDeals, 0);

  if (context === "remaining") {
    const remaining = Math.max(0, safeTotal - 1);
    return remaining > 0 ? `We have ${remaining} new deal${remaining === 1 ? '' : 's'}` : 'Explore new deals';
  }

  return safeTotal > 0 ? `We have ${safeTotal} new deal${safeTotal === 1 ? '' : 's'}` : 'Explore deals';
};

/**
 * Transforms h1 and h2 tags into h5 and h6 inside Observations & Insights rich text
 * to maintain strict SEO heading hierarchy under h4 section headers.
 */
export const transformObservationHtml = (html) => {
  if (!html || typeof html !== "string") return html;
  return html
    .replace(/<h1(\b[^>]*)>/gi, "<h5$1>")
    .replace(/<\/h1\s*>/gi, "</h5>")
    .replace(/<h2(\b[^>]*)>/gi, "<h6$1>")
    .replace(/<\/h2\s*>/gi, "</h6>");
};
