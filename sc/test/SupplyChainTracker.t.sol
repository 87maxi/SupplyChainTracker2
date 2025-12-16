// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {SupplyChainTracker} from "../src/SupplyChainTracker.sol";

contract SupplyChainTrackerTest is Test {
    SupplyChainTracker public tracker;

    address fabricante = address(0x1);
    address auditor = address(0x2);
    address tecnico = address(0x3);
    address escuela = address(0x4);

    string constant SERIAL_01 = "NB001";
    string constant SERIAL_02 = "NB002";
    string constant BATCH = "LOT-2025-01";
    string constant SPECS = "Modelo X-256 RAM 4GB SSD 32GB";
    string constant OS_VERSION = "Linux Edu 5.1";
    bytes32 constant SCHOOL_HASH =
        0x1234000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant STUDENT_HASH =
        0x5678000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant REPORT_HASH =
        0x9abc000000000000000000000000000000000000000000000000000000000000;

    function setUp() public {
        tracker = new SupplyChainTracker();

        // Grant roles with the contract's own functions
        tracker.grantRole(tracker.FABRICANTE_ROLE(), fabricante);
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), fabricante); // Make fabricante admin to further delegate

        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), auditor);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), tecnico);
        tracker.grantRole(tracker.ESCUELA_ROLE(), escuela);
    }

    function test_RegisterNetbooks() public {
        string[] memory serials = new string[](2);
        string[] memory batches = new string[](2);
        string[] memory specs = new string[](2);
        serials[0] = SERIAL_01;
        serials[1] = SERIAL_02;
        batches[0] = BATCH;
        batches[1] = BATCH;
        specs[0] = SPECS;
        specs[1] = SPECS;

        vm.prank(fabricante);
        tracker.registerNetbooks(serials, batches, specs);

        assertEq(uint256(tracker.getNetbookState(SERIAL_01)), uint256(SupplyChainTracker.State.FABRICADA));
        assertEq(tracker.getNetbookReport(SERIAL_01).batchId, BATCH);
        assertEq(tracker.getNetbookReport(SERIAL_01).initialModelSpecs, SPECS);
    }

    function test_AuditHardware_ValidTransition() public {
        test_RegisterNetbooks();

        vm.prank(auditor);
        tracker.auditHardware(SERIAL_01, true, REPORT_HASH);

        assertEq(uint256(tracker.getNetbookState(SERIAL_01)), uint256(SupplyChainTracker.State.HW_APROBADO));
        assertEq(tracker.getNetbookReport(SERIAL_01).hwAuditor, auditor);
        assertEq(tracker.getNetbookReport(SERIAL_01).hwIntegrityPassed, true);
        assertEq(tracker.getNetbookReport(SERIAL_01).hwReportHash, REPORT_HASH);
    }

    function test_AuditHardware_InvalidState_Reverts() public {
        test_AuditHardware_ValidTransition(); // Lleva a HW_APROBADO

        vm.expectRevert("Estado incorrecto para esta accion");
        vm.prank(auditor);
        tracker.auditHardware(SERIAL_01, true, REPORT_HASH);
    }

    function test_ValidateSoftware_ValidTransition() public {
        test_AuditHardware_ValidTransition();

        vm.prank(tecnico);
        tracker.validateSoftware(SERIAL_01, OS_VERSION, true);

        assertEq(uint256(tracker.getNetbookState(SERIAL_01)), uint256(SupplyChainTracker.State.SW_VALIDADO));
        assertEq(tracker.getNetbookReport(SERIAL_01).swTechnician, tecnico);
        assertEq(tracker.getNetbookReport(SERIAL_01).osVersion, OS_VERSION);
        assertEq(tracker.getNetbookReport(SERIAL_01).swValidationPassed, true);
    }

    function test_AssignToStudent_ValidTransition() public {
        test_ValidateSoftware_ValidTransition();

        vm.prank(escuela);
        tracker.assignToStudent(SERIAL_01, SCHOOL_HASH, STUDENT_HASH);

        assertEq(uint256(tracker.getNetbookState(SERIAL_01)), uint256(SupplyChainTracker.State.DISTRIBUIDA));
        assertEq(tracker.getNetbookReport(SERIAL_01).destinationSchoolHash, SCHOOL_HASH);
        assertEq(tracker.getNetbookReport(SERIAL_01).studentIdHash, STUDENT_HASH);
        assertEq(tracker.getNetbookReport(SERIAL_01).distributionTimestamp, block.timestamp);
    }

    function test_OnlyAuthorizedRolesCanPerformActions() public {
        test_RegisterNetbooks();

        // Intentar auditoría desde una dirección no autorizada
        vm.expectRevert("Acceso denegado: rol requerido");
        vm.prank(address(0x5));
        tracker.auditHardware(SERIAL_01, true, REPORT_HASH);
    }

    function test_RegisterDuplicateSerial_Reverts() public {
        test_RegisterNetbooks();

        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        serials[0] = SERIAL_01;
        batches[0] = BATCH;
        specs[0] = SPECS;

        vm.expectRevert();
        vm.prank(fabricante);
        tracker.registerNetbooks(serials, batches, specs);
    }
}
