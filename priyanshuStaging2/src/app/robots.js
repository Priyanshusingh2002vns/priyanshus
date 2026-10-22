export default function robots() {
  return {
    rules: {
      userAgent: [
        // Search engines
        'Googlebot',
        'Googlebot-Image',
        'Bingbot',
        'DuckDuckBot',
        'Applebot',
        'YandexBot',

        // OpenAI (ChatGPT)
        'GPTBot',
        'OAI-SearchBot',
        'ChatGPT-User',

        // Anthropic (Claude)
        'ClaudeBot',
        'Claude-SearchBot',
        'Claude-User',
        'anthropic-ai',

        // Google AI (Gemini / AI Overviews training opt-in)
        'Google-Extended',
        'GoogleOther',

        // Perplexity
        'PerplexityBot',
        'Perplexity-User',

        // Microsoft / Apple / Meta / Amazon AI
        'Applebot-Extended',
        'meta-externalagent',
        'meta-externalfetcher',
        'FacebookBot',
        'Amazonbot',

        // Other AI assistants and datasets
        'DuckAssistBot',
        'MistralAI-User',
        'cohere-ai',
        'YouBot',
        'CCBot',
        'Diffbot',

        // Everyone else
        '*',
      ],
      allow: '/',
      disallow: [
        '/api/',
        '/account/',
        '/account',
        '/app-redirect',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.preqt.club'}/sitemap.xml`,
  };
}
