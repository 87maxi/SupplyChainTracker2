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

    // --- Eventos ---
    event NetbookRegistered(string serialNumber);
    event HardwareAudited(string serialNumber);
    event SoftwareValidated(string serialNumber);
    event AssignedToStudent(string serialNumber);

    // --- Modificadores ---
    // The onlyRole modifier from AccessControl is not virtual in v4, so we cannot override it.
    // Instead, we use the _checkRole internal function provided by AccessControl.
    function _checkRoleCustom(bytes32 role) internal view {
        if (!hasRole(role, msg.sender)) {
            revert("Acceso denegado: rol requerido");
        }
    }

    modifier validSerial(string memory serial) {
        _validSerial(serial);
        _;
    }

    function _validSerial(string memory serial) internal pure {
        require(bytes(serial).length > 0, "Serial no valido");
    }

    modifier stateExpected(string memory serial, State expectedState) {
        _stateExpected(serial, expectedState);
        _;
    }

    function _stateExpected(string memory serial, State expectedState) internal view {
        require(
            netbooks[serial].currentState == expectedState, "Estado incorrecto para esta accion"
        );
    }

    // --- Constructor ---
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // --- Funciones de Escritura (Privilegiadas) ---

    function registerNetbooks(
        string[] memory serials,
        string[] memory batches,
        string[] memory modelSpecs
    ) external {
        _checkRoleCustom(FABRICANTE_ROLE);
        require(
            serials.length == batches.length && batches.length == modelSpecs.length,
            "Arrays de longitud incompatible"
        );

        for (uint i = 0; i < serials.length; i++) {
            string memory serial = serials[i];
            require(bytes(netbooks[serial].serialNumber).length == 0, "Netbook ya registrada: ");

            netbooks[serial] = Netbook({
                serialNumber: serial,
                batchId: batches[i],
                initialModelSpecs: modelSpecs[i],
                hwAuditor: address(0),
                hwIntegrityPassed: false,
                hwReportHash: bytes32(0),
                swTechnician: address(0),
                osVersion: "",
                swValidationPassed: false,
                destinationSchoolHash: bytes32(0),
                studentIdHash: bytes32(0),
                distributionTimestamp: 0,
                currentState: State.FABRICADA
            });
            allSerialNumbers.push(serial);
            emit NetbookRegistered(serial);
        }
    }

        function auditHardware(
        string memory serial,
        bool passed,
        bytes32 reportHash
    ) external validSerial(serial) stateExpected(serial, State.FABRICADA) {
        _checkRoleCustom(AUDITOR_HW_ROLE);
        Netbook storage nb = netbooks[serial];
        nb.hwAuditor = msg.sender;
        nb.hwIntegrityPassed = passed;
        nb.hwReportHash = reportHash;
        nb.currentState = State.HW_APROBADO;

        emit HardwareAudited(serial);
    }

        function validateSoftware(
        string memory serial,
        string memory version,
        bool passed
    ) external validSerial(serial) stateExpected(serial, State.HW_APROBADO) {
        _checkRoleCustom(TECNICO_SW_ROLE);
        Netbook storage nb = netbooks[serial];
        nb.swTechnician = msg.sender;
        nb.osVersion = version;
        nb.swValidationPassed = passed;
        nb.currentState = State.SW_VALIDADO;

        emit SoftwareValidated(serial);
    }

        function assignToStudent(
        string memory serial,
        bytes32 schoolHash,
        bytes32 studentHash
    ) external validSerial(serial) stateExpected(serial, State.SW_VALIDADO) {
        _checkRoleCustom(ESCUELA_ROLE);
        Netbook storage nb = netbooks[serial];
        nb.destinationSchoolHash = schoolHash;
        nb.studentIdHash = studentHash;
        nb.distributionTimestamp = block.timestamp;
        nb.currentState = State.DISTRIBUIDA;

        emit AssignedToStudent(serial);
    }

    // --- Funciones de Lectura (Públicas) ---

    function getNetbookState(string memory serial)
        external
        view
        validSerial(serial)
        returns (State)
    {
        return netbooks[serial].currentState;
    }

    function getNetbookReport(string memory serial)
        external
        view
        validSerial(serial)
        returns (Netbook memory)
    {
        return netbooks[serial];
    }

    // --- Soporte ERC165 ---
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
