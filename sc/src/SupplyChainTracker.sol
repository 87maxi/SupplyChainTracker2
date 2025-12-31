// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SupplyChainTracker is AccessControl {
    // Ensure Context is inherited for _msgSender() compatibility
    // This is automatically included via AccessControl, so no need to re-inherit

    using Strings for uint256;

    // Add helper function to map role names to role hashes
    function getRoleByName(string memory roleName) public pure returns (bytes32) {
        if (keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("FABRICANTE"))) {
            return FABRICANTE_ROLE;
        } else if (keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("AUDITOR_HW"))) {
            return AUDITOR_HW_ROLE;
        } else if (keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("TECNICO_SW"))) {
            return TECNICO_SW_ROLE;
        } else if (keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("ESCUELA"))) {
            return ESCUELA_ROLE;
        } else if (keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("ADMIN")) ||
                   keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("DEFAULT_ADMIN")) ||
                   keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("MANAGER")) ||
                   keccak256(abi.encodePacked(roleName)) == keccak256(abi.encodePacked("OWNER"))) {
            return DEFAULT_ADMIN_ROLE;
        } else {
            revert("SupplyChainTracker: Invalid role type");
        }
    }

    // Estados definidos
    enum NetbookState {
        FABRICADA,
        HW_APROBADO,
        SW_VALIDADO,
        DISTRIBUIDA
    }

    // Estructura de datos para cada netbook
    struct NetbookData {
        string serialNumber;
        string batchId;
        string initialModelSpecs;
        address hwAuditor;
        bool hwIntegrityPassed;
        bytes32 hwReportHash;
        address swTechnician;
        string osVersion;
        bool swValidationPassed;
        bytes32 destinationSchoolHash;
        bytes32 studentIdHash;
        uint256 distributionTimestamp;
        NetbookState state;
    }

    // Mapeo de hash de serialNumber -> datos de la netbook
    mapping(bytes32 => NetbookData) public netbooks;

    // Roles definidos
    bytes32 public constant FABRICANTE_ROLE = keccak256("FABRICANTE_ROLE");
    bytes32 public constant AUDITOR_HW_ROLE = keccak256("AUDITOR_HW_ROLE");
    bytes32 public constant TECNICO_SW_ROLE = keccak256("TECNICO_SW_ROLE");
    bytes32 public constant ESCUELA_ROLE = keccak256("ESCUELA_ROLE");

    // Eventos para trazabilidad
    event NetbookRegistered(
        bytes32 indexed hash,
        string serialNumber,
        string batchId,
        string initialModelSpecs
    );

    event HardwareAudited(
        bytes32 indexed hash,
        address auditor,
        bool passed,
        bytes32 reportHash
    );

    event SoftwareValidated(
        bytes32 indexed hash,
        address technician,
        string osVersion,
        bool passed
    );

    event AssignedToStudent(
        bytes32 indexed hash,
        bytes32 schoolHash,
        bytes32 studentHash,
        uint256 timestamp
    );

    // Constructor: asigna DEFAULT_ADMIN_ROLE a la dirección del creador
    constructor() {
        // AccessControl's constructor already sets DEFAULT_ADMIN_ROLE as admin of itself
        // We only need to grant it to the deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Función para registrar una nueva netbook (solo FABRICANTE_ROLE)
    function setData(bytes32 serialHash, string memory data) external {
        require(hasRole(FABRICANTE_ROLE, msg.sender), "SupplyChainTracker: Not fabricante");
        require(netbooks[serialHash].state == NetbookState.FABRICADA, "Netbook must be FABRICADA to set data");
        netbooks[serialHash].serialNumber = data;
        netbooks[serialHash].state = NetbookState.FABRICADA;
        emit NetbookRegistered(serialHash, data, "", "");
    }

    function registerNetbooks(
        string memory serialNumber,
        string memory batchId,
        string memory initialModelSpecs
    ) external onlyRole(FABRICANTE_ROLE) {
        bytes32 hash = keccak256(abi.encodePacked(serialNumber));

        require(netbooks[hash].state == NetbookState.FABRICADA, "Netbook already registered");

        netbooks[hash] = NetbookData({
            serialNumber: serialNumber,
            batchId: batchId,
            initialModelSpecs: initialModelSpecs,
            hwAuditor: address(0),
            hwIntegrityPassed: false,
            hwReportHash: bytes32(0),
            swTechnician: address(0),
            osVersion: "",
            swValidationPassed: false,
            destinationSchoolHash: bytes32(0),
            studentIdHash: bytes32(0),
            distributionTimestamp: 0,
            state: NetbookState.FABRICADA
        });

        emit NetbookRegistered(hash, serialNumber, batchId, initialModelSpecs);
    }

    // Función para auditar hardware (solo AUDITOR_HW_ROLE, estado FABRICADA)
    function approveHardware(bytes32 serialHash) external {
        require(
            hasRole(FABRICANTE_ROLE, msg.sender) || hasRole(AUDITOR_HW_ROLE, msg.sender),
            "SupplyChainTracker: Not fabricante or auditorHW"
        );
        NetbookData storage netbook = netbooks[serialHash];
        require(netbook.state == NetbookState.FABRICADA, "Invalid state: must be FABRICADA");
        netbook.state = NetbookState.HW_APROBADO;
        emit HardwareAudited(serialHash, msg.sender, true, keccak256("approved"));
    }

    // Función para validar software (solo TECNICO_SW_ROLE, estado HW_APROBADO)
    function validateSoftware(bytes32 serialHash) external {
        require(hasRole(TECNICO_SW_ROLE, msg.sender), "SupplyChainTracker: Not tecnicoSW");
        NetbookData storage netbook = netbooks[serialHash];
        require(netbook.state == NetbookState.HW_APROBADO, "Invalid state: must be HW_APROBADO");
        netbook.state = NetbookState.SW_VALIDADO;
        emit SoftwareValidated(serialHash, msg.sender, "", true);
    }

    // Función para asignar a estudiante (solo ESCUELA_ROLE, estado SW_VALIDADO)
    function distribute(bytes32 serialHash) external {
        require(hasRole(ESCUELA_ROLE, msg.sender), "SupplyChainTracker: Not escuela");
        NetbookData storage netbook = netbooks[serialHash];
        require(netbook.state == NetbookState.SW_VALIDADO, "Invalid state: must be SW_VALIDADO");
        netbook.state = NetbookState.DISTRIBUIDA;
        emit AssignedToStudent(serialHash, bytes32(0), bytes32(0), block.timestamp);
    }

    // Función pública para obtener datos completos por hash
    function getData(bytes32 hash) public view returns (
        string memory serialNumber,
        string memory batchId,
        string memory initialModelSpecs,
        address hwAuditor,
        bool hwIntegrityPassed,
        bytes32 hwReportHash,
        address swTechnician,
        string memory osVersion,
        bool swValidationPassed,
        bytes32 destinationSchoolHash,
        bytes32 studentIdHash,
        uint256 distributionTimestamp,
        NetbookState state
    ) {
        NetbookData storage netbook = netbooks[hash];
        return (
            netbook.serialNumber,
            netbook.batchId,
            netbook.initialModelSpecs,
            netbook.hwAuditor,
            netbook.hwIntegrityPassed,
            netbook.hwReportHash,
            netbook.swTechnician,
            netbook.osVersion,
            netbook.swValidationPassed,
            netbook.destinationSchoolHash,
            netbook.studentIdHash,
            netbook.distributionTimestamp,
            netbook.state
        );
    }

    // Función pública para obtener solo el estado por hash
    function getDataState(bytes32 hash) public view returns (NetbookState) {
        return netbooks[hash].state;
    }
}
