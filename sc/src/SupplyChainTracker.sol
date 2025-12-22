// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControlEnumerable} from "openzeppelin-contracts/contracts/access/extensions/AccessControlEnumerable.sol";

contract SupplyChainTracker is AccessControlEnumerable {
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
        uint256 distributionTimestamp;

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
    
    function name() external pure returns (string memory) {
        return "SupplyChainTracker";
    }
    
    function symbol() external pure returns (string memory) {
        return "SCT";
    }
    
    function decimals() external pure returns (uint8) {
        return 0; // No es un token, por lo que no tiene decimales
    }
    
    function totalSupply() external pure returns (uint256) {
        return 0; // No es un token, por lo que no tiene suministro
    }
    
    function balanceOf(address) external pure returns (uint256) {
        return 0; // No es un token, por lo que no tiene balances
    }
    
    function transfer(address, uint256) external pure returns (bool) {
        return false; // No es un token, por lo que no permite transferencias
    }
    
    function allowance(address, address) external pure returns (uint256) {
        return 0; // No es un token, por lo que no tiene allowances
    }
    
    function approve(address, uint256) external pure returns (bool) {
        return false; // No es un token, por lo que no permite aprobaciones
    }
    
    function transferFrom(address, address, uint256) external pure returns (bool) {
        return false; // No es un token, por lo que no permite transferencias
    }

    // --- Funciones de Escritura ---

    function registerNetbooks(
        string[] calldata serials,
        string[] calldata batches,
        string[] calldata specs
    ) external {
        require(hasRole(FABRICANTE_ROLE, msg.sender), "Acceso denegado: rol requerido");
        require(serials.length == batches.length && serials.length == specs.length, "Longitud de arrays no coincide");
        
        for (uint256 i = 0; i < serials.length; i++) {
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

    function auditHardware(
        string calldata serial,
        bool passed,
        bytes32 reportHash
    ) external {
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

    function validateSoftware(
        string calldata serial,
        string calldata osVersion,
        bool passed
    ) external {
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

    function assignToStudent(
        string calldata serial,
        bytes32 schoolHash,
        bytes32 studentHash
    ) external {
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
        uint256 count = getRoleMemberCount(role);
        address[] memory members = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            members[i] = getRoleMember(role, i);
        }
        
        return members;
    }

    function totalNetbooks() external view returns (uint256) {
        return allSerialNumbers.length;
    }

    function getNetbooksByState(State state) external view returns (string[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allSerialNumbers.length; i++) {
            if (netbooks[allSerialNumbers[i]].currentState == state) {
                count++;
            }
        }
        
        string[] memory result = new string[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allSerialNumbers.length; i++) {
            if (netbooks[allSerialNumbers[i]].currentState == state) {
                result[index] = allSerialNumbers[i];
                index++;
            }
        }
        return result;
    }

}