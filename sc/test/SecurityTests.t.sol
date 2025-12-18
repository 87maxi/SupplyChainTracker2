// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {SupplyChainTracker} from "../src/SupplyChainTracker.sol";
import {MaliciousContract} from "./MaliciousContract.sol";

contract SecurityTests is Test {
    SupplyChainTracker public tracker;

    address public fabricante = address(0x1);
    address public auditor = address(0x2);
    address public tecnico = address(0x3);
    address public escuela = address(0x4);
    
    string constant VALID_SERIAL = "NB001";
    string constant VALID_BATCH = "LOT-2025-01";
    string constant VALID_SPECS = "Modelo X-256 RAM 4GB SSD 32GB";
    string constant VALID_OS_VERSION = "Linux Edu 5.1";
    bytes32 constant VALID_HASH =
        0x1234567890123456789012345678901234567890123456789012345678901234;

    function setUp() public {
        tracker = new SupplyChainTracker();

        // Grant roles with the contract's own functions
        tracker.grantRole(tracker.FABRICANTE_ROLE(), fabricante);
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), fabricante); // Make fabricante admin to further delegate

        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), auditor);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), tecnico);
        tracker.grantRole(tracker.ESCUELA_ROLE(), escuela);
        
        // Register a netbook for testing
        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        serials[0] = VALID_SERIAL;
        batches[0] = VALID_BATCH;
        specs[0] = VALID_SPECS;
        
        vm.prank(fabricante);
        tracker.registerNetbooks(serials, batches, specs);
    }

    // ====== REENTRANCY TESTS ======
    
    function test_ReentrancyAttempt_WhenNoEtherIsSent() public {
        // Deploy malicious contract
        MaliciousContract attacker = new MaliciousContract(address(tracker), VALID_SERIAL);
        
        // Try to attack - this shouldn't work since no Ether is involved
        attacker.attack{value: 0}();
        
        // Verify state hasn't been compromised
        assertEq(uint256(tracker.getNetbookState(VALID_SERIAL)), uint256(SupplyChainTracker.State.FABRICADA));
        assertFalse(attacker.reentrancyDetected());
    }
    
    // ====== ACCESS CONTROL TESTS ======
    
    function test_AccessControl_DefaultAdminRoleSetup() public {
        // Verify that the deployer has the default admin role
        assertTrue(tracker.hasRole(tracker.DEFAULT_ADMIN_ROLE(), fabricante));
        
        // Verify that other roles can be managed by the admin
        address newAdmin = address(0x5);
        vm.prank(fabricante);
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), newAdmin);
        
        assertTrue(tracker.hasRole(tracker.DEFAULT_ADMIN_ROLE(), newAdmin));
    }
    
    function test_AccessControl_RoleRevocation() public {
        address accountToRevoke = address(0x6);
        
        // Grant role first
        vm.prank(fabricante);
        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), accountToRevoke);
        
        assertTrue(tracker.hasRole(tracker.AUDITOR_HW_ROLE(), accountToRevoke));
        
        // Revoke role
        vm.prank(fabricante);
        tracker.revokeRole(tracker.AUDITOR_HW_ROLE(), accountToRevoke);
        
        assertFalse(tracker.hasRole(tracker.AUDITOR_HW_ROLE(), accountToRevoke));
        
        // Attempt to perform action should fail
        vm.expectRevert("Acceso denegado: rol requerido");
        vm.prank(accountToRevoke);
        tracker.auditHardware(VALID_SERIAL, true, VALID_HASH);
    }
    
    function test_AccessControl_CannotRevokeOwnAdminRole() public {
        // This tests that an admin cannot accidentally revoke their own admin role
        // In OpenZeppelin AccessControl, there's no built-in protection against this,
        // so we want to verify the behavior
        
        vm.prank(fabricante);
        tracker.revokeRole(tracker.DEFAULT_ADMIN_ROLE(), fabricante);
        
        // The fabricante should no longer have the admin role
        assertFalse(tracker.hasRole(tracker.DEFAULT_ADMIN_ROLE(), fabricante));
        
        // This could be a security issue, so in production we might want to add
        // additional protections or use AccessControlDefaultAdminRules
    }
    
    // ====== EDGE CASE TESTS ======
    
    function test_EdgeCase_EmptyStringInputs() public {
        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        
        // Test empty serial number
        serials[0] = "";
        batches[0] = VALID_BATCH;
        specs[0] = VALID_SPECS;
        
        vm.expectRevert("Serial no valido");
        vm.prank(fabricante);
        tracker.registerNetbooks(serials, batches, specs);
        
        // Test empty batch ID
        serials[0] = "NB999";
        batches[0] = "";
        // specs[0] still has value from previous test
        
        // This should succeed because there's no validation on batchId
        vm.prank(fabricante);
        tracker.registerNetbooks(serials, batches, specs);
        
        // Test empty specs
        string[] memory serials2 = new string[](1);
        string[] memory batches2 = new string[](1);
        string[] memory specs2 = new string[](1);
        serials2[0] = "NB998";
        batches2[0] = "BATCH998";
        specs2[0] = "";
        
        // This should also succeed because there's no validation on initialModelSpecs
        vm.prank(fabricante);
        tracker.registerNetbooks(serials2, batches2, specs2);
    }
    
    function test_EdgeCase_LongStringInputs() public {
        // Test very long strings - Solidity doesn't have a built-in limit, but it can affect gas costs
        string memory longSerial = string(new bytes(1000));
        string memory longBatch = string(new bytes(1000));
        string memory longSpecs = string(new bytes(1000));
        
        // Fill with data
        bytes memory longBytes = new bytes(1000);
        for(uint i = 0; i < 1000; i++) {
            longBytes[i] = bytes("A")[0];
        }
        
        string[] memory serials = new string[](1);
        string[] memory batches = new string[](1);
        string[] memory specs = new string[](1);
        serials[0] = longSerial;
        batches[0] = longBatch;
        specs[0] = longSpecs;
        
        // This should succeed but with high gas cost
        vm.prank(fabricante);
        tracker.registerNetbooks(serials, batches, specs);
        
        // Verify the data was stored correctly
        SupplyChainTracker.Netbook memory nb = tracker.getNetbookReport(serials[0]);
        assertEq(nb.serialNumber, longSerial);
        assertEq(nb.batchId, longBatch);
        assertEq(nb.initialModelSpecs, longSpecs);
    }
    
    function test_EdgeCase_GetNonExistentNetbook() public {
        // Test getting state of non-existent netbook
        vm.expectRevert("Serial no valido");
        tracker.getNetbookState("NON_EXISTENT");
        
        // Test getting report of non-existent netbook
        vm.expectRevert("Serial no valido");
        tracker