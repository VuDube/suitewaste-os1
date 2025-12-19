import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Camera, Loader2, Link as LinkIcon, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketplaceListings, useClassifyImage, useCreateListing } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
const MarketplaceApp: React.FC = () => {
  const { t } = useTranslation();
  const { data: items, isLoading: isLoadingListings } = useMarketplaceListings();
  const classifyMutation = useClassifyImage();
  const createListingMutation = useCreateListing();
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '', image: '' });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewItem((prev) => ({ ...prev, [id]: value }));
  };
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) return;
    const formData = new FormData();
    formData.append('name', newItem.name);
    formData.append('price', newItem.price);
    formData.append('category', newItem.category);
    formData.append('image', newItem.image);
    createListingMutation.mutate(formData, {
      onSuccess: () => {
        setNewItem({ name: '', price: '', category: '', image: '' });
      }
    });
  };
  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setIsCameraOpen(false);
      }
    }
  }, []);
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const base64Image = dataUrl.split(',')[1];
      setNewItem(prev => ({ ...prev, image: dataUrl }));
      stopCamera();
      setIsCameraOpen(false);
      classifyMutation.mutate({ image: base64Image }, {
        onSuccess: (data) => {
          setNewItem(prev => ({ ...prev, name: data.name, category: data.category, price: data.estimatedPrice.replace('R ', '') }));
        }
      });
    }
  };
  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('apps.marketplace.title')}</h1>
              <p className="text-muted-foreground">{t('apps.marketplace.description')}</p>
            </div>
            <Sheet>
              <SheetTrigger asChild><Button size="lg" className="shadow-lg"><Sparkles className="mr-2 h-4 w-4" /> {t('apps.marketplace.createListing')}</Button></SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader><SheetTitle>{t('apps.marketplace.createListing')}</SheetTitle></SheetHeader>
                <form onSubmit={handleCreateListing} className="py-6 space-y-6">
                  <div className="relative group">
                    <Button type="button" variant="outline" className="w-full h-32 border-dashed border-2 flex flex-col gap-2" onClick={() => setIsCameraOpen(true)}>
                      <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm">{t('apps.marketplace.scanWithCamera')}</span>
                    </Button>
                    {newItem.image && (
                      <div className="mt-4 relative rounded-xl overflow-hidden border">
                        <img src={newItem.image} alt="Captured" className="w-full aspect-video object-cover" />
                        <AnimatePresence>
                          {classifyMutation.isPending && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center">
                              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                              <span className="text-xs font-bold uppercase tracking-widest">{t('apps.marketplace.classifying')}...</span>
                              <motion.div initial={{ top: '0%' }} animate={{ top: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="absolute left-0 right-0 h-1 bg-primary/50 shadow-[0_0_15px_hsl(var(--primary))]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="name">Item Name</Label><Input id="name" value={newItem.name} onChange={handleInputChange} placeholder="e.g., Industrial Scrap" /></div>
                    <div className="space-y-2"><Label htmlFor="price">Price (R)</Label><Input id="price" type="number" value={newItem.price} onChange={handleInputChange} placeholder="0.00" /></div>
                    <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" value={newItem.category} onChange={handleInputChange} placeholder="e.g., E-Waste" /></div>
                  </div>
                  <SheetFooter><SheetClose asChild><Button type="submit" className="w-full h-12" disabled={createListingMutation.isPending || !newItem.name}>
                    {createListingMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                    Submit Listing
                  </Button></SheetClose></SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoadingListings ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-xl" />) :
              items?.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 group border-border/50">
                    <div className="relative aspect-video overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-2 right-2"><Badge variant="secondary" className="bg-background/80 backdrop-blur-md">{item.category}</Badge></div>
                    </div>
                    <CardContent className="p-4 flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-1">{item.name}</CardTitle>
                      <p className="text-2xl font-bold text-primary">{item.price}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" className="w-full" onClick={() => setIsBlockchainOpen(true)}><LinkIcon size={14} className="mr-2" /> {t('apps.marketplace.viewOnChain')}</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      </ScrollArea>
      <Dialog open={isCameraOpen} onOpenChange={(open) => { setIsCameraOpen(open); if (open) startCamera(); else stopCamera(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t('apps.marketplace.scanWithCamera')}</DialogTitle><DialogDescription>{t('apps.marketplace.cameraDescription')}</DialogDescription></DialogHeader>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
             <div className="absolute inset-0 border-2 border-primary/30 rounded-xl pointer-events-none" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-lg pointer-events-none" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <DialogFooter><Button size="lg" className="w-full rounded-full h-14" onClick={handleCapture}><Camera size={20} className="mr-2" /> {t('apps.marketplace.capture')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default MarketplaceApp;