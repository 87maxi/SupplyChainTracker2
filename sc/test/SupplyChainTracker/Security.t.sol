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
    address public unauthorized;

    string constant SERIAL_01 = "NB001";
    string constant BATCH = "LOT-2025-01";
    string constant SPECS = "Modelo X-256 RAM 4GB SSD 32GB";
    string constant OS_VERSION = "Linux Edu 5.1";
    bytes32 constant SCHOOL_HASH = 0x1234000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant STUDENT_HASH = 0x5678000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant REPORT_HASH = 0x9abc000000000000000000000000000000000000000000000000000000000000;
    string constant REGISTER_METADATA = "{}";
    string constant HARDWARE_METADATA = "{}";
    string constant SOFTWARE_METADATA = "{}";
    string constant ASSIGNMENT_METADATA = "{}";

    function setUp() public {
        tracker = new SupplyChainTracker();
        
        // Usar direcciones conocidas
        fabricante = address(uint160(2));
        auditor = address(uint160(3));
        tecnico = address(uint160(4));
        escuela = address(uint160(5));
        admin = address(uint160(6));
        unauthorized = address(uint160(10));
        
        // Asegurar que las cuentas tengan saldo
        vm.deal(fabricante, 1 ether);
        vm.deal(auditor, 1 ether);
        vm.deal(tecnico, 1 ether);
        vm.deal(escuela, 1 ether);
        vm.deal(admin, 1 ether);
        vm.deal(unauthorized, 1 ether);
        
        // Otorgar roles
        // La cuenta que despliega el contrato (address(this)) tiene DEFAULT_ADMIN_ROLE
        vm.startPrank(address(this));
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), admin);
        tracker.grantRole(tracker.FABRICANTE_ROLE(), fabricante);
        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), auditor);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), tecnico);
        tracker.grantRole(tracker.ESCUELA_ROLE(), escuela);
        vm.stopPrank();
    }

    // --- Access Control Tests ---

    function test_accessControl_cannotGrantRoleWithoutAdmin() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        tracker.grantRole(tracker.FABRICANTE_ROLE(), unauthorized);
    }

    function test_accessControl_cannotRevokeRoleWithoutAdmin() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        tracker.revokeRole(tracker.FABRICANTE_ROLE(), fabricante);
    }

    function test_accessControl_cannotRegisterWithoutFabricanteRole() public {
        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        string[] memory metadata = new string[](1);
        
        serials[0] = SERIAL_01;
        batches[0] = BATCH;
        specs[0] = SPECS;
        metadata[0] = REGISTER_METADATA;

        vm.prank(unauthorized);
        vm.expectRevert("Access denied: FABRICANTE_ROLE required");
        tracker.registerNetbooks(serials, batches, specs, metadata);
    }

    function test_accessControl_cannotAuditWithoutAuditorRole() public {
        // Primero registrar el netbook
        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        string[] memory metadata = new string[](1);
        
        serials[0] = SERIAL_01;
        batches[0]