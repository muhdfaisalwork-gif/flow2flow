import { describe, it, expect } from 'vitest';
import { countWords, calculateKeywordDensity, calculateReadability, auditOnPageSeo, generateTechArticleSchema } from '@/lib/seo/seoEngine';
import { auditHumanNaturalWriting, humanizeContent, BANNED_BUZZWORDS } from '@/lib/seo/humanizerRules';
import { researchKeywords, searchKeywords, getRelatedQuestions } from '@/lib/seo/keywordEngine';
import { backlinkOpportunities, generateOutreachPitch } from '@/lib/seo/backlinkEngine';
import { aiTechNewsFeed } from '@/lib/seo/aiNewsEngine';
import { getAllBlogPosts, getBlogPostBySlug, saveCustomBlogPost } from '@/lib/seo/blogEngine';

describe('Shadow Flow SEO Suite & Agents', () => {
  describe('82 Human-Natural Writing Rules Engine', () => {
    it('detects banned AI buzzwords with plain replacement suggestions', () => {
      const roboticText = 'In order to delve into this topic, we must leverage a robust and seamless solution across the AI landscape.';
      const audit = auditHumanNaturalWriting(roboticText);
      expect(audit.passed).toBe(false);
      expect(audit.score).toBeLessThanOrEqual(80);
      expect(audit.bannedWordsFound.length).toBeGreaterThanOrEqual(4);
      expect(audit.bannedWordsFound.some(w => w.word === 'delve')).toBe(true);
      expect(audit.bannedWordsFound.some(w => w.word === 'landscape')).toBe(true);
    });

    it('detects formulaic introduction and conclusion patterns', () => {
      const formulaicIntro = "In today's digital landscape, AI is evolving rapidly. In conclusion, the future will depend on these systems.";
      const audit = auditHumanNaturalWriting(formulaicIntro);
      expect(audit.bannedPhrasesFound.length).toBeGreaterThanOrEqual(2);
      expect(audit.checks.some(c => c.name === 'No Formulaic Introductions' && !c.passed)).toBe(true);
      expect(audit.checks.some(c => c.name === 'No Formulaic Conclusions' && !c.passed)).toBe(true);
    });

    it('detects chatbot residue phrases', () => {
      const chatbotText = "Let's dive in and examine how this works!";
      const audit = auditHumanNaturalWriting(chatbotText);
      expect(audit.bannedPhrasesFound.some(p => p.rule.includes('Rule 35'))).toBe(true);
    });

    it('passes clean, direct, human writing with high score', () => {
      const naturalText = 'Most clinics now rely on several systems to manage scheduling, billing, clinical notes, and patient communication. Shadow Flow connects these systems using standard webhooks.';
      const audit = auditHumanNaturalWriting(naturalText);
      expect(audit.passed).toBe(true);
      expect(audit.score).toBeGreaterThanOrEqual(90);
      expect(audit.bannedWordsFound.length).toBe(0);
    });

    it('humanizeContent automatically replaces buzzwords with plain English', () => {
      const text = 'We leverage this robust tool to delve into data across the landscape.';
      const { cleanedText, replacementsCount } = humanizeContent(text);
      expect(replacementsCount).toBeGreaterThanOrEqual(3);
      expect(cleanedText.toLowerCase()).not.toContain('leverage');
      expect(cleanedText.toLowerCase()).not.toContain('robust');
      expect(cleanedText.toLowerCase()).toContain('use');
      expect(cleanedText.toLowerCase()).toContain('reliable');
    });
  });

  describe('SEO Engine (On-Page & Schema)', () => {
    it('correctly calculates word count and keyword density', () => {
      const text = 'DeepSeek R1 is an open-source reasoning model. DeepSeek R1 lowers automation costs significantly.';
      const words = countWords(text);
      expect(words).toBeGreaterThan(10);

      const density = calculateKeywordDensity(text, 'DeepSeek R1');
      expect(density.count).toBe(2);
      expect(density.densityPct).toBeGreaterThan(0);
    });

    it('measures sentence readability metrics', () => {
      const complexText = 'Autonomous multi-agent Directed Acyclic Graph orchestrators have been traditionally constrained by latency bottlenecks. However, local WebAssembly runtimes alleviate round-trip costs.';
      const readability = calculateReadability(complexText);
      expect(readability.avgSentenceLength).toBeGreaterThan(0);
      expect(['optimal', 'moderate', 'difficult']).toContain(readability.rating);
    });

    it('generates a full on-page SEO audit score and recommendations', () => {
      const audit = auditOnPageSeo(
        'DeepSeek-R1 Architecture: What It Means for Enterprise AI Automation',
        '# DeepSeek-R1 Architecture\n\nDeepSeek R1 is changing AI automation economics.\n\n## 1. Cost Reductions\n\nBy using DeepSeek R1, teams save 90%.\n\n## 2. Architecture\n\nDetailed breakdown here.',
        'DeepSeek R1'
      );
      expect(audit.overallScore).toBeGreaterThanOrEqual(10);
      expect(audit.overallScore).toBeLessThanOrEqual(100);
      expect(audit.headings.h1).toBeGreaterThanOrEqual(1);
      expect(audit.recommendations.length).toBeGreaterThan(0);
    });

    it('generates valid Schema.org TechArticle JSON-LD', () => {
      const schema = generateTechArticleSchema(
        'Guide to MCP Protocol',
        'In-depth guide to Model Context Protocol',
        'https://shadowflow.dev/blog/mcp',
        '2026-10-27'
      );
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('TechArticle');
      expect(schema.headline).toBe('Guide to MCP Protocol');
    });
  });

  describe('Keyword Research Engine', () => {
    it('filters and searches curated high-intent keywords', () => {
      const results = searchKeywords('n8n');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.keyword.toLowerCase().includes('n8n'))).toBe(true);
      expect(results[0].intent).toBeDefined();
    });

    it('synthesizes questions for novel topics', () => {
      const questions = getRelatedQuestions('Kubernetes Workflows');
      expect(questions.length).toBeGreaterThan(0);
    });
  });

  describe('Backlink Engine', () => {
    it('provides high-authority backlink targets with verified DA', () => {
      expect(backlinkOpportunities.length).toBeGreaterThanOrEqual(5);
      const first = backlinkOpportunities[0];
      expect(first.domainAuthority).toBeGreaterThanOrEqual(80);
    });

    it('generates personalized outreach pitch sequences', () => {
      const opp = backlinkOpportunities[0];
      const pitch = generateOutreachPitch(opp, 'Alex Maintainer', 'founder');
      expect(pitch.subject).toContain('Resource suggestion');
      expect(pitch.body).toContain('Shadow Flow');
      expect(pitch.followUp).toContain('following up');
    });
  });

  describe('AI & Tech News Radar', () => {
    it('maintains a live breaking news feed with suggested keywords', () => {
      expect(aiTechNewsFeed.length).toBeGreaterThanOrEqual(4);
      const topNews = aiTechNewsFeed[0];
      expect(topNews.title).toBeDefined();
      expect(topNews.suggestedKeyword).toBeDefined();
      expect(topNews.impact).toBe('High');
    });
  });

  describe('Blog Publishing & Retrieval Engine', () => {
    it('retrieves default pre-seeded authoritative blog posts', () => {
      const posts = getAllBlogPosts();
      expect(posts.length).toBeGreaterThanOrEqual(4);
      const deepseekPost = getBlogPostBySlug('deepseek-reasoner-enterprise-ai-automation');
      expect(deepseekPost).toBeDefined();
      expect(deepseekPost?.title).toContain('DeepSeek Reasoner');
    });

    it('can save and retrieve custom published articles', () => {
      const testPost = {
        slug: 'test-autonomous-agent-post',
        title: 'Test Article on Autonomous Agents',
        content: '# Test Article Body\n\nContent for testing custom publication.',
        category: 'AI Agents',
        tags: ['Agents', 'Test'],
      };
      saveCustomBlogPost(testPost);
      const retrieved = getBlogPostBySlug('test-autonomous-agent-post');
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Test Article on Autonomous Agents');
    });
  });
});
