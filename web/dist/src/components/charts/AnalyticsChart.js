"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsChart = AnalyticsChart;
const recharts_1 = require("recharts");
const card_1 = require("@/components/ui/card");
function AnalyticsChart({ data }) {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Progreso del Programa</card_1.CardTitle>
        <card_1.CardDescription>Seguimiento mensual de netbooks fabricadas y distribuidas</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="pb-4">
        <div className="h-[200px]">
          <recharts_1.ResponsiveContainer width="100%" height="100%">
            <recharts_1.LineChart data={data}>
              <recharts_1.CartesianGrid strokeDasharray="3 3"/>
              <recharts_1.XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <recharts_1.YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <recharts_1.Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length) {
                return (<div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          {payload.map((pld, index) => (<div key={index} className="flex items-center gap-2 font-medium">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: pld.color }}/>
                              {pld.name}: {pld.value}
                            </div>))}
                        </div>
                      </div>);
            }
            return null;
        }}/>
              <recharts_1.Legend layout="horizontal" verticalAlign="bottom" align="center" formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}/>
              <recharts_1.Line type="monotone" dataKey="fabricadas" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Netbooks Fabricadas"/>
              <recharts_1.Line type="monotone" dataKey="distribuidas" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Netbooks Distribuidas"/>
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
