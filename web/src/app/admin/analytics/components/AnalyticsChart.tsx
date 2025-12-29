'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
  month: string;
  users: number;
  roleRequests: number;
  completions: number;
}

const chartData: AnalyticsData[] = [
  { month: 'Ene', users: 65, roleRequests: 85, completions: 40 },
  { month: 'Feb', users: 80, roleRequests: 90, completions: 55 },
  { month: 'Mar', users: 120, roleRequests: 140, completions: 85 },
  { month: 'Abr', users: 160, roleRequests: 120, completions: 90 },
  { month: 'May', users: 180, roleRequests: 160, completions: 120 },
  { month: 'Jun', users: 220, roleRequests: 180, completions: 150 },
];

export function AnalyticsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad del Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            users: {
              label: 'Usuarios Registrados',
              color: 'hsl(var(--chart-1))',
            },
            roleRequests: {
              label: 'Solicitudes de Rol',
              color: 'hsl(var(--chart-2))',
            },
            completions: {
              label: 'Operaciones Completadas',
              color: 'hsl(var(--chart-3))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: 'var(--chart-text-color)' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--chart-text-color)' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" radius={[4, 4, 0, 0]} />
              <Bar dataKey="roleRequests" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}