import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
const complianceItems = [
  { id: 'c1', label: 'Waste Carrier License up-to-date', checked: true },
  { id: 'c2', label: 'Vehicle maintenance logs complete', checked: true },
  { id: 'c3', label: 'Driver training records verified', checked: false },
  { id: 'c4', label: 'Waste transfer notes correctly filed', checked: true },
  { id: 'c5', label: 'Health & Safety audit passed', checked: false },
];
const ComplianceApp: React.FC = () => {
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Compliance Center</h1>
          <p className="text-muted-foreground">Manage and track regulatory compliance.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox id={item.id} defaultChecked={item.checked} />
                  <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {item.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText /> Generate Report</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4 h-full">
              <p className="text-muted-foreground">Generate an audit-ready compliance report with one click.</p>
              <Button>Generate PDF Report</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};
export default ComplianceApp;