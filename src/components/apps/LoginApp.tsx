import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, ShieldAlert, Loader2 } from 'lucide-react';
const LoginApp: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(s => s.login);
  const isLoggingIn = useAuthStore(s => s.isLoggingIn);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(pin);
    if (!success) {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };
  return (
    <div className="absolute inset-0 z-[100000] flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-2xl" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 text-center"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <KeyRound className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SuiteWaste OS</h1>
          <p className="text-muted-foreground">Industrial Management Suite</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="password"
                placeholder="Enter Access PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-2xl tracking-[0.5em] h-14 bg-background/50 border-border/50 focus:ring-primary"
                maxLength={4}
                autoFocus
              />
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-sm flex items-center justify-center gap-1"
                >
                  <ShieldAlert size={14} /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 rounded-xl text-lg font-semibold"
            disabled={pin.length < 4 || isLoggingIn}
          >
            {isLoggingIn ? <Loader2 className="animate-spin mr-2" /> : null}
            Unlock System
          </Button>
        </form>
        <div className="mt-8 pt-6 border-t border-border/50 text-xs text-muted-foreground">
          <p>Operator: 1234 | Manager: 5678</p>
          <p className="mt-2">POPIA Compliant Environment • V3.2.0</p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginApp;