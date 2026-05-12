import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import { HelpBot } from "@/components/ui/HelpBot";
import PreSession from "./pages/PreSession";
import LiveSession from "./pages/LiveSession";
import SessionReport from "./pages/SessionReport";
import SessionHistory from "./pages/SessionHistory";
import PracticeModes from "./pages/PracticeModes";
import SpeechTools from "./pages/SpeechTools";
import StressTraining from "./pages/StressTraining";
import SpeechLibraryPage from "./pages/SpeechLibraryPage";
import LearningPage from "./pages/LearningPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChangelogPage from "./pages/ChangelogPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      toast.error("An error occurred. Please try again.");
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      toast.error("Something went wrong. Please refresh.");
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PreSession />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/session" element={<LiveSession />} />
            <Route path="/report" element={<SessionReport />} />
            <Route path="/history" element={<SessionHistory />} />
            <Route path="/practice" element={<PracticeModes />} />
            <Route path="/tools" element={<SpeechTools />} />
            <Route path="/training" element={<StressTraining />} />
            <Route path="/library" element={<SpeechLibraryPage />} />
            <Route path="/learn" element={<LearningPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <HelpBot />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
