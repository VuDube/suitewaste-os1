import React from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
const wallpapers = [
  { name: 'Default', url: '/wallpapers/default.jpg' },
  { name: 'Green Field', url: '/wallpapers/green.jpg' },
  { name: 'Earthy Tones', url: '/wallpapers/earth.jpg' },
];
const SettingsApp: React.FC = () => {
  const { wallpaper, setWallpaper } = useDesktopStore((state) => ({
    wallpaper: state.wallpaper,
    setWallpaper: state.setWallpaper,
  }));
  const { isDark, toggleTheme } = useTheme();
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your SuiteWaste OS experience.</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" checked={isDark} onCheckedChange={toggleTheme} />
            </div>
            <div>
              <Label>Desktop Wallpaper</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.name}
                    className={`relative rounded-md overflow-hidden border-2 ${
                      wallpaper === wp.url ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setWallpaper(wp.url)}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-20 object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-end justify-center">
                      <p className="text-white text-xs pb-1">{wp.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
export default SettingsApp;