import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserRound, BarChart3, MessageSquare, ArrowLeft, Send, Loader2 } from "lucide-react";
import type { Poll } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Results() {
  const { id } = useParams();
  const { data: poll, isLoading } = useQuery<Poll>({
    queryKey: [`/api/polls/${id}`],
  });
  const [selectedPersona, setSelectedPersona] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const { toast } = useToast();
  const [answer, setAnswer] = useState<string | null>(null);

  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", `/api/polls/${id}/ask`, { question });
      return res.json();
    },
    onSuccess: (data) => {
      setAnswer(data.answer);
      setQuestion("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    askQuestionMutation.mutate(question);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!poll) {
    return <div>Poll not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{poll.topic}</h1>
            <p className="text-muted-foreground">{poll.prompt.substring(0, 100)}...</p> {/* Shortened prompt */}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{poll.summary}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Demographic Personas
            </h2>
            {poll.personas.map((persona, i) => (
              <Card
                key={i}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => setSelectedPersona(i)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{persona.demographic}</div>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Age: {persona.age}</div>
                    <div>Location: {persona.location}</div>
                    <div>Background: {persona.background}</div>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-sm">{persona.views}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Survey Questions & Results
            </h2>
            {poll.questions.map((question, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-4">
                  <div className="font-medium">{question.question}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${question.agreement}` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{question.agreement}% Overall Agreement</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {question.demographic}
                  </div>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm font-medium">Demographic Breakdown:</p>
                    <div className="grid gap-2">
                      {question.responses.map((response, j) => (
                        <div key={j} className="text-sm flex items-center gap-2">
                          <div className="w-32 font-medium truncate">{response.demographic}:</div>
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/60"
                              style={{ width: `${response.agreement}` }}
                            />
                          </div>
                          <span className="w-12 text-right">{response.agreement}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ask About the Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about the analysis..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAskQuestion();
                  }
                }}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={askQuestionMutation.isPending}
              >
                {askQuestionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Ask
                  </>
                )}
              </Button>
            </div>
            {answer && (
              <Card className="bg-accent">
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{answer}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Dialog open={selectedPersona !== null} onOpenChange={() => setSelectedPersona(null)}>
          {selectedPersona !== null && poll.personas[selectedPersona] && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Conversation with {poll.personas[selectedPersona].demographic}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Demographic Profile</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Age:</span> {poll.personas[selectedPersona].age}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {poll.personas[selectedPersona].location}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Background:</span> {poll.personas[selectedPersona].background}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Survey Responses</h3>
                  {poll.questions.map((question, i) => {
                    const personaResponse = question.responses.find(
                      r => r.demographic === poll.personas[selectedPersona].demographic
                    );
                    return (
                      <div key={i} className="space-y-2">
                        <p className="font-medium">{question.question}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${personaResponse?.agreement ?? 0}` }}
                            />
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap">
                            {personaResponse?.agreement ?? 0}% Agreement
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {personaResponse?.reasoning}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Views and Perspective</h3>
                  <p className="text-sm leading-relaxed">
                    {poll.personas[selectedPersona].views}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Follow-up Discussion</h3>
                  {poll.followupResponses
                    .filter(r => r.demographic === poll.personas[selectedPersona].demographic)
                    .map((response, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                          <p className="font-medium text-sm text-muted-foreground">
                            Interviewer: {response.question}
                          </p>
                          <p className="text-sm">
                            {poll.personas[selectedPersona].demographic}: {response.response}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}