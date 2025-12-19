import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { CreditCard, QrCode, AlertCircle, ArrowRight, Wallet, History, SendHorizontal, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaymentsTransactions, useCreatePayment } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
const PaymentsApp: React.FC = () => {
  const { t } = useTranslation();
  const addNotification = useDesktopStore((state) => state.addNotification);
  const { data: transactions, isLoading: isLoadingTransactions } = usePaymentsTransactions();
  const createPaymentMutation = useCreatePayment();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const handleFinalSubmit = () => {
    createPaymentMutation.mutate({ recipient, amount }, {
      onSuccess: (newTransaction) => {
        setRecipient('');
        setAmount('');
        setIsConfirmOpen(false);
        addNotification({
          appId: 'payments',
          icon: CreditCard,
          title: 'Payment Successful',
          message: `Successfully sent R ${amount} to ${recipient}.`,
        });
      },
      onError: (error) => {
        setIsConfirmOpen(false);
        addNotification({ appId: 'payments', icon: AlertCircle, title: 'Payment Failed', message: error.message });
      }
    });
  };
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`recipient=${recipient}&amount=${amount}`)}`;
  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                <Wallet className="text-primary h-10 w-10" />
                {t('apps.payments.title')}
              </h1>
              <p className="text-lg text-muted-foreground">{t('apps.payments.description')}</p>
            </div>
            <div className="flex gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Available Balance</p>
                <p className="text-2xl font-bold text-primary">R 124,500.00</p>
              </div>
            </div>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <Card className="border-primary/10 shadow-xl overflow-hidden">
                <div className="bg-primary p-6 text-primary-foreground">
                  <h3 className="text-xl font-bold flex items-center gap-2"><SendHorizontal size={20} /> {t('apps.payments.newPayment')}</h3>
                  <p className="text-primary-foreground/70 text-sm">Send funds instantly to any registered worker or center</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('apps.payments.recipient')}</Label>
                      <Input id="recipient" placeholder="Center ID or Phone Number" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="h-12 text-lg bg-muted/50 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('apps.payments.amount')}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R</span>
                        <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 pl-8 text-xl font-bold bg-muted/50 border-border/50" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsConfirmOpen(true)} className="flex-1 h-12 text-lg" disabled={!recipient || !amount}>{t('apps.payments.sendPayment')}</Button>
                    <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-12 w-12 border-2" disabled={!recipient || !amount}><QrCode size={20} /></Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>{t('apps.payments.qrCodeFor', { amount: `R ${amount}` })}</DialogTitle></DialogHeader>
                        <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-2xl border">
                          <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 rounded-xl shadow-lg border-8 border-white" />
                          <p className="text-sm text-muted-foreground mt-6 text-center">{t('apps.payments.scanQrCode')}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-8">
              <Card className="border-border/50 shadow-sm h-full">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-xl">{t('apps.payments.history')}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary font-bold">Export CSV</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">TRANSACTION ID</TableHead>
                        <TableHead className="font-bold">DATE</TableHead>
                        <TableHead className="font-bold">AMOUNT</TableHead>
                        <TableHead className="font-bold">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTransactions ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <TableRow key={i}><TableCell><Skeleton className="h-4 w-20" /></TableCell><TableCell><Skeleton className="h-4 w-32" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell></TableRow>
                        ))
                      ) : transactions?.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
                      ) : (
                        <AnimatePresence>
                          {transactions?.map((tx) => (
                            <motion.tr key={tx.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/20 transition-colors">
                              <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                              <TableCell className="font-medium">{tx.date}</TableCell>
                              <TableCell className="font-bold">{tx.amount}</TableCell>
                              <TableCell>
                                <Badge variant={tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'} className="rounded-full px-4">
                                  {tx.status}
                                </Badge>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card/90 backdrop-blur-2xl border p-8 rounded-3xl shadow-2xl">
            <DialogHeader className="mb-6"><DialogTitle className="text-2xl font-black text-center">Confirm Payment</DialogTitle></DialogHeader>
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="p-4 bg-muted rounded-2xl border"><Wallet className="h-8 w-8" /></div>
                <ArrowRight className="text-primary animate-pulse" />
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20"><Wallet className="h-8 w-8 text-primary" /></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">You are sending</p>
                <p className="text-5xl font-black text-primary mt-1">R {amount}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-1">To Recipient</p>
                <p className="text-xl font-bold truncate">{recipient}</p>
              </div>
            </div>
            <DialogFooter className="mt-10 gap-3">
              <Button variant="ghost" size="lg" className="h-14 flex-1" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
              <Button size="lg" className="h-14 flex-[2] text-lg font-bold shadow-xl" onClick={handleFinalSubmit} disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
                Confirm & Pay
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default PaymentsApp;