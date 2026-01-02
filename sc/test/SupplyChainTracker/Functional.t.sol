// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/SupplyChainTracker.sol";

contract FunctionalTest is Test {
    SupplyChainTracker public tracker;

    address public fabricante;
    address public auditor;
    address public tecnico;
    address public escuela;
    address public admin;

    string constant SERIAL_01 = "NB001";
    string constant BATCH = "LOT-2025-01";
    string constant SPECS = "Modelo X-256 RAM 4GB SSD 32GB";
    string constant OS_VERSION = "Linux Edu 5.1";
    bytes32 constant SCHOOL_HASH = 0x1234000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant STUDENT_HASH = 0x5678000000000000000000000000000000000000000000000000000000000000;
    bytes32 constant REPORT_HASH = 0x9abc000000000000000000000000000000000000000000000000000000000000;

    
    function setUp() public {
        tracker = new SupplyChainTracker();
        
        // Usar direcciones conocidas
        // Cuenta 0: Anvil Default Account (será admin por el constructor)
        // Cuenta 1: Fabricante
        // Cuenta 2: Auditor
        // Cuenta 3: Técnico
        // Cuenta 4: Escuela
        
        fabricante = address(uint160(1));
        auditor = address(uint160(2));
        tecnico = address(uint160(3));
        escuela = address(uint160(4));
        admin = address(this); // Usar la dirección del contrato de test como admin
        
        // Asegurar que las cuentas tengan saldo
        vm.deal(fabricante, 1 ether);
        vm.deal(auditor, 1 ether);
        vm.deal(tecnico, 1 ether);
        vm.deal(escuela, 1 ether);
        vm.deal(admin, 1 ether);
        
        // Otorgar roles (el admin ya tiene DEFAULT_ADMIN_ROLE por el constructor)
        vm.startPrank(admin);
        tracker.grantRole(tracker.FABRICANTE_ROLE(), fabricante);
        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), auditor);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), tecnico);
        tracker.grantRole(tracker.ESCUELA_ROLE(), escuela);
        vm.stopPrank();
        
        // Verificar que el admin tiene el rol correcto
        require(tracker.hasRole(tracker.DEFAULT_ADMIN_ROLE(), admin), "Admin should have DEFAULT_ADMIN_ROLE");
    }

    string constant REGISTER_METADATA = "{\"deviceType\":\"netbook\",\"manufacturer\":\"TechCorp\",\"warrantyPeriod\":\"2 years\"}";
    
    function test_01_RegisterNetbooks() public {
        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        string[] memory metadata = new string[](1);
        
        serials[0] = SERIAL_01;
        batches[0] = BATCH;
        specs[0] = SPECS;
        metadata[0] = REGISTER_METADATA;

        vm.prank(fabricante);
        tracker.registerNetbooks(serials, batches, specs, metadata);

        assertEq(uint(tracker.getNetbookState(SERIAL_01)), uint(SupplyChainTracker.State.FABRICADA));
        assertEq(tracker.getNetbookReport(SERIAL_01).batchId, BATCH);
        assertEq(tracker.getNetbookReport(SERIAL_01).initialModelSpecs, SPECS);
        
        // Verificar token y metadatos
        uint256 tokenId = tracker.getTokenId(SERIAL_01);
        assertEq(tracker.getSerialNumber(tokenId), SERIAL_01);
        assertEq(tracker.getTokenMetadata(tokenId), REGISTER_METADATA);
    }

    string constant HARDWARE_METADATA = "{\"cpu\":\"Intel i3\",\"ram\":\"4GB\",\"ssd\":\"128GB\",\"batteryHealth\":\"98%\",\"externalDevices\": [\"mouse\",\"keyboard\"]}";
    
    function test_02_AuditHardware_ValidTransition() public {
        test_01_RegisterNetbooks();

        vm.prank(auditor);
        tracker.auditHardware(SERIAL_01, true, REPORT_HASH, HARDWARE_METADATA);

        assertEq(
            uint(tracker.getNetbookState(SERIAL_01)), uint(SupplyChainTracker.State.HW_APROBADO)
        );
        assertEq(tracker.getNetbookReport(SERIAL_01).hwAuditor, auditor);
        assertEq(tracker.getNetbookReport(SERIAL_01).hwIntegrityPassed, true);
        assertEq(tracker.getNetbookReport(SERIAL_01).hwReportHash, REPORT_HASH);
        
        // Verificar actualización de metadatos
        uint256 tokenId = tracker.getTokenId(SERIAL_01);
        assertEq(tracker.getTokenMetadata(tokenId), HARDWARE_METADATA);
    }

    string constant SOFTWARE_METADATA = "{\"os\":\"Linux Edu\",\"kernel\":\"5.10\",\"installedApps\": [\"LibreOffice\",\"Firefox\",\"GIMP\"],\"securityPatchLevel\":\"2025-01-01\"}";
    
    function test_03_ValidateSoftware_ValidTransition() public {
        test_02_AuditHardware_ValidTransition();

        vm.prank(tecnico);
        tracker.validateSoftware(SERIAL_01, OS_VERSION, true, SOFTWARE_METADATA);

        assertEq(
            uint(tracker.getNetbookState(SERIAL_01)), uint(SupplyChainTracker.State.SW_VALIDADO)
        );
        assertEq(tracker.getNetbookReport(SERIAL_01).swTechnician, tecnico);
        assertEq(tracker.getNetbookReport(SERIAL_01).osVersion, OS_VERSION);
        assertEq(tracker.getNetbookReport(SERIAL_01).swValidationPassed, true);
        
        // Verificar actualización de metadatos
        uint256 tokenId = tracker.getTokenId(SERIAL_01);
        assertEq(tracker.getTokenMetadata(tokenId), SOFTWARE_METADATA);
    }

    string constant ASSIGNMENT_METADATA = "{\"school\":\"Escuela Secundaria #1\",\"grade\":\"10th\",\"assignedTeacher\":\"Ana Martinez\",\"expectedReturnDate\":\"2027-12-15\"}";
    
    function test_04_AssignToStudent_ValidTransition() public {
        test_03_ValidateSoftware_ValidTransition();

        vm.prank(escuela);
        tracker.assignToStudent(SERIAL_01, SCHOOL_HASH, STUDENT_HASH, ASSIGNMENT_METADATA);

        assertEq(
            uint(tracker.getNetbookState(SERIAL_01)), uint(SupplyChainTracker.State.DISTRIBUIDA)
        );
        assertEq(tracker.getNetbookReport(SERIAL_01).destinationSchoolHash, SCHOOL_HASH);
        assertEq(tracker.getNetbookReport(SERIAL_01).studentIdHash, STUDENT_HASH);
        assertTrue(tracker.getNetbookReport(SERIAL_01).distributionTimestamp > 0);
        
        // Verificar actualización de metadatos
        uint256 tokenId = tracker.getTokenId(SERIAL_01);
        assertEq(tracker.getTokenMetadata(tokenId), ASSIGNMENT_METADATA);
    }

}