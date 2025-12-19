import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
const wallpapers = [
  { name: 'Default', url: '/wallpapers/default.jpg' },
  { name: 'Green Field', url: '/wallpapers/green.jpg' },
  { name: 'Earthy Tones', url: '/wallpapers/earth.jpg' },
];
const languages = [
  { code: 'en', name: 'English' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'xh', name: 'isiXhosa' },
];
const SettingsApp: React.FC = () => {
  const { t, i18n } = useTranslation();
  const wallpaper = useDesktopStore((state) => state.wallpaper);
  const setWallpaper = useDesktopStore((state) => state.setWallpaper);
  const { isDark, toggleTheme } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  const handleLanguageChange = useCallback((langCode: string) => {
    setIsLanguageLoading(true);
    i18n.changeLanguage(langCode).finally(() => {
      setTimeout(() => setIsLanguageLoading(false), 0);
    });
  }, [i18n]);
  return (
    <ScrollArea className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">{t('apps.settings.title')}</h1>
            <p className="text-muted-foreground">{t('apps.settings.description')}</p>
          </header>
          <Card>
            <CardContent className="p-0">
              <Accordion type="single" collapsible defaultValue="appearance" className="w-full">
                <AccordionItem value="appearance">
                  <AccordionTrigger className="px-6">{t('apps.settings.appearance')}</AccordionTrigger>
                  <AccordionContent className={`px-6 pb-6 space-y-6 ${prefersReducedMotion ? 'transition-none' : ''}`}>
                    <div className="flex items-center justify-between min-h-[44px] md:min-h-auto">
                      <Label htmlFor="dark-mode" id="dark-mode-label">{t('apps.settings.darkMode')}</Label>
                      <Switch id="dark-mode" checked={isDark} onCheckedChange={toggleTheme} aria-labelledby="dark-mode-label" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="language">
                  <AccordionTrigger className="px-6">{t('apps.settings.language')}</AccordionTrigger>
                  <AccordionContent className={`px-6 pb-6 space-y-2 ${prefersReducedMotion ? 'transition-none' : ''}`}>
                    <Label>{t('apps.settings.language')}</Label>
                    {isLanguageLoading ? <Skeleton className="h-[44px] w-full" /> : (
                      <Select value={i18n.language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="min-h-[44px] md:min-h-auto">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="wallpaper">
                  <AccordionTrigger className="px-6">{t('apps.settings.wallpaper')}</AccordionTrigger>
                  <AccordionContent className={`px-6 pb-6 ${prefersReducedMotion ? 'transition-none' : ''}`}>
                    <Label>{t('apps.settings.wallpaper')}</Label>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};
export default SettingsApp;