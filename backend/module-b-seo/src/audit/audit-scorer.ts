import * as cheerio from 'cheerio';

export interface AuditDetails {
  title: { text: string | null; length: number; ok: boolean };
  metaDescription: { text: string | null; length: number; ok: boolean };
  headings: { h1Count: number; h2Count: number; ok: boolean };
  keyword: {
    target: string | null;
    inTitle: boolean;
    inMetaDescription: boolean;
    inH1: boolean;
    ok: boolean;
  };
  images: { total: number; missingAlt: number; ok: boolean };
  links: { internal: number; external: number };
  wordCount: number;
}

export interface AuditResult {
  score: number;
  details: AuditDetails;
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_MIN = 70;
const META_MAX = 160;

export function scoreHtml(html: string, targetKeyword?: string | null, baseUrl?: string): AuditResult {
  const $ = cheerio.load(html);
  const keyword = targetKeyword?.trim().toLowerCase() || null;

  // ---- Title ----
  const titleText = $('title').first().text().trim() || null;
  const titleLength = titleText?.length ?? 0;
  const titleOk = titleLength >= TITLE_MIN && titleLength <= TITLE_MAX;

  // ---- Meta description ----
  const metaText = $('meta[name="description"]').attr('content')?.trim() || null;
  const metaLength = metaText?.length ?? 0;
  const metaOk = metaLength >= META_MIN && metaLength <= META_MAX;

  // ---- Headings ----
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const headingsOk = h1Count === 1; // exactly one H1 is the standard best practice

  // ---- Keyword usage ----
  const inTitle = !!keyword && !!titleText?.toLowerCase().includes(keyword);
  const inMeta = !!keyword && !!metaText?.toLowerCase().includes(keyword);
  const inH1 = !!keyword && $('h1').first().text().toLowerCase().includes(keyword);
  const keywordOk = !keyword || (inTitle && inH1); // if no keyword given, don't penalize

  // ---- Images / alt text ----
  const images = $('img');
  const totalImages = images.length;
  let missingAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (!alt || !alt.trim()) missingAlt++;
  });
  const imagesOk = totalImages === 0 || missingAlt === 0;

  // ---- Links ----
  let internal = 0;
  let external = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (href.startsWith('http') && baseUrl && !href.includes(new URL(baseUrl).hostname)) {
      external++;
    } else {
      internal++;
    }
  });

  // ---- Word count (body text) ----
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(' ').length : 0;

  const details: AuditDetails = {
    title: { text: titleText, length: titleLength, ok: titleOk },
    metaDescription: { text: metaText, length: metaLength, ok: metaOk },
    headings: { h1Count, h2Count, ok: headingsOk },
    keyword: { target: targetKeyword ?? null, inTitle, inMetaDescription: inMeta, inH1, ok: keywordOk },
    images: { total: totalImages, missingAlt, ok: imagesOk },
    links: { internal, external },
    wordCount,
  };

  // ---- Scoring: 100 points split across 5 weighted checks ----
  let score = 0;
  score += titleOk ? 25 : titleText ? 10 : 0;
  score += metaOk ? 20 : metaText ? 8 : 0;
  score += headingsOk ? 20 : h1Count > 0 ? 10 : 0;
  score += keywordOk ? 20 : 0;
  score += imagesOk ? 15 : totalImages === 0 ? 15 : 5;

  return { score: Math.round(score), details };
}