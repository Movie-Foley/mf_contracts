// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

interface tokenRecipient {
    function receiveApproval(address sender, uint256 value) external;
}

contract MovieFoley is Context, ERC20, Ownable {
    string private _name = "Movie Foley Token";
    string private _symbol = "MOVY";
    uint8 private _decimal = 4;
    uint256 private _treasure = 300000000000;

    event Burned(address addr, uint256 amount);
    event Minted(address addr, uint256 amount);

    constructor() ERC20(_name, _symbol) {
        mintForTreasure(_treasure);
    }

    function decimals() public view override returns (uint8) {
        return _decimal;
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(_msgSender(), amount);
        emit Burned(_msgSender(), amount);
    }

    function mintForTreasure(uint256 amount) public onlyOwner {
        _mint(owner(), amount);
        emit Minted(owner(), amount);
    }

    function approveAndCall(address _spender, uint256 _value) public {
        require(approve(_spender, _value));
        tokenRecipient spender = tokenRecipient(_spender);
        spender.receiveApproval(_msgSender(), _value);
    }
}
