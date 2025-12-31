"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetbookStatusChart = NetbookStatusChart;
const recharts_1 = require("recharts");
const card_1 = require("@/components/ui/card");
function NetbookStatusChart({ data }) {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Estado de las Netbooks</card_1.CardTitle>
        <card_1.CardDescription>Distribución del estado actual de todas las netbooks</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="pb-4">
        <div className="h-[200px]">
          <recharts_1.ResponsiveContainer width="100%" height="100%">
            <recharts_1.BarChart data={data}>
              <recharts_1.XAxis dataKey="status" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
              <recharts_1.YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
              <recharts_1.Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length) {
                return (<div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 font-medium">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }}/>
                            {payload[0].value}
                          </div>
                        </div>
                      </div>);
            }
            return null;
        }}/>
              <recharts_1.Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <recharts_1.LabelList dataKey="count" position="top" offset={12} fontSize={12}/>
              </recharts_1.Bar>
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
