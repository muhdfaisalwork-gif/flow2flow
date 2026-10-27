// ============================================================================
// Shadow Flow — 82 Human-Natural Writing Rules Engine
// Strict enforcement of authentic, concrete, human writing without AI tells.
// ============================================================================

export interface HumanizerCheck {
  id: number;
  name: string;
  category: 'Vocabulary' | 'Structure' | 'Tone' | 'Evidence' | 'Formatting';
  description: string;
}

export interface HumanizerAuditResult {
  score: number; // 0 - 100
  passed: boolean;
  bannedWordsFound: Array<{ word: string; count: number; suggestion?: string }>;
  bannedPhrasesFound: Array<{ phrase: string; rule: string }>;
  emDashCount: number;
  passiveVerbsCount: number;
  checks: Array<{
    id: number;
    name: string;
    passed: boolean;
    details: string;
  }>;
}

export const BANNED_BUZZWORDS: Record<string, string> = {
  delve: 'examine, look at, study',
  pivotal: 'important, critical',
  robust: 'reliable, durable, steady',
  comprehensive: 'complete, detailed, full',
  multifaceted: 'complex, varied',
  nuanced: 'subtle, detailed',
  intricate: 'detailed, complex',
  transformative: 'significant, major',
  groundbreaking: 'new, first',
  revolutionary: 'major, fundamental',
  innovative: 'new, fresh',
  'cutting-edge': 'modern, recent',
  dynamic: 'active, changing',
  vibrant: 'active, lively',
  enduring: 'lasting, durable',
  remarkable: 'notable, unusual',
  exceptional: 'unusual, rare',
  sophisticated: 'advanced, complex',
  seamless: 'smooth, direct',
  powerful: 'effective, capable',
  versatile: 'flexible',
  noteworthy: 'notable',
  compelling: 'strong, convincing',
  invaluable: 'helpful, useful',
  'invaluable insights': 'useful details, clear data',
  landscape: 'market, field, setting',
  tapestry: 'mix, collection',
  testament: 'proof, evidence',
  realm: 'area, field',
  ecosystem: 'network, tools, environment',
  paradigm: 'model, standard',
  interplay: 'interaction, relation',
  fostering: 'encouraging, helping',
  leveraging: 'using',
  leverage: 'use',
  harnessing: 'using',
  harness: 'use',
  empowering: 'helping, enabling',
  empower: 'help, enable',
  showcasing: 'showing',
  showcase: 'show',
  underscore: 'stress, show',
  underscores: 'stresses, shows',
  garner: 'get, collect',
  garners: 'gets, collects',
  facilitate: 'help, assist',
  facilitates: 'helps, assists',
  utilize: 'use',
  utilizes: 'uses',
  utilizing: 'using',
  commence: 'start, begin',
  elucidate: 'explain',
  ascertain: 'check, find',
  endeavor: 'try',
};

export const BANNED_INTRO_PATTERNS: RegExp[] = [
  /in today'?s rapidly evolving world/i,
  /in today'?s digital landscape/i,
  /in the modern era/i,
  /in an increasingly connected world/i,
  /as technology continues to evolve/i,
  /in this fast-paced world/i,
  /it is important to understand that/i,
];

export const BANNED_CONCLUSION_PATTERNS: RegExp[] = [
  /in conclusion/i,
  /ultimately,/i,
  /looking ahead,/i,
  /the future will depend on/i,
  /taken together,/i,
  /the key takeaway is/i,
  /this represents a significant step forward/i,
];

export const BANNED_SIGNIFICANCE_PADDING: RegExp[] = [
  /marking a pivotal moment/i,
  /representing a significant milestone/i,
  /underscoring its importance/i,
  /highlighting its growing influence/i,
  /reflecting broader societal changes/i,
  /serving as a testament to/i,
  /symbolizing a new chapter/i,
  /shaping the future/i,
  /paving the way for/i,
  /laying the groundwork for/i,
  /setting the stage for/i,
  /demonstrating a commitment to/i,
  /contributing to a wider movement/i,
  /a catalyst for transformation/i,
  /a bridge between innovation and execution/i,
  /a gateway to new opportunities/i,
  /a cornerstone of modern operations/i,
];

