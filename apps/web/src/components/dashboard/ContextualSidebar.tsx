'use client';

import { Lightbulb, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SidebarItem {
  title: string;
  content: React.ReactNode;
  type?: 'tip' | 'info' | 'warning';
}

interface ContextualSidebarProps {
  items: SidebarItem[];
}

export function ContextualSidebar({ items }: ContextualSidebarProps) {
  const getIcon = (type: SidebarItem['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 hidden lg:block sticky top-6">
      {items.map((item, index) => (
        <Card 
          key={index} 
          className="border-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-violet-500/10 backdrop-blur-md shadow-lg shadow-indigo-500/5 ring-1 ring-white/10 dark:ring-white/20 transition-all duration-300 hover:shadow-indigo-500/10 overflow-hidden relative"
        >
          {/* Subtle gradient overlay for extra "AI-ey" feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center gap-3 space-y-0 relative z-10">
            <div className="p-2 bg-background/50 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              {getIcon(item.type)}
            </div>
            <CardTitle className="text-sm font-semibold tracking-wide text-foreground/90">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed relative z-10">
            {item.content}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
