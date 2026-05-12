import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Save, RotateCcw, Key, ExternalLink, CheckCircle2, XCircle, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SYSTEM_INSTRUCTION_TEXT } from "@/hooks/useGeminiCoach";
import { useAIProvider, PROVIDER_INFO, type AIProvider } from "@/hooks/useAIProvider";

interface SettingsPanelProps {
  systemInstruction: string;
  onUpdateSystemInstruction: (instruction: string) => void;
}

export function SettingsPanel({
  systemInstruction,
  onUpdateSystemInstruction,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localInstruction, setLocalInstruction] = useState(systemInstruction);
  const [isSaved, setIsSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const aiProvider = useAIProvider();

  // Sync local instruction when prop changes
  useEffect(() => {
    setLocalInstruction(systemInstruction);
  }, [systemInstruction]);

  const handleSave = () => {
    onUpdateSystemInstruction(localInstruction);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalInstruction(DEFAULT_SYSTEM_INSTRUCTION_TEXT);
    onUpdateSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION_TEXT);
  };

  const currentProvider = PROVIDER_INFO[aiProvider.config.provider];

  return (
    <>
      {/* Settings Button — shows warning dot if no API key */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="border-border hover:bg-muted"
        >
          <Settings className="w-5 h-5" />
        </Button>
        {!aiProvider.isConfigured && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Settings</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* === AI Provider Selection === */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    AI Provider
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(PROVIDER_INFO) as AIProvider[]).map((provider) => {
                      const info = PROVIDER_INFO[provider];
                      const isSelected = aiProvider.config.provider === provider;
                      return (
                        <button
                          key={provider}
                          onClick={() => aiProvider.updateProvider(provider)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                              : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="font-medium text-sm text-foreground">{info.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{info.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* === API Key Input (hidden for offline mode) === */}
                {aiProvider.config.provider === "offline" ? (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-400 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready to go — no API key needed!
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Offline mode uses 30 built-in interview questions with local speech analysis. 
                      Switch to an AI provider anytime for smarter, adaptive responses.
                    </p>
                  </div>
                ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={aiProvider.config.apiKey}
                      onChange={(e) => aiProvider.updateApiKey(e.target.value)}
                      placeholder={`Enter your ${currentProvider.name} API key...`}
                      className="w-full px-3 py-2.5 pr-20 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
                    >
                      {showKey ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Key status + test button */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => aiProvider.testKey()}
                      disabled={!aiProvider.isConfigured || aiProvider.isTestingKey}
                      className="gap-2"
                    >
                      {aiProvider.isTestingKey ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                    {aiProvider.keyStatus === "valid" && (
                      <span className="flex items-center gap-1.5 text-xs text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    )}
                    {aiProvider.keyStatus === "invalid" && (
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs text-destructive">
                          <XCircle className="w-3.5 h-3.5" /> Connection failed
                        </span>
                        {aiProvider.keyError && (
                          <span className="text-xs text-destructive/70 ml-5">
                            {aiProvider.keyError}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Get API key link */}
                  {currentProvider.getKeyUrl && (
                  <a
                    href={currentProvider.getKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {currentProvider.getKeyLabel}
                  </a>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally in your browser. It is never sent to our servers.
                  </p>
                </div>
                )}

                {/* === Model Selection (hidden for offline) === */}
                {aiProvider.config.provider !== "offline" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Model</label>
                  <div className="relative">
                    <select
                      value={aiProvider.config.model}
                      onChange={(e) => aiProvider.updateModel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {currentProvider.models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                )}

                {/* === Connection Status Summary === */}
                <div className={`p-4 rounded-lg border ${
                  aiProvider.isConfigured 
                    ? aiProvider.keyStatus === "valid" 
                      ? "bg-green-500/5 border-green-500/20" 
                      : "bg-primary/5 border-primary/20"
                    : "bg-destructive/5 border-destructive/20"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      aiProvider.isConfigured 
                        ? aiProvider.keyStatus === "valid"
                          ? "bg-green-400 animate-pulse"
                          : "bg-primary"
                        : "bg-destructive animate-pulse"
                    }`} />
                    <span className="text-sm text-foreground">
                      {!aiProvider.isConfigured
                        ? "⚠️ API key required to start coaching"
                        : aiProvider.keyStatus === "valid"
                        ? `✅ Connected to ${currentProvider.name}`
                        : `🔑 ${currentProvider.name} key configured`}
                    </span>
                  </div>
                  {!aiProvider.isConfigured && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Add your API key above to enable AI-powered interview coaching.
                    </p>
                  )}
                </div>

                {/* === System Instructions === */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      System Instructions
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset to Default
                    </Button>
                  </div>
                  <Textarea
                    value={localInstruction}
                    onChange={(e) => setLocalInstruction(e.target.value)}
                    placeholder="Enter system instructions for the AI coach..."
                    className="min-h-[200px] bg-background border-border resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions guide how the AI coach behaves during your session.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                <Button
                  onClick={handleSave}
                  className="w-full"
                  disabled={isSaved}
                >
                  {isSaved ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
