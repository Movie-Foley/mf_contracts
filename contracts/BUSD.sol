// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// DUMMY BUSD FOR TRUFFLE TESTS

contract BUSD is ERC20 {
    constructor() ERC20("BUSD", "BUSD") {
        _mint(msg.sender, 10000 * 10**uint256(decimals()));
    }
}
