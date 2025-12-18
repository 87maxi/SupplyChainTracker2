export const dynamic = 'force-dynamic';

import { getDashboardData } from '@/app/admin/components/server/actions';
import { AdminClient } from '@/app/admin/components/AdminClient';

export default async function AdminPage() {
  const stats = await getDashboardData();

  return <AdminClient stats={stats} />;
}