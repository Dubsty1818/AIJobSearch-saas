'use client';

import { 
  Users, Activity, CheckCircle, 
  Search, Briefcase, Filter 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

interface AdminDashboardClientProps {
  metrics: {
    totalUsers: number;
    dau: number;
    wizardCompletionRate: number;
  };
  charts: {
    searchVelocity: Array<{ date: string; count: number }>;
    matchRatio: Array<{ status: string; count: number }>;
    funnel: Array<{ stage: string; value: number }>;
  };
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

export function AdminDashboardClient({ metrics, charts }: AdminDashboardClientProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Users */}
        <div className="flex flex-col p-6 bg-card border rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Users className="h-5 w-5" />
            <h3 className="text-sm font-medium">Total Users</h3>
          </div>
          <p className="text-4xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
        </div>

        {/* DAU */}
        <div className="flex flex-col p-6 bg-card border rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Activity className="h-5 w-5" />
            <h3 className="text-sm font-medium">Daily Active Users</h3>
          </div>
          <p className="text-4xl font-bold">{metrics.dau.toLocaleString()}</p>
        </div>

        {/* Wizard Completion */}
        <div className="flex flex-col p-6 bg-card border rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <CheckCircle className="h-5 w-5" />
            <h3 className="text-sm font-medium">Setup Completion</h3>
          </div>
          <p className="text-4xl font-bold">{metrics.wizardCompletionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Search Velocity */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Search className="h-5 w-5" />
            <h3 className="text-sm font-medium">Search Velocity (Last 7 Days)</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.searchVelocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={10} />
                <YAxis stroke="#888" fontSize={12} tickMargin={10} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match vs Reject Ratio */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Briefcase className="h-5 w-5" />
            <h3 className="text-sm font-medium">Match Status Ratio</h3>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {charts.matchRatio.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.matchRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {charts.matchRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No match data available</p>
            )}
          </div>
        </div>

        {/* Funnel Pipeline */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col h-[400px] lg:col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Filter className="h-5 w-5" />
            <h3 className="text-sm font-medium">Application Pipeline Conversion</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.funnel} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#888" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="#888" fontSize={12} width={100} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={40}>
                  {charts.funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
