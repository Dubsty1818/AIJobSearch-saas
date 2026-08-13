'use client';

import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'de' : 'en';
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1.5 font-medium"
      onClick={toggleLanguage}
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? 'EN' : 'DE'}</span>
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
