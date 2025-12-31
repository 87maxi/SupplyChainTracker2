"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PendingRoleRequestsPage;
const card_1 = require("@/components/ui/card");
const EnhancedPendingRoleRequests_1 = __importDefault(require("./EnhancedPendingRoleRequests"));
function PendingRoleRequestsPage() {
    return (<div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Pending Role Requests</h1>
      <div className="grid gap-6">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Manage Pending Role Requests</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <p className="text-muted-foreground mb-4">
              Review and manage pending role requests. Approve or reject requests based on your organization's access control policies.
            </p>
            <EnhancedPendingRoleRequests_1.default />
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
