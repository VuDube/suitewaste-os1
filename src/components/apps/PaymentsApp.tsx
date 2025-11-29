import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { CreditCard, QrCode, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaymentsTransactions, useCreatePayment } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
const PaymentsApp: React.FC = () => {
  const { t } = useTranslation();
  const addNotification = useDesktopStore((state) => state.addNotification);
  const { data: transactions, isLoading: isLoadingTransactions } = usePaymentsTransactions();
  const createPaymentMutation = useCreatePayment();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;
    createPaymentMutation.mutate({ recipient, amount }, {
      onSuccess: (newTransaction) => {
        setRecipient('');
        setAmount('');
        addNotification({
          appId: 'payments',
          icon: CreditCard,
          title: 'Payment Successful',
          message: `Successfully sent ${newTransaction.amount} to ${recipient}.`,
        });
      },
      onError: (error) => {
        addNotification({
          appId: 'payments',
          icon: AlertCircle,
          title: 'Payment Failed',
          message: error.message,
        });
      }
    });
  };
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Amount: R ${amount}, Recipient: ${recipient}`)}`;
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{t('apps.payments.title')}</h1>
          <p className="text-muted-foreground">{t('apps.payments.description')}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('apps.payments.newPayment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">{t('apps.payments.recipient')}</Label>
                    <Input id="recipient" placeholder="Account Number or Phone" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t('apps.payments.amount')}</Label>
                    <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={createPaymentMutation.isPending}>{t('apps.payments.sendPayment')}</Button>
                    <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" disabled={!recipient || !amount}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('apps.payments.qrCodeFor', { amount })}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-4">
                          <img src={qrCodeUrl} alt="QR Code for payment" className="w-48 h-48" />
                          <p className="text-sm text-muted-foreground mt-4 text-center">{t('apps.payments.scanQrCode')}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('apps.payments.history')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <AnimatePresence>
                        {transactions?.map((tx) => (
                          <motion.tr key={tx.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/50">
                            <TableCell>{tx.id}</TableCell>
                            <TableCell>{tx.date}</TableCell>
                            <TableCell>{tx.amount}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{tx.status}</span>
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
  );
};
export default PaymentsApp;