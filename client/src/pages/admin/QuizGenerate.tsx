import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/useToast';
import { getDocuments } from '@/api/documents';
import { generateQuiz } from '@/api/quizzes';
import { Document } from '@/types/document';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function QuizGenerate() {
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [title, setTitle] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [category, setCategory] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const loadDocuments = useCallback(async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.documents.filter((doc) => doc.status === 'ready'));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
    if (location.state?.documentId) {
      setSelectedDocument(location.state.documentId);
    }
  }, [loadDocuments, location.state]);

  const handleGenerate = async () => {
    if (!selectedDocument || !title) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      setGenerationProgress(0);
      setGenerationMessage('Analyzing document content...');

      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      setTimeout(() => setGenerationMessage('Identifying key concepts...'), 1000);
      setTimeout(() => setGenerationMessage('Generating questions...'), 2000);
      setTimeout(() => setGenerationMessage('Creating answer options...'), 2500);

      const response = await generateQuiz({
        documentId: selectedDocument,
        title,
        numberOfQuestions,
        difficulty,
        timeLimit: timeLimit > 0 ? timeLimit : undefined,
        passingScore,
        category: category || undefined,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      toast({
        title: 'Success',
        description: 'Quiz generated successfully',
      });

      navigate(`/admin/quiz/${response.quiz._id}/edit`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">Generating Your Quiz</h3>
              <p className="text-sm text-muted-foreground">{generationMessage}</p>
              <Progress value={generationProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                This may take 30-120 seconds depending on document size
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Quiz</h1>
        <p className="text-muted-foreground">Create an AI-powered quiz from your documents</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1
          </div>
          <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2
          </div>
          <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document</Label>
              <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.fileName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedDocument}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Configure Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AWS Cloud Practitioner Certification"
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Questions: {numberOfQuestions}</Label>
              <Slider
                value={[numberOfQuestions]}
                onValueChange={(value) => setNumberOfQuestions(value[0])}
                min={5}
                max={50}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard' | 'mixed') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Limit (minutes): {timeLimit > 0 ? timeLimit : 'No limit'}</Label>
              <Slider
                value={[timeLimit]}
                onValueChange={(value) => setTimeLimit(value[0])}
                min={0}
                max={120}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Passing Score: {passingScore}%</Label>
              <Slider
                value={[passingScore]}
                onValueChange={(value) => setPassingScore(value[0])}
                min={50}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Cloud Computing, Programming"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Review & Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Document</span>
                <span className="font-medium">
                  {documents.find((d) => d._id === selectedDocument)?.fileName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Quiz Title</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Number of Questions</span>
                <span className="font-medium">{numberOfQuestions}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-medium capitalize">{difficulty}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Time Limit</span>
                <span className="font-medium">{timeLimit > 0 ? `${timeLimit} minutes` : 'No limit'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Passing Score</span>
                <span className="font-medium">{passingScore}%</span>
              </div>
              {category && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{category}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleGenerate}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}