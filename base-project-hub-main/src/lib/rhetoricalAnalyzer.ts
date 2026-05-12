// Rhetorical Techniques Detector
// Detects persuasion patterns, storytelling, data usage, call-to-action, etc.

interface TechniqueResult {
  name: string;
  icon: string;
  impact: string;
  count: number;
  examples: string[];
  used: boolean;
}

interface Recommendation {
  technique: string;
  priority: string;
  suggestion: string;
  example: string;
}

export interface RhetoricalAnalysisResult {
  techniques: Record<string, TechniqueResult>;
  summary: {
    totalTechniquesUsed: number;
    techniqueVariety: number;
    diversityScore: number;
    persuasionLevel: string;
    missingTechniques: Array<{ name: string; icon: string; suggestion: string }>;
  };
  recommendations: Recommendation[];
}

function detectPattern(text: string, patterns: RegExp[]): string[] {
  const found: string[] = [];
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) found.push(...matches);
  });
  return found;
}

const TECHNIQUE_DETECTORS: Record<string, {
  name: string;
  icon: string;
  impact: string;
  detect: (text: string) => string[];
}> = {
  rhetoricalQuestions: {
    name: 'Rhetorical Questions',
    icon: '❓',
    impact: 'Engages audience thinking',
    detect: (text) => {
      const questions = text.match(/[^.!]*\?/g) || [];
      return questions.filter(q => {
        const lower = q.toLowerCase().trim();
        return !lower.startsWith('what time') && !lower.startsWith('where is') && !lower.startsWith('how do i') && q.split(' ').length <= 15;
      });
    },
  },
  ruleOfThree: {
    name: 'Rule of Three',
    icon: '3️⃣',
    impact: 'Creates memorable and rhythmic phrases',
    detect: (text) => {
      const patterns: string[] = [];
      const threePattern = /(\w+),\s*(\w+),?\s*and\s+(\w+)/gi;
      let match;
      while ((match = threePattern.exec(text)) !== null) patterns.push(match[0]);
      return patterns;
    },
  },
  anaphora: {
    name: 'Anaphora (Repetition at Start)',
    icon: '🔄',
    impact: 'Creates emphasis and rhythm',
    detect: (text) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      const starters: Record<string, number> = {};
      sentences.forEach(s => {
        const firstWords = s.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase();
        starters[firstWords] = (starters[firstWords] || 0) + 1;
      });
      return Object.entries(starters)
        .filter(([, count]) => count >= 2)
        .map(([phrase, count]) => `"${phrase}" (${count}x)`);
    },
  },
  metaphorsSimiles: {
    name: 'Metaphors & Similes',
    icon: '🎨',
    impact: 'Makes abstract concepts vivid and relatable',
    detect: (text) => detectPattern(text, [
      /like\s+a\s+\w+/gi, /as\s+\w+\s+as/gi, /similar\s+to/gi,
      /reminds\s+me\s+of/gi, /just\s+like/gi, /compared\s+to/gi,
    ]),
  },
  callToAction: {
    name: 'Call to Action',
    icon: '📢',
    impact: 'Drives audience to take specific action',
    detect: (text) => detectPattern(text, [
      /let['']?s\s+\w+/gi, /i\s+(urge|encourage|ask|invite|challenge)\s+you/gi,
      /you\s+(should|must|need\s+to|can|have\s+to)/gi, /join\s+(me|us)/gi,
      /take\s+action/gi, /start\s+(today|now|right\s+now)/gi,
      /together\s+we\s+can/gi, /imagine\s+(a\s+world|if|what)/gi,
    ]),
  },
  storytelling: {
    name: 'Storytelling Elements',
    icon: '📖',
    impact: 'Creates emotional connection with audience',
    detect: (text) => detectPattern(text, [
      /\b(once\s+upon|one\s+day|there\s+was|i\s+remember|let\s+me\s+tell\s+you|true\s+story)\b/gi,
      /\b(when\s+i\s+was|years?\s+ago|back\s+in|growing\s+up)\b/gi,
      /\b(imagine|picture\s+this|close\s+your\s+eyes)\b/gi,
      /\b(suddenly|then|meanwhile|finally|at\s+last)\b/gi,
    ]),
  },
  dataEvidence: {
    name: 'Data & Evidence',
    icon: '📊',
    impact: 'Adds credibility to claims',
    detect: (text) => detectPattern(text, [
      /\d+\s*%/g, /\d+\s*(million|billion|thousand)/gi,
      /according\s+to/gi, /research\s+(shows|suggests|indicates|proves)/gi,
      /stud(y|ies)\s+(show|found|reveal)/gi, /evidence\s+(shows|suggests)/gi,
    ]),
  },
  emotionalAppeal: {
    name: 'Emotional Appeals',
    icon: '❤️',
    impact: 'Connects with audience on emotional level',
    detect: (text) => detectPattern(text, [
      /\b(passionate|heartbreaking|inspiring|devastating|thrilling)\b/gi,
      /\b(dream|hope|fear|love|believe|courage|struggle)\b/gi,
      /\b(we\s+all|each\s+of\s+us|every\s+one\s+of\s+us)\b/gi,
    ]),
  },
  contrastAntithesis: {
    name: 'Contrast & Antithesis',
    icon: '⚖️',
    impact: 'Highlights differences for emphasis',
    detect: (text) => detectPattern(text, [
      /not\s+\w+\s*,?\s*but\s+\w+/gi,
      /\b(however|nevertheless|on\s+the\s+other\s+hand|in\s+contrast)\b/gi,
      /\b(instead\s+of|rather\s+than)\b/gi,
    ]),
  },
};

