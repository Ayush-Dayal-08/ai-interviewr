import { useState, useCallback, useEffect } from "react";

export type AIProvider = "offline" | "google" | "openrouter" | "nvidia";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const PROVIDER_INFO: Record<AIProvider, {
  name: string;
  description: string;
  defaultModel: string;
  models: { id: string; name: string }[];
  getKeyUrl: string;
  getKeyLabel: string;
}> = {
  offline: {
    name: "Offline Mode",
    description: "No API key needed — built-in questions, instant start",
    defaultModel: "offline",
    models: [
      { id: "offline", name: "Built-in Interview Engine" },
    ],
    getKeyUrl: "",
    getKeyLabel: "",
  },
  google: {
    name: "Google AI Studio",
    description: "Free Gemini API — best for getting started",
    defaultModel: "gemini-2.0-flash",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Fast)" },
      { id: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash (Latest)" },
      { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro (Best)" },
    ],
    getKeyUrl: "https://aistudio.google.com/apikey",
    getKeyLabel: "Get free API key from Google AI Studio",
  },
  openrouter: {
    name: "OpenRouter",
    description: "Access 300+ models — OpenAI, Anthropic, Google, Meta & more",
    defaultModel: "google/gemini-2.0-flash-001",
    models: [
      { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B" },
      { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro" },
    ],
    getKeyUrl: "https://openrouter.ai/keys",
    getKeyLabel: "Get API key from OpenRouter",
  },
  nvidia: {
    name: "NVIDIA NIM",
    description: "100+ high-performance models — DeepSeek, Llama, Qwen, Mistral & more",
    defaultModel: "meta/llama-3.1-8b-instruct",
    models: [
      // --- NVIDIA Models ---
      { id: "nvidia/llama-3.1-nemotron-ultra-253b-v1", name: "Nemotron Ultra 253B (Best)" },
      { id: "nvidia/nemotron-3-super-120b-a12b", name: "Nemotron 3 Super 120B" },
      { id: "nvidia/llama-3.3-nemotron-super-49b-v1.5", name: "Nemotron Super 49B v1.5" },
      { id: "nvidia/llama-3.3-nemotron-super-49b-v1", name: "Nemotron Super 49B v1" },
      { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B Instruct" },
      { id: "nvidia/llama-3.1-nemotron-51b-instruct", name: "Nemotron 51B Instruct" },
      { id: "nvidia/nemotron-4-340b-instruct", name: "Nemotron 4 340B Instruct" },
      { id: "nvidia/nemotron-3-nano-30b-a3b", name: "Nemotron 3 Nano 30B" },
      { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", name: "Nemotron 3 Nano Omni (Reasoning)" },
      { id: "nvidia/nvidia-nemotron-nano-9b-v2", name: "Nemotron Nano 9B v2" },
      { id: "nvidia/llama-3.1-nemotron-nano-8b-v1", name: "Nemotron Nano 8B v1" },
      { id: "nvidia/nemotron-mini-4b-instruct", name: "Nemotron Mini 4B" },
      { id: "nvidia/cosmos-reason2-8b", name: "Cosmos Reason2 8B" },
      { id: "nvidia/mistral-nemo-minitron-8b-8k-instruct", name: "Mistral NeMo Minitron 8B" },
      // --- DeepSeek ---
      { id: "deepseek-ai/deepseek-v4-pro", name: "DeepSeek V4 Pro" },
      { id: "deepseek-ai/deepseek-v4-flash", name: "DeepSeek V4 Flash" },
      // --- Meta Llama ---
      { id: "meta/llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick 17B" },
      { id: "meta/llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct" },
      { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B Instruct" },
      { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct" },
      { id: "meta/llama-3.2-90b-vision-instruct", name: "Llama 3.2 90B Vision" },
      { id: "meta/llama-3.2-11b-vision-instruct", name: "Llama 3.2 11B Vision" },
      { id: "meta/llama-3.2-3b-instruct", name: "Llama 3.2 3B Instruct" },
      { id: "meta/llama-3.2-1b-instruct", name: "Llama 3.2 1B Instruct" },
      // --- Qwen ---
      { id: "qwen/qwen3.5-397b-a17b", name: "Qwen 3.5 397B" },
      { id: "qwen/qwen3.5-122b-a10b", name: "Qwen 3.5 122B" },
      { id: "qwen/qwen3-coder-480b-a35b-instruct", name: "Qwen 3 Coder 480B" },
      { id: "qwen/qwen3-next-80b-a3b-instruct", name: "Qwen 3 Next 80B" },
      { id: "qwen/qwen3-next-80b-a3b-thinking", name: "Qwen 3 Next 80B (Thinking)" },
      // --- Mistral AI ---
      { id: "mistralai/mistral-large-3-675b-instruct-2512", name: "Mistral Large 3 675B" },
      { id: "mistralai/mistral-medium-3.5-128b", name: "Mistral Medium 3.5 128B" },
      { id: "mistralai/mistral-small-4-119b-2603", name: "Mistral Small 4 119B" },
      { id: "mistralai/mistral-large-2-instruct", name: "Mistral Large 2" },
      { id: "mistralai/mistral-nemotron", name: "Mistral Nemotron" },
      { id: "mistralai/mixtral-8x22b-instruct-v0.1", name: "Mixtral 8x22B Instruct" },
      { id: "mistralai/mixtral-8x7b-instruct-v0.1", name: "Mixtral 8x7B Instruct" },
      { id: "mistralai/mistral-7b-instruct-v0.3", name: "Mistral 7B Instruct" },
      { id: "mistralai/ministral-14b-instruct-2512", name: "Ministral 14B" },
      { id: "mistralai/codestral-22b-instruct-v0.1", name: "Codestral 22B" },
      { id: "nv-mistralai/mistral-nemo-12b-instruct", name: "Mistral NeMo 12B" },
      // --- Google ---
      { id: "google/gemma-4-31b-it", name: "Gemma 4 31B" },
      { id: "google/gemma-3-12b-it", name: "Gemma 3 12B" },
      { id: "google/gemma-3-4b-it", name: "Gemma 3 4B" },
      { id: "google/gemma-3n-e4b-it", name: "Gemma 3n E4B" },
      { id: "google/gemma-3n-e2b-it", name: "Gemma 3n E2B" },
      { id: "google/gemma-2-2b-it", name: "Gemma 2 2B" },
      // --- Microsoft ---
      { id: "microsoft/phi-4-mini-instruct", name: "Phi 4 Mini" },
      { id: "microsoft/phi-3.5-moe-instruct", name: "Phi 3.5 MoE" },
      // --- OpenAI ---
      { id: "openai/gpt-oss-120b", name: "GPT OSS 120B" },
      { id: "openai/gpt-oss-20b", name: "GPT OSS 20B" },
      // --- Others ---
      { id: "moonshotai/kimi-k2.6", name: "Kimi K2.6 (Moonshot)" },
      { id: "minimaxai/minimax-m2.7", name: "MiniMax M2.7" },
      { id: "stepfun-ai/step-3.5-flash", name: "Step 3.5 Flash" },
      { id: "z-ai/glm-5.1", name: "GLM 5.1 (Z-AI)" },
      { id: "z-ai/glm5", name: "GLM 5 (Z-AI)" },
      { id: "01-ai/yi-large", name: "Yi Large (01.AI)" },
      { id: "ai21labs/jamba-1.5-large-instruct", name: "Jamba 1.5 Large (AI21)" },
      { id: "databricks/dbrx-instruct", name: "DBRX Instruct" },
      { id: "ibm/granite-3.0-8b-instruct", name: "Granite 3.0 8B (IBM)" },
      { id: "writer/palmyra-creative-122b", name: "Palmyra Creative 122B" },
      { id: "sarvamai/sarvam-m", name: "Sarvam M (Indian Languages)" },
      { id: "abacusai/dracarys-llama-3.1-70b-instruct", name: "Dracarys Llama 70B" },
      { id: "bytedance/seed-oss-36b-instruct", name: "Seed OSS 36B (ByteDance)" },
      { id: "stockmark/stockmark-2-100b-instruct", name: "Stockmark 2 100B" },
      { id: "zyphra/zamba2-7b-instruct", name: "Zamba2 7B" },
    ],
    getKeyUrl: "https://build.nvidia.com/explore/discover",
    getKeyLabel: "Get API key from NVIDIA Build",
  },
};

// ─── Offline Interview Question Bank ───
const OFFLINE_QUESTIONS = [
  "Tell me about yourself and what motivates you in your career.",
  "What is your greatest professional achievement so far?",
  "Describe a time when you had to work under pressure. How did you handle it?",
  "Why are you interested in this role and our company?",
  "Tell me about a time you failed at something. What did you learn?",
  "How do you handle disagreements with coworkers or managers?",
  "Describe a situation where you had to learn something new quickly.",
  "What are your strengths and how do they apply to this position?",
  "Tell me about a project you led. What was the outcome?",
  "How do you prioritize tasks when you have multiple deadlines?",
  "Describe a time when you went above and beyond at work.",
  "What's the most difficult decision you've had to make professionally?",
  "How do you stay updated with industry trends and developments?",
  "Tell me about a time you had to persuade someone to see your point of view.",
  "Where do you see yourself in five years?",
  "Describe a situation where you had to deal with an unhappy client or stakeholder.",
  "What's your approach to problem-solving? Give me an example.",
  "Tell me about a time you worked effectively as part of a team.",
  "How do you handle constructive criticism?",
  "What would your previous manager say is your biggest area for improvement?",
  "Describe a time when you had to adapt to a significant change at work.",
  "How do you measure success in your work?",
  "Tell me about a time you identified a problem before it became critical.",
  "What do you do when you don't know the answer to something?",
  "Describe your ideal work environment.",
  "Tell me about a time you mentored or helped develop someone else.",
  "How do you handle ambiguity in your work?",
  "What's the most innovative idea you've implemented?",
  "Tell me about a time you had to balance competing priorities from different stakeholders.",
  "What questions do you have for me about this role?",
];

let offlineQuestionIndex = 0;

const STORAGE_KEY = "ai_coach_provider_config";

function loadConfig(): AIProviderConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.provider) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return { provider: "offline", apiKey: "", model: "offline" };
}

function saveConfig(config: AIProviderConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Call Google AI Studio (Gemini) directly from the browser.
 * Google's generativelanguage API supports CORS.
 */
async function callGoogleAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  // Separate system instruction from messages
  const systemMessages = messages.filter(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  // Build Gemini-format contents
  const contents = chatMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents };

  if (systemMessages.length > 0) {
    body.systemInstruction = {
      parts: [{ text: systemMessages.map(m => m.content).join("\n") }],
    };
  }

  body.generationConfig = {
    temperature: 0.8,
    maxOutputTokens: 512,
    responseMimeType: "application/json",
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = (errorData as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
    if (response.status === 400 && msg.includes("API key")) {
      throw new Error("Invalid API key. Please check your Google AI Studio key in Settings.");
    }
    if (response.status === 429) {
      throw new Error("Rate limit reached. Please wait a moment and try again.");
    }
    throw new Error(`Google AI error: ${msg}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Google AI");
  return text;
}

/**
 * Call OpenRouter API directly from the browser.
 * OpenRouter supports CORS and the OpenAI chat completions format.
 * Works with Anthropic, OpenAI, Google, Meta, and 300+ other models.
 */
async function callOpenRouterAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "AI Career Coach",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 512,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = (errorData as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
    if (response.status === 401) {
      throw new Error("Invalid API key. Please check your OpenRouter key in Settings.");
    }
    if (response.status === 429) {
      throw new Error("Rate limit reached. Please wait a moment and try again.");
    }
    throw new Error(`OpenRouter error: ${msg}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return text;
}

/**
 * Call NVIDIA NIM API via local proxy to bypass CORS.
 * In dev mode, Vite proxies /nvidia-api → integrate.api.nvidia.com.
 * In production, configure your server (nginx, Cloudflare, etc.) to do the same.
 *
 * NVIDIA's reasoning models (e.g. Nemotron Super) return text in
 * `reasoning_content` instead of `content`, so we check both.
 */
async function callNvidiaAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  // Use the local proxy to bypass CORS
  const proxyUrl = "/nvidia-api/v1/chat/completions";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let response: Response;
  try {
    response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 512,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("NVIDIA API timed out (20s). Try a smaller/faster model.");
    }
    throw new Error(
      "Cannot reach NVIDIA API. Make sure the dev server proxy is running (npm run dev)."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = (errorData as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid API key. Please check your NVIDIA key in Settings.");
    }
    if (response.status === 429) {
      throw new Error("Rate limit reached. Please wait a moment and try again.");
    }
    throw new Error(`NVIDIA NIM error: ${msg}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0]?.message;
  // Reasoning models put text in reasoning_content, normal models in content
  const text = choice?.content || choice?.reasoning_content || "";
  if (!text) throw new Error("Empty response from NVIDIA NIM");
  return text;
}

/**
 * Offline AI — zero latency, no API key needed.
 * Uses a built-in question bank and local speech analysis.
 */
async function callOfflineAI(messages: ChatMessage[]): Promise<string> {
  // Simulate tiny delay for natural feel
  await new Promise(r => setTimeout(r, 300));

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
  const isGreeting = messages.filter(m => m.role === "user").length <= 1;

  // Analyze user's speech locally
  const words = lastUserMsg.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const fillerWords = ["um", "uh", "like", "you know", "basically", "actually", "so", "right"];
  const detectedFillers = fillerWords.filter(f => lastUserMsg.toLowerCase().includes(f));
  const fillerDensity = wordCount > 0 ? detectedFillers.length / wordCount : 0;

  // Score based on answer length and filler usage
  const lengthScore = Math.min(100, Math.max(20, wordCount * 2));
  const fillerPenalty = fillerDensity * 200;
  const confidence = Math.round(Math.max(15, Math.min(95, lengthScore - fillerPenalty)));
  const clarity = Math.round(Math.max(20, Math.min(95, lengthScore - fillerPenalty * 0.5)));
  const energy = Math.round(Math.max(25, Math.min(90, 40 + wordCount * 0.8)));

  const tones: Array<"confident" | "nervous" | "enthusiastic" | "monotone" | "neutral"> = 
    ["confident", "neutral", "enthusiastic", "nervous", "monotone"];
  const tone = confidence > 70 ? tones[0] : confidence > 50 ? tones[1] : tones[3];

  const pacing = wordCount > 0 ? String(Math.round(wordCount * 4.5)) : "0";

  // Pick the right question
  let coachMessage: string;
  let liveTip: string;

  if (isGreeting) {
    coachMessage = "Welcome! I'm your AI Interview Coach. I'll be conducting a mock interview with you today. Let's start with a classic opener: Tell me about yourself and what motivates you in your career.";
    liveTip = "Relax and be natural";
    offlineQuestionIndex = 1;
  } else {
    // Generate feedback + next question
    const feedbacks = [
      wordCount < 10 ? "Try to elaborate more on your answers. Interviewers want depth." :
      wordCount > 100 ? "Good detail! Try to be a bit more concise though." :
      "Good response length.",

      detectedFillers.length > 0 
        ? `Watch out for filler words: "${detectedFillers.join('", "')}".` 
        : "Great job avoiding filler words!",

      confidence > 60 ? "You sound confident — keep it up!" : "Try to project more confidence.",
    ];

    const nextQ = OFFLINE_QUESTIONS[offlineQuestionIndex % OFFLINE_QUESTIONS.length];
    offlineQuestionIndex++;

    coachMessage = `${feedbacks.join(" ")} Now, let's move on: ${nextQ}`;

    const tips = [
      "Use the STAR method",
      "Be specific with examples", 
      "Maintain eye contact",
      "Slow down slightly",
      "Structure your answer",
      "Start with the outcome",
      "Keep it under 2 minutes",
      "Show enthusiasm",
      "Quantify your impact",
      "Pause before answering",
    ];
    liveTip = tips[offlineQuestionIndex % tips.length];
  }

  const response = {
    coach_message: coachMessage,
    metrics: {
      confidence_score: confidence,
      pacing_wpm: pacing,
      filler_words_detected: detectedFillers,
      eye_contact_rating: confidence > 60 ? "Good" : confidence > 35 ? "Fair" : "Poor",
      accent_tips: [],
      clarity_score: clarity,
      tone,
      energy_level: energy,
      pitch_variation: confidence > 60 ? "dynamic" : confidence > 35 ? "moderate" : "low",
    },
    live_tip: liveTip,
    content_suggestion: wordCount < 15 
      ? "Try to provide more detailed answers with specific examples." 
      : undefined,
  };

  return JSON.stringify(response);
}

/**
 * Main hook: manages AI provider config and provides a unified callAI function.
 */
export function useAIProvider() {
  const [config, setConfig] = useState<AIProviderConfig>(loadConfig);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"untested" | "valid" | "invalid">("untested");
  const [keyError, setKeyError] = useState<string | null>(null);

  // Sync to localStorage whenever config changes
  useEffect(() => {
    saveConfig(config);
    setKeyStatus("untested");
    setKeyError(null);
  }, [config]);

  const updateProvider = useCallback((provider: AIProvider) => {
    setConfig(prev => ({
      ...prev,
      provider,
      model: PROVIDER_INFO[provider].defaultModel,
    }));
  }, []);

  const updateApiKey = useCallback((apiKey: string) => {
    setConfig(prev => ({ ...prev, apiKey }));
  }, []);

  const updateModel = useCallback((model: string) => {
    setConfig(prev => ({ ...prev, model }));
  }, []);

  const isConfigured = config.provider === "offline" || config.apiKey.trim().length > 0;

  /**
   * Unified AI call — works with any configured provider.
   */
  const callAI = useCallback(async (messages: ChatMessage[]): Promise<string> => {
    if (config.provider !== "offline" && !config.apiKey.trim()) {
      throw new Error("No API key configured. Please add your API key in Settings.");
    }

    switch (config.provider) {
      case "offline":
        return callOfflineAI(messages);
      case "google":
        return callGoogleAI(config.apiKey, config.model, messages);
      case "openrouter":
        return callOpenRouterAI(config.apiKey, config.model, messages);
      case "nvidia":
        return callNvidiaAI(config.apiKey, config.model, messages);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }, [config]);

  /**
   * Test the API key with a simple request.
   */
  const testKey = useCallback(async (): Promise<boolean> => {
    // Offline mode always works
    if (config.provider === "offline") {
      setKeyStatus("valid");
      setKeyError(null);
      return true;
    }

    if (!config.apiKey.trim()) {
      setKeyStatus("invalid");
      setKeyError("No API key provided.");
      return false;
    }

    setIsTestingKey(true);
    setKeyError(null);
    try {
      await callAI([
        { role: "user", content: "Reply with exactly one word: OK" },
      ]);
      setKeyStatus("valid");
      setKeyError(null);
      return true;
    } catch (err) {
      setKeyStatus("invalid");
      const msg = err instanceof Error ? err.message : "Unknown error";
      setKeyError(msg);
      console.error("[AI Provider] Key test failed:", msg);
      return false;
    } finally {
      setIsTestingKey(false);
    }
  }, [callAI, config.apiKey]);

  return {
    config,
    isConfigured,
    keyStatus,
    keyError,
    isTestingKey,
    providerInfo: PROVIDER_INFO,
    updateProvider,
    updateApiKey,
    updateModel,
    callAI,
    testKey,
  };
}

export { PROVIDER_INFO };
