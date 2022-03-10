// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract MovieFoley is Context, ERC20, Ownable {
    string private _name = "Movie Foley Token";
    string private _symbol = "MOVY";
    uint8 private _decimal = 4;
    uint32 private _treasure = 30000000;

    constructor() ERC20(_name, _symbol) {
        _mint(_msgSender(), _treasure);
    }

    function decimals() public view override returns (uint8) {
        return _decimal;
    }
}
