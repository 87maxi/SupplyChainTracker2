"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSkeleton = DashboardSkeleton;
const card_1 = require("@/components/ui/card");
const skeleton_1 = require("@/components/ui/skeleton");
function DashboardSkeleton() {
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <skeleton_1.Skeleton className="h-8 w-64"/>
        <skeleton_1.Skeleton className="h-10 w-32"/>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle><skeleton_1.Skeleton className="h-6 w-32"/></card_1.CardTitle>
          <card_1.CardDescription><skeleton_1.Skeleton className="h-4 w-64"/></card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (<card_1.Card key={i} className="border-l-4 border-l-blue-500">
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">
                    <skeleton_1.Skeleton className="h-4 w-24"/>
                  </card_1.CardTitle>
                  <skeleton_1.Skeleton className="h-4 w-4"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold"><skeleton_1.Skeleton className="h-8 w-16"/></div>
                  <div className="text-xs text-muted-foreground">
                    <skeleton_1.Skeleton className="h-3 w-32"/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle><skeleton_1.Skeleton className="h-6 w-32"/></card_1.CardTitle>
          <card_1.CardDescription><skeleton_1.Skeleton className="h-4 w-64"/></card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (<card_1.Card key={i} className="border-l-4 border-l-blue-500">
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">
                    <skeleton_1.Skeleton className="h-4 w-24"/>
                  </card_1.CardTitle>
                  <skeleton_1.Skeleton className="h-4 w-4"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold"><skeleton_1.Skeleton className="h-8 w-16"/></div>
                  <div className="text-xs text-muted-foreground">
                    <skeleton_1.Skeleton className="h-3 w-32"/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle><skeleton_1.Skeleton className="h-6 w-32"/></card_1.CardTitle>
          <card_1.CardDescription><skeleton_1.Skeleton className="h-4 w-64"/></card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <skeleton_1.Skeleton className="h-10 w-10 rounded-full"/>
                  <div className="space-y-1">
                    <skeleton_1.Skeleton className="h-4 w-24"/>
                    <skeleton_1.Skeleton className="h-3 w-32"/>
                  </div>
                </div>
                <skeleton_1.Skeleton className="h-8 w-20"/>
              </div>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
