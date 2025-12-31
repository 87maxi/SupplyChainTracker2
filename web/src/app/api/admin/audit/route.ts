'use server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { RoleData, NetbookData } from '@/types/mongodb';
import { ContractRoles } from '@/types/contract';

// Interfaces para la respuesta de auditoría
interface AuditLog {
  id: number;
  timestamp: string;
  eventType: string;
  description: string;
  actor: string;
  success: boolean;
}

// Mapeo de roles a eventos
const ROLE_TO_EVENT: Record<ContractRoles, string> = {
  DEFAULT_ADMIN_ROLE: 'role_assigned',
  FABRICANTE_ROLE: 'role_assigned',
  AUDITOR_HW_ROLE: 'role_assigned',
  TECNICO_SW_ROLE: 'role_assigned',
  ESCUELA_ROLE: 'role_assigned'
};

// Tipos para datos de auditoría
interface AuditData {
  roleData: RoleData[];
  netbookData: NetbookData[];
}

/**
 * Handler para obtener registros de auditoría
 * Combina datos de roles y netbooks de MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Obtener datos de MongoDB
    const roleData = await db.collection('role_data').find({}).sort({ timestamp: -1 }).limit(100).toArray();
    const netbookData = await db.collection('netbook_data').find({}).sort({ timestamp: -1 }).limit(100).toArray();
    
    // Convertir ObjectId a string y asegurar tipos
    const processedRoleData: RoleData[] = roleData.map(item => ({
      ...item,
      _id: item._id?.toString(),
      timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
      createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt)
    }));
    
    const processedNetbookData: NetbookData[] = netbookData.map(item => ({
      ...item,
      _id: item._id?.toString(),
      timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
      createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt)
    }));
    
    // Transformar datos en registros de auditoría
    const auditLogs: AuditLog[] = [];
    
    // Procesar datos de roles
    processedRoleData.forEach(item => {
      auditLogs.push({
        id: parseInt(item._id?.slice(-6), 16) || Date.now(),
        timestamp: item.timestamp.toISOString(),
        eventType: ROLE_TO_EVENT[item.role as ContractRoles] || 'role_assigned',
        description: `Rol ${item.role} asignado a ${item.userAddress}`,
        actor: item.userAddress,
        success: true
      });
    });
    
    // Procesar datos de netbooks
    processedNetbookData.forEach(item => {
      let eventType = 'netbook_registered';
      let description = `Netbook ${item.serialNumber} registrada`;
      
      switch (item.role) {
        case 'AUDITOR_HW_ROLE':
          eventType = 'hardware_audited';
          description = `Netbook ${item.serialNumber} auditada por hardware`;
          break;
        case 'TECNICO_SW_ROLE':
          eventType = 'software_validated';
          description = `Netbook ${item.serialNumber} validada por software`;
          break;
        case 'ESCUELA_ROLE':
          eventType = 'netbook_assigned';
          description = `Netbook ${item.serialNumber} asignada a estudiante`;
          break;
      }
      
      auditLogs.push({
        id: parseInt(item._id?.slice(-6), 16) || Date.now(),
        timestamp: item.timestamp.toISOString(),
        eventType,
        description,
        actor: item.userAddress,
        success: true
      });
    });
    
    // Ordenar por timestamp descendente
    auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({
      success: true,
      data: auditLogs
    });
    
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch audit logs' 
      },
      { status: 500 }
    );
  }
}
