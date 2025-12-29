"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import EnhancedPendingRoleRequests from './EnhancedPendingRoleRequests';

export default function PendingRoleRequestsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Pending Role Requests</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Pending Role Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Review and manage pending role requests. Approve or reject requests based on your organization's access control policies.
            </p>
            <EnhancedPendingRoleRequests />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}