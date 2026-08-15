import { redirect } from 'next/navigation';
import { getUserProfile } from '@/data/user/profile';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Internal SaaS Metrics',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile().catch(() => null);

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-500" />
            <span className="text-lg font-bold">Admin Panel</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Exit to App
            </Link>
          </nav>
        </div>
      </header>
      <main className="container px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
