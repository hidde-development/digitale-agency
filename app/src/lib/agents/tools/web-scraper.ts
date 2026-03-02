import * as cheerio from 'cheerio';
import type { Tool } from '../types';

interface ScraperInput {
  url: string;
  mode?: 'full' | 'seo' | 'accessibility' | 'content';
}

interface ScraperResult {
  url: string;
  status: number;
  mode: string;
  data: Record<string, unknown>;
  error?: string;
}

async function fetchPage(url: string): Promise<{ html: string; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoldfizhBot/1.0; +https://www.goldfizh.nl)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'nl,en;q=0.9',
      },
    });

    const html = await response.text();
    return { html, status: response.status };
  } finally {
    clearTimeout(timeout);
  }
}

function extractFull($: cheerio.CheerioAPI, url: string) {
  return {
    ...extractSeo($, url),
    ...extractAccessibility($),
    ...extractContent($),
  };
}

function extractSeo($: cheerio.CheerioAPI, url: string) {
  const headings: Record<string, string[]> = {};
  for (let i = 1; i <= 6; i++) {
    const tags = $(`h${i}`)
      .map((_, el) => $(el).text().trim())
      .get();
    if (tags.length > 0) headings[`h${i}`] = tags;
  }

  const metaTags: Record<string, string> = {};
  $('meta').each((_, el) => {
    const name =
      $(el).attr('name') ||
      $(el).attr('property') ||
      $(el).attr('http-equiv');
    const content = $(el).attr('content');
    if (name && content) metaTags[name] = content;
  });

  const links = $('a[href]')
    .map((_, el) => ({
      text: $(el).text().trim(),
      href: $(el).attr('href') ?? '',
      rel: $(el).attr('rel') ?? '',
    }))
    .get();

  const internalLinks = links.filter(
    (l) => l.href.startsWith('/') || l.href.includes(new URL(url).hostname)
  );
  const externalLinks = links.filter(
    (l) =>
      l.href.startsWith('http') && !l.href.includes(new URL(url).hostname)
  );

  const canonical = $('link[rel="canonical"]').attr('href') ?? null;
  const hreflang = $('link[rel="alternate"][hreflang]')
    .map((_, el) => ({
      lang: $(el).attr('hreflang'),
      href: $(el).attr('href'),
    }))
    .get();

  const structuredData = $('script[type="application/ld+json"]')
    .map((_, el) => {
      try {
        return JSON.parse($(el).html() ?? '');
      } catch {
        return null;
      }
    })
    .get()
    .filter(Boolean);

  return {
    seo: {
      title: $('title').text().trim(),
      meta_tags: metaTags,
      headings,
      heading_hierarchy_valid:
        ($('h1').length === 1 && $('h2').length > 0) || $('h1').length === 1,
      canonical,
      hreflang,
      robots_meta: metaTags['robots'] ?? null,
      internal_links_count: internalLinks.length,
      external_links_count: externalLinks.length,
      internal_links_sample: internalLinks.slice(0, 10),
      external_links_sample: externalLinks.slice(0, 10),
      structured_data: structuredData,
      images_without_alt: $('img:not([alt]), img[alt=""]').length,
      total_images: $('img').length,
    },
  };
}

