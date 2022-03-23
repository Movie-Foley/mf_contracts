// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12;

import "./MovyBase.sol";

// DUMMY TOKEN

contract Bayram is MovyBase {
    constructor(address _movy) MovyBase("Bayram Token", "BAY", 2) {
        paymentToken = _movy;
        mintForTreasure(10000000); // 1000
        ICO_OPTIONS[1] = ICOOption({
            minMint: 100000, // 30
            maxMint: 600000, // 60
            limit: 1000000, // 100
            price: 5000, // 0.5 MOVY
            isLocked: false,
            isAmountUnlocked: true,
            totalMinted: 0
        });
        ICO_OPTIONS[2] = ICOOption({
            minMint: 100000, // 10
            maxMint: 200000, // 20
            limit: 500000, // 50
            price: 2500, // 0.25 MOVY
            isLocked: true,
            isAmountUnlocked: false,
            totalMinted: 0
        });
    }
}
