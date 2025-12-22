// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {SupplyChainTracker} from "../src/SupplyChainTracker.sol";

contract DeploySupplyChainTracker is Script {
    function run() external returns (SupplyChainTracker) {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        SupplyChainTracker tracker = new SupplyChainTracker();
        
        // Grant roles to the deployer
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), deployer);
        tracker.grantRole(tracker.FABRICANTE_ROLE(), deployer);
        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), deployer);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), deployer);
        tracker.grantRole(tracker.ESCUELA_ROLE(), deployer);

        vm.stopBroadcast();
        
        // Log the contract address for easy reference
        console.log("SupplyChainTracker deployed at:", address(tracker));
        console.log("Deployer address:", deployer);
        
        return tracker;
    }
}