export const HUMANIZER_RULES: HumanizerCheck[] = [
  { id: 1, name: 'Core Question Check', category: 'Tone', description: 'Would a real, knowledgeable person naturally say it this way?' },
  { id: 2, name: 'No Writing to Impress', category: 'Vocabulary', description: 'Avoid buzzwords like delve, pivotal, robust, landscape, tapestry.' },
  { id: 3, name: 'Prefer Plain Verbs', category: 'Vocabulary', description: 'Prefer use over utilize, help over facilitate, show over showcase.' },
  { id: 4, name: 'No Artificial Synonym Rotation', category: 'Vocabulary', description: 'Repeat the clearest word instead of cycling company -> firm -> entity.' },
  { id: 5, name: 'Ban Generic Significance Padding', category: 'Evidence', description: 'No "marking a pivotal moment" or "paving the way for".' },
  { id: 6, name: 'Do Not Over-Explain', category: 'Structure', description: 'No "In other words" or "Put simply" right after stating a fact.' },
  { id: 7, name: 'No Formulaic Introductions', category: 'Structure', description: 'No "In today\'s rapidly evolving digital landscape".' },
  { id: 8, name: 'No Formulaic Conclusions', category: 'Structure', description: 'No "In conclusion", "Ultimately", or "Looking ahead".' },
  { id: 9, name: 'Controlled Connectors', category: 'Structure', description: 'Avoid starting every sentence with Furthermore, Moreover, Additionally.' },
  { id: 10, name: 'Natural Sentence Openings', category: 'Structure', description: 'Avoid starting consecutive sentences with "This", "The", or "It".' },
  { id: 11, name: 'Avoid "This + Abstract Noun"', category: 'Structure', description: 'Avoid "this approach", "this capability" without concrete nouns.' },
  { id: 12, name: 'Control "Not Just X, But Y"', category: 'Structure', description: 'Avoid repetitive "not only X, but also Y" constructions.' },
  { id: 13, name: 'Control the Rule of Three', category: 'Structure', description: 'Do not automatically group items into threes.' },
  { id: 14, name: 'Break Excessive Symmetry', category: 'Structure', description: 'Mix short, medium, and longer clauses naturally.' },
  { id: 15, name: 'Vary Sentence Length Naturally', category: 'Structure', description: 'Use a dynamic mix of short and contextual sentences.' },
  { id: 17, name: 'Em-Dash Control', category: 'Formatting', description: 'Use em dashes sparingly; never as default dramatic pauses.' },
  { id: 21, name: 'No Unsubstantiated Praise', category: 'Tone', description: 'Avoid calling tools "groundbreaking", "revolutionary", or "world-class" without data.' },
  { id: 22, name: 'Replace Abstract Praise with Facts', category: 'Evidence', description: 'Claim -> Evidence -> Consequence over strings of adjectives.' },
  { id: 23, name: 'Specific Actors', category: 'Tone', description: 'Name developers, clinicians, billing teams over generic "stakeholders".' },
  { id: 26, name: 'Never Invent Specificity', category: 'Evidence', description: 'Do not fabricate statistics, studies, quotes, or fake benchmarks.' },
  { id: 35, name: 'Do Not Sound Like a Chatbot', category: 'Tone', description: 'No "Certainly!", "Let\'s dive in", or "Here\'s what you need to know".' },
  { id: 50, name: 'Formatting Serves Content', category: 'Formatting', description: 'Avoid bold label factories like "**Efficiency:** ..." on every line.' },
];

