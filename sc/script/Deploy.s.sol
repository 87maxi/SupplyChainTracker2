// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {SupplyChainTracker} from "../src/SupplyChainTracker.sol";

contract DeploySupplyChainTracker is Script {
    function run() external returns (SupplyChainTracker) {
        vm.startBroadcast();

        SupplyChainTracker tracker = new SupplyChainTracker();
        
        // Grant roles to default broadcaster (anvil first address)
        // Use the default broadcaster address (first anvil account)
        address defaultAdmin = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        tracker.grantRole(tracker.DEFAULT_ADMIN_ROLE(), defaultAdmin);
        tracker.grantRole(tracker.FABRICANTE_ROLE(), defaultAdmin);
        tracker.grantRole(tracker.AUDITOR_HW_ROLE(), defaultAdmin);
        tracker.grantRole(tracker.TECNICO_SW_ROLE(), defaultAdmin);
        tracker.grantRole(tracker.ESCUELA_ROLE(), defaultAdmin);

        vm.stopBroadcast();
        return tracker;
    }
}