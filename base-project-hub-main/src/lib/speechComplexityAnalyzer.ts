// Speech Complexity Analyzer — Readability scoring engine
// Implements Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, Coleman-Liau, SMOG

const syllableCache = new Map<string, number>();

function countSyllables(word: string): number {
  if (syllableCache.has(word)) return syllableCache.get(word)!;
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) { syllableCache.set(word, 1); return 1; }
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  w = w.replace(/^y/, '');
  const matches = w.match(/[aeiouy]{1,2}/g);
  const count = matches ? matches.length : 1;
  syllableCache.set(word, count);
  return count;
}

function getSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 3);
}

function getWords(text: string): string[] {
  return text.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, '').length > 0);
}

export interface AudienceLevel {
  level: string;
  icon: string;
  description: string;
  recommendation: string;
}

export interface SentenceVariety {
  distribution: { short: number; medium: number; long: number; veryLong: number };
  varietyScore: number;
  repetitiveStarters: Array<{ word: string; count: number }>;
  sentenceTypes: { statements: number; questions: number; exclamations: number };
  suggestions: string[];
}

export interface VocabularyRichness {
  typeTokenRatio: string;
  uniqueWordCount: number;
  totalWords: number;
  hapaxLegomena: number;
  richness: string;
  mostRepeated: Array<{ word: string; count: number }>;
  suggestions: string[];
}

export interface RepetitionAnalysis {
  repeatedPhrases: Array<{ phrase: string; count: number; severity: string }>;
  consecutiveRepeats: Array<{ word: string; position: number }>;
  repetitionScore: number;
}

export interface VoiceAnalysis {
  activeSentences: number;
  passiveSentences: number;
  activeRatio: string;
  passiveExamples: Array<{ sentence: string; index: number; suggestion: string }>;
  score: string;
  suggestion: string;
}

export interface JargonAnalysis {
  jargonCount: number;
  jargonWords: Array<{ word: string; position: number; simpleAlternative: string }>;
  jargonDensity: string;
  recommendation: string;
}

export interface SpeechComplexityResult {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  colemanLiau: number;
  smogIndex: number;
  avgSentenceLength: string;
  avgWordLength: string;
  avgSyllablesPerWord: string;
  complexWordPercentage: string;
  complexWords: string[];
  audienceLevel: AudienceLevel;
  sentenceVariety: SentenceVariety;
  vocabularyRichness: VocabularyRichness;
  repetitionAnalysis: RepetitionAnalysis;
  voiceAnalysis: VoiceAnalysis;
  jargonAnalysis: JargonAnalysis;
}