function generateRecommendations(results: Record<string, TechniqueResult>): Recommendation[] {
  const recs: Recommendation[] = [];

  if (!results.rhetoricalQuestions?.used) {
    recs.push({ technique: 'Rhetorical Questions', priority: 'high', suggestion: 'Start with a thought-provoking question', example: 'Instead of: "Today I will talk about X"\nTry: "What if everything you knew about X was wrong?"' });
  }
  if (!results.ruleOfThree?.used) {
    recs.push({ technique: 'Rule of Three', priority: 'high', suggestion: 'Group key points in threes', example: '"We need courage, commitment, and compassion."' });
  }
  if (!results.storytelling?.used) {
    recs.push({ technique: 'Storytelling', priority: 'high', suggestion: 'Include a personal story or anecdote', example: '"Let me tell you about a moment that changed my perspective..."' });
  }
  if (!results.callToAction?.used) {
    recs.push({ technique: 'Call to Action', priority: 'medium', suggestion: 'End with a clear call to action', example: '"Starting today, I challenge each of you to..."' });
  }
  if (!results.dataEvidence?.used) {
    recs.push({ technique: 'Data & Evidence', priority: 'medium', suggestion: 'Support claims with statistics or research', example: '"According to a 2024 study, 78% of..."' });
  }
  if ((results.emotionalAppeal?.count || 0) < 2) {
    recs.push({ technique: 'Emotional Appeal', priority: 'medium', suggestion: 'Add emotional language to connect', example: 'Use words like: imagine, dream, believe, together, hope' });
  }

  return recs;
}

export function analyzeRhetoric(transcript: string): RhetoricalAnalysisResult {
  // Strip annotations
  const cleanText = transcript.replace(/\[\d+:\d+\]\s*\w+:\s*"?/g, '').replace(/"/g, '');

  const results: Record<string, TechniqueResult> = {};
  let totalTechniques = 0;

  for (const [key, technique] of Object.entries(TECHNIQUE_DETECTORS)) {
    const detected = technique.detect(cleanText);
    results[key] = {
      name: technique.name,
      icon: technique.icon,
      impact: technique.impact,
      count: detected.length,
      examples: detected.slice(0, 5),
      used: detected.length > 0,
    };
    totalTechniques += detected.length;
  }

  const usedTechniques = Object.values(results).filter(r => r.used).length;
  const totalPossible = Object.keys(TECHNIQUE_DETECTORS).length;
  const diversityScore = Math.round((usedTechniques / totalPossible) * 100);

  const missing = Object.values(results)
    .filter(r => !r.used)
    .map(r => ({ name: r.name, icon: r.icon, suggestion: `Add ${r.name.toLowerCase()} to strengthen your speech` }));

  return {
    techniques: results,
    summary: {
      totalTechniquesUsed: totalTechniques,
      techniqueVariety: usedTechniques,
      diversityScore,
      persuasionLevel: diversityScore >= 70 ? 'Highly Persuasive' : diversityScore >= 50 ? 'Moderately Persuasive' : diversityScore >= 30 ? 'Somewhat Persuasive' : 'Needs More Persuasion Techniques',
      missingTechniques: missing,
    },
    recommendations: generateRecommendations(results),
  };
}
