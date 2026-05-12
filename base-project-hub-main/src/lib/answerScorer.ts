/**
 * Local answer scoring engine — zero API calls.
 * Compares user answers against model answers using keyword matching,
 * depth analysis, structure detection, and fluency scoring.
 */

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually",
  "literally", "sort of", "kind of", "i mean", "right", "so yeah",
  "well", "er", "umm", "uhh", "so",
];

const STAR_INDICATORS = [
  "situation", "task", "action", "result",
  "for example", "in my experience", "i achieved", "the outcome",
  "specifically", "as a result", "i led", "i managed",
  "i implemented", "i designed", "i built", "we delivered",
  "the impact was", "which resulted in", "i learned",
];

export interface AnswerScore {
  /** Overall score 0-100 */
  total: number;
  /** Keyword coverage score 0-100 */
  keywordScore: number;
  /** Answer depth score 0-100 */
  depthScore: number;
  /** Answer structure score 0-100 */
  structureScore: number;
  /** Fluency score 0-100 (inversely related to filler word usage) */
  fluencyScore: number;
  /** Key points the user covered */
  matchedKeywords: string[];
  /** Key points the user missed */
  missedKeywords: string[];
  /** Filler words detected in the answer */
  detectedFillers: string[];
  /** Auto-generated feedback string */
  feedback: string;
}

/**
 * Score a user's answer against a model answer.
 */
export function scoreAnswer(
  userAnswer: string,
  modelAnswer: string,
  keyPoints: string[],
): AnswerScore {
  const userLower = userAnswer.toLowerCase().trim();
  const modelLower = modelAnswer.toLowerCase();

  if (!userLower || userLower.length < 5) {
    return {
      total: 0,
      keywordScore: 0,
      depthScore: 0,
      structureScore: 0,
      fluencyScore: 0,
      matchedKeywords: [],
      missedKeywords: [...keyPoints],
      detectedFillers: [],
      feedback: "No answer provided. Try to give a detailed response.",
    };
  }

  // ─── 1. Keyword Coverage (40%) ───
  const matchedKeywords: string[] = [];
  const missedKeywords: string[] = [];

  for (const kp of keyPoints) {
    const variants = kp.toLowerCase().split(/\s+/);
    // Check if the user mentioned the key point or its individual words
    const directMatch = userLower.includes(kp.toLowerCase());
    const wordMatch =
      variants.length > 1 &&
      variants.filter((v) => userLower.includes(v)).length >=
        Math.ceil(variants.length * 0.6);

    if (directMatch || wordMatch) {
      matchedKeywords.push(kp);
    } else {
      missedKeywords.push(kp);
    }
  }

  const keywordScore =
    keyPoints.length > 0
      ? Math.round((matchedKeywords.length / keyPoints.length) * 100)
      : 50;

  // ─── 2. Depth Score (20%) ───
  const userWords = userLower.split(/\s+/).filter(Boolean).length;
  const modelWords = modelLower.split(/\s+/).filter(Boolean).length;
  const lengthRatio = Math.min(userWords / modelWords, 1.5); // Cap at 150%
  // Sweet spot: 60-120% of model answer length
  let depthScore: number;
  if (lengthRatio < 0.2) depthScore = 10;
  else if (lengthRatio < 0.4) depthScore = 30;
  else if (lengthRatio < 0.6) depthScore = 55;
  else if (lengthRatio <= 1.2) depthScore = 85 + Math.round(lengthRatio * 10);
  else depthScore = 80; // Slightly penalize overly long answers

  depthScore = Math.min(100, depthScore);

  // ─── 3. Structure Score (20%) ───
  const starMatches = STAR_INDICATORS.filter((s) => userLower.includes(s));
  const hasSentenceStructure = (userAnswer.match(/[.!?]/g) || []).length >= 2;
  const hasMultipleSentences = userAnswer.split(/[.!?]+/).filter(s => s.trim().length > 10).length >= 3;

  let structureScore = 20; // Base
  structureScore += Math.min(40, starMatches.length * 10); // STAR indicators
  if (hasSentenceStructure) structureScore += 15;
  if (hasMultipleSentences) structureScore += 15;
  if (userWords >= 30) structureScore += 10;
  structureScore = Math.min(100, structureScore);

  // ─── 4. Fluency Score (20%) ───
  const detectedFillers = FILLER_WORDS.filter((f) =>
    userLower.includes(f),
  );
  const fillerDensity =
    userWords > 0 ? detectedFillers.length / userWords : 0;

  let fluencyScore: number;
  if (fillerDensity === 0) fluencyScore = 100;
  else if (fillerDensity < 0.02) fluencyScore = 85;
  else if (fillerDensity < 0.05) fluencyScore = 65;
  else if (fillerDensity < 0.1) fluencyScore = 40;
  else fluencyScore = 20;

  // ─── Total ───
  const total = Math.round(
    keywordScore * 0.4 +
      depthScore * 0.2 +
      structureScore * 0.2 +
      fluencyScore * 0.2,
  );

  // ─── Feedback Generation ───
  const feedbackParts: string[] = [];

  if (keywordScore >= 70) {
    feedbackParts.push("Great coverage of key concepts!");
  } else if (keywordScore >= 40) {
    feedbackParts.push(
      `You covered some key points but missed: ${missedKeywords.slice(0, 3).join(", ")}.`,
    );
  } else {
    feedbackParts.push(
      `Several critical points were missing. Focus on: ${missedKeywords.slice(0, 4).join(", ")}.`,
    );
  }

  if (depthScore < 50) {
    feedbackParts.push(
      "Your answer was too brief. Aim for more detailed explanations with examples.",
    );
  }

  if (structureScore < 50) {
    feedbackParts.push(
      "Try structuring your answer with the STAR method: Situation, Task, Action, Result.",
    );
  }

  if (detectedFillers.length > 2) {
    feedbackParts.push(
      `Watch your filler words (${detectedFillers.slice(0, 3).join(", ")}). Practice pausing instead.`,
    );
  }

  if (total >= 80) {
    feedbackParts.unshift("Excellent answer! 🎯");
  } else if (total >= 60) {
    feedbackParts.unshift("Good answer with room for improvement.");
  } else if (total >= 40) {
    feedbackParts.unshift("Decent attempt — needs more depth and key points.");
  } else {
    feedbackParts.unshift(
      "This answer needs significant improvement. Review the model answer.",
    );
  }

  return {
    total,
    keywordScore,
    depthScore,
    structureScore,
    fluencyScore,
    matchedKeywords,
    missedKeywords,
    detectedFillers,
    feedback: feedbackParts.join(" "),
  };
}

