import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { getQuizById, updateQuiz } from '@/api/quizzes';
import { Quiz, QuizQuestion } from '@/types/quiz';
import {
  Save,
  Trash2,
  Plus,
  GripVertical,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function QuizEdit() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadQuiz = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getQuizById(id);
      setQuiz(response.quiz);
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
    loadQuiz();
  }, [loadQuiz]);

  const handleSave = async (publish: boolean = false) => {
    if (!quiz) return;

    try {
      setSaving(true);
      await updateQuiz(quiz._id, {
        ...quiz,
        status: publish ? 'published' : 'draft',
      });
      toast({
        title: 'Success',
        description: publish ? 'Quiz published successfully' : 'Quiz saved as draft',
      });
      if (publish) {
        navigate('/admin/quizzes');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    if (!quiz) return;
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q._id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = () => {
    if (!quiz || !questionToDelete) return;
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((q) => q._id !== questionToDelete),
    });
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const addQuestion = () => {
    if (!quiz) return;
    const newQuestion: QuizQuestion = {
      _id: `new-${Date.now()}`,
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
    };
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    });
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/quizzes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
            <p className="text-muted-foreground">Review and edit AI-generated questions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Sparkles className="mr-2 h-4 w-4" />
            Publish Quiz
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={quiz.description || ''}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Questions ({quiz.questions.length})</h2>
        <Button onClick={addQuestion} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <Card key={question._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <CardTitle className="text-base">Question {index + 1}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={question.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                      updateQuestion(question._id, { difficulty: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setQuestionToDelete(question._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={question.questionText}
                  onChange={(e) =>
                    updateQuestion(question._id, { questionText: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Answer Options</Label>
                <RadioGroup
                  value={question.correctAnswer.toString()}
                  onValueChange={(value) =>
                    updateQuestion(question._id, { correctAnswer: parseInt(value) })
                  }
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <RadioGroupItem value={optionIndex.toString()} id={`${question._id}-${optionIndex}`} />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[optionIndex] = e.target.value;
                          updateQuestion(question._id, { options: newOptions });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Select the correct answer by clicking the radio button
                </p>
              </div>

              <div className="space-y-2">
                <Label>Explanation</Label>
                <Textarea
                  value={question.explanation}
                  onChange={(e) =>
                    updateQuestion(question._id, { explanation: e.target.value })
                  }
                  rows={2}
                  placeholder="Explain why this is the correct answer"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteQuestion}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}