function extractAccessibility($: cheerio.CheerioAPI) {
  // Images
  const images = $('img')
    .map((_, el) => ({
      src: $(el).attr('src') ?? '',
      alt: $(el).attr('alt') ?? null,
      has_alt: $(el).attr('alt') !== undefined,
      alt_empty: $(el).attr('alt') === '',
    }))
    .get();

  // Form inputs
  const formInputs = $('input, select, textarea')
    .map((_, el) => {
      const id = $(el).attr('id');
      const name = $(el).attr('name');
      const type = $(el).attr('type') ?? $(el).prop('tagName')?.toLowerCase();
      const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
      const ariaLabel = $(el).attr('aria-label') ?? null;
      const ariaLabelledby = $(el).attr('aria-labelledby') ?? null;
      return {
        type,
        name,
        has_label: hasLabel,
        has_aria_label: !!ariaLabel || !!ariaLabelledby,
        labelled: hasLabel || !!ariaLabel || !!ariaLabelledby,
      };
    })
    .get();

  // ARIA landmarks
  const landmarks = $('[role]')
    .map((_, el) => ({
      role: $(el).attr('role'),
      tag: $(el).prop('tagName')?.toLowerCase(),
    }))
    .get();

  // Semantic elements
  const semanticElements = {
    header: $('header').length,
    nav: $('nav').length,
    main: $('main').length,
    footer: $('footer').length,
    article: $('article').length,
    section: $('section').length,
    aside: $('aside').length,
  };

  // Language attribute
  const htmlLang = $('html').attr('lang') ?? null;

  // Tabindex issues
  const positiveTabindex = $('[tabindex]')
    .filter((_, el) => {
      const val = parseInt($(el).attr('tabindex') ?? '0', 10);
      return val > 0;
    })
    .length;

  // Links and buttons
  const emptyLinks = $('a')
    .filter((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      const hasImg = $(el).find('img[alt]').length > 0;
      return !text && !ariaLabel && !hasImg;
    })
    .length;

  const emptyButtons = $('button')
    .filter((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      return !text && !ariaLabel;
    })
    .length;

  // Skip navigation
  const hasSkipNav =
    $('a[href="#main"], a[href="#content"], a[href="#main-content"], .skip-nav, .skip-link, [class*="skip"]').length > 0;

  // Heading order
  const headingLevels = $('h1, h2, h3, h4, h5, h6')
    .map((_, el) => parseInt($(el).prop('tagName')?.replace('H', '') ?? '0', 10))
    .get();
  let headingOrderValid = true;
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      headingOrderValid = false;
      break;
    }
  }

  return {
    accessibility: {
      lang_attribute: htmlLang,
      has_lang: !!htmlLang,
      images: {
        total: images.length,
        missing_alt: images.filter((i) => !i.has_alt).length,
        empty_alt: images.filter((i) => i.alt_empty).length,
        sample: images.slice(0, 15),
      },
      forms: {
        total_inputs: formInputs.length,
        unlabelled: formInputs.filter((f) => !f.labelled).length,
        sample: formInputs.slice(0, 10),
      },
      landmarks: {
        aria_roles: landmarks.slice(0, 20),
        semantic_elements: semanticElements,
        has_main: semanticElements.main > 0,
        has_nav: semanticElements.nav > 0,
      },
      navigation: {
        has_skip_nav: hasSkipNav,
        positive_tabindex_count: positiveTabindex,
        empty_links: emptyLinks,
        empty_buttons: emptyButtons,
      },
      headings: {
        order: headingLevels,
        order_valid: headingOrderValid,
        h1_count: headingLevels.filter((h) => h === 1).length,
      },
    },
  };
}

function extractContent($: cheerio.CheerioAPI) {
  // Remove scripts, styles, nav, footer for content extraction
  const contentClone = $.root().clone();
  contentClone
    .find('script, style, nav, footer, header, iframe, noscript')
    .remove();

  const bodyText = contentClone.find('body').text().replace(/\s+/g, ' ').trim();

  const wordCount = bodyText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return {
    content: {
      word_count: wordCount,
      text_preview: bodyText.slice(0, 1500),
      meta_description: $('meta[name="description"]').attr('content') ?? null,
      og_title: $('meta[property="og:title"]').attr('content') ?? null,
      og_description:
        $('meta[property="og:description"]').attr('content') ?? null,
      og_image: $('meta[property="og:image"]').attr('content') ?? null,
    },
  };
}

export const webScraperTool: Tool = {
  name: 'web_scraper',
  description:
    'Haal een webpagina op en analyseer de inhoud. Gebruik mode "seo" voor SEO-analyse, "accessibility" voor WCAG/toegankelijkheidscheck, "content" voor inhoudsextractie, of "full" voor een complete analyse.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'De volledige URL van de pagina om te analyseren (inclusief https://)',
      },
      mode: {
        type: 'string',
        enum: ['full', 'seo', 'accessibility', 'content'],
        description:
          'Analysemodus: "full" = alles, "seo" = SEO-specifiek, "accessibility" = WCAG/toegankelijkheid, "content" = inhoudsextractie',
      },
    },
    required: ['url'],
  },

  async execute(input: Record<string, unknown>): Promise<ScraperResult> {
    const { url, mode = 'full' } = input as unknown as ScraperInput;

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
          url,
          status: 0,
          mode: mode ?? 'full',
          data: {},
          error: 'Alleen HTTP en HTTPS URLs zijn toegestaan.',
        };
      }
    } catch {
      return {
        url,
        status: 0,
        mode: mode ?? 'full',
        data: {},
        error: 'Ongeldige URL. Geef een volledige URL inclusief https://',
      };
    }

    try {
      const { html, status } = await fetchPage(parsedUrl.toString());
      const $ = cheerio.load(html);

      let data: Record<string, unknown>;
      switch (mode) {
        case 'seo':
          data = extractSeo($, parsedUrl.toString());
          break;
        case 'accessibility':
          data = extractAccessibility($);
          break;
        case 'content':
          data = extractContent($);
          break;
        default:
          data = extractFull($, parsedUrl.toString());
      }

      return { url: parsedUrl.toString(), status, mode: mode ?? 'full', data };
    } catch (err) {
      return {
        url: parsedUrl.toString(),
        status: 0,
        mode: mode ?? 'full',
        data: {},
        error:
          err instanceof Error
            ? `Pagina kon niet worden opgehaald: ${err.message}`
            : 'Onbekende fout bij het ophalen van de pagina.',
      };
    }
  },
};