/**
 * Generate a session-level summary from all question scores.
 */
export function generateSessionSummary(
  scores: AnswerScore[],
): {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  avgKeywordCoverage: number;
  avgFluency: number;
  totalFillers: number;
} {
  if (scores.length === 0) {
    return {
      overallScore: 0,
      strengths: [],
      improvements: [],
      avgKeywordCoverage: 0,
      avgFluency: 0,
      totalFillers: 0,
    };
  }

  const overallScore = Math.round(
    scores.reduce((a, s) => a + s.total, 0) / scores.length,
  );

  const avgKeywordCoverage = Math.round(
    scores.reduce((a, s) => a + s.keywordScore, 0) / scores.length,
  );

  const avgFluency = Math.round(
    scores.reduce((a, s) => a + s.fluencyScore, 0) / scores.length,
  );

  const totalFillers = scores.reduce(
    (a, s) => a + s.detectedFillers.length,
    0,
  );

  // Identify strengths and improvements
  const sorted = [...scores].sort((a, b) => b.total - a.total);
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (avgKeywordCoverage >= 60) strengths.push("Good coverage of key concepts");
  if (avgFluency >= 70) strengths.push("Clear and fluent delivery");
  if (sorted[0]?.total >= 70) strengths.push("Strong top answers showing knowledge depth");
  if (scores.filter(s => s.structureScore >= 60).length >= 5)
    strengths.push("Well-structured responses");

  if (avgKeywordCoverage < 50) improvements.push("Cover more key concepts in your answers");
  if (avgFluency < 60) improvements.push("Reduce filler words for clearer delivery");
  if (scores.filter(s => s.depthScore < 50).length >= 3)
    improvements.push("Provide more detailed and longer responses");
  if (scores.filter(s => s.structureScore < 50).length >= 3)
    improvements.push("Use the STAR method to structure answers");

  return {
    overallScore,
    strengths: strengths.length > 0 ? strengths : ["Keep practicing!"],
    improvements:
      improvements.length > 0 ? improvements : ["Maintain your current performance"],
    avgKeywordCoverage,
    avgFluency,
    totalFillers,
  };
}
