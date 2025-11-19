import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useTranslation } from 'react-i18next';
const mockCourses = [
  { id: 1, title: 'Safety in Waste Handling', duration: '45 mins', completed: true, started: true },
  { id: 2, title: 'Introduction to e-Waste Sorting', duration: '1 hour', completed: false, started: false },
  { id: 3, title: 'Using the SuiteWaste OS', duration: '30 mins', completed: false, started: false },
];
const TrainingApp: React.FC = () => {
  const { t } = useTranslation();
  const addNotification = useDesktopStore((state) => state.addNotification);
  const [courses, setCourses] = useState(mockCourses);
  const handleStartCourse = (courseId: number) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, started: true } : course
      )
    );
    const course = courses.find(c => c.id === courseId);
    if (course) {
      addNotification({
        appId: 'training',
        icon: BookOpen,
        title: 'Course Started',
        message: `You have started the "${course.title}" course.`,
      });
    }
  };
  return (
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
                    <Button size="sm" onClick={() => handleStartCourse(course.id)} disabled={course.started}>
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
  );
};
export default TrainingApp;