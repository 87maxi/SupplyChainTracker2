

El proyecto en cuestión es una aplicación web desarrollada en TypeScript y React que se enfoca en la gestión de dispositivos netbooks en una cadena de suministro. La aplicación incluye varias funcionalidades para administrar los dispositivos, como la asignación de dispositivos a estudiantes, la auditoría de hardware y software, y la gestión de solicitudes de roles.

## El sistema se divide en varias partes principales:

1. **Frontend:** La interfaz de usuario de la aplicación, desarrollada en React.
2. **Backend:** La parte del servidor, desarrollada en Node.js y TypeScript, que proporciona funcionalidades 3. como la gestión de usuarios, la comunicación con la cadena de suministro y la gestión de solicitudes de roles.
4. **Cadena de suministro:** La cadena de suministro es un contrato inteligente en la blockchain Ethereum que se utiliza para gestionar los dispositivos netbooks.
5. **Utilidades:** Módulos de utilidades que proporcionan funcionalidades comunes, como la validación de metadatos, la conversión de fechas y la generación de colores para los estados de los dispositivos.
6. **Servicios:** Módulos de servicios que proporcionan funcionalidades específicas, como el servicio de solicitudes de roles y el servicio de la cadena de suministro.
A continuación, se detallan las principales funcionalidades del sistema:

7. **Asignación de dispositivos a estudiantes:** La aplicación permite asignar dispositivos netbooks a estudiantes en una escuela específica.
8. **Auditoría de hardware:** La aplicación permite auditar el hardware de los dispositivos netbooks para verificar que cumplan con los requisitos mínimos.
9. **Auditoría de software:** La aplicación permite auditar el software de los dispositivos netbooks para verificar que cumplan con las versiones mínimas y que estén libres de virus y malware.
10. **Gestión de solicitudes de roles:** La aplicación permite a los usuarios solicitar roles específicos en la cadena de suministro, como fabricante, auditor de hardware, técnico de software, etc.
11. **Registro de dispositivos:** La aplicación permite registrar los dispositivos netbooks en la cadena de suministro.
12. **Gestión de usuarios:** La aplicación permite gestionar los usuarios y sus roles en la cadena de suministro.
13. **Gestión de errores:** La aplicación proporciona una interfaz para manejar errores y excepciones en todo el sistema.
14. **Diagnóstico de servicios:** La aplicación proporciona una interfaz para diagnosticar problemas de inicialización de servicios.
15. **Registro de auditorías:** La aplicación registra auditorías de los eventos importantes en el sistema.


@startuml
!define ROLE_COLOR #FF6347
!define CONTRACT_COLOR #4CAF50
!define SERVICE_COLOR #2196F3
!define UTILITY_COLOR #00E676

package "Contracts" {
  class SupplyChainContract {
    - address: string
    - abi: any
    + assignToStudent(serial: string, schoolHash: string, studentHash: string)
    + auditHardware(serial: string, passed: boolean, reportHash: string)
    + getAllMembers(roleHash: string)
    + getAllSerialNumbers()
    + getNetbookReport(serial: string)
    + getNetbookState(serial: string)
    + getNetbooksByState(state: number)
    + getRoleMemberCount(roleHash: string)
    + grantRole(role: string, account: string)
    + hasRole(role: string, account: string)
    + registerNetbooks(serials: string[], batches: string[], modelSpecs: string[])
    + revokeRole(role: string, account: string)
    + validateSoftware(serial: string, version: string, passed: boolean)
  }
}

package "Services" {
  class RoleRequestService {
    - supplyChainService: SupplyChainContract
    - roleMapper: RoleMapper
    + createRequest(request: { userAddress: string; role: string; signature: string })
    + deleteRoleRequest(id: string)
    + getRoleRequests()
    + updateRoleRequestStatus(id: string, status: 'approved' | 'rejected')
  }
  class SupplyChainService {
    - contract: SupplyChainContract
    + getAddress()
    + readContract(...args: any[])
    + writeContract(...args: any[])
  }
}

package "Utilities" {
  class RoleMapper {
    + getRoleHash(name: string)
    + normalizeRoleName(name: string)
  }
}

RoleRequestService --|> SupplyChainService
RoleRequestService --|> RoleMapper
SupplyChainService --|> SupplyChainContract
@enduml