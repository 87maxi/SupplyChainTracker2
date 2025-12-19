'use server';

import { ROLES } from '@/lib/constants';

export async function getDashboardData() {
  try {
    // Dynamically import serverRpc functions to avoid build-time evaluation issues
    const {
      getAllSerialNumbers,
      getRoleMemberCount,
      getNetbooksByState
    } = await import('@/lib/api/serverRpc');

    // Get all serial numbers
    const serialNumbers = await getAllSerialNumbers();

    // Get role members
    const [fabricanteCount, auditorHwCount, tecnicoSwCount, escuelaCount] = await Promise.all([
      getRoleMemberCount(ROLES.FABRICANTE.hash),
      getRoleMemberCount(ROLES.AUDITOR_HW.hash),
      getRoleMemberCount(ROLES.TECNICO_SW.hash),
      getRoleMemberCount(ROLES.ESCUELA.hash)
    ]);

    // Get netbook counts by state
    const [fabricadaSerials, hwAprobadaSerials, swValidadaSerials, distribuidaSerials] = await Promise.all([
      getNetbooksByState(0),
      getNetbooksByState(1),
      getNetbooksByState(2),
      getNetbooksByState(3)
    ]);

    return {
      fabricanteCount,
      auditorHwCount,
      tecnicoSwCount,
      escuelaCount,
      totalFabricadas: fabricadaSerials.length,
      totalHwAprobadas: hwAprobadaSerials.length,
      totalSwValidadas: swValidadaSerials.length,
      totalDistribuidas: distribuidaSerials.length
    };
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