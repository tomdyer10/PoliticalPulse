import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisStep } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Analyzing() {
  const [, navigate] = useLocation();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'analysisStep') {
        setAnalysisSteps(steps => {
          const newSteps = [...steps, data.step];
          // When we receive the complete step, wait a moment then navigate to results
          if (data.step.type === 'complete' && data.pollId) {
            setTimeout(() => {
              navigate(`/results/${data.pollId}`);
            }, 1000);
          }
          return newSteps;
        });
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Analyzing Topic</h1>
          <p className="text-muted-foreground">
            Please wait while our AI expert analyzes the topic...
          </p>
        </div>

        <div className="space-y-4">
          {analysisSteps.map((step, i) => (
            <Card 
              key={i} 
              className={`transition-all duration-500 ${
                step.type === 'complete' ? 'bg-primary/10' : ''
              }`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p>{step.message}</p>
              </CardContent>
            </Card>
          ))}
          
          {analysisSteps.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
