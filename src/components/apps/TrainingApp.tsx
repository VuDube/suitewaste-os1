import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle } from 'lucide-react';
const mockCourses = [
  { id: 1, title: 'Safety in Waste Handling', duration: '45 mins', completed: true },
  { id: 2, title: 'Introduction to e-Waste Sorting', duration: '1 hour', completed: false },
  { id: 3, title: 'Using the SuiteWaste OS', duration: '30 mins', completed: false },
];
const TrainingApp: React.FC = () => {
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Training Hub</h1>
          <p className="text-muted-foreground">Enhance your skills with our interactive modules.</p>
        </header>
        <div className="space-y-4">
          {mockCourses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  {course.completed ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} /> Completed
                    </span>
                  ) : (
                    <Button size="sm">
                      <PlayCircle size={16} className="mr-2" /> Start
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