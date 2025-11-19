import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, List } from 'lucide-react';
const mockRoutes = [
  { id: 'R001', area: 'Sandton', status: 'In Progress', progress: 65 },
  { id: 'R002', area: 'Midrand', status: 'Completed', progress: 100 },
  { id: 'R003', area: 'Soweto', status: 'Pending', progress: 0 },
];
const OperationsApp: React.FC = () => {
  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-[3] bg-muted flex items-center justify-center">
        <img src="/map_placeholder.png" alt="Map of routes" className="object-cover w-full h-full" />
      </div>
      <div className="flex-[1] border-l">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List /> Daily Routes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRoutes.map((route) => (
                  <div key={route.id} className="p-3 rounded-md border">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{route.id} - {route.area}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        route.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        route.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{route.status}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${route.progress}%` }}></div>
                    </div>
                  </div>
                ))}
                <Button className="w-full">Optimize Routes</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck /> Live Vehicle Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Vehicle tracking is active. 3/5 vehicles online.</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
export default OperationsApp;