import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { getQuizResult } from '@/api/quizzes';
import { QuizResult } from '@/types/quiz';
import {
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Download,
  Home,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function QuizResults() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadResult = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getQuizResult(id);
      setResult(response.result);
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

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Results not found</p>
      </div>
    );
  }

  const correctCount = result.questions.filter(
    (q) => result.answers[q._id] === q.correctAnswer
  ).length;
  const incorrectCount = result.questions.length - correctCount;

  const filteredQuestions = result.questions.filter((q) => {
    if (filter === 'correct') return result.answers[q._id] === q.correctAnswer;
    if (filter === 'incorrect') return result.answers[q._id] !== q.correctAnswer;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
          <p className="text-muted-foreground">{result.quizTitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/student/quizzes')}>
            <Home className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`${result.passed ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score</CardTitle>
            <Award className={`h-4 w-4 ${result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{result.score}%</div>
            <Badge variant={result.passed ? 'default' : 'destructive'} className="mt-2">
              {result.passed ? 'Passed' : 'Failed'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{correctCount}</div>
            <p className="text-xs text-muted-foreground">
              out of {result.questions.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incorrect Answers</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{incorrectCount}</div>
            <p className="text-xs text-muted-foreground">
              out of {result.questions.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTime(result.timeSpent)}</div>
            <p className="text-xs text-muted-foreground">Total time</p>
          </CardContent>
        </Card>
      </div>

      {result.passed && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Congratulations!</h3>
                <p className="text-sm text-muted-foreground">
                  You've earned a certificate for this quiz
                </p>
              </div>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question Review</CardTitle>
            <Tabs value={filter} onValueChange={(value: 'all' | 'correct' | 'incorrect') => setFilter(value)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="correct">Correct</TabsTrigger>
                <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {filteredQuestions.map((question) => {
            const userAnswer = result.answers[question._id];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={question._id}
                className="rounded-lg border p-4 space-y-4"
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium mb-3">
                      Question {result.questions.indexOf(question) + 1}: {question.questionText}
                    </h4>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isUserAnswer = userAnswer === optionIndex;
                        const isCorrectAnswer = question.correctAnswer === optionIndex;

                        return (
                          <div
                            key={optionIndex}
                            className={`rounded-lg border p-3 ${
                              isCorrectAnswer
                                ? 'bg-green-50 dark:bg-green-950 border-green-500'
                                : isUserAnswer
                                ? 'bg-red-50 dark:bg-red-950 border-red-500'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {isCorrectAnswer && (
                                <Badge variant="default" className="bg-green-500">
                                  Correct
                                </Badge>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <Badge variant="destructive">Your Answer</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 rounded-lg bg-muted p-3">
                      <p className="text-sm font-medium mb-1">Explanation:</p>
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}