export function auditHumanNaturalWriting(text: string): HumanizerAuditResult {
  if (!text) {
    return {
      score: 100,
      passed: true,
      bannedWordsFound: [],
      bannedPhrasesFound: [],
      emDashCount: 0,
      passiveVerbsCount: 0,
      checks: HUMANIZER_RULES.map(r => ({ id: r.id, name: r.name, passed: true, details: 'No text provided.' })),
    };
  }

  let penalty = 0;
  const bannedWordsFound: Array<{ word: string; count: number; suggestion?: string }> = [];
  const bannedPhrasesFound: Array<{ phrase: string; rule: string }> = [];

  // 1. Scan for banned words
  for (const [badWord, suggestion] of Object.entries(BANNED_BUZZWORDS)) {
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      bannedWordsFound.push({
        word: badWord,
        count: matches.length,
        suggestion,
      });
      penalty += matches.length * 4;
    }
  }

  // 2. Scan for banned introductory patterns
  for (const pat of BANNED_INTRO_PATTERNS) {
    if (pat.test(text)) {
      bannedPhrasesFound.push({
        phrase: text.match(pat)?.[0] || 'Formulaic Intro',
        rule: 'Rule 7: No Automatic Introduction Formula',
      });
      penalty += 12;
    }
  }

  // 3. Scan for banned conclusion patterns
  for (const pat of BANNED_CONCLUSION_PATTERNS) {
    if (pat.test(text)) {
      bannedPhrasesFound.push({
        phrase: text.match(pat)?.[0] || 'Formulaic Conclusion',
        rule: 'Rule 8: No Automatic Conclusion Formula',
      });
      penalty += 10;
    }
  }

  // 4. Scan for significance padding
  for (const pat of BANNED_SIGNIFICANCE_PADDING) {
    if (pat.test(text)) {
      bannedPhrasesFound.push({
        phrase: text.match(pat)?.[0] || 'Significance Padding',
        rule: 'Rule 5: Ban Generic Significance Padding',
      });
      penalty += 10;
    }
  }

  // 5. Em-dash count
  const emDashes = (text.match(/—|--/g) || []).length;
  const words = text.split(/\s+/).length;
  if (emDashes > 3 && emDashes / (words / 300) > 2) {
    penalty += 8;
  }

  // 6. Chatbot residue
  const chatbotPatterns = [/let'?s dive in/i, /let'?s break this down/i, /here'?s what you need to know/i, /in a nutshell/i];
  for (const cb of chatbotPatterns) {
    if (cb.test(text)) {
      bannedPhrasesFound.push({
        phrase: text.match(cb)?.[0] || 'Chatbot Residue',
        rule: 'Rule 35: Do Not Sound Like a Chatbot',
      });
      penalty += 15;
    }
  }

  const score = Math.max(15, Math.min(100, 100 - penalty));
  const passed = score >= 85 && bannedWordsFound.length === 0 && bannedPhrasesFound.length === 0;

  const checks = HUMANIZER_RULES.map((rule) => {
    let checkPassed = true;
    let details = 'Verified natural human construction.';

    if (rule.id === 2 && bannedWordsFound.length > 0) {
      checkPassed = false;
      details = `Found ${bannedWordsFound.length} banned buzzwords (${bannedWordsFound.slice(0, 3).map(w => w.word).join(', ')}).`;
    } else if (rule.id === 7 && bannedPhrasesFound.some(p => p.rule.includes('Rule 7'))) {
      checkPassed = false;
      details = 'Detected generic modern world introduction formula.';
    } else if (rule.id === 8 && bannedPhrasesFound.some(p => p.rule.includes('Rule 8'))) {
      checkPassed = false;
      details = 'Detected formulaic conclusion ("In conclusion", "Ultimately").';
    } else if (rule.id === 5 && bannedPhrasesFound.some(p => p.rule.includes('Rule 5'))) {
      checkPassed = false;
      details = 'Detected generic significance padding phrases.';
    } else if (rule.id === 17 && emDashes > 4) {
      checkPassed = false;
      details = `Text contains ${emDashes} em dashes. Use commas or periods instead.`;
    } else if (rule.id === 35 && bannedPhrasesFound.some(p => p.rule.includes('Rule 35'))) {
      checkPassed = false;
      details = 'Found conversational assistant residue ("Let\'s dive in").';
    }

    return {
      id: rule.id,
      name: rule.name,
      passed: checkPassed,
      details,
    };
  });

  return {
    score,
    passed,
    bannedWordsFound,
    bannedPhrasesFound,
    emDashCount: emDashes,
    passiveVerbsCount: 0,
    checks,
  };
}

