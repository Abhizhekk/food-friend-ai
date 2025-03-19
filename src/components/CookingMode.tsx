
import React, { useState, useEffect, useRef } from 'react';
import { RecipeData } from '@/services/GeminiService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Mic, MicOff, X } from 'lucide-react';
import geminiService from '@/services/GeminiService';
import { toast } from "sonner";

interface CookingModeProps {
  recipe: RecipeData;
  onExit: () => void;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onExit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [voiceInstructions, setVoiceInstructions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Convert recipe steps to voice instructions
    const getVoiceInstructions = async () => {
      try {
        setIsLoading(true);
        const instructions = await geminiService.getVoiceInstructions(recipe.steps);
        setVoiceInstructions(instructions);
      } catch (error) {
        console.error("Error getting voice instructions:", error);
        setVoiceInstructions(recipe.steps);
      } finally {
        setIsLoading(false);
      }
    };

    getVoiceInstructions();
    
    // Clean up speech synthesis when component unmounts
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [recipe.steps]);

  useEffect(() => {
    // Update progress whenever current step changes
    const newProgress = (currentStep / (recipe.steps.length - 1)) * 100;
    setProgress(newProgress);
  }, [currentStep, recipe.steps.length]);

  const speakInstruction = (text: string) => {
    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower than default
    utterance.pitch = 1;
    
    // Get available voices and try to find a good one
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Try to find a good voice, preferring female voices for cooking instructions
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google US English Female') ||
        voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }
    
    // Set up events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Failed to speak instruction");
    };
    
    // Store reference and speak
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const nextStep = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (voiceInstructions[currentStep + 1]) {
        speakInstruction(voiceInstructions[currentStep + 1]);
      }
    } else {
      // Completed all steps
      toast.success("Recipe completed! Enjoy your meal!", {
        icon: <CheckCircle className="h-5 w-5 text-primary" />,
        duration: 5000,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (voiceInstructions[currentStep - 1]) {
        speakInstruction(voiceInstructions[currentStep - 1]);
      }
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      // Stop speaking
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } else {
      // Start speaking current instruction
      const instruction = voiceInstructions[currentStep] || recipe.steps[currentStep];
      speakInstruction(instruction);
    }
  };

  const startVoiceRecognition = () => {
    // Check if SpeechRecognition is supported
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error("Voice recognition is not supported in your browser");
      return;
    }
    
    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening for voice commands...", { duration: 2000 });
    };
    
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice command:", command);
      
      // Handle commands
      if (command.includes('next') || command.includes('forward')) {
        nextStep();
      } else if (command.includes('previous') || command.includes('back')) {
        prevStep();
      } else if (command.includes('repeat') || command.includes('again')) {
        toggleVoice();
      } else if (command.includes('exit') || command.includes('quit') || command.includes('close')) {
        onExit();
      } else {
        toast.info(`Command not recognized: "${command}"`, { duration: 2000 });
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
      toast.error("Error recognizing voice command");
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-fade-in">
      <header className="glass py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit}>
            <X className="h-5 w-5" />
          </Button>
          <h2 className="font-display text-xl font-medium">Cooking Mode</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className={`${isSpeaking ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={toggleVoice}
          >
            {isSpeaking ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </header>
      
      <div className="flex items-center justify-between px-6 py-3 bg-muted/50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{recipe.cookingTime}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-sm">Step {currentStep + 1} of {recipe.steps.length}</span>
        </div>
      </div>
      
      <Progress value={progress} className="h-1.5" />
      
      <main className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
              <p className="text-sm text-foreground/80">Preparing cooking instructions...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="glass-card relative p-8">
              <div className="flex justify-center mb-6">
                <span className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {currentStep + 1}
                </span>
              </div>
              
              <p className="text-xl text-center mb-10">
                {voiceInstructions[currentStep] || recipe.steps[currentStep]}
              </p>
              
              <div className="absolute top-4 right-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-full ${isListening ? 'bg-primary text-primary-foreground animate-pulse' : ''}`}
                  onClick={startVoiceRecognition}
                  title="Voice commands"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </Card>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                className="flex items-center gap-1.5"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <Button 
                variant={currentStep === recipe.steps.length - 1 ? "default" : "outline"}
                className="flex items-center gap-1.5"
                onClick={nextStep}
              >
                <span>{currentStep === recipe.steps.length - 1 ? "Finish" : "Next"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="p-4 border-t text-center text-sm text-muted-foreground">
        <p>Voice commands: "next", "previous", "repeat", "exit"</p>
      </footer>
    </div>
  );
};

export default CookingMode;
