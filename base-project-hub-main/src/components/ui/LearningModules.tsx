import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle, XCircle, ChevronRight, ChevronLeft, Award, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Lesson {
  title: string;
  theory: string;
  example: string;
  antiExample: string;
  practicePrompt: string;
}

interface Quiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Module {
  id: string;
  title: string;
  icon: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessons: Lesson[];
  quiz: Quiz[];
}

const MODULES: Module[] = [
  {
    id: "openings",
    title: "Powerful Openings",
    icon: "🚀",
    description: "Master 7 ways to start a speech that grabs attention",
    duration: "15 min",
    difficulty: "beginner",
    lessons: [
      {
        title: "The Question Hook",
        theory: "Starting with a question immediately engages your audience's brain. It creates curiosity and makes them active participants rather than passive listeners.",
        example: '"What if I told you that 90% of what you learned in school is wrong?"',
        antiExample: '"Today I am going to talk about education reform."',
        practicePrompt: "Start a 30-second speech about any topic using a question hook.",
      },
      {
        title: "The Shocking Statistic",
        theory: "Numbers create credibility and surprise. Use unexpected data to jolt your audience awake and establish authority.",
        example: '"Every 40 seconds, someone in the world takes their own life. Today, I want to talk about mental health."',
        antiExample: '"Mental health is important. Let me tell you why."',
        practicePrompt: "Open a speech with a surprising statistic about a topic you care about.",
      },
      {
        title: "The Personal Story",
        theory: "Stories create emotional connection. Starting with a personal moment makes you relatable and authentic.",
        example: '"Three years ago, I stood in this exact spot, terrified, voice shaking, hands trembling..."',
        antiExample: '"I have experience with public speaking anxiety."',
        practicePrompt: "Start a speech with a personal story that connects to overcoming a challenge.",
      },
      {
        title: "The Bold Statement",
        theory: "A controversial or bold claim grabs attention immediately and creates anticipation for what comes next.",
        example: '"Social media is the most destructive invention of the 21st century."',
        antiExample: '"Social media has both pros and cons."',
        practicePrompt: "Open with a bold, debatable statement about technology.",
      },
      {
        title: 'The "Imagine" Technique',
        theory: 'Asking people to imagine puts them in a story. It activates their visual brain and creates immersion.',
        example: '"Imagine waking up tomorrow and every language barrier has disappeared. What would you do first?"',
        antiExample: '"Language barriers are a problem in our world."',
        practicePrompt: 'Start a speech using "Imagine..." about your ideal future.',
      },
    ],
    quiz: [
      {
        question: "Which opening is MOST likely to engage an audience immediately?",
        options: [
          '"Today I will discuss three topics."',
          '"What if everything you knew about success was wrong?"',
          '"Thank you for having me. I am honored to be here."',
          '"Let me read from my notes about this topic."',
        ],
        correct: 1,
        explanation: "A question hook creates immediate mental engagement and curiosity.",
      },
      {
        question: "What makes a statistic-based opening effective?",
        options: [
          "Using very large numbers",
          "Making the number unexpected and relatable",
          "Citing as many statistics as possible",
          "Using percentages instead of raw numbers",
        ],
        correct: 1,
        explanation: "Surprise and relevance make statistics memorable, not just the size of the number.",
      },
    ],
  },
  {
    id: "body-language",
    title: "Body Language Mastery",
    icon: "🎭",
    description: "Non-verbal communication that commands attention",
    duration: "20 min",
    difficulty: "intermediate",
    lessons: [
      {
        title: "Eye Contact Techniques",
        theory: "The triangle technique: move your gaze between three points in the audience every 3-5 seconds. This creates a sense of personal connection.",
        example: "Pick 3 friendly faces in different sections. Hold contact for 3 seconds each, then move on.",
        antiExample: "Staring at one person the entire time or looking at the ceiling.",
        practicePrompt: "Practice speaking for 30 seconds while consciously shifting eye contact between 3 points.",
      },
      {
        title: "Hand Gestures",
        theory: "Purposeful gestures amplify your message. Open palms convey honesty, pointing creates emphasis, and numbered fingers aid understanding.",
        example: "When listing 3 points, hold up fingers. When emphasizing size, spread your hands apart.",
        antiExample: "Hands in pockets, crossed arms, or fidgeting with a pen.",
        practicePrompt: "Describe your favorite meal using only hand gestures to emphasize key points.",
      },
      {
        title: "Power Stance",
        theory: "Plant your feet shoulder-width apart and stand tall. This conveys confidence and grounds your energy. Avoid swaying or shifting weight.",
        example: "Stand with feet firmly planted, shoulders back, chin slightly up.",
        antiExample: "Leaning on the podium, crossing your legs, or pacing nervously.",
        practicePrompt: "Practice delivering a 1-minute speech while maintaining a strong, grounded stance.",
      },
    ],
    quiz: [
      {
        question: "How long should you maintain eye contact with one person?",
        options: ["1 second", "3-5 seconds", "10+ seconds", "Don't make eye contact"],
        correct: 1,
        explanation: "3-5 seconds creates connection without making it uncomfortable.",
      },
      {
        question: "What do open palms convey to an audience?",
        options: ["Weakness", "Honesty and openness", "Boredom", "Aggression"],
        correct: 1,
        explanation: "Open palms are universally associated with honesty, trust, and openness.",
      },
    ],
  },
  {
    id: "storytelling",
    title: "Storytelling Mastery",
    icon: "📖",
    description: "Turn any message into a compelling narrative",
    duration: "25 min",
    difficulty: "intermediate",
    lessons: [
      {
        title: "The Story Arc",
        theory: "Every great story has a Setup (normal world), Conflict (the challenge), and Resolution (the transformation). This structure keeps audiences hooked.",
        example: '"I used to be terrified of speaking (setup). Then one day I was forced to present to 500 people (conflict). That moment changed everything (resolution)."',
        antiExample: '"I got better at speaking over time."',
        practicePrompt: "Tell a 1-minute story from your life using the setup-conflict-resolution arc.",
      },
      {
        title: "Sensory Details",
        theory: "Use specific sensory language — what you saw, heard, felt, smelled — to transport your audience into the moment.",
        example: '"The room smelled of stale coffee and anxiety. My palms were slick with sweat."',
        antiExample: '"I was in a room and I was nervous."',
        practicePrompt: "Describe a meaningful moment using at least 3 different senses.",
      },
      {
        title: "The Callback",
        theory: "Referencing an earlier point or story creates a satisfying circular structure and shows intentional design.",
        example: 'Starting with "What if..." and ending with the answer to that question.',
        antiExample: "Ending with completely unrelated content from the opening.",
        practicePrompt: "Create a 2-minute speech where your closing references your opening line.",
      },
    ],
    quiz: [
      {
        question: "What are the three parts of a story arc?",
        options: [
          "Introduction, Body, Conclusion",
          "Setup, Conflict, Resolution",
          "Beginning, Middle, End",
          "Hook, Evidence, Summary",
        ],
        correct: 1,
        explanation: "Setup (normal world), Conflict (challenge), Resolution (transformation) creates compelling narrative.",
      },
    ],
  },
  {
    id: "persuasion",
    title: "Art of Persuasion",
    icon: "🎯",
    description: "Aristotle's techniques for convincing any audience",
    duration: "20 min",
    difficulty: "advanced",
    lessons: [
      {
        title: "Ethos (Credibility)",
        theory: "Establish why YOU are the right person to speak on this topic. Share credentials, experience, or personal connection early.",
        example: '"As someone who has coached 500+ speakers and overcome my own severe anxiety..."',
        antiExample: '"I read about this online and thought it was interesting."',
        practicePrompt: "Open a persuasive speech by establishing your credibility on a topic you know well.",
      },
      {
        title: "Pathos (Emotion)",
        theory: "Connect with your audience emotionally through stories, vivid imagery, and relatable situations. Emotion drives action.",
        example: '"Imagine your child coming home, tears in their eyes, saying nobody at school will talk to them."',
        antiExample: '"Bullying statistics show a 15% increase year over year."',
        practicePrompt: "Make an emotional appeal about an issue you care about — aim to move the audience.",
      },
      {
        title: "Logos (Logic)",
        theory: "Support your arguments with data, evidence, and logical reasoning. Use the if-then structure to build airtight cases.",
        example: '"If we invest $1 in prevention, we save $7 in treatment. The math is simple."',
        antiExample: '"I just feel like this is the right thing to do."',
        practicePrompt: "Build a logical argument with at least 2 pieces of evidence for something you believe in.",
      },
    ],
    quiz: [
      {
        question: "Which persuasion technique uses emotional appeal?",
        options: ["Ethos", "Pathos", "Logos", "Kairos"],
        correct: 1,
        explanation: "Pathos is the appeal to emotion — stories, imagery, and feelings that drive action.",
      },
      {
        question: 'What does "Ethos" establish?',
        options: ["Logical reasoning", "Emotional connection", "Speaker credibility", "Time urgency"],
        correct: 2,
        explanation: "Ethos establishes why YOU are a credible source — through experience, credentials, or authority.",
      },
    ],
  },
];

