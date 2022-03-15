// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./MovieFoley.sol";

contract Bayram is Context, ERC20, Ownable {
    string private _name = "Bayram Token";
    string private _symbol = "BAY";
    uint8 private _decimal = 4;
    uint32 private _treasure = 10000000; // 1000
    uint32 private _minMintAmount = 300000; // 30
    uint32 private _maxMintAmount = 1200000; // 120
    address public movy;
    uint256 public preSaleMovyPrice = 5000; // 0.5 MOVY
    uint256 public preSaleLimit = 1000000; // 100
    uint256 public preSaleMinted = 0; // 0
    bool public isPreSaleActive = true;

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

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
        emit Burned(from, amount);
    }

    function mintForTreasure(uint256 amount) public onlyOwner {
        _mint(owner(), amount);
        emit Minted(owner(), amount);
    }

    function setPreSale(bool _sale) external onlyOwner {
        isPreSaleActive = _sale;
    }

    function buy(uint256 amount) external {
        require(isPreSaleActive, "Presale is over");
        require(_minMintAmount <= amount, "Minimum amount not exceeded");
        require(_maxMintAmount >= amount, "Maximum amount exceeded");
        require(
            preSaleMinted + amount <= preSaleLimit,
            "Maximum Pre-Sale supply exceeded"
        );
        MovieFoley mf = MovieFoley(movy);
        mf.transferFrom(
            _msgSender(),
            owner(),
            (amount * preSaleMovyPrice) / 10000
        );
        _mint(_msgSender(), amount);
        preSaleMinted = preSaleMinted + amount;
        emit Minted(_msgSender(), amount);
    }
}
