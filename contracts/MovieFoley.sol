// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12;

import "./MovyBase.sol";

contract MovieFoley is MovyBase {
    constructor(address _busd) MovyBase("Movie Foley Token", "MOVY", 4) {
        paymentToken = _busd;
        mintForTreasure(300000000000); // 30,000,000
        ICO_OPTIONS[1] = ICOOption({
            minMint: 300000, // 30
            maxMint: 250000000, // 25,000
            limit: 65000000000, // 6,500,000
            price: 200000000000000000, // 0.2 BUSD
            isLocked: true,
            isAmountUnlocked: false,
            totalMinted: 0
        });
        ICO_OPTIONS[2] = ICOOption({
            minMint: 250000, // 25
            maxMint: 200000000, // 20,000
            limit: 55000000000, // 5,500,000
            price: 400000000000000000, // 0.4 BUSD
            isLocked: true,
            isAmountUnlocked: false,
            totalMinted: 0
        });
        ICO_OPTIONS[3] = ICOOption({
            minMint: 200000, // 20
            maxMint: 150000000, // 15,000
            limit: 40000000000, // 4,000,000
            price: 700000000000000000, // 0.7 BUSD
            isLocked: true,
            isAmountUnlocked: false,
            totalMinted: 0
        });
        ICO_OPTIONS[4] = ICOOption({
            minMint: 150000, // 15
            maxMint: 100000000, // 10,000
            limit: 40000000000, // 4,000,000
            price: 900000000000000000, // 0.9 BUSD
            isLocked: false,
            isAmountUnlocked: true,
            totalMinted: 0
        });
    }
}