function fleschReadingEase(sentenceCount: number, wordCount: number, syllableCount: number): number {
  if (sentenceCount === 0 || wordCount === 0) return 0;
  const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

function fleschKincaidGrade(sentenceCount: number, wordCount: number, syllableCount: number): number {
  if (sentenceCount === 0 || wordCount === 0) return 0;
  const grade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

function gunningFogIndex(sentenceCount: number, wordCount: number, complexWordCount: number): number {
  if (sentenceCount === 0) return 0;
  return Math.round(0.4 * ((wordCount / sentenceCount) + 100 * (complexWordCount / wordCount)) * 10) / 10;
}

function colemanLiauIndex(text: string, sentenceCount: number, wordCount: number): number {
  if (wordCount === 0) return 0;
  const letters = text.replace(/[^a-zA-Z]/g, '').length;
  const L = (letters / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  return Math.round((0.0588 * L - 0.296 * S - 15.8) * 10) / 10;
}

function smogIndex(sentenceCount: number, complexWordCount: number): number {
  if (sentenceCount === 0) return 0;
  return Math.round((1.043 * Math.sqrt(complexWordCount * (30 / sentenceCount)) + 3.1291) * 10) / 10;
}

function getAudienceLevel(fleschScore: number): AudienceLevel {
  if (fleschScore >= 80) return { level: 'Elementary', icon: '🟢', description: 'Easy to understand for all audiences', recommendation: 'Great for general public speaking' };
  if (fleschScore >= 60) return { level: 'Middle School', icon: '🟡', description: 'Suitable for most audiences', recommendation: 'Ideal for business presentations' };
  if (fleschScore >= 40) return { level: 'High School / College', icon: '🟠', description: 'Requires educated audience', recommendation: 'Consider simplifying for broader reach' };
  if (fleschScore >= 20) return { level: 'College Graduate', icon: '🔴', description: 'Complex language detected', recommendation: 'Too complex for most audiences. Simplify.' };
  return { level: 'Expert / Academic', icon: '⛔', description: 'Very difficult to follow verbally', recommendation: 'Significantly simplify for spoken delivery' };
}

function analyzeSentenceVariety(sentences: string[]): SentenceVariety {
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const types = {
    short: lengths.filter(l => l <= 8).length,
    medium: lengths.filter(l => l > 8 && l <= 18).length,
    long: lengths.filter(l => l > 18 && l <= 30).length,
    veryLong: lengths.filter(l => l > 30).length,
  };

  const starters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase() || '');
  const starterCounts: Record<string, number> = {};
  starters.forEach(s => { starterCounts[s] = (starterCounts[s] || 0) + 1; });
  const repetitiveStarters = Object.entries(starterCounts)
    .filter(([, count]) => count >= 3)
    .map(([word, count]) => ({ word, count }));

  const questionCount = sentences.filter(s => s.trim().endsWith('?')).length;
  const exclamationCount = sentences.filter(s => s.trim().endsWith('!')).length;

  const total = sentences.length;
  const shortRatio = types.short / Math.max(total, 1);
  const mediumRatio = types.medium / Math.max(total, 1);
  const longRatio = types.long / Math.max(total, 1);
  const veryLongPenalty = (types.veryLong / Math.max(total, 1)) * 30;
  let score = 70;
  if (shortRatio >= 0.15 && shortRatio <= 0.35) score += 10;
  if (mediumRatio >= 0.4 && mediumRatio <= 0.65) score += 10;
  if (longRatio >= 0.05 && longRatio <= 0.25) score += 10;
  score -= veryLongPenalty;

  const suggestions: string[] = [];
  if (types.veryLong > 2) suggestions.push('Break down sentences longer than 30 words. Listeners lose track of long sentences.');
  if (types.short < total * 0.15) suggestions.push('Add more short punchy sentences for impact.');
  if (repetitiveStarters.length > 0) suggestions.push(`You start ${repetitiveStarters[0].count} sentences with "${repetitiveStarters[0].word}". Vary your openings.`);

  return {
    distribution: types,
    varietyScore: Math.min(100, Math.max(0, Math.round(score))),
    repetitiveStarters,
    sentenceTypes: { statements: total - questionCount - exclamationCount, questions: questionCount, exclamations: exclamationCount },
    suggestions,
  };
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'and', 'but', 'or', 'not', 'no',
  'that', 'this', 'it', 'i', 'you', 'he', 'she', 'we', 'they', 'my',
  'your', 'his', 'her', 'our', 'their', 'me', 'him', 'us', 'them',
  'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why', 'if',
  'then', 'so', 'as', 'just', 'also', 'very', 'really', 'about',
]);

function analyzeVocabularyRichness(words: string[]): VocabularyRichness {
  const lowerWords = words.map(w => w.toLowerCase());
  const uniqueWords = new Set(lowerWords);
  const ttr = uniqueWords.size / Math.max(words.length, 1);

  const wordFreq: Record<string, number> = {};
  lowerWords.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const hapax = Object.values(wordFreq).filter(c => c === 1).length;

  const meaningfulRepetitions = Object.entries(wordFreq)
    .filter(([word, count]) => !STOP_WORDS.has(word) && count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const suggestions: string[] = [];
  if (ttr < 0.5) suggestions.push('Your vocabulary is repetitive. Use a thesaurus to find alternatives.');
  if (meaningfulRepetitions.length > 0) suggestions.push(`"${meaningfulRepetitions[0].word}" appears ${meaningfulRepetitions[0].count} times. Find synonyms.`);

  return {
    typeTokenRatio: (ttr * 100).toFixed(1),
    uniqueWordCount: uniqueWords.size,
    totalWords: words.length,
    hapaxLegomena: hapax,
    richness: ttr > 0.7 ? 'Excellent' : ttr > 0.5 ? 'Good' : ttr > 0.35 ? 'Average' : 'Limited',
    mostRepeated: meaningfulRepetitions,
    suggestions,
  };
}

function analyzeRepetitions(words: string[]): RepetitionAnalysis {
  const lowerWords = words.map(w => w.toLowerCase());
  const phrases: Record<string, number> = {};
  for (let phraseLen = 2; phraseLen <= 4; phraseLen++) {
    for (let i = 0; i <= lowerWords.length - phraseLen; i++) {
      const phrase = lowerWords.slice(i, i + phraseLen).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
  }

  const repeatedPhrases = Object.entries(phrases)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({
      phrase,
      count,
      severity: count >= 5 ? 'high' : count >= 3 ? 'medium' : 'low',
    }));

  const consecutiveRepeats: Array<{ word: string; position: number }> = [];
  for (let i = 1; i < lowerWords.length; i++) {
    if (lowerWords[i] === lowerWords[i - 1] && lowerWords[i].length > 2) {
      consecutiveRepeats.push({ word: lowerWords[i], position: i });
    }
  }

  const highSeverity = repeatedPhrases.filter(p => p.severity === 'high').length;
  const mediumSeverity = repeatedPhrases.filter(p => p.severity === 'medium').length;
  const score = 100 - highSeverity * 10 - mediumSeverity * 5;

  return { repeatedPhrases, consecutiveRepeats, repetitionScore: Math.max(0, Math.min(100, score)) };
}

const PASSIVE_PATTERNS = [
  /\b(was|were|is|are|been|being|be)\s+(\w+ed|(\w+en))\b/gi,
  /\b(was|were|is|are)\s+being\s+\w+/gi,
  /\b(has|have|had)\s+been\s+\w+/gi,
];

function analyzeVoice(sentences: string[]): VoiceAnalysis {
  let passiveCount = 0;
  const passiveSentences: Array<{ sentence: string; index: number; suggestion: string }> = [];

  sentences.forEach((sentence, index) => {
    for (const pattern of PASSIVE_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(sentence)) {
        passiveCount++;
        passiveSentences.push({
          sentence: sentence.trim(),
          index,
          suggestion: `Consider restructuring: "${sentence.trim().substring(0, 50)}..." → Use active voice.`,
        });
        break;
      }
    }
  });

  const activeCount = sentences.length - passiveCount;
  const activeRatio = activeCount / Math.max(sentences.length, 1);

  return {
    activeSentences: activeCount,
    passiveSentences: passiveCount,
    activeRatio: (activeRatio * 100).toFixed(1),
    passiveExamples: passiveSentences.slice(0, 5),
    score: activeRatio > 0.85 ? 'Excellent' : activeRatio > 0.7 ? 'Good' : activeRatio > 0.5 ? 'Needs Work' : 'Too Passive',
    suggestion: passiveCount > 3
      ? 'Too many passive constructions. Active voice sounds more confident and direct.'
      : 'Good balance of active voice. Sounds commanding and clear.',
  };
}

const JARGON_SET = new Set([
  'synergy', 'leverage', 'paradigm', 'utilize', 'optimize', 'streamline',
  'scalable', 'disrupt', 'ecosystem', 'holistic', 'bandwidth', 'deliverables',
  'stakeholders', 'actionable', 'granular', 'ideate', 'pivot', 'iterate',
  'onboard', 'robust', 'seamless', 'turnkey', 'enterprise', 'methodology',
]);

const JARGON_ALTERNATIVES: Record<string, string> = {
  synergy: 'working together', leverage: 'use', paradigm: 'model / approach',
  utilize: 'use', optimize: 'improve', streamline: 'simplify',
  scalable: 'can grow', disrupt: 'change / shake up', ecosystem: 'system / environment',
  holistic: 'complete / whole', bandwidth: 'capacity / time', deliverables: 'results / outputs',
  stakeholders: 'people involved', actionable: 'practical / usable', ideate: 'brainstorm',
  pivot: 'change direction', iterate: 'repeat and improve', robust: 'strong / reliable',
};

function detectJargon(words: string[]): JargonAnalysis {
  const foundJargon: Array<{ word: string; position: number; simpleAlternative: string }> = [];
  words.forEach((w, index) => {
    const lower = w.toLowerCase().replace(/[^a-z-]/g, '');
    if (JARGON_SET.has(lower)) {
      foundJargon.push({ word: lower, position: index, simpleAlternative: JARGON_ALTERNATIVES[lower] || 'use simpler language' });
    }
  });

  return {
    jargonCount: foundJargon.length,
    jargonWords: foundJargon,
    jargonDensity: ((foundJargon.length / Math.max(words.length, 1)) * 100).toFixed(2),
    recommendation: foundJargon.length > 5
      ? '⚠️ High jargon usage. Simplify for broader audience understanding.'
      : foundJargon.length > 2
      ? '🟡 Some jargon detected. Consider your audience.'
      : '✅ Minimal jargon. Language is accessible.',
  };
}

export function analyzeSpeechComplexity(transcript: string): SpeechComplexityResult {
  if (!transcript || transcript.trim().length < 10) {
    return {
      fleschReadingEase: 0, fleschKincaidGrade: 0, gunningFog: 0, colemanLiau: 0, smogIndex: 0,
      avgSentenceLength: '0', avgWordLength: '0', avgSyllablesPerWord: '0',
      complexWordPercentage: '0', complexWords: [], audienceLevel: getAudienceLevel(0),
      sentenceVariety: { distribution: { short: 0, medium: 0, long: 0, veryLong: 0 }, varietyScore: 0, repetitiveStarters: [], sentenceTypes: { statements: 0, questions: 0, exclamations: 0 }, suggestions: [] },
      vocabularyRichness: { typeTokenRatio: '0', uniqueWordCount: 0, totalWords: 0, hapaxLegomena: 0, richness: 'N/A', mostRepeated: [], suggestions: [] },
      repetitionAnalysis: { repeatedPhrases: [], consecutiveRepeats: [], repetitionScore: 100 },
      voiceAnalysis: { activeSentences: 0, passiveSentences: 0, activeRatio: '0', passiveExamples: [], score: 'N/A', suggestion: '' },
      jargonAnalysis: { jargonCount: 0, jargonWords: [], jargonDensity: '0', recommendation: '' },
    };
  }

  // Strip timestamp annotations like [0:15] You: "text"
  const cleanText = transcript.replace(/\[\d+:\d+\]\s*\w+:\s*"?/g, '').replace(/"/g, '');

  const sentences = getSentences(cleanText);
  const words = getWords(cleanText);
  const syllables = words.map(w => countSyllables(w));
  const totalSyllables = syllables.reduce((a, b) => a + b, 0);
  const complexWordsArr = words.filter(w => countSyllables(w) >= 3);

  const fre = fleschReadingEase(sentences.length, words.length, totalSyllables);

  return {
    fleschReadingEase: fre,
    fleschKincaidGrade: fleschKincaidGrade(sentences.length, words.length, totalSyllables),
    gunningFog: gunningFogIndex(sentences.length, words.length, complexWordsArr.length),
    colemanLiau: colemanLiauIndex(cleanText, sentences.length, words.length),
    smogIndex: smogIndex(sentences.length, complexWordsArr.length),
    avgSentenceLength: (words.length / Math.max(sentences.length, 1)).toFixed(1),
    avgWordLength: (words.join('').length / Math.max(words.length, 1)).toFixed(1),
    avgSyllablesPerWord: (totalSyllables / Math.max(words.length, 1)).toFixed(1),
    complexWordPercentage: ((complexWordsArr.length / Math.max(words.length, 1)) * 100).toFixed(1),
    complexWords: [...new Set(complexWordsArr)].slice(0, 20),
    audienceLevel: getAudienceLevel(fre),
    sentenceVariety: analyzeSentenceVariety(sentences),
    vocabularyRichness: analyzeVocabularyRichness(words),
    repetitionAnalysis: analyzeRepetitions(words),
    voiceAnalysis: analyzeVoice(sentences),
    jargonAnalysis: detectJargon(words),
  };
}
