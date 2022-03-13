// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./MovieFoley.sol";

// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Bayram is Context, ERC20, Ownable {
    string private _name = "Bayram Token";
    string private _symbol = "BAY";
    uint8 private _decimal = 4;
    uint32 private _treasure = 10000000;
    uint8 private _preSaleMovyPrice = 1;
    uint32 private _minMintAmount = 30;
    uint32 private _maxMintAmount = 120;
    address public movy;

    event Burned(address addr, uint256 amount);
    event Minted(address addr, uint256 amount);

    modifier onlyMovy() {
        require(movy == _msgSender(), "Caller is not the MovieFoley Contract");
        _;
    }

    constructor(address _movy) ERC20(_name, _symbol) {
        movy = _movy;
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

    function receiveApproval(address sender, uint256 amount) external onlyMovy {
        MovieFoley mf = MovieFoley(movy);
        require(mf.transferFrom(sender, address(this), amount));
        uint256 mintAmount = amount / _preSaleMovyPrice;
        _mint(sender, mintAmount);
        emit Minted(sender, mintAmount);
    }

    function withdrawMovy(uint256 amount) public onlyOwner {
        MovieFoley mf = MovieFoley(movy);
        mf.transfer(owner(), amount);
    }
}
