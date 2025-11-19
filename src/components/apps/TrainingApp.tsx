import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QuizView, { QuizQuestion } from './QuizView';
interface Course {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  started: boolean;
  quiz: QuizQuestion[];
}
const mockCourses: Course[] = [
  {
    id: 1, title: 'Safety in Waste Handling', duration: '45 mins', completed: true, started: true,
    quiz: [
      { question: 'What is the most important piece of safety gear?', options: ['Gloves', 'Hat', 'Boots'], correctAnswer: 'Gloves' },
      { question: 'How should you lift heavy objects?', options: ['With your back', 'With your legs', 'Quickly'], correctAnswer: 'With your legs' },
    ]
  },
  {
    id: 2, title: 'Introduction to e-Waste Sorting', duration: '1 hour', completed: false, started: false,
    quiz: [
      { question: 'Which component contains valuable metals?', options: ['Plastic Casing', 'Circuit Boards', 'Glass Screen'], correctAnswer: 'Circuit Boards' },
      { question: 'Are batteries in e-waste hazardous?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
    ]
  },
  {
    id: 3, title: 'Using the SuiteWaste OS', duration: '30 mins', completed: false, started: false,
    quiz: [
      { question: 'Where can you find all applications?', options: ['Taskbar', 'Start Menu', 'Desktop'], correctAnswer: 'Start Menu' },
      { question: 'How do you switch between open apps?', options: ['Using the Taskbar', 'Closing and reopening', 'Using the Start Menu'], correctAnswer: 'Using the Taskbar' },
    ]
  },
];
const TrainingApp: React.FC = () => {
  const { t } = useTranslation();
  const addNotification = useDesktopStore((state) => state.addNotification);
  const [courses, setCourses] = useState(mockCourses);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const handleStartCourse = (courseId: number) => {
    const courseToStart = courses.find(c => c.id === courseId);
    if (courseToStart) {
      setCourses(courses.map(c => c.id === courseId ? { ...c, started: true } : c));
      setActiveCourse(courseToStart);
      if (!courseToStart.started) {
        addNotification({
          appId: 'training',
          icon: BookOpen,
          title: 'Course Started',
          message: `You have started the "${courseToStart.title}" course.`,
        });
      }
    }
  };
  const handleQuizComplete = (score: number, total: number) => {
    if (activeCourse) {
      const passingScore = total * 0.75;
      if (score >= passingScore) {
        setCourses(courses.map(c => c.id === activeCourse.id ? { ...c, completed: true } : c));
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
    // Keep the dialog open to show results, user can close it manually or retake.
  };
  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">{t('apps.training.title')}</h1>
            <p className="text-muted-foreground">{t('apps.training.description')}</p>
          </header>
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{course.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.completed ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} /> {t('apps.training.completed')}
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => handleStartCourse(course.id)}>
                        <PlayCircle size={16} className="mr-2" />
                        {course.started ? 'Resume' : t('apps.training.start')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
      <Dialog open={!!activeCourse} onOpenChange={(isOpen) => !isOpen && setActiveCourse(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeCourse?.title}</DialogTitle>
          </DialogHeader>
          {activeCourse && (
            <QuizView
              questions={activeCourse.quiz}
              onComplete={handleQuizComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
export default TrainingApp;