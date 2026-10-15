import * as cheerio from 'cheerio';

export interface LinkCheckResult {
  url: string;
  status: number | null; // null = request failed entirely (timeout, DNS, etc.)
  ok: boolean;
}

export interface TechnicalDetails {
  sitemap: { checkedUrl: string; found: boolean; isValidXml: boolean };
  robotsTxt: { checkedUrl: string; found: boolean };
  metaTags: {
    hasCanonical: boolean;
    canonicalHref: string | null;
    hasViewport: boolean;
    hasCharset: boolean;
    robotsContent: string | null; // e.g. "index, follow" or "noindex"
  };
  brokenLinks: {
    checkedCount: number;
    brokenCount: number;
    results: LinkCheckResult[]; // capped list, see MAX_LINKS_TO_CHECK
  };
}

export interface TechnicalResult {
  score: number;
  details: TechnicalDetails;
}

const FETCH_TIMEOUT_MS = 8_000;
const MAX_LINKS_TO_CHECK = 15; // crawling every link on a large page would be slow; cap it

async function fetchStatus(url: string): Promise<{ ok: boolean; status: number | null }> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Mozilla/5.0 (SEO-Audit-Bot)' },
    });
    // Some servers don't support HEAD properly and return 405 — fall back to GET in that case
    if (res.status === 405) {
      const getRes = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'User-Agent': 'Mozilla/5.0 (SEO-Audit-Bot)' },
      });
      return { ok: getRes.ok, status: getRes.status };
    }
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: null };
  }
}

async function checkTextResourceExists(url: string): Promise<{ found: boolean; body: string | null }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Mozilla/5.0 (SEO-Audit-Bot)' },
    });
    if (!res.ok) return { found: false, body: null };
    return { found: true, body: await res.text() };
  } catch {
    return { found: false, body: null };
  }
}

export async function runTechnicalCheck(pageUrl: string): Promise<TechnicalResult> {
  const parsed = new URL(pageUrl);
  const origin = parsed.origin;

  // ---- Fetch the page itself ----
  const pageRes = await fetch(pageUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'User-Agent': 'Mozilla/5.0 (SEO-Audit-Bot)' },
  });
  const html = await pageRes.text();
  const $ = cheerio.load(html);

  // ---- Sitemap ----
  const sitemapUrl = `${origin}/sitemap.xml`;
  const sitemapCheck = await checkTextResourceExists(sitemapUrl);
  const isValidXml = !!sitemapCheck.body && sitemapCheck.body.trim().startsWith('<?xml');

  // ---- robots.txt ----
  const robotsUrl = `${origin}/robots.txt`;
  const robotsCheck = await checkTextResourceExists(robotsUrl);

  // ---- Meta tags ----
  const canonicalHref = $('link[rel="canonical"]').attr('href') || null;
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasCharset = $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0;
  const robotsContent = $('meta[name="robots"]').attr('content') || null;

  // ---- Broken links (capped) ----
  const hrefs = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const absolute = new URL(href, pageUrl).toString();
      hrefs.add(absolute);
    } catch {
      // ignore malformed hrefs
    }
  });

  const linksToCheck = Array.from(hrefs).slice(0, MAX_LINKS_TO_CHECK);
  const linkResults: LinkCheckResult[] = [];
  for (const link of linksToCheck) {
    const { ok, status } = await fetchStatus(link);
    linkResults.push({ url: link, status, ok });
  }
  const brokenCount = linkResults.filter((r) => !r.ok).length;

  const details: TechnicalDetails = {
    sitemap: { checkedUrl: sitemapUrl, found: sitemapCheck.found, isValidXml },
    robotsTxt: { checkedUrl: robotsUrl, found: robotsCheck.found },
    metaTags: {
      hasCanonical: !!canonicalHref,
      canonicalHref,
      hasViewport,
      hasCharset,
      robotsContent,
    },
    brokenLinks: {
      checkedCount: linkResults.length,
      brokenCount,
      results: linkResults,
    },
  };

  // ---- Scoring: 100 points across 4 weighted checks ----
  let score = 0;
  score += sitemapCheck.found && isValidXml ? 25 : sitemapCheck.found ? 15 : 0;
  score += robotsCheck.found ? 10 : 0;
  score += hasViewport ? 15 : 0;
  score += hasCharset ? 10 : 0;
  score += canonicalHref ? 15 : 0;
  score += linksToCheck.length === 0 ? 25 : Math.round((1 - brokenCount / linksToCheck.length) * 25);

  return { score: Math.round(score), details };
}