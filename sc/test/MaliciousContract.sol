// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../src/SupplyChainTracker.sol";

contract MaliciousContract {
    SupplyChainTracker public tracker;
    string public targetSerial;
    bool public shouldReenter;
    bool public reentrancyDetected;
    uint256 public reentrancyCount;
    
    constructor(address _trackerAddress, string memory _serial) {
        tracker = SupplyChainTracker(_trackerAddress);
        targetSerial = _serial;
        shouldReenter = false;
        reentrancyDetected = false;
        reentrancyCount = 0;
    }
    
    function enableReentrancy() public {
        shouldReenter = true;
    }
    
    function disableReentrancy() public {
        shouldReenter = false;
    }
    
    // This function will be called when Ether is sent to this contract
    receive() external payable {
        if (shouldReenter && reentrancyCount < 2) {
            reentrancyCount++;
            reentrancyDetected = true;
            // Attempt to re-enter a function if possible
            // Note: The SupplyChainTracker contract doesn't have functions that send Ether,
            // so true reentrancy is not possible. This is just to check for proper patterns.
        }
    }
    
    function attack() public payable {
        // This function doesn't exploit anything since the contract doesn't handle Ether
        // But we can use it to test that there are no unexpected behaviors
        reentrancyDetected = false;
        reentrancyCount = 0;
    }
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}