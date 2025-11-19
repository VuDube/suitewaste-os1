import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
const mockTransactions = [
  { id: 'T001', date: '2023-10-26', amount: 'R 1,500.00', status: 'Completed' },
  { id: 'T002', date: '2023-10-25', amount: 'R 850.00', status: 'Completed' },
  { id: 'T003', date: '2023-10-24', amount: 'R 2,200.00', status: 'Pending' },
  { id: 'T004', date: '2023-10-23', amount: 'R 500.00', status: 'Failed' },
];
const PaymentsApp: React.FC = () => {
  const { t } = useTranslation();
  const addNotification = useDesktopStore((state) => state.addNotification);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;
    const newTransaction = {
      id: `T${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      amount: `R ${parseFloat(amount).toFixed(2)}`,
      status: 'Completed',
    };
    setTransactions([newTransaction, ...transactions]);
    setRecipient('');
    setAmount('');
    addNotification({
      appId: 'payments',
      icon: CreditCard,
      title: 'Payment Successful',
      message: `Successfully sent ${newTransaction.amount} to ${recipient}.`,
    });
  };
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
                    <Input
                      id="recipient"
                      placeholder="Account Number or Phone"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t('apps.payments.amount')}</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">{t('apps.payments.sendPayment')}</Button>
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
                  <AnimatePresence>
                    <TableBody>
                      {transactions.map((tx) => (
                        <motion.tr
                          key={tx.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>{tx.id}</TableCell>
                          <TableCell>{tx.date}</TableCell>
                          <TableCell>{tx.amount}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tx.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>{tx.status}</span>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </AnimatePresence>
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