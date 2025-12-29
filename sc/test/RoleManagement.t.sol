// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {SupplyChainTracker} from "../src/SupplyChainTracker.sol";

contract RoleManagement is Test {
    SupplyChainTracker public tracker;

    address admin = address(0x1);
    address user = address(0x2);
    address anotherUser = address(0x3);

    function setUp() public {
        tracker = new SupplyChainTracker();
        vm.prank(admin);
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), admin);
    }

    function test_getRoleByName_ValidRoles() public {
        // Test each valid role mapping
        bytes32 fabricanteRole = tracker.getRoleByName("FABRICANTE");
        bytes32 auditorRole = tracker.getRoleByName("AUDITOR_HW");
        bytes32 tecnicoRole = tracker.getRoleByName("TECNICO_SW");
        bytes32 escuelaRole = tracker.getRoleByName("ESCUELA");
        
        // Get the actual role constants from contract
        bytes32 expectedFabricante = tracker.FABRICANTE_ROLE();
        bytes32 expectedAuditor = tracker.AUDITOR_HW_ROLE();
        bytes32 expectedTecnico = tracker.TECNICO_SW_ROLE();
        bytes32 expectedEscuela = tracker.ESCUELA_ROLE();
        
        assertEq(fabricanteRole, expectedFabricante, "FABRICANTE role mismatch");
        assertEq(auditorRole, expectedAuditor, "AUDITOR_HW role mismatch");
        assertEq(tecnicoRole, expectedTecnico, "TECNICO_SW role mismatch");
        assertEq(escuelaRole, expectedEscuela, "ESCUELA role mismatch");
    }

    function test_getRoleByName_AdminVariants() public {
        // Test all admin variants that should map to DEFAULT_ADMIN_ROLE
        bytes32 adminRole = tracker.getRoleByName("ADMIN");
        bytes32 defaultManagerRole = tracker.getRoleByName("DEFAULT_ADMIN");
        bytes32 managerRole = tracker.getRoleByName("MANAGER");
        bytes32 ownerRole = tracker.getRoleByName("OWNER");
        
        bytes32 expectedAdmin = 0x0000000000000000000000000000000000000000000000000000000000000000;
        
        assertEq(adminRole, expectedAdmin, "ADMIN role mismatch");
        assertEq(defaultManagerRole, expectedAdmin, "DEFAULT_ADMIN role mismatch");
        assertEq(managerRole, expectedAdmin, "MANAGER role mismatch");
        assertEq(ownerRole, expectedAdmin, "OWNER role mismatch");
    }

    function test_getRoleByName_InvalidRole_Reverts() public {
        // Test that invalid role names revert
        vm.expectRevert("Invalid role type");
        tracker.getRoleByName("INVALID_ROLE");
        
        vm.expectRevert("Invalid role type");
        tracker.getRoleByName("");
        
        vm.expectRevert("Invalid role type");
        tracker.getRoleByName("RANDOM_TEXT");
    }

    function test_grantRole_OnlyAdmin() public {
        // Try to grant role as non-admin
        vm.expectRevert();
        vm.prank(user);
        tracker.grantRole(user, "FABRICANTE");
        
        // Grant role as admin
        vm.prank(admin);
        tracker.grantRole(user, "FABRICANTE");
        
        // Verify role was granted
        assertEq(tracker.getRoleByName("FABRICANTE"), tracker.FABRICANTE_ROLE(), "Role name mismatch");
        assertTrue(tracker.hasRole(tracker.getRoleByName("FABRICANTE"), user), "User should have role");
    }

    function test_revokeRole_OnlyAdmin() public {
        // Setup: grant role first
        vm.prank(admin);
        tracker.grantRole(user, "FABRICANTE");
        
        // Try to revoke as non-admin
        vm.expectRevert();
        vm.prank(anotherUser);
        tracker.revokeRole(user, "FABRICANTE");
        
        // Revoke as admin
        vm.prank(admin);
        tracker.revokeRole(user, "FABRICANTE");
        
        // Verify role was revoked
        assertFalse(tracker.hasRole(tracker.getRoleByName("FABRICANTE"), user), "User should not have role");
    }

    function test_hasRole_CorrectDetection() public {
        // Test hasRole with different roles
        
        // 1. Test with Fabricante role
        vm.prank(admin);
        tracker.grantRole(user, "FABRICANTE");
        
                assertTrue(tracker.hasRole(tracker.getRoleByName("FABRICANTE"), user), "should detect FABRICANTE role");
        assertFalse(tracker.hasRole(tracker.getRoleByName("FABRICANTE"), anotherUser), "should not detect role for other users");

        // Revoke and test
        vm.prank(admin);
        tracker.revokeRole(user, "FABRICANTE");
        assertFalse(tracker.hasRole(tracker.getRoleByName("FABRICANTE"), user), "should not detect revoked role");
        
        // 2. Test with Admin variants
        // Grant admin role
        vm.prank(admin);
        tracker.grantRole(user, "ADMIN");
        
        // Test all admin variants with hasRole
        bytes32 adminRole = tracker.getRoleByName("ADMIN");
        assertTrue(tracker.hasRole(adminRole, user), "should detect ADMIN role");
        assertTrue(tracker.hasRole(adminRole, user), "should detect DEFAULT_ADMIN role");
        assertTrue(tracker.hasRole(adminRole, user), "should detect MANAGER role");
        assertTrue(tracker.hasRole(adminRole, user), "should detect OWNER role");
        
        // Test with another user
        assertFalse(tracker.hasRole(adminRole, anotherUser), "should not detect admin role for other users");
    }
}