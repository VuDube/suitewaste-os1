import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, ShieldCheck, Bot, Loader2 } from 'lucide-react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useTranslation } from 'react-i18next';
import { useComplianceChecklist, useUpdateChecklistItem, useComplianceAudit } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
const APP_ID = 'compliance';
const ComplianceApp: React.FC = () => {
  const { t } = useTranslation();
  const addNotification = useDesktopStore((state) => state.addNotification);
  const { data: complianceItems, isLoading: isLoadingChecklist } = useComplianceChecklist();
  const updateMutation = useUpdateChecklistItem();
  const auditMutation = useComplianceAudit();
  const handleCheckChange = (itemId: string, checked: boolean) => {
    updateMutation.mutate({ id: itemId, checked });
  };
  const handleGenerateReport = () => {
    addNotification({
      appId: APP_ID,
      icon: FileText,
      title: t('apps.compliance.generateReport'),
      message: 'Your compliance report is being generated and will be available shortly.',
    });
  };
  const handleAiAudit = () => {
    auditMutation.mutate(undefined, {
      onSuccess: () => {
        addNotification({
          appId: APP_ID,
          icon: ShieldCheck,
          title: t('apps.compliance.aiAuditCompleteTitle'),
          message: t('apps.compliance.aiAuditCompleteMessage', { count: complianceItems?.filter(i => !i.checked).length || 0 }),
        });
      }
    });
  };
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{t('apps.compliance.title')}</h1>
          <p className="text-muted-foreground">{t('apps.compliance.description')}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('apps.compliance.checklist')}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAiAudit} disabled={auditMutation.isPending}>
                {auditMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                {t('apps.compliance.runAiAudit')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingChecklist ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ))
              ) : (
                complianceItems?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) => handleCheckChange(item.id, !!checked)}
                      disabled={updateMutation.isPending}
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.label}
                    </label>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText /> {t('apps.compliance.generateReport')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4 h-full">
              <p className="text-muted-foreground">{t('apps.compliance.generateReportDesc')}</p>
              <Button onClick={handleGenerateReport}>{t('apps.compliance.generatePdf')}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};
export default ComplianceApp;