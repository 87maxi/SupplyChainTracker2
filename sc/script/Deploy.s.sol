// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {SupplyChainTracker} from "../src/SupplyChainTracker.sol";

contract DeploySupplyChainTracker is Script {
    function run() external returns (SupplyChainTracker) {
        vm.startBroadcast();

        SupplyChainTracker tracker = new SupplyChainTracker();
        
        // Grant roles to the transaction sender
        address deployer = msg.sender;
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), deployer);
        tracker.grantRole(tracker.FABRICANTE_ROLE(), deployer);
        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), deployer);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), deployer);
        tracker.grantRole(tracker.ESCUELA_ROLE(), deployer);

        vm.stopBroadcast();
        return tracker;
    }
}