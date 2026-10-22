/**
 * Deal Utility Functions for PrEqt Catalog and Listings
 * 
 * Provides server-side pruning of heavy deal records to optimize initial SSR HTML size.
 * Strips massive nested subtrees (deal_overview balance sheets, P&L, cash flow, board bios,
 * deal_setpData admin forms, preqt_summary rich text, documents, faqs) while preserving
 * all display metrics, badge flags, and filter properties required by AllDeals and DealCard.
 */

export function pruneDealForListing(deal) {
  if (!deal || typeof deal !== "object") return deal;

  // 1. Merge tags from root and step data fallback
  const rootTags = Array.isArray(deal.tags)
    ? deal.tags
    : (deal.tags ? [deal.tags] : []);
  const stepTags = Array.isArray(deal.deal_setpData?.tags)
    ? deal.deal_setpData.tags
    : (Array.isArray(deal.deal_setpData?.tags?.data) ? deal.deal_setpData.tags.data : []);
  const tags = rootTags.length > 0 ? rootTags : stepTags;

  // 2. Merge key highlights
  const keyHighlights = Array.isArray(deal.key_highlights)
    ? deal.key_highlights
    : (Array.isArray(deal.deal_setpData?.key_highlights)
        ? deal.deal_setpData.key_highlights
        : (Array.isArray(deal.deal_setpData?.key_highlights?.data) ? deal.deal_setpData.key_highlights.data : []));

  // 3. Merge companies_sectors
  const rootSectors = Array.isArray(deal.companies_sectors)
    ? deal.companies_sectors
    : (Array.isArray(deal.companies_sectors?.data) ? deal.companies_sectors.data : (deal.companies_sectors ? [deal.companies_sectors] : []));
  const stepSectors = Array.isArray(deal.deal_setpData?.companies_sectors)
    ? deal.deal_setpData.companies_sectors
    : (Array.isArray(deal.deal_setpData?.companies_sectors?.data) ? deal.deal_setpData.companies_sectors.data : []);
  const companiesSectors = rootSectors.length > 0 ? rootSectors : stepSectors;

  // 4. Resolve high conviction flag (handle typo and standard naming)
  const isHighConviction = Boolean(
    deal.hight_conviction === true ||
    deal.hight_conviction === "true" ||
    deal.high_conviction === true ||
    deal.high_conviction === "true"
  );

  return {
    // Identity & Routing
    id: deal.id || deal._id,
    _id: deal._id || deal.id,
    deal_id: deal.deal_id || deal.id || deal._id,
    slug: deal.slug || "",

    // Company Brand & Basics
    company_name:
      deal.company_name ||
      deal.deal_setpData?.company_name ||
      deal.deal_overview?.company_name ||
      "",
    brand_name: deal.brand_name || "",
    company_intro: deal.company_intro || "",
    tag_line:
      deal.tag_line ||
      (typeof deal.deal_setpData?.tag_line === "object"
        ? deal.deal_setpData?.tag_line?.data
        : deal.deal_setpData?.tag_line) ||
      "",
    symbol: deal.symbol || "",
    company_logo: deal.company_logo || deal.deal_setpData?.company_logo || [],

    // Deal Classification & Badges
    deal_type: deal.deal_type || deal.deal_setpData?.deal_type || "",
    deal_sub_type: deal.deal_sub_type || deal.deal_setpData?.deal_sub_type || null,
    status: deal.status || "",
    hidden_status: deal.hidden_status || "",
    is_deep_dive: Boolean(deal.is_deep_dive),
    exclusive_deal: Boolean(deal.exclusive_deal),
    is_sme: Boolean(deal.is_sme),
    high_conviction: isHighConviction,
    hight_conviction: isHighConviction,

    // Filters, Tags, Taxonomy
    tags,
    key_highlights: keyHighlights,
    companies_sectors: companiesSectors,
    sector_industry: deal.sector_industry || "",
    company_stage: deal.company_stage || "",
    stage: deal.stage || "",

    // Ratings & Community Engagement
    ipo_review_rating: deal.ipo_review_rating || null,
    qa_count: deal.qa_count ?? 0,
    user_visit_count: deal.user_visit_count ?? deal.view_count ?? deal.views ?? 0,
    view_count: deal.view_count ?? deal.user_visit_count ?? 0,
    views: deal.views ?? deal.user_visit_count ?? 0,
    raised_amount: deal.raised_amount ?? 0,

    // Dates & Timeline
    timeline_ipo_open_date: deal.timeline_ipo_open_date || null,
    timeline_ipo_close_date: deal.timeline_ipo_close_date || null,
    bidding_end_date: deal.bidding_end_date || null,
    close_date: deal.close_date || null,
    listing_timeline: deal.listing_timeline || null,
    createdAt: deal.createdAt || null,
    updatedAt: deal.updatedAt || null,
    live_at: deal.live_at || deal.liveAt || null,
    liveAt: deal.liveAt || deal.live_at || null,

    // Financial & Valuation Metrics (preserves { data, label_name } objects when delivered by API)
    valuation_in_cr: deal.valuation_in_cr ?? null,
    per_share_price: deal.per_share_price ?? null,
    offer_price: deal.offer_price ?? null,
    min_investment_amount_in_inr: deal.min_investment_amount_in_inr ?? null,
    min_investment_lot_size: deal.min_investment_lot_size ?? null,
    lot_size_share: deal.lot_size_share ?? null,
    issue_size_overall: deal.issue_size_overall ?? null,
    issue_size_amount: deal.issue_size_amount ?? null,
    target_funding_in_cr: deal.target_funding_in_cr ?? null,
    gmp: deal.gmp ?? null,
    estimated_gain_loss: deal.estimated_gain_loss ?? null,

    // Financial Ratios & Performance Metrics
    revenue_fy25_in_cr: deal.revenue_fy25_in_cr ?? null,
    pat_fy25_in_cr: deal.pat_fy25_in_cr ?? null,
    pe_multiple: deal.pe_multiple ?? null,
    cagr_growth_3y_percent: deal.cagr_growth_3y_percent ?? null,
    roce_fy25_percent: deal.roce_fy25_percent ?? null,

    // Startup & Private Metrics
    round_size: deal.round_size ?? null,
    round_size_in_cr: deal.round_size_in_cr ?? null,
    rev_arr: deal.rev_arr ?? null,
    rev_arr_in_cr: deal.rev_arr_in_cr ?? null,
    gross_margin: deal.gross_margin ?? null,
    gross_margin_percent: deal.gross_margin_percent ?? null,
    growth_yoy: deal.growth_yoy ?? null,
    min_ticket: deal.min_ticket ?? null,
    min_ticket_in_inr: deal.min_ticket_in_inr ?? null,
  };
}
