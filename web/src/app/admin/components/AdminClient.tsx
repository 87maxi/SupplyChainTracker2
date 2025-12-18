"use client";

import nextDynamic from 'next/dynamic';

const DashboardOverview = nextDynamic(() => import('./DashboardOverview').then(mod => mod.DashboardOverview), { ssr: false });
const UsersList = nextDynamic(() => import('./UsersList').then(mod => mod.UsersList), { ssr: false });

export function AdminClient({ stats }: { stats: any }) {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <DashboardOverview stats={stats} />
            <UsersList />
        </div>
    );
}
