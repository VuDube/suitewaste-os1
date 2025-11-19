import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
const mockItems = [
  { id: 1, name: 'Refurbished Laptops (x10)', price: 'R 15,000', category: 'E-Waste', image: '/ewaste/laptops.jpg' },
  { id: 2, name: 'Scrap Metal Bundle', price: 'R 5,000', category: 'Metals', image: '/ewaste/scrap.jpg' },
  { id: 3, name: 'Used Office Phones', price: 'R 2,500', category: 'E-Waste', image: '/ewaste/phones.jpg' },
  { id: 4, name: 'Recycled Plastic Pellets', price: 'R 8,000', category: 'Plastics', image: '/ewaste/pellets.jpg' },
];
const MarketplaceApp: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState(mockItems);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewItem((prev) => ({ ...prev, [id]: value }));
  };
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) return;
    const newListing = {
      id: items.length + 1,
      ...newItem,
      price: `R ${parseFloat(newItem.price).toLocaleString()}`,
      image: '/ewaste/placeholder.jpg', // Placeholder for new items
    };
    setItems([newListing, ...items]);
    setNewItem({ name: '', price: '', category: '' });
    // Ideally, we'd close the sheet here. The SheetClose button handles this.
  };
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('apps.marketplace.title')}</h1>
            <p className="text-muted-foreground">{t('apps.marketplace.description')}</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button>{t('apps.marketplace.createListing')}</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('apps.marketplace.createListing')}</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleCreateListing} className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" value={newItem.name} onChange={handleInputChange} placeholder="e.g., Used Keyboards" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (R)</Label>
                  <Input id="price" type="number" value={newItem.price} onChange={handleInputChange} placeholder="e.g., 500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={newItem.category} onChange={handleInputChange} placeholder="e.g., E-Waste" />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Create</Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
              </CardHeader>
              <CardContent className="p-4">
                <Badge variant="secondary" className="mb-2">{item.category}</Badge>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 pt-0">
                <span className="font-bold text-lg">{item.price}</span>
                <Button variant="outline" size="sm">{t('apps.marketplace.view')}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
export default MarketplaceApp;