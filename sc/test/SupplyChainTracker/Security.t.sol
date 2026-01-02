// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/SupplyChainTracker.sol";

contract SecurityTest is Test {
    SupplyChainTracker public tracker;

    address public fabricante;
    address public auditor;
    address public tecnico;
    address public escuela;
    address public admin;
    address public attacker;

    string constant SERIAL = "NB001";
    string constant BATCH = "LOT-2025-01";
    string constant SPECS = "Modelo X-256 RAM 4GB SSD 32GB";
    string constant OS_VERSION = "Linux Edu 5.1";
    bytes32 constant SCHOOL_HASH = 0x1234000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant STUDENT_HASH = 0x5678000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant REPORT_HASH = 0x9abc000000000000000000000000000000000000000000000000000000000000;
    string constant METADATA = "{}";

    function setUp() public {
        tracker = new SupplyChainTracker();

        // Asignar direcciones
        fabricante = address(uint160(1));
        auditor = address(uint160(2));
        tecnico = address(uint160(3));
        escuela = address(uint160(4));
        admin = address(this);
        attacker = address(uint160(5));

        // Asignar saldos
        vm.deal(admin, 1 ether);
        vm.deal(fabricante, 1 ether);
        vm.deal(auditor, 1 ether);
        vm.deal(tecnico, 1 ether);
        vm.deal(escuela, 1 ether);
        vm.deal(attacker, 1 ether);

        // Otorgar roles
        vm.startPrank(admin);
        tracker.grantRole(tracker.FABRICANTE_ROLE(), fabricante);
        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), auditor);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), tecnico);
        tracker.grantRole(tracker.ESCUELA_ROLE(), escuela);
        vm.stopPrank();
    }

    // ########## PRUEBAS DE ACCESO Y AUTORIZACIÓN ##########
    
    function test_01_AttackerCannotRegister() public {
        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        string[] memory metadata = new string[](1);

        serials[0] = SERIAL;
        batches[0] = BATCH;
        specs[0] = SPECS;
        metadata[0] = METADATA;

        vm.prank(attacker);
        vm.expectRevert("Access denied: FABRICANTE_ROLE required");
        tracker.registerNetbooks(serials, batches, specs, metadata);
    }

    function test_02_AttackerCannotAuditHardware() public {
        // Registrar una netbook restableciendo cualquier estado anterior
        vm.startPrank(fabricante);
        tracker.registerNetbooks(
            new string[](1),
            new string[](1),
            new string[](1),
            new string[](1)
        );
        vm.stopPrank();
        
        string[] memory serials = new string[](1);
        serials[0] = SERIAL;

        // El atacante intenta auditar el hardware
        vm.prank(attacker);
        vm.expectRevert("Access denied: AUDITOR_HW_ROLE required");
        tracker.auditHardware(SERIAL, true, REPORT_HASH, METADATA);
    }

    function test_03_AttackerCannotValidateSoftware() public {
        // Registrar una netbook
        vm.startPrank(fabricante);
        tracker.registerNetbooks(
            new string[](1),
            new string[](1),
            new string[](1),
            new string[](1)
        );

        // Auditar hardware
        vm.stopPrank();
        vm.startPrank(auditor);
        tracker.auditHardware(SERIAL, true, REPORT_HASH, METADATA);
        vm.stopPrank();

        // El atacante intenta validar software
        vm.prank(attacker);
        vm.expectRevert("Access denied: TECNICO_SW_ROLE required");
        tracker.validateSoftware(SERIAL, OS_VERSION, true, METADATA);
    }

    function test_04_AttackerCannotAssignToStudent() public {
        // Registrar una netbook
        vm.startPrank(fabricante);
        tracker.registerNetbooks(
            new string[](1),
            new string[](1),
            new string[](1),
            new string[](1)
        );

        // Auditar hardware
        tracker.auditHardware(SERIAL, true, REPORT_HASH, METADATA);
        vm.stopPrank();
        
        // Validar software
        vm.startPrank(tecnico);
        tracker.validateSoftware(SERIAL, OS_VERSION, true, METADATA);
        vm.stopPrank();
        
        // El atacante intenta asignar a un estudiante
        vm.prank(attacker);
        vm.expectRevert("Access denied: ESCUELA_ROLE required");
        tracker.assignToStudent(SERIAL, SCHOOL_HASH, STUDENT_HASH, METADATA);
    }

    // ########## PRUEBAS DE TRANSICIÓN DE ESTADOS ##########

    function test_11_CannotSkipState_Transition() public {
        // Registrar una netbook
        vm.startPrank(fabricante);
        tracker.registerNetbooks(
            new string[](1),
            new string[](1),
            new string[](1),
            new string[](1)
        );
        vm.stopPrank();
        
        // Intentar saltar al estado DISTRIBUIDA sin pasar por HW_APROBADO y SW_VALIDADO
        vm.start