// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// DUMMY BUSD FOR TRUFFLE TESTS

contract BUSD is ERC20, Ownable {
    constructor(string memory name) ERC20(name, name) {
        _mint(msg.sender, 100000 * 10**uint256(decimals()));
    }

    function mintForTreasure(uint256 amount) public onlyOwner {
        _mint(owner(), amount);
    }
}
