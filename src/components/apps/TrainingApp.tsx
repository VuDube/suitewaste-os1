import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle, BookOpen, Award, Trophy, Loader2 } from 'lucide-react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QuizView from './QuizView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTrainingProgress, useUpdateProgress, useTrainingLeaderboard } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TrainingProgress } from '@/lib/schemas';
const TrainingApp: React.FC = () => {
  const { t } = useTranslation();
  const addNotification = useDesktopStore((state) => state.addNotification);
  const { data: courses, isLoading: isLoadingCourses } = useTrainingProgress();
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useTrainingLeaderboard();
  const updateProgressMutation = useUpdateProgress();
  const [activeCourse, setActiveCourse] = useState<TrainingProgress | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [visibleRows, setVisibleRows] = useState(5);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setVisibleRows(prev => Math.min(prev + 5, leaderboardData?.length || 5));
    }
  }, [leaderboardData]);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, { threshold: 1.0 });
    if (lastRowRef.current) {
      observerRef.current.observe(lastRowRef.current);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);
  const earnedBadges = useMemo(() => courses?.filter(c => c.completed) || [], [courses]);
  const handleStartCourse = (courseId: number) => {
    const courseToStart = courses?.find(c => c.id === courseId);
    if (courseToStart) {
      if (!courseToStart.started) {
        updateProgressMutation.mutate({ courseId, started: true }, {
          onSuccess: () => {
            addNotification({
              appId: 'training',
              icon: BookOpen,
              title: 'Course Started',
              message: `You have started the "${courseToStart.title}" course.`,
            });
          }
        });
      }
      setActiveCourse(courseToStart);
    }
  };
  const handleQuizComplete = (score: number, total: number) => {
    if (activeCourse) {
      const passingScore = total * 0.75;
      const passed = score >= passingScore;
      updateProgressMutation.mutate({ courseId: activeCourse.id, completed: passed, score: score / total, started: true }, {
        onSuccess: () => {
          if (passed) {
            addNotification({
              appId: 'training',
              icon: CheckCircle,
              title: 'Course Completed!',
              message: `You passed the quiz for "${activeCourse.title}" with a score of ${score}/${total}.`,
            });
          } else {
            addNotification({
              appId: 'training',
              icon: BookOpen,
              title: 'Quiz Attempted',
              message: `You scored ${score}/${total}. Please try again to pass.`,
            });
          }
        }
      });
    }
  };
  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">{t('apps.training.title')}</h1>
            <p className="text-muted-foreground">{t('apps.training.description')}</p>
          </header>
          <Tabs defaultValue="courses">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">{t('apps.training.courses')}</TabsTrigger>
              <TabsTrigger value="leaderboard">{t('apps.training.leaderboard')}</TabsTrigger>
              <TabsTrigger value="badges">{t('apps.training.myBadges')}</TabsTrigger>
            </TabsList>
            <TabsContent value="courses" className="mt-4 space-y-4">
              {isLoadingCourses ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />) :
                courses?.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{course.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.completed ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle size={16} /> {t('apps.training.completed')}</span>
                        ) : (
                          <Button size="sm" onClick={() => handleStartCourse(course.id)} disabled={updateProgressMutation.isPending}>
                            {updateProgressMutation.isPending && updateProgressMutation.variables?.courseId === course.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle size={16} className="mr-2" />}
                            {course.started ? t('apps.training.resume') : t('apps.training.start')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
            <TabsContent value="leaderboard">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy /> {t('apps.training.leaderboard')}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead className="w-[50px]">{t('apps.training.rank')}</TableHead><TableHead>{t('apps.training.user')}</TableHead><TableHead className="text-right">{t('apps.training.points')}</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isLoadingLeaderboard ? Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-4 w-4" /></TableCell><TableCell><Skeleton className="h-4 w-32" /></TableCell><TableCell className="text-right"><Skeleton className="h-4 w-12" /></TableCell></TableRow>) :
                        leaderboardData?.slice(0, visibleRows).map((user, index) => (
                          <TableRow key={user.rank} ref={index === visibleRows - 1 ? lastRowRef : null} className={user.name === 'You' ? 'bg-accent' : ''}>
                            <TableCell className="font-medium">{user.rank}</TableCell>
                            <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={user.avatar} alt={user.name} /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar><span>{user.name}</span></div></TableCell>
                            <TableCell className="text-right">{user.points}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {leaderboardData && visibleRows < leaderboardData.length && <div aria-live="polite">More rows loaded</div>}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="badges">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedBadges.map(course => (
                  <Card key={course.id} className="flex flex-col items-center justify-center p-4 text-center">
                    <Award size={48} className={course.badge.color} />
                    <p className="font-semibold mt-2">{course.badge.name}</p>
                    <p className="text-xs text-muted-foreground">{t('apps.training.earnedOn')} {new Date().toLocaleDateString()}</p>
                  </Card>
                ))}
                {earnedBadges.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">{t('apps.training.noBadges')}</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      <Dialog open={!!activeCourse} onOpenChange={(isOpen) => !isOpen && setActiveCourse(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{activeCourse?.title}</DialogTitle><DialogDescription>{t('apps.training.quizDescription')}</DialogDescription></DialogHeader>
          {activeCourse && <QuizView questions={activeCourse.quiz} onComplete={handleQuizComplete} />}
        </DialogContent>
      </Dialog>
    </>
  );
};
export default TrainingApp;