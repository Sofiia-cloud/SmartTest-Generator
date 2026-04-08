import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { getQuizHistory } from '@/api/quizzes';
import { QuizAttempt } from '@/types/quiz';
import { Clock, CheckCircle2, XCircle, Eye, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export function QuizHistory() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadHistory = async () => {
    try {
      setLoading(true);
      console.log('[QuizHistory] Loading quiz history...');
      const response = await getQuizHistory();
      console.log('[QuizHistory] Quiz history loaded:', response.results.length);
      setAttempts(response.results);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('[QuizHistory] Error loading history:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredAttempts = attempts.filter((attempt) => {
    if (filter === 'passed') return attempt.passed;
    if (filter === 'failed') return !attempt.passed;
    return true;
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const stats = {
    total: attempts.length,
    passed: attempts.filter((a) => a.passed).length,
    failed: attempts.filter((a) => !a.passed).length,
    averageScore: attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
        <p className="text-muted-foreground">View your past quiz attempts and performance</p>
      </div>

      {/* Stats Cards */}
      {attempts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Buttons */}
      {attempts.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Attempts ({stats.total})
          </Button>
          <Button
            variant={filter === 'passed' ? 'default' : 'outline'}
            onClick={() => setFilter('passed')}
            className={filter === 'passed' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Passed ({stats.passed})
          </Button>
          <Button
            variant={filter === 'failed' ? 'default' : 'outline'}
            onClick={() => setFilter('failed')}
            className={filter === 'failed' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Failed ({stats.failed})
          </Button>
        </div>
      )}

      {/* Attempts List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading quiz history...</p>
          </div>
        </div>
      ) : filteredAttempts.length > 0 ? (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => (
            <Card key={attempt._id} className="group hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{attempt.quizTitle}</CardTitle>
                      <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                        {attempt.passed ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Passed
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Failed
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(attempt.completedAt), 'MMM dd, yyyy · h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {attempt.score}%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="font-semibold">{attempt.score}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time Spent</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(attempt.timeSpent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold">{attempt.passed ? 'Passed' : 'Failed'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Attempt ID</p>
                    <p className="font-mono text-xs">{attempt._id?.toString().slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/student/quiz-result/${attempt._id}`)}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/student/quiz/${attempt.quizId}`)}
                    className="flex-1"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quiz history yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'all'
                ? 'Complete a quiz to see your history'
                : filter === 'passed'
                  ? 'You haven\'t passed any quizzes yet'
                  : 'Great! You haven\'t failed any quizzes'}
            </p>
            <Button onClick={() => navigate('/student/quizzes')}>
              Browse Available Quizzes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
