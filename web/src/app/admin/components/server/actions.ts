'use server';

import { ROLES } from '@/lib/constants';

export async function getDashboardData() {
  try {
    // Dynamically import serverRpc to avoid build-time evaluation issues
    const { serverRpc } = await import('@/lib/api/serverRpc');

    // Get all serial numbers
    const serialNumbers = await serverRpc.getAllSerialNumbers();

    // Get role members
    const [fabricanteCount, auditorHwCount, tecnicoSwCount, escuelaCount] = await Promise.all([
      serverRpc.getRoleMemberCount(ROLES.FABRICANTE.hash),
      serverRpc.getRoleMemberCount(ROLES.AUDITOR_HW.hash),
      serverRpc.getRoleMemberCount(ROLES.TECNICO_SW.hash),
      serverRpc.getRoleMemberCount(ROLES.ESCUELA.hash)
    ]);

    // Initialize counters
    const stats = {
      fabricanteCount,
      auditorHwCount,
      tecnicoSwCount,
      escuelaCount,
      totalFabricadas: 0,
      totalHwAprobadas: 0,
      totalSwValidadas: 0,
      totalDistribuidas: 0
    };

    // Process each netbook state
    const stateStats = [];
    for (const serial of serialNumbers) {
      stateStats.push(
        serverRpc.getNetbookState(serial).then(state => {
          switch (state) {
            case 0: // FABRICADA
              stats.totalFabricadas++;
              break;
            case 1: // HW_APROBADO
              stats.totalHwAprobadas++;
              break;
            case 2: // SW_VALIDADO
              stats.totalSwValidadas++;
              break;
            case 3: // DISTRIBUIDA
              stats.totalDistribuidas++;
              break;
          }
        }).catch(() => {
          // Ignore errors for individual netbooks
        })
      );
    }

    // Wait for all state fetches
    await Promise.all(stateStats);

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      fabricanteCount: 0,
      auditorHwCount: 0,
      tecnicoSwCount: 0,
      escuelaCount: 0,
      totalFabricadas: 0,
      totalHwAprobadas: 0,
      totalSwValidadas: 0,
      totalDistribuidas: 0
    };
  }
}