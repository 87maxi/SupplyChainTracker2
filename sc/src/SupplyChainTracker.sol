// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {
    AccessControlEnumerable
} from "openzeppelin-contracts/contracts/access/extensions/AccessControlEnumerable.sol";

contract SupplyChainTracker is AccessControlEnumerable {
    // --- Roles ---
    // Roles constant - using public constant as per OpenZeppelin best practices
    bytes32 public constant FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE");
    bytes32 public constant AUDITOR_HW_ROLE = keccak256("AUDITOR_HW_ROLE");
    bytes32 public constant TECNICO_SW_ROLE = keccak256("TECNICO_SW_ROLE");
    bytes32 public constant ESCUELA_ROLE = keccak256("ESCUELA_ROLE");

    // DEFAULT_ADMIN_ROLE is already defined in AccessControl as 0x00...
    // We expose it through our mapping system for consistency

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
        bool exists;
    }

    // --- Almacenamiento ---
    mapping(string => Netbook) private netbooks;
    string[] public allSerialNumbers;

    // --- Eventos ---
    event NetbookRegistered(string serialNumber, string batchId, address manufacturer);
    event HardwareAudited(string serialNumber, address auditor, bool passed);
    event SoftwareValidated(string serialNumber, address technician, string osVersion);
    event NetbookAssigned(string serialNumber, bytes32 schoolHash, bytes32 studentHash);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // --- Funciones ERC-20 para evitar errores de "execution reverted" ---
    // Estas funciones devuelven valores por defecto para evitar que herramientas
    // que esperan un contrato ERC-20 fallen con "execution reverted"
    
    function decimals() external pure returns (uint8) {
        return 0; // No es un token, devolvemos 0
    }
    
    function symbol() external pure returns (string memory) {
        return ""; // No es un token, devolvemos string vacío
    }
    
    function name() external pure returns (string memory) {
        return "SupplyChainTracker"; // Nombre del contrato
    }
    
    function totalSupply() external pure returns (uint256) {
        return 0; // No es un token, devolvemos 0
    }
    
    function balanceOf(address) external pure returns (uint256) {
        return 0; // No es un token, devolvemos 0
    }

    // --- Funciones de gestión de roles ---

    /**
     * @notice Otorga un rol a una cuenta
     * @dev Solo el administrador puede llamar a esta función
     * @param account La cuenta que recibirá el rol
     * @param roleType El tipo de rol a otorgar ("FABRICANTE", "AUDITOR_HW", "TECNICO_SW", "ESCUELA")
     */
    function grantRole(address account, string calldata roleType)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bytes32 role = getRoleByName(roleType);
        _grantRole(role, account);
    }

    /**
     * @notice Revoca un rol de una cuenta
     * @dev Solo el administrador puede llamar a esta función
     * @param account La cuenta de la que se revocará el rol
     * @param roleType El tipo de rol a revocar ("FABRICANTE", "AUDITOR_HW", "TECNICO_SW", "ESCUELA")
     */
    function revokeRole(address account, string calldata roleType)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bytes32 role = getRoleByName(roleType);
        _revokeRole(role, account);
    }

    /**
     * @notice Obtiene el hash del rol por su nombre
     * @param roleType El nombre del rol ("FABRICANTE", "AUDITOR_HW", "TECNICO_SW", "ESCUELA")
     * @return role El hash del rol correspondiente
     */
    function getRoleByName(string calldata roleType) public pure returns (bytes32) {
        if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("FABRICANTE"))) {
            return FABRICANTE_ROLE;
        }
        if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("AUDITOR_HW"))) {
            return AUDITOR_HW_ROLE;
        }
        if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("TECNICO_SW"))) {
            return TECNICO_SW_ROLE;
        }
        if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("ESCUELA"))) {
            return ESCUELA_ROLE;
        }
        if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("ADMIN")) ||
            keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("DEFAULT_ADMIN")) ||
            keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("MANAGER")) ||
            keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("OWNER"))) {
            return DEFAULT_ADMIN_ROLE;
        }
        revert("Invalid role type");
    }

    /**
     * @notice Verifica si una cuenta tiene un rol específico
     * @param roleType El tipo de rol a verificar
     * @param account La cuenta a verificar
     * @return bool True si la cuenta tiene el rol, false en caso contrario
     */
    function hasRole(string calldata roleType, address account) external view returns (bool) {
        bytes32 role = getRoleByName(roleType);
        return hasRole(role, account);
    }

    // --- Funciones de Escritura ---

    function registerNetbooks(
        string[] calldata serials,
        string[] calldata batches,
        string[] calldata specs
    ) external {
        require(hasRole(FABRICANTE_ROLE, msg.sender), "Acceso denegado: rol requerido");
        require(
            serials.length == batches.length && serials.length == specs.length,
            "Longitud de arrays no coincide"
        );

        for (uint i = 0; i < serials.length; i++) {
            require(bytes(serials[i]).length > 0, "Serial no valido");
            require(!netbooks[serials[i]].exists, "Netbook ya registrada");

            netbooks[serials[i]] = Netbook({
                serialNumber: serials[i],
                batchId: batches[i],
                initialModelSpecs: specs[i],
                hwAuditor: address(0),
                hwIntegrityPassed: false,
                hwReportHash: bytes32(0),
                swTechnician: address(0),
                osVersion: "",
                swValidationPassed: false,
                destinationSchoolHash: bytes32(0),
                studentIdHash: bytes32(0),
                distributionTimestamp: 0,
                currentState: State.FABRICADA,
                exists: true
            });

            allSerialNumbers.push(serials[i]);
            emit NetbookRegistered(serials[i], batches[i], msg.sender);
        }
    }

    function auditHardware(string calldata serial, bool passed, bytes32 reportHash) external {
        require(hasRole(AUDITOR_HW_ROLE, msg.sender), "Acceso denegado: rol requerido");
        Netbook storage nb = netbooks[serial];
        require(nb.exists, "Serial no valido");
        require(nb.currentState == State.FABRICADA, "Estado incorrecto para esta accion");

        nb.hwAuditor = msg.sender;
        nb.hwIntegrityPassed = passed;
        nb.hwReportHash = reportHash;
        nb.currentState = State.HW_APROBADO;

        emit HardwareAudited(serial, msg.sender, passed);
    }

    function validateSoftware(string calldata serial, string calldata osVersion, bool passed)
        external
    {
        require(hasRole(TECNICO_SW_ROLE, msg.sender), "Acceso denegado: rol requerido");
        Netbook storage nb = netbooks[serial];
        require(nb.exists, "Serial no valido");
        require(nb.currentState == State.HW_APROBADO, "Estado incorrecto para esta accion");

        nb.swTechnician = msg.sender;
        nb.osVersion = osVersion;
        nb.swValidationPassed = passed;
        nb.currentState = State.SW_VALIDADO;

        emit SoftwareValidated(serial, msg.sender, osVersion);
    }

    function assignToStudent(string calldata serial, bytes32 schoolHash, bytes32 studentHash)
        external
    {
        require(hasRole(ESCUELA_ROLE, msg.sender), "Acceso denegado: rol requerido");
        Netbook storage nb = netbooks[serial];
        require(nb.exists, "Serial no valido");
        require(nb.currentState == State.SW_VALIDADO, "Estado incorrecto para esta accion");

        nb.destinationSchoolHash = schoolHash;
        nb.studentIdHash = studentHash;
        nb.distributionTimestamp = block.timestamp;
        nb.currentState = State.DISTRIBUIDA;

        emit NetbookAssigned(serial, schoolHash, studentHash);
    }

    // --- Funciones de Lectura ---

    function getNetbookState(string calldata serial) external view returns (State) {
        require(netbooks[serial].exists, "Serial no valido");
        return netbooks[serial].currentState;
    }

    function getNetbookReport(string calldata serial) external view returns (Netbook memory) {
        require(netbooks[serial].exists, "Serial no valido");
        return netbooks[serial];
    }

    function getAllSerialNumbers() external view returns (string[] memory) {
        return allSerialNumbers;
    }

    function getAllMembers(bytes32 role) public view returns (address[] memory) {
        uint count = getRoleMemberCount(role);
        address[] memory members = new address[](count);

        for (uint i = 0; i < count; i++) {
            members[i] = getRoleMember(role, i);
        }

        return members;
    }

    function totalNetbooks() external view returns (uint) {
        return allSerialNumbers.length;
    }

    function getNetbooksByState(State state) external view returns (string[] memory) {
        uint count = 0;
        for (uint i = 0; i < allSerialNumbers.length; i++) {
            if (netbooks[allSerialNumbers[i]].currentState == state) {
                count++;
            }
        }

        string[] memory result = new string[](count);
        uint index = 0;
        for (uint i = 0; i < allSerialNumbers.length; i++) {
            if (netbooks[allSerialNumbers[i]].currentState == state) {
                result[index] = allSerialNumbers[i];
                index++;
            }
        }
        return result;
    }
}
