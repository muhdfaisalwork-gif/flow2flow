// ============================================================================
// Shadow Flow — SEO & AI SEO Engine
// Built-in heuristics for On-Page SEO scoring, keyword density, readability,
// heading hierarchy verification, Schema.org JSON-LD generation, and
// strict 82 Human-Natural Writing Rules verification.
// Inspired by sultrix-seo & modern Google Search / Perplexity / AI search standards.
// ============================================================================

import { auditHumanNaturalWriting, HumanizerAuditResult } from './humanizerRules';
import { auditGeoReadiness, GeoAuditResult } from './geoEngine';

export interface SeoAuditResult {
  score: number; // 0 - 100
  rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  wordCount: number;
  readingTimeMinutes: number;
  keywordDensity: {
    keyword: string;
    count: number;
    densityPct: number;
    status: 'optimal' | 'low' | 'stuffed';
  };
  readability: {
    avgSentenceLength: number;
    passiveVoiceRatio: number;
    rating: 'optimal' | 'moderate' | 'difficult';
  };
  titleAnalysis: {
    title: string;
    charCount: number;
    hasKeyword: boolean;
    status: 'optimal' | 'too-short' | 'too-long' | 'missing';
  };
  metaDescriptionAnalysis: {
    description: string;
    charCount: number;
    hasKeyword: boolean;
    status: 'optimal' | 'too-short' | 'too-long' | 'missing';
  };
  headingsAnalysis: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasKeywordInH1: boolean;
    hasKeywordInH2: boolean;
    hierarchyValid: boolean;
  };
  humanizer: HumanizerAuditResult;
  geo: GeoAuditResult;
  recommendations: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
    impact: string;
  }>;
  jsonLdSchema: string;
}

