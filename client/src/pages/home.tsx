import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SearchIcon, Wand2 } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "What do people in the UK think about the death penalty?",
  "How do Americans view universal healthcare?",
  "What are Australian voters' attitudes towards climate change?",
  "What do Canadians think about immigration policy?"
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      navigate("/analyzing");
      const res = await apiRequest("POST", "/api/polls", { prompt });
      const data = await res.json();
      navigate(`/results/${data.id}`);
    } catch (error: any) {
      const message = error.message.includes("API call limit reached")
        ? "The API call limit has been reached (30 calls). Please try again later."
        : "Failed to generate poll analysis. Please try again.";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Political Polling Simulator</h1>
          <p className="text-muted-foreground">
            Explore public opinion on political topics using AI-generated surveys
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="What topic would you like to explore?"
              className="pl-10 py-6 text-lg"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full py-6" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Analysis...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Analysis
              </>
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Explore Example Prompts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {EXAMPLE_PROMPTS.map((example, i) => (
              <Card key={i} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setPrompt(example)}>
                <CardContent className="p-4">
                  <p>{example}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}