// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SupplyChainTracker.sol";

contract SupplyChainTrackerTest is Test {
    // Referencia al contrato
    SupplyChainTracker public supplyChain;

    // Direcciones de prueba
    address public fabricante = makeAddr("fabricante");
    address public auditorHW = makeAddr("auditorHW");
    address public tecnicoSW = makeAddr("tecnicoSW");
    address public escuela = makeAddr("escuela");

    bytes32 public serial = keccak256("serial-001");

    function setUp() public {
        supplyChain = new SupplyChainTracker();
        
        // Grant roles
        supplyChain.grantRole(supplyChain.FABRICANTE_ROLE(), fabricante);
        supplyChain.grantRole(supplyChain.AUDITOR_HW_ROLE(), auditorHW);
        supplyChain.grantRole(supplyChain.TECNICO_SW_ROLE(), tecnicoSW);
        supplyChain.grantRole(supplyChain.ESCUELA_ROLE(), escuela);
    }

    // Helper interno para comparar strings sin errores de tipo
    function assertEqString(string memory a, string memory b) internal pure {
        assertEq(keccak256(bytes(a)), keccak256(bytes(b)));
    }

    function testInitialStates() public {
        // SOLUCIÓN AL ERROR: Acceder al struct mediante la instancia del contrato
        // o usar directamente los valores devueltos si es una tupla.
        // Si el struct es público en el contrato, se accede así:
        (string memory serialNumber, , , , , , , , , , , , ) = supplyChain.getData(serial);
        
        assertEq(uint256(supplyChain.getDataState(serial)), 0);
        assertEqString(serialNumber, "serial-001");
    }

    function testFabricanteCanSetData() public {
        vm.startPrank(fabricante);
        supplyChain.setData(serial, "data-001");
        vm.stopPrank();

        (string memory serialNumber, , , , , , , , , , , , ) = supplyChain.getData(serial);
        assertEq(uint256(supplyChain.getDataState(serial)), 0);
        assertEqString(serialNumber, "data-001");
    }

    function testNonFabricanteCannotSetData() public {
        vm.startPrank(auditorHW);
        // Usamos un revert genérico si no estamos seguros del string exacto del error
        vm.expectRevert(); 
        supplyChain.setData(serial, "data-001");
        vm.stopPrank();
    }

    function testFabricanteCanApproveHW() public {
        vm.startPrank(fabricante);
        supplyChain.setData(serial, "data-001");
        supplyChain.approveHardware(serial);
        vm.stopPrank();

        assertEq(uint256(supplyChain.getDataState(serial)), 1);
    }

    function testAuditorHWCanApproveHW() public {
        vm.startPrank(fabricante);
        supplyChain.setData(serial, "data-001");
        vm.stopPrank();

        vm.startPrank(auditorHW);
        supplyChain.approveHardware(serial);
        vm.stopPrank();

        assertEq(uint256(supplyChain.getDataState(serial)), 1);
    }

    function testTecnicoSWCanValidateSW() public {
        vm.startPrank(fabricante);
        supplyChain.setData(serial, "data-001");
        supplyChain.approveHardware(serial);
        vm.stopPrank();

        vm.startPrank(tecnicoSW);
        supplyChain.validateSoftware(serial);
        vm.stopPrank();

        assertEq(uint256(supplyChain.getDataState(serial)), 2);
    }

    function testEscuelaCanDistribute() public {
        vm.startPrank(fabricante);
        supplyChain.setData(serial, "data-001");
        supplyChain.approveHardware(serial);
        vm.stopPrank();

        vm.startPrank(tecnicoSW);
        supplyChain.validateSoftware(serial);
        vm.stopPrank();

        vm.startPrank(escuela);
        supplyChain.distribute(serial);
        vm.stopPrank();

        assertEq(uint256(supplyChain.getDataState(serial)), 3);
    }

    function testGetStateReturnsCorrectState() public {
        vm.startPrank(fabricante);
        supplyChain.setData(serial, "data-001");
        assertEq(uint256(supplyChain.getDataState(serial)), 0);
        supplyChain.approveHardware(serial);
        vm.stopPrank();

        vm.startPrank(tecnicoSW);
        supplyChain.validateSoftware(serial);
        vm.stopPrank();

        vm.startPrank(escuela);
        supplyChain.distribute(serial);
        assertEq(uint256(supplyChain.getDataState(serial)), 3);
        vm.stopPrank();
    }
}