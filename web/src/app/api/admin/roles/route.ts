'use server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Interface para la respuesta
interface RoleStats {
  role: string;
  count: number;
}

interface NetbookStatusStats {
  status: string;
  count: number;
}

// Mapeo de estado
const STATE_MAPPING: Record<string, string> = {
  'FABRICADA': 'FABRICADA',
  'HW_APROBADO': 'HW_APROBADO',
  'SW_VALIDADO': 'SW_VALIDADO',
  'DISTRIBUIDA': 'DISTRIBUIDA'
};

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Obtener conteo de usuarios por rol
    const rolePipeline = [
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];
    
    const roleData = await db.collection('role_data').aggregate(rolePipeline).toArray();
    const roleStats: RoleStats[] = roleData.map(item => ({
      role: item._id,
      count: item.count
    }));
    
    // Obtener conteo de netbooks por estado
    const netbookPipeline = [
      {
        $group: {
          _id: "$data.currentState",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];
    
    const netbookData = await db.collection('netbook_data').aggregate(netbookPipeline).toArray();
    const netbookStatusStats: NetbookStatusStats[] = netbookData
      .map(item => ({
        status: STATE_MAPPING[item._id] || item._id,
        count: item.count
      }));
    
    // Calcular totales
    const totalUsers = roleStats.reduce((sum, role) => sum + role.count, 0);
    const totalNetbooks = netbookStatusStats.reduce((sum, status) => sum + status.count, 0);
    
    // Mapear estados a nombres comunes
    const statusNameMap: Record<string, string> = {
      'FABRICADA': 'Fabricadas',
      'HW_APROBADO': 'HW Aprobado',
      'SW_VALIDADO': 'SW Validado',
      'DISTRIBUIDA': 'Distribuidas'
    };
    
    // Mapear roles a nombres comunes
    const roleNameMap: Record<string, string> = {
      'FABRICANTE_ROLE': 'Fabricantes',
      'AUDITOR_HW_ROLE': 'Auditores HW',
      'TECNICO_SW_ROLE': 'Técnicos SW',
      'ESCUELA_ROLE': 'Escuelas',
      'DEFAULT_ADMIN_ROLE': 'Administradores'
    };
    
    // Preparar datos para el frontend
    const dashboardData = {
      usersByRole: roleStats.reduce((acc, item) => {
        acc[roleNameMap[item.role] || item.role] = item.count;
        return acc;
      }, {} as Record<string, number>),
      netbooksByStatus: netbookStatusStats.reduce((acc, item) => {
        acc[statusNameMap[item.status] || item.status] = item.count;
        return acc;
      }, {} as Record<string, number>),
      totalUsers,
      totalNetbooks
    };
    
    return NextResponse.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch admin stats' 
      },
      { status: 500 }
    );
  }
}
