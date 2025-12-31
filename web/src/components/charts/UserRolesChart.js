"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRolesChart = UserRolesChart;
const recharts_1 = require("recharts");
const card_1 = require("@/components/ui/card");
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
function UserRolesChart({ data }) {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Roles de Usuario</card_1.CardTitle>
        <card_1.CardDescription>Distribución de roles en el sistema</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="pb-4">
        <div className="h-[200px]">
          <recharts_1.ResponsiveContainer width="100%" height="100%">
            <recharts_1.PieChart>
              <recharts_1.Pie data={data} cx="50%" cy="50%" labelLine={false} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="count">
                {data.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={entry.fill}/>))}
              </recharts_1.Pie>
              <recharts_1.Legend layout="horizontal" verticalAlign="bottom" align="center" formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}/>
            </recharts_1.PieChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
