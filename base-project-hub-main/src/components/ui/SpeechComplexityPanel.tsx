import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Type, AlertCircle, Repeat, MessageSquare, Lightbulb } from "lucide-react";
import { analyzeSpeechComplexity, type SpeechComplexityResult } from "@/lib/speechComplexityAnalyzer";

interface Props {
  transcript: string;
}

function ScoreBadge({ score, label }: { score: number | string; label: string }) {
  const num = typeof score === "string" ? parseFloat(score) : score;
  const color = num >= 70 ? "text-success" : num >= 40 ? "text-warning" : "text-destructive";
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-muted/50 rounded-lg">
      <span className={`text-xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

export function SpeechComplexityPanel({ transcript }: Props) {
  const analysis = useMemo(() => analyzeSpeechComplexity(transcript), [transcript]);

  if (!transcript || transcript.trim().length < 20) {
    return null;
  }

  const { audienceLevel, sentenceVariety, vocabularyRichness, voiceAnalysis, jargonAnalysis, repetitionAnalysis } = analysis;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Speech Complexity Analysis</h2>
      </div>

      {/* Readability Scores Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Readability Scores</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
          <ScoreBadge score={analysis.fleschReadingEase} label="Flesch Ease" />
          <ScoreBadge score={analysis.fleschKincaidGrade} label="Grade Level" />
          <ScoreBadge score={analysis.gunningFog} label="Gunning Fog" />
          <ScoreBadge score={analysis.colemanLiau} label="Coleman-Liau" />
          <ScoreBadge score={analysis.smogIndex} label="SMOG Index" />
        </div>
        <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
          <span className="text-2xl">{audienceLevel.icon}</span>
          <div>
            <p className="text-sm font-medium text-foreground">Audience Level: {audienceLevel.level}</p>
            <p className="text-xs text-muted-foreground">{audienceLevel.recommendation}</p>
          </div>
        </div>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sentence Variety */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Sentence Variety</h3>
            <span className="ml-auto text-xs font-bold text-primary">{sentenceVariety.varietyScore}/100</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {Object.entries(sentenceVariety.distribution).map(([key, val]) => (
              <div key={key} className="text-center">
                <span className="text-lg font-bold text-foreground">{val}</span>
                <p className="text-[10px] text-muted-foreground capitalize">{key === 'veryLong' ? 'Very Long' : key}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>📝 {sentenceVariety.sentenceTypes.statements} statements</span>
            <span>❓ {sentenceVariety.sentenceTypes.questions} questions</span>
            <span>❗ {sentenceVariety.sentenceTypes.exclamations} exclamations</span>
          </div>
          {sentenceVariety.suggestions.length > 0 && (
            <div className="mt-3 space-y-1">
              {sentenceVariety.suggestions.map((s, i) => (
                <p key={i} className="text-xs text-warning flex items-start gap-1">
                  <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {s}
                </p>
              ))}
            </div>
          )}
        </motion.div>

        {/* Vocabulary Richness */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-success" />
            <h3 className="text-sm font-medium text-foreground">Vocabulary Richness</h3>
            <span className={`ml-auto text-xs font-bold ${vocabularyRichness.richness === 'Excellent' ? 'text-success' : vocabularyRichness.richness === 'Good' ? 'text-primary' : 'text-warning'}`}>
              {vocabularyRichness.richness}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div>
              <span className="text-lg font-bold text-foreground">{vocabularyRichness.uniqueWordCount}</span>
              <p className="text-[10px] text-muted-foreground">Unique Words</p>
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">{vocabularyRichness.typeTokenRatio}%</span>
              <p className="text-[10px] text-muted-foreground">Type-Token Ratio</p>
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">{vocabularyRichness.hapaxLegomena}</span>
              <p className="text-[10px] text-muted-foreground">Hapax Words</p>
            </div>
          </div>
          {vocabularyRichness.mostRepeated.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium">Most Repeated:</p>
              <div className="flex flex-wrap gap-1">
                {vocabularyRichness.mostRepeated.slice(0, 6).map((r) => (
                  <span key={r.word} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-foreground">
                    {r.word} ({r.count}×)
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Active vs Passive Voice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Voice Analysis</h3>
            <span className={`ml-auto text-xs font-bold ${voiceAnalysis.score === 'Excellent' ? 'text-success' : voiceAnalysis.score === 'Good' ? 'text-primary' : 'text-warning'}`}>
              {voiceAnalysis.score}
            </span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-success">Active ({voiceAnalysis.activeSentences})</span>
                <span className="text-warning">Passive ({voiceAnalysis.passiveSentences})</span>
              </div>
              <div className="h-2 bg-warning/30 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${voiceAnalysis.activeRatio}%` }} />
              </div>
            </div>
            <span className="text-sm font-bold text-foreground">{voiceAnalysis.activeRatio}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{voiceAnalysis.suggestion}</p>
        </motion.div>

        {/* Jargon Detection */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-medium text-foreground">Jargon Detection</h3>
            <span className="ml-auto text-xs text-muted-foreground">{jargonAnalysis.jargonCount} found</span>
          </div>
          <p className="text-xs mb-3">{jargonAnalysis.recommendation}</p>
          {jargonAnalysis.jargonWords.length > 0 && (
            <div className="space-y-1.5">
              {jargonAnalysis.jargonWords.slice(0, 5).map((j, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-destructive font-mono">"{j.word}"</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-success">{j.simpleAlternative}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Repetition Analysis */}
      {repetitionAnalysis.repeatedPhrases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Repeat className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-medium text-foreground">Repeated Phrases</h3>
            <span className="ml-auto text-xs font-bold text-primary">{repetitionAnalysis.repetitionScore}/100</span>
          </div>
          <div className="space-y-1.5">
            {repetitionAnalysis.repeatedPhrases.slice(0, 8).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground font-mono">"{p.phrase}"</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  p.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                  p.severity === 'medium' ? 'bg-warning/20 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {p.count}×
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Word Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-lg font-bold text-foreground">{analysis.avgSentenceLength}</span>
            <p className="text-[10px] text-muted-foreground">Avg Sentence Len</p>
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{analysis.avgWordLength}</span>
            <p className="text-[10px] text-muted-foreground">Avg Word Len</p>
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{analysis.avgSyllablesPerWord}</span>
            <p className="text-[10px] text-muted-foreground">Avg Syllables</p>
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{analysis.complexWordPercentage}%</span>
            <p className="text-[10px] text-muted-foreground">Complex Words</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