const STORAGE_KEY = "learning_progress";

function getProgress(): Record<string, { completedLessons: number[]; quizScore: number; completed: boolean }> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveProgress(data: ReturnType<typeof getProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function LearningModules() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [progress, setProgress] = useState(getProgress);

  const startModule = (mod: Module) => {
    setSelectedModule(mod);
    setCurrentLessonIndex(0);
    setIsQuizMode(false);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizDone(false);
  };

  const markLessonComplete = () => {
    if (!selectedModule) return;
    const p = { ...progress };
    if (!p[selectedModule.id]) p[selectedModule.id] = { completedLessons: [], quizScore: 0, completed: false };
    if (!p[selectedModule.id].completedLessons.includes(currentLessonIndex)) {
      p[selectedModule.id].completedLessons.push(currentLessonIndex);
    }
    setProgress(p);
    saveProgress(p);

    if (currentLessonIndex < selectedModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      setIsQuizMode(true);
    }
  };

  const submitAnswer = (answerIndex: number) => {
    if (!selectedModule || showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    if (answerIndex === selectedModule.quiz[currentQuizIndex].correct) {
      setQuizScore(quizScore + 1);
    }
  };

  const nextQuestion = () => {
    if (!selectedModule) return;
    setSelectedAnswer(null);
    setShowResult(false);
    if (currentQuizIndex < selectedModule.quiz.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setQuizDone(true);
      const p = { ...progress };
      if (!p[selectedModule.id]) p[selectedModule.id] = { completedLessons: [], quizScore: 0, completed: false };
      p[selectedModule.id].quizScore = quizScore;
      p[selectedModule.id].completed = true;
      setProgress(p);
      saveProgress(p);
      toast.success("Module completed!");
    }
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  // Module list view
  if (!selectedModule) {
    const totalCompleted = Object.values(progress).filter(p => p.completed).length;

    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Learning Modules</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{totalCompleted}/{MODULES.length} completed</p>
              <div className="h-1.5 w-24 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(totalCompleted / MODULES.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {MODULES.map((mod, i) => {
            const modProgress = progress[mod.id];
            const isCompleted = modProgress?.completed;
            const lessonsDone = modProgress?.completedLessons?.length || 0;

            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => startModule(mod)}
                className={`text-left p-5 rounded-xl border transition-all hover:shadow-lg ${
                  isCompleted ? "border-success/50 bg-success/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{mod.icon}</span>
                  {isCompleted && <CheckCircle className="w-5 h-5 text-success" />}
                </div>
                <h4 className="text-base font-semibold text-foreground mt-3">{mod.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[mod.difficulty]}`}>
                    {mod.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">⏱ {mod.duration}</span>
                  <span className="text-xs text-muted-foreground">• {mod.lessons.length} lessons</span>
                </div>
                {lessonsDone > 0 && !isCompleted && (
                  <div className="mt-2">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(lessonsDone / mod.lessons.length) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{lessonsDone}/{mod.lessons.length} lessons done</p>
                  </div>
                )}
                {isCompleted && modProgress?.quizScore !== undefined && (
                  <p className="text-xs text-success mt-2 font-medium">Quiz: {modProgress.quizScore}/{mod.quiz.length} correct</p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const currentLesson = selectedModule.lessons[currentLessonIndex];
  const currentQuiz = selectedModule.quiz[currentQuizIndex];

  // Quiz Done Screen
  if (quizDone) {
    const percent = Math.round((quizScore / selectedModule.quiz.length) * 100);
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center space-y-6">
        <Award className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Module Complete!</h2>
        <p className="text-lg text-muted-foreground">{selectedModule.title}</p>
        <div className="text-4xl font-bold text-primary">{percent}%</div>
        <p className="text-muted-foreground">
          You got {quizScore} out of {selectedModule.quiz.length} questions correct
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="gap-1.5" onClick={() => startModule(selectedModule)}>
            <RotateCcw className="w-4 h-4" /> Retry Module
          </Button>
          <Button onClick={() => setSelectedModule(null)}>
            Back to Modules
          </Button>
        </div>
      </div>
    );
  }

  // Quiz Mode
  if (isQuizMode && currentQuiz) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setSelectedModule(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> All Modules
          </Button>
          <span className="text-sm text-muted-foreground">
            Quiz: {currentQuizIndex + 1}/{selectedModule.quiz.length}
          </span>
        </div>

        <motion.div key={currentQuizIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-lg font-semibold text-foreground">Quiz Time</h3>
          </div>

          <p className="text-base font-medium text-foreground">{currentQuiz.question}</p>

          <div className="space-y-2">
            {currentQuiz.options.map((opt, i) => {
              let style = "border-border hover:border-primary/50";
              if (showResult) {
                if (i === currentQuiz.correct) style = "border-success bg-success/10";
                else if (i === selectedAnswer) style = "border-destructive bg-destructive/10";
              } else if (selectedAnswer === i) {
                style = "border-primary bg-primary/10";
              }
              return (
                <button
                  key={i}
                  onClick={() => submitAnswer(i)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${style}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-foreground">{opt}</span>
                    {showResult && i === currentQuiz.correct && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                    {showResult && i === selectedAnswer && i !== currentQuiz.correct && <XCircle className="w-4 h-4 text-destructive ml-auto" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary">{currentQuiz.explanation}</p>
            </motion.div>
          )}

          {showResult && (
            <Button className="w-full" onClick={nextQuestion}>
              {currentQuizIndex < selectedModule.quiz.length - 1 ? "Next Question" : "See Results"} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  // Lesson View
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setSelectedModule(null)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> All Modules
        </Button>
        <span className="text-sm text-muted-foreground">
          Lesson {currentLessonIndex + 1}/{selectedModule.lessons.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentLessonIndex + 1) / selectedModule.lessons.length) * 100}%` }} />
      </div>

      <motion.div key={currentLessonIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <span className="text-sm text-primary font-medium">{selectedModule.icon} {selectedModule.title}</span>
          <h3 className="text-xl font-bold text-foreground mt-1">{currentLesson.title}</h3>
        </div>

        {/* Theory */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-primary mb-2">📚 Theory</h4>
          <p className="text-sm text-foreground leading-relaxed">{currentLesson.theory}</p>
        </div>

        {/* Example vs Anti-Example */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-success mb-2">✅ Good Example</h4>
            <p className="text-sm text-foreground italic">{currentLesson.example}</p>
          </div>
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-destructive mb-2">❌ Bad Example</h4>
            <p className="text-sm text-foreground italic">{currentLesson.antiExample}</p>
          </div>
        </div>

        {/* Practice Prompt */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">🎤 Practice This</h4>
          <p className="text-sm text-muted-foreground">{currentLesson.practicePrompt}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" disabled={currentLessonIndex === 0}
            onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <Button size="sm" onClick={markLessonComplete}>
            {currentLessonIndex < selectedModule.lessons.length - 1 ? "Next Lesson" : "Take Quiz"} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
