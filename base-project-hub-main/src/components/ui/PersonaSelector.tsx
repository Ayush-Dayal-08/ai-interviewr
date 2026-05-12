import { useState } from "react";
import { ChevronDown, User, Briefcase, Brain } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type PersonaType = "friendly" | "stern" | "behavioral";

interface PersonaOption {
  id: PersonaType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const personas: PersonaOption[] = [
  {
    id: "friendly",
    label: "Friendly Recruiter",
    description: "Warm, encouraging, focuses on your potential",
    icon: <User className="w-4 h-4 text-success" />,
  },
  {
    id: "stern",
    label: "Stern Technical Lead",
    description: "Direct, challenging, expects precision",
    icon: <Briefcase className="w-4 h-4 text-warning" />,
  },
  {
    id: "behavioral",
    label: "Behavioral Expert",
    description: "STAR method focused, probes for details",
    icon: <Brain className="w-4 h-4 text-primary" />,
  },
];

interface PersonaSelectorProps {
  value: PersonaType;
  onChange: (persona: PersonaType) => void;
}

export function PersonaSelector({ value, onChange }: PersonaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPersona = personas.find((p) => p.id === value) || personas[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-3 px-4 bg-card border-border hover:bg-muted"
        >
          <div className="flex items-center gap-3">
            {selectedPersona.icon}
            <div className="text-left">
              <div className="font-medium text-foreground">{selectedPersona.label}</div>
              <div className="text-xs text-muted-foreground">{selectedPersona.description}</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border-border" align="start">
        {personas.map((persona) => (
          <DropdownMenuItem
            key={persona.id}
            onClick={() => onChange(persona.id)}
            className={`flex items-center gap-3 py-3 px-4 cursor-pointer ${
              value === persona.id ? 'bg-muted' : ''
            }`}
          >
            {persona.icon}
            <div className="flex-1">
              <div className="font-medium text-foreground">{persona.label}</div>
              <div className="text-xs text-muted-foreground">{persona.description}</div>
            </div>
            {value === persona.id && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper to get system instruction modifier based on persona
export function getPersonaInstruction(persona: PersonaType): string {
  switch (persona) {
    case "friendly":
      return `Tone & Style: You are a FRIENDLY RECRUITER. Be warm, encouraging, and supportive. 
      Focus on the candidate's potential and growth. Use phrases like "That's a great start!" and "I love how you approached that."
      Ask follow-up questions with genuine curiosity. Make the candidate feel comfortable while still providing honest feedback.
      Your goal is to build confidence while helping them improve.`;
    
    case "stern":
      return `Tone & Style: You are a STERN TECHNICAL LEAD. Be direct, precise, and challenging.
      Expect clear, concise answers with specific technical details. Push back on vague responses.
      Use phrases like "Can you be more specific?" and "Walk me through the exact steps."
      Don't accept surface-level answers - dig deeper. Your feedback should be constructive but demanding.
      You're preparing them for the toughest technical interviews.`;
    
    case "behavioral":
      return `Tone & Style: You are a BEHAVIORAL INTERVIEW EXPERT. Focus heavily on the STAR method.
      Ask probing questions about Situation, Task, Action, and Result. 
      Use phrases like "Tell me about a time when..." and "What was YOUR specific role in that?"
      Look for quantifiable results and specific examples. Challenge them if they speak in generalities.
      Your goal is to extract concrete behavioral evidence that demonstrates competencies.`;
    
    default:
      return "";
  }
}
