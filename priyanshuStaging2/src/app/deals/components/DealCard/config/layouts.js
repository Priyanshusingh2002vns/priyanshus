export const CARD_LAYOUTS = {
    public_deep_dive: {
        sections: ['header', 'companyInfo', 'heroMetrics', 'actionButton'],
        heroStyle: 'divided',
        ratingStyle: 'large',
    },
    featured_deal: {
        sections: ['header_featured', 'companyInfo', 'tagline', 'ratingLarge', 'heroMetrics', 'actionButton'],
        heroStyle: 'divided',
        ratingStyle: 'none', // using custom ratingLarge section instead
    },
    public_standard: {
        sections: ['header', 'companyInfo', 'tagline', 'heroMetrics', 'metricsGrid', 'tags', 'footer'],
        heroStyle: 'boxes',
        ratingStyle: 'pill',
    },
    unlisted_nse: {
        sections: ['header', 'companyInfo', 'tagline', 'heroMetrics', 'metricsGrid', 'tags', 'footer'],
        heroStyle: 'boxes',
        ratingStyle: 'pill',
    },
    pre_ipo_exclusive: {
        sections: ['header', 'companyInfo', 'tagline', 'metricsGrid', 'progress', 'tags', 'footer'],
        heroStyle: 'none',
        ratingStyle: 'none',
    },
    series_a: {
        sections: ['header', 'companyInfo', 'tagline', 'heroMetrics', 'metricsGrid', 'progress', 'tags', 'footer'],
        heroStyle: 'boxes',
        ratingStyle: 'none',
    },
    ofs: {
        sections: ['header', 'companyInfo', 'tagline', 'heroMetrics', 'metricsGrid', 'tags', 'footer'],
        heroStyle: 'boxes',
        ratingStyle: 'none',
        hasOFSGradient: true
    }
};
