'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase-clients/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Loader2, TrendingUp, Briefcase, FileCheck, XCircle, Info } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

interface AnalyticsClientProps {
  userId: string;
}

export default function AnalyticsClient({ userId }: AnalyticsClientProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFound: 0,
    totalApproved: 0,
    totalRejected: 0,
  });
  
  const [lineData, setLineData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();
      
      // Fetch all matches for this user
      const { data, error } = await supabase
        .from('job_matches')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Calculate simple stats
      const totalFound = data.length;
      const totalApproved = data.filter(d => d.matched_status === 'approved').length;
      const totalRejected = data.filter(d => d.matched_status === 'rejected').length;

      setStats({ totalFound, totalApproved, totalRejected });

      // Generate Line Chart Data (Applications per day over the last 14 days)
      const appsOverTime = new Map<string, number>();
      // Initialize last 14 days with 0
      for (let i = 13; i >= 0; i--) {
        appsOverTime.set(format(subDays(new Date(), i), 'MMM dd'), 0);
      }

      data.forEach(job => {
        if (job.application_date && job.application_status) {
          const dateStr = format(new Date(job.application_date), 'MMM dd');
          if (appsOverTime.has(dateStr)) {
            appsOverTime.set(dateStr, (appsOverTime.get(dateStr) || 0) + 1);
          }
        }
      });

      const processedLineData = Array.from(appsOverTime.entries()).map(([date, count]) => ({
        date,
        Applications: count,
      }));
      setLineData(processedLineData);

      // Generate Pie Chart Data (Breakdown of application statuses)
      const statusCounts = new Map<string, number>();
      data.forEach(job => {
        // Only count jobs that are approved matches
        if (job.matched_status === 'approved') {
          const status = job.application_status || 'ignored';
          statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
        }
      });

      const COLORS: Record<string, string> = {
        applied: '#3b82f6', // blue-500
        ignored: '#cbd5e1', // light grey (slate-300)
        interview: '#22c55e', // green-500
        interview_2: '#10b981', // emerald-500
        offer: '#eab308', // yellow-500
        rejection: '#ef4444', // red-500
      };

      const LABELS: Record<string, string> = {
        applied: 'Applied',
        ignored: 'No Action',
        interview: '1st Interview',
        interview_2: '2nd+ Interview',
        offer: 'Offer',
        rejection: 'Rejection',
      };

      const processedPieData = Array.from(statusCounts.entries()).map(([status, count]) => ({
        name: LABELS[status] || status,
        value: count,
        color: COLORS[status] || '#94a3b8'
      }));

      setPieData(processedPieData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Crunching your analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-2">
      


      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Briefcase className="w-4 h-4" />
            <h3 className="font-medium text-sm">Total Jobs Scanned</h3>
          </div>
          <div className="text-4xl font-bold">{stats.totalFound}</div>
        </div>
        
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <FileCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="font-medium text-sm">Total Approved</h3>
          </div>
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalApproved}</div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <XCircle className="w-4 h-4 text-red-500" />
            <h3 className="font-medium text-sm">Total Rejected</h3>
          </div>
          <div className="text-4xl font-bold text-red-600 dark:text-red-400">{stats.totalRejected}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Application Velocity</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Applications" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Pipeline Status Breakdown</h3>
          </div>
          <div className="h-[300px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-foreground text-sm font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p>No active applications in your pipeline.</p>
                <p className="text-sm mt-1">Start matching and applying to see your breakdown!</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