export function countWords(text: string): number {
  if (!text) return 0;
  const matches = text.match(/[A-Za-z0-9'-]+/g);
  return matches ? matches.length : 0;
}

export function calculateKeywordDensity(text: string, keyword: string) {
  const total = countWords(text);
  if (total === 0 || !keyword.trim()) {
    return { count: 0, densityPct: 0, status: 'low' as const };
  }

  const cleanKeyword = keyword.trim().toLowerCase();
  const kwWords = cleanKeyword.split(/\s+/);
  const regex = new RegExp(`\\b${cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const matches = text.match(regex);
  const matchCount = matches ? matches.length : 0;

  const densityPct = parseFloat(((matchCount * kwWords.length / total) * 100).toFixed(2));

  let status: 'optimal' | 'low' | 'stuffed' = 'optimal';
  if (densityPct < 0.5) status = 'low';
  else if (densityPct > 3.0) status = 'stuffed';

  return {
    count: matchCount,
    densityPct,
    status,
  };
}

export function calculateReadability(text: string) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) {
    return { avgSentenceLength: 0, passiveVoiceRatio: 0, rating: 'moderate' as const };
  }

  const totalWords = countWords(text);
  const avgSentenceLength = parseFloat((totalWords / sentences.length).toFixed(1));

  // Heuristic passive voice detection: (is/are/was/were/be/been/being + [word]ed)
  const passiveRegex = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveMatches = sentences.filter(s => passiveRegex.test(s)).length;
  const passiveVoiceRatio = parseFloat((passiveMatches / sentences.length).toFixed(2));

  let rating: 'optimal' | 'moderate' | 'difficult' = 'optimal';
  if (avgSentenceLength > 24 || passiveVoiceRatio > 0.35) {
    rating = 'difficult';
  } else if (avgSentenceLength > 18 || passiveVoiceRatio > 0.2) {
    rating = 'moderate';
  }

  return {
    avgSentenceLength,
    passiveVoiceRatio,
    rating,
  };
}

export function auditContentForSeo(params: {
  title: string;
  metaDescription: string;
  content: string;
  targetKeyword: string;
  author?: string;
  url?: string;
}): SeoAuditResult {
  const { title, metaDescription, content, targetKeyword, author = 'Shadow Flow Research', url = 'https://shadowflow.dev/blog' } = params;
  const totalWords = countWords(content);
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  const kw = targetKeyword.toLowerCase().trim();
  const kwDensity = calculateKeywordDensity(content, kw);
  const readability = calculateReadability(content);

  // Title Analysis
  const titleChars = title.trim().length;
  const titleHasKw = kw ? title.toLowerCase().includes(kw) : false;
  let titleStatus: 'optimal' | 'too-short' | 'too-long' | 'missing' = 'optimal';
  if (titleChars === 0) titleStatus = 'missing';
  else if (titleChars < 30) titleStatus = 'too-short';
  else if (titleChars > 65) titleStatus = 'too-long';

  // Meta Description Analysis
  const descChars = metaDescription.trim().length;
  const descHasKw = kw ? metaDescription.toLowerCase().includes(kw) : false;
  let descStatus: 'optimal' | 'too-short' | 'too-long' | 'missing' = 'optimal';
  if (descChars === 0) descStatus = 'missing';
  else if (descChars < 100) descStatus = 'too-short';
  else if (descChars > 165) descStatus = 'too-long';

  // Heading Analysis from Markdown / HTML
  const h1Matches = content.match(/^(?:#\s+.+|<h1[^>]*>.*?<\/h1>)/gim) || [];
  const h2Matches = content.match(/^(?:##\s+.+|<h2[^>]*>.*?<\/h2>)/gim) || [];
  const h3Matches = content.match(/^(?:###\s+.+|<h3[^>]*>.*?<\/h3>)/gim) || [];

  const hasKwInH1 = h1Matches.some(h => h.toLowerCase().includes(kw));
  const hasKwInH2 = h2Matches.some(h => h.toLowerCase().includes(kw));
  const hierarchyValid = h1Matches.length === 1 && (h2Matches.length > 0 || totalWords < 300);

  // Calculate Score (out of 100)
  let score = 100;
  const recommendations: SeoAuditResult['recommendations'] = [];

  // Title score deductions
  if (titleStatus === 'missing') {
    score -= 20;
    recommendations.push({ type: 'critical', message: 'Missing article title tag.', impact: '-20 pts' });
  } else {
    if (titleStatus !== 'optimal') {
      score -= 5;
      recommendations.push({ type: 'warning', message: `Title length (${titleChars} chars) outside optimal 50-60 character range.`, impact: '-5 pts' });
    }
    if (!titleHasKw && kw) {
      score -= 10;
      recommendations.push({ type: 'critical', message: `Target keyword "${targetKeyword}" missing from Title tag.`, impact: '-10 pts' });
    }
  }

  // Meta description deductions
  if (descStatus === 'missing') {
    score -= 15;
    recommendations.push({ type: 'critical', message: 'Missing Meta Description. Search engines will generate an untargeted snippet.', impact: '-15 pts' });
  } else {
    if (descStatus !== 'optimal') {
      score -= 5;
      recommendations.push({ type: 'warning', message: `Meta Description length (${descChars} chars) outside 120-160 character sweet spot.`, impact: '-5 pts' });
    }
    if (!descHasKw && kw) {
      score -= 5;
      recommendations.push({ type: 'warning', message: `Target keyword "${targetKeyword}" not found in Meta Description.`, impact: '-5 pts' });
    }
  }

  // Content length deductions
  if (totalWords < 300) {
    score -= 20;
    recommendations.push({ type: 'critical', message: `Content is very short (${totalWords} words). Aim for at least 800+ words for deep technical authority.`, impact: '-20 pts' });
  } else if (totalWords < 600) {
    score -= 10;
    recommendations.push({ type: 'warning', message: `Content is moderately thin (${totalWords} words). Expand with examples or code snippets.`, impact: '-10 pts' });
  }

  // Keyword density deductions
  if (kw) {
    if (kwDensity.status === 'low') {
      score -= 10;
      recommendations.push({ type: 'warning', message: `Keyword density is low (${kwDensity.densityPct}%). Target 0.8% - 2.2% natural occurrence.`, impact: '-10 pts' });
    } else if (kwDensity.status === 'stuffed') {
      score -= 15;
      recommendations.push({ type: 'critical', message: `Keyword stuffing detected (${kwDensity.densityPct}%). Reduce frequency to avoid search penalties.`, impact: '-15 pts' });
    }
  }

  // Heading deductions
  if (h1Matches.length === 0) {
    score -= 10;
    recommendations.push({ type: 'critical', message: 'Missing top-level H1 heading in content.', impact: '-10 pts' });
  } else if (h1Matches.length > 1) {
    score -= 5;
    recommendations.push({ type: 'warning', message: 'Multiple H1 tags detected. Keep exactly one H1 per page for optimal hierarchy.', impact: '-5 pts' });
  }

  if (h2Matches.length === 0 && totalWords > 400) {
    score -= 8;
    recommendations.push({ type: 'warning', message: 'No H2 subheadings found. Break up long content with structured H2 sections.', impact: '-8 pts' });
  }

  if (kw && !hasKwInH2 && h2Matches.length > 0) {
    score -= 4;
    recommendations.push({ type: 'info', message: 'Include target keyword or semantic variations in at least one H2 heading.', impact: '-4 pts' });
  }

  // Readability deductions
  if (readability.rating === 'difficult') {
    score -= 8;
    recommendations.push({ type: 'warning', message: `Sentences are long (avg ${readability.avgSentenceLength} words/sentence) or overly passive (${Math.round(readability.passiveVoiceRatio * 100)}%). Simplify phrasing.`, impact: '-8 pts' });
  }

  // 82 Human-Natural Writing Rules Audit
  const humanizer = auditHumanNaturalWriting(content);
  if (humanizer.bannedWordsFound.length > 0) {
    const buzzwordPenalty = Math.min(20, humanizer.bannedWordsFound.reduce((acc, curr) => acc + curr.count * 3, 0));
    score -= buzzwordPenalty;
    const examples = humanizer.bannedWordsFound
      .slice(0, 3)
      .map(w => `"${w.word}" → "${w.suggestion || 'plain alternative'}"`)
      .join(', ');
    recommendations.push({
      type: 'warning',
      message: `Detected ${humanizer.bannedWordsFound.length} AI buzzwords (${examples}). Replace with plain human verbs per 82 Humanizer Rules.`,
      impact: `-${buzzwordPenalty} pts`,
    });
  }

  if (humanizer.bannedPhrasesFound.length > 0) {
    const phrasePenalty = Math.min(15, humanizer.bannedPhrasesFound.length * 5);
    score -= phrasePenalty;
    const examples = humanizer.bannedPhrasesFound
      .slice(0, 2)
      .map(p => `"${p.phrase}"`)
      .join(', ');
    recommendations.push({
      type: 'warning',
      message: `Detected formulaic AI phrases (${examples}). Start and end directly without significance padding per Rules 5, 7, & 8.`,
      impact: `-${phrasePenalty} pts`,
    });
  }

  if (humanizer.emDashCount > 4) {
    recommendations.push({
      type: 'info',
      message: `Found ${humanizer.emDashCount} em dashes. Use periods or commas instead per Rule 17 (Em-dash control).`,
      impact: '0 pts',
    });
  }

  // Bound score
  score = Math.max(10, Math.min(100, score));

  let rating: SeoAuditResult['rating'] = 'excellent';
  if (score < 50) rating = 'poor';
  else if (score < 70) rating = 'needs-improvement';
  else if (score < 88) rating = 'good';

  // Generate Schema.org JSON-LD
  const jsonLdSchema = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description: metaDescription,
      author: {
        '@type': 'Organization',
        name: author,
        url: 'https://shadowflow.dev',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Shadow Flow',
        logo: {
          '@type': 'ImageObject',
          url: 'https://shadowflow.dev/assets/logo.png',
        },
      },
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      keywords: [targetKeyword, 'workflow automation', 'ai agents', 'n8n alternative'].filter(Boolean).join(', '),
      wordCount: totalWords,
    },
    null,
    2
  );

  return {
    score,
    rating,
    wordCount: totalWords,
    readingTimeMinutes: readingTime,
    keywordDensity: {
      keyword: targetKeyword,
      count: kwDensity.count,
      densityPct: kwDensity.densityPct,
      status: kwDensity.status,
    },
    readability,
    titleAnalysis: {
      title,
      charCount: titleChars,
      hasKeyword: titleHasKw,
      status: titleStatus,
    },
    metaDescriptionAnalysis: {
      description: metaDescription,
      charCount: descChars,
      hasKeyword: descHasKw,
      status: descStatus,
    },
    headingsAnalysis: {
      h1Count: h1Matches.length,
      h2Count: h2Matches.length,
      h3Count: h3Matches.length,
      hasKeywordInH1: hasKwInH1,
      hasKeywordInH2: hasKwInH2,
      hierarchyValid,
    },
    humanizer,
    geo: auditGeoReadiness(content, title, targetKeyword),
    recommendations,
    jsonLdSchema,
  };
}

export function generateTechArticleSchema(
  title: string,
  description: string,
  url: string,
  datePublished?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: description,
    author: {
      '@type': 'Organization',
      name: 'Shadow Flow Research',
      url: 'https://shadowflow.dev',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Shadow Flow',
      logo: {
        '@type': 'ImageObject',
        url: 'https://shadowflow.dev/assets/logo.png',
      },
    },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export interface OnPageAuditResult {
  overallScore: number;
  wordCount: number;
  keywordDensity: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
  humanizer: HumanizerAuditResult;
  geo: GeoAuditResult;
  recommendations: Array<{
    type: 'pass' | 'warning' | 'info';
    rule: string;
    message: string;
  }>;
  jsonLdSchema: string;
}

export function auditOnPageSeo(title: string, content: string, targetKeyword: string): OnPageAuditResult {
  const fullAudit = auditContentForSeo({
    title,
    metaDescription: content.slice(0, 160).replace(/[#*_`]/g, '').trim(),
    content,
    targetKeyword,
  });

  const recommendations = [
    {
      type: fullAudit.titleAnalysis.status === 'optimal' ? 'pass' as const : 'warning' as const,
      rule: 'H1 Title Length',
      message: `Title is ${fullAudit.titleAnalysis.charCount} characters (${fullAudit.titleAnalysis.status}). Ideal: 40-70 characters.`,
    },
    {
      type: fullAudit.titleAnalysis.hasKeyword ? 'pass' as const : 'warning' as const,
      rule: 'Target Keyword in Title',
      message: fullAudit.titleAnalysis.hasKeyword
        ? `Primary keyword "${targetKeyword}" appears in the H1 title.`
        : `Target keyword "${targetKeyword}" is missing from the H1 title.`,
    },
    {
      type: fullAudit.keywordDensity.status === 'optimal' ? 'pass' as const : 'warning' as const,
      rule: 'Keyword Density',
      message: `Keyword appears ${fullAudit.keywordDensity.count} times (${fullAudit.keywordDensity.densityPct}%). Target sweet spot: 0.5% - 3.0%.`,
    },
    {
      type: fullAudit.wordCount >= 800 ? 'pass' as const : 'warning' as const,
      rule: 'Article Word Count',
      message: `Content has ${fullAudit.wordCount} words. High-ranking technical guides typically exceed 1,000 words.`,
    },
    {
      type: fullAudit.headingsAnalysis.h2Count >= 2 ? 'pass' as const : 'warning' as const,
      rule: 'H2 Section Hierarchy',
      message: `Found ${fullAudit.headingsAnalysis.h2Count} H2 subheadings. Well-structured articles feature at least 3 distinct sections.`,
    },
    {
      type: fullAudit.readability.rating === 'optimal' ? 'pass' as const : 'warning' as const,
      rule: 'Readability & Passive Voice',
      message: `Average sentence length: ${fullAudit.readability.avgSentenceLength} words. Rating: ${fullAudit.readability.rating}.`,
    },
    {
      type: fullAudit.humanizer.passed ? 'pass' as const : 'warning' as const,
      rule: 'Human-Natural Writing (82 Rules)',
      message: fullAudit.humanizer.passed
        ? `Authentic human tone score: ${fullAudit.humanizer.score}/100. Zero banned AI buzzwords found.`
        : `AI tone patterns detected (${fullAudit.humanizer.score}/100). Found ${fullAudit.humanizer.bannedWordsFound.length} buzzwords (${fullAudit.humanizer.bannedWordsFound.map(w => w.word).slice(0, 3).join(', ')}).`,
    },
    {
      type: fullAudit.geo.score >= 70 ? 'pass' as const : 'warning' as const,
      rule: 'AI Search (GEO) Citability',
      message: `GEO Readiness: ${fullAudit.geo.score}/100 (${fullAudit.geo.rating}). Early direct answer: ${fullAudit.geo.citability.hasEarlyDirectAnswer ? 'Present in first 30%' : 'Missing in opening'}.`,
    },
  ];

  return {
    overallScore: fullAudit.score,
    wordCount: fullAudit.wordCount,
    keywordDensity: fullAudit.keywordDensity.densityPct,
    headings: {
      h1: fullAudit.headingsAnalysis.h1Count,
      h2: fullAudit.headingsAnalysis.h2Count,
      h3: fullAudit.headingsAnalysis.h3Count,
    },
    humanizer: fullAudit.humanizer,
    geo: fullAudit.geo,
    recommendations,
    jsonLdSchema: fullAudit.jsonLdSchema,
  };
}
