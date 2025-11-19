import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, LineChart, PieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUp, Recycle, Truck } from 'lucide-react';
const kpiData = [
  { title: 'Waste Collected (Tons)', value: '1,280', change: '+12.5%', icon: Recycle },
  { title: 'Routes Completed', value: '312', change: '+5.2%', icon: Truck },
  { title: 'Recycling Rate', value: '68%', change: '+2.1%', icon: ArrowUp },
];
const wasteCompositionData = [
  { name: 'Organics', value: 400 },
  { name: 'Paper', value: 300 },
  { name: 'Plastics', value: 300 },
  { name: 'Glass', value: 200 },
  { name: 'Other', value: 100 },
];
const collectionTrendData = [
  { name: 'Jan', tons: 400 },
  { name: 'Feb', tons: 300 },
  { name: 'Mar', tons: 500 },
  { name: 'Apr', tons: 450 },
  { name: 'May', tons: 600 },
  { name: 'Jun', tons: 580 },
];
const COLORS = ['#2E7D32', '#66BB6A', '#A5D6A7', '#C8E6C9', '#A1887F'];
const DashboardApp: React.FC = () => {
  return (
    <ScrollArea className="h-full">
      <div className="p-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">ESG Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights into waste management operations.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground text-green-600">{kpi.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Waste Collection Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tons" stroke="#2E7D32" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Waste Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={wasteCompositionData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
                    {wasteCompositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};
export default DashboardApp;