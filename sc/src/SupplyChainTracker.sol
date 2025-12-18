// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";

contract SupplyChainTracker is AccessControl {
    // --- Roles ---
    bytes32 public constant FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE");
    bytes32 public constant AUDITOR_HW_ROLE = keccak256("AUDITOR_HW_ROLE");
    bytes32 public constant TECNICO_SW_ROLE = keccak256("TECNICO_SW_ROLE");
    bytes32 public constant ESCUELA_ROLE = keccak256("ESCUELA_ROLE");

    // --- Enums ---
    enum State {
        FABRICADA,
        HW_APROBADO,
        SW_VALIDADO,
        DISTRIBUIDA
    }

    // --- Estructuras de Datos ---
    struct Netbook {
        // A. Datos de Origen
        string serialNumber;
        string batchId;
        string initialModelSpecs;

        // B. Datos de Hardware
        address hwAuditor;
        bool hwIntegrityPassed;
        bytes32 hwReportHash;

        // C. Datos de Software
        address swTechnician;
        string osVersion;
        bool swValidationPassed;

        // D. Datos de Destino
        bytes32 destinationSchoolHash;
        bytes32 studentIdHash;
        uint distributionTimestamp;

        // Estado actual
        State currentState;
    }

    // --- Almacenamiento ---
    mapping(string => Netbook) private netbooks;
    string[] public allSerialNumbers;

    // Eventos y modificadores omitidos por brevedad...
    
    // --- Funciones de Soporte de Roles ---
    
    /**
     * @dev Retorna todos los miembros de un rol específico.
     * @param role El rol del cual obtener los miembros.
     * @return address[] Un array con todas las direcciones que tienen el rol.
     */
    function getAllMembers(bytes32 role) public view returns (address[] memory) {
        uint256 count = getRoleMemberCount(role);
        address[] memory members = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            members[i] = getRoleMember(role, i);
        }
        
        return members;
    }
    
    /**
     * @dev Retorna el número de miembros en un rol específico.
     * @param role El rol del cual obtener el conteo.
     * @return uint256 El número de miembros en el rol.
     */
    function getRoleMemberCount(bytes32 role) public view returns (uint256) {
        return getRoleMemberCount(role);
    }

    /**
     * @dev Verifica si una dirección tiene un rol específico.
     * @param role El rol a verificar.
     * @param account La dirección a verificar.
     * @return bool Verdadero si la cuenta tiene el rol.
     */
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return super.hasRole(role, account);
    }

    // Resto del contrato...
}