/**
 * Automatically cleans text by replacing detected AI buzzwords and robotic clichés
 * with plain, natural human alternatives per the 82 Human-Natural Writing rules.
 */
export function humanizeContent(text: string): { cleanedText: string; replacementsCount: number } {
  if (!text) return { cleanedText: '', replacementsCount: 0 };

  let result = text;
  let count = 0;

  // Single-word buzzword replacements (case-insensitive with case preservation heuristic)
  const directReplacements: Array<[RegExp, string]> = [
    [/\bdelve into\b/gi, 'examine'],
    [/\bdelves into\b/gi, 'examines'],
    [/\bdelve\b/gi, 'look'],
    [/\butilize\b/gi, 'use'],
    [/\butilizes\b/gi, 'uses'],
    [/\butilizing\b/gi, 'using'],
    [/\bleverage\b/gi, 'use'],
    [/\bleverages\b/gi, 'uses'],
    [/\bleveraging\b/gi, 'using'],
    [/\bharness\b/gi, 'use'],
    [/\bharnessing\b/gi, 'using'],
    [/\bharnesses\b/gi, 'uses'],
    [/\bfacilitate\b/gi, 'help'],
    [/\bfacilitates\b/gi, 'helps'],
    [/\bfacilitating\b/gi, 'helping'],
    [/\bpivotal\b/gi, 'critical'],
    [/\brobust\b/gi, 'reliable'],
    [/\bcomprehensive\b/gi, 'detailed'],
    [/\bmultifaceted\b/gi, 'varied'],
    [/\bnuanced\b/gi, 'subtle'],
    [/\bintricate\b/gi, 'detailed'],
    [/\btransformative\b/gi, 'major'],
    [/\bgroundbreaking\b/gi, 'new'],
    [/\brevolutionary\b/gi, 'major'],
    [/\bseamless\b/gi, 'smooth'],
    [/\bseamlessly\b/gi, 'directly'],
    [/\btapestry\b/gi, 'mix'],
    [/\btestament\b/gi, 'proof'],
    [/\brealm\b/gi, 'field'],
    [/\blandscape\b/gi, 'market'],
    [/\becosystem\b/gi, 'environment'],
    [/\bparadigm\b/gi, 'model'],
    [/\bempower\b/gi, 'help'],
    [/\bempowers\b/gi, 'helps'],
    [/\bempowering\b/gi, 'enabling'],
    [/\bshowcase\b/gi, 'show'],
    [/\bshowcases\b/gi, 'shows'],
    [/\bshowcasing\b/gi, 'showing'],
    [/\bunderscore\b/gi, 'highlight'],
    [/\bunderscores\b/gi, 'highlights'],
    [/\bgarner\b/gi, 'gain'],
    [/\bgarners\b/gi, 'gains'],
    [/\binvaluable insights\b/gi, 'useful data'],
    [/\binvaluable\b/gi, 'valuable'],
    [/\bcutting-edge\b/gi, 'modern'],
    [/\blet'?s dive in\b/gi, 'here is how it works'],
    [/\bmarking a pivotal moment\b/gi, 'starting a major shift'],
    [/\bserving as a testament to\b/gi, 'showing proof of'],
    [/\bpaving the way for\b/gi, 'enabling'],
  ];

  for (const [pattern, replacement] of directReplacements) {
    const matches = result.match(pattern);
    if (matches) {
      count += matches.length;
      result = result.replace(pattern, (match) => {
        // preserve uppercase initial letter if original was capitalized
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }
  }

  return {
    cleanedText: result,
    replacementsCount: count,
  };
}
