// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {SupplyChainTracker} from "../src/SupplyChainTracker.sol";

contract ERC20CompatibilityTest is Test {
    SupplyChainTracker public tracker;

    function setUp() public {
        tracker = new SupplyChainTracker();
    }

    // Test que verifica que la función name() no cause execution reverted
    function test_ERC20NameFunction() public {
        string memory name = tracker.name();
        assertEq(name, "SupplyChainTracker");
    }

    // Test que verifica que la función symbol() no cause execution reverted
    function test_ERC20SymbolFunction() public {
        string memory symbol = tracker.symbol();
        assertEq(symbol, "SCT");
    }

    // Test que verifica que la función decimals() no cause execution reverted
    function test_ERC20DecimalsFunction() public {
        uint8 decimals = tracker.decimals();
        assertEq(decimals, 0);
    }

    // Test que verifica que la función totalSupply() no cause execution reverted
    function test_ERC20TotalSupplyFunction() public {
        uint256 supply = tracker.totalSupply();
        assertEq(supply, 0);
    }

    // Test que verifica que la función balanceOf() no cause execution reverted
    function test_ERC20BalanceOfFunction() public {
        uint256 balance = tracker.balanceOf(address(this));
        assertEq(balance, 0);
    }

    // Test que verifica que las funciones de transferencia no cause execution reverted
    function test_ERC20TransferFunctions() public {
        bool result = tracker.transfer(address(0x1), 100);
        assertFalse(result); // Debe devolver false ya que no es un token real
        
        result = tracker.approve(address(0x1), 100);
        assertFalse(result); // Debe devolver false ya que no es un token real
        
        uint256 allowance = tracker.allowance(address(this), address(0x1));
        assertEq(allowance, 0); // Debe devolver 0 ya que no es un token real
        
        result = tracker.transferFrom(address(this), address(0x1), 100);
        assertFalse(result); // Debe devolver false ya que no es un token real
    }

    // Test que verifica que todas las funciones ERC-20 devuelven valores consistentes
    function test_ERC20ConsistentReturnValues() public {
        // Verificar que todas las funciones devuelven valores consistentes
        assertEq(tracker.name(), "SupplyChainTracker");
        assertEq(tracker.symbol(), "SCT");
        assertEq(tracker.decimals(), 0);
        assertEq(tracker.totalSupply(), 0);
        assertEq(tracker.balanceOf(address(0)), 0);
        assertFalse(tracker.transfer(address(0), 0));
        assertFalse(tracker.approve(address(0), 0));
        assertEq(tracker.allowance(address(0), address(0)), 0);
        assertFalse(tracker.transferFrom(address(0), address(0), 0));
    }
}