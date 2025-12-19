import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, ShieldCheck, Bot, Loader2, ClipboardCheck, AlertCircle } from 'lucide-react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useTranslation } from 'react-i18next';
import { useComplianceChecklist, useUpdateChecklistItem, useComplianceAudit } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
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
  const handleAiAudit = () => {
    auditMutation.mutate(undefined, {
      onSuccess: (data) => {
        addNotification({
          appId: APP_ID,
          icon: ShieldCheck,
          title: t('apps.compliance.aiAuditCompleteTitle'),
          message: t('apps.compliance.aiAuditCompleteMessage', { count: data.resolved }),
        });
      }
    });
  };
  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                <ClipboardCheck className="text-primary h-10 w-10" />
                {t('apps.compliance.title')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">{t('apps.compliance.description')}</p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" variant="outline" className="h-14 px-6 border-2"><FileText size={18} className="mr-2" /> Report Library</Button>
              <Button size="lg" className="h-14 px-8 shadow-xl" onClick={handleAiAudit} disabled={auditMutation.isPending}>
                {auditMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bot size={18} className="mr-2" />}
                {auditMutation.isPending ? 'Analyzing Documentation...' : t('apps.compliance.runAiAudit')}
              </Button>
            </div>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border/50 shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{t('apps.compliance.checklist')}</CardTitle>
                    <CardDescription>Regulatory compliance tracking status</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-background">{complianceItems?.filter(i => i.checked).length || 0} / {complianceItems?.length || 0} Complete</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {isLoadingChecklist ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-4 flex items-center space-x-4"><Skeleton className="h-5 w-5 rounded" /><Skeleton className="h-5 w-3/4" /></div>
                    ))
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {complianceItems?.map((item, idx) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 flex items-center hover:bg-muted/30 transition-colors group"
                        >
                          <Checkbox
                            id={item.id}
                            checked={item.checked}
                            onCheckedChange={(checked) => handleCheckChange(item.id, !!checked)}
                            className="h-6 w-6 rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor={item.id}
                            className={`ml-4 text-base font-medium transition-all ${item.checked ? 'text-muted-foreground line-through decoration-primary/50' : 'text-foreground'}`}
                          >
                            {item.label}
                          </label>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-8">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> {t('apps.compliance.generateReport')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('apps.compliance.generateReportDesc')}</p>
                  <Button className="w-full h-12" variant="default" onClick={() => addNotification({ appId: APP_ID, icon: FileText, title: 'Report Generated', message: 'Compliance summary v2.1.pdf' })}>
                    {t('apps.compliance.generatePdf')}
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-600"><AlertCircle /> System Insights</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-3">
                    <li className="flex gap-2"><span>���</span> <span>POPIA data audit logs are being maintained automatically in the DO.</span></li>
                    <li className="flex gap-2"><span>•</span> <span>3 upcoming expiry alerts detected for carrier licenses.</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
export default ComplianceApp;