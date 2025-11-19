import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
const mockItems = [
  { id: 1, name: 'Refurbished Laptops (x10)', price: 'R 15,000', category: 'E-Waste', image: '/ewaste/laptops.jpg' },
  { id: 2, name: 'Scrap Metal Bundle', price: 'R 5,000', category: 'Metals', image: '/ewaste/scrap.jpg' },
  { id: 3, name: 'Used Office Phones', price: 'R 2,500', category: 'E-Waste', image: '/ewaste/phones.jpg' },
  { id: 4, name: 'Recycled Plastic Pellets', price: 'R 8,000', category: 'Plastics', image: '/ewaste/pellets.jpg' },
];
const MarketplaceApp: React.FC = () => {
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">e-Waste Marketplace</h1>
            <p className="text-muted-foreground">Connecting buyers and sellers in the circular economy.</p>
          </div>
          <Button>Create Listing</Button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockItems.map((item) => (
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
                <Button variant="outline" size="sm">View</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
export default MarketplaceApp;