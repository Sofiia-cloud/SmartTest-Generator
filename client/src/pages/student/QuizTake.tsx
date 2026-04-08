import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { getQuizById, submitQuizAttempt } from '@/api/quizzes';
import { Quiz } from '@/types/quiz';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Send,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function QuizTake() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadQuiz = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getQuizById(id);
      setQuiz(response.quiz);
      if (response.quiz.settings.timeLimit) {
        setTimeRemaining(response.quiz.settings.timeLimit * 60);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  const handleAutoSubmit = useCallback(async () => {
    if (!quiz) return;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      setSubmitting(true);
      const response = await submitQuizAttempt(quiz._id, answers, timeSpent);
      navigate(`/student/results/${response.result._id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [quiz, answers, startTime, navigate, toast]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (started && quiz?.settings.timeLimit && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeRemaining, quiz?.settings.timeLimit, handleAutoSubmit]);

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      setSubmitting(true);
      const response = await submitQuizAttempt(quiz._id, answers, timeSpent);
      navigate(`/student/results/${response.result._id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setSubmitDialogOpen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = quiz ? (answeredCount / quiz.questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Number of Questions</span>
                <span className="font-medium">{quiz.questions.length}</span>
              </div>
              {quiz.settings.timeLimit && (
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">Time Limit</span>
                  <span className="font-medium">{quiz.settings.timeLimit} minutes</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Passing Score</span>
                <span className="font-medium">{quiz.settings.passingScore}%</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Read each question carefully before answering</li>
                <li>• You can flag questions for review</li>
                <li>• Navigate between questions using the buttons</li>
                {quiz.settings.timeLimit && (
                  <li>• The quiz will auto-submit when time runs out</li>
                )}
                <li>• Make sure to submit your quiz when finished</li>
              </ul>
            </div>

            <Button onClick={handleStart} className="w-full" size="lg">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>
        {quiz.settings.timeLimit && (
          <div className={`flex items-center gap-2 text-lg font-semibold ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {currentQ.questionText}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFlag}
                  className={flagged.has(currentQuestion) ? 'text-yellow-500' : ''}
                >
                  <Flag className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQ._id]?.toString()}
                onValueChange={(value) => handleAnswer(currentQ._id, parseInt(value))}
              >
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={() => setSubmitDialogOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((_, index) => {
                  const isAnswered = answers[quiz.questions[index]._id] !== undefined;
                  const isFlagged = flagged.has(index);
                  const isCurrent = index === currentQuestion;

                  return (
                    <Button
                      key={index}
                      variant={isCurrent ? 'default' : 'outline'}
                      size="sm"
                      className={`relative ${isFlagged ? 'border-yellow-500' : ''}`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                      {isAnswered && (
                        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-background rounded-full" />
                      )}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Answered: {answeredCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  <span>Unanswered: {quiz.questions.length - answeredCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-yellow-500" />
                  <span>Flagged: {flagged.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Are you sure you want to submit your quiz?</p>
                <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                  <p>Answered: {answeredCount} of {quiz.questions.length}</p>
                  <p>Unanswered: {quiz.questions.length - answeredCount}</p>
                  {quiz.questions.length - answeredCount > 0 && (
                    <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                      Warning: You have unanswered questions
                    </p>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Final Answers'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}