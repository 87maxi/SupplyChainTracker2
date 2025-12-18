'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NetbookStatusData {
  status: string;
  count: number;
  fill: string;
}

export function NetbookStatusChart() {
  // Mock data - in a real app, this would come from the contract
  const data: NetbookStatusData[] = [
    {
      status: 'Fabricadas',
      count: 28,
      fill: 'hsl(var(--chart-1))',
    },
    {
      status: 'HW Aprobado',
      count: 24,
      fill: 'hsl(var(--chart-2))',
    },
    {
      status: 'SW Validado',
      count: 20,
      fill: 'hsl(var(--chart-3))',
    },
    {
      status: 'Distribuidas',
      count: 16,
      fill: 'hsl(var(--chart-4))',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de las Netbooks</CardTitle>
        <CardDescription>Distribución del estado actual de todas las netbooks</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="status" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 font-medium">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: payload[0].color }}
                            />
                            {payload[0].value}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0] }>
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={12}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}