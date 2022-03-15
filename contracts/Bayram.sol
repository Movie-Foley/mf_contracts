// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./MovieFoley.sol";

// DUMMY TOKEN

contract Bayram is Context, ERC20, Ownable {
    string private _name = "Bayram Token";
    string private _symbol = "BAY";
    uint8 private _decimal = 4;
    uint32 private _treasure = 10000000; // 1000
    uint32 private constant MIN_MINT_AMOUNT = 300000; // 30
    uint32 private constant MAX_MINT_AMOUNT = 1200000; // 120
    address public movy;
    uint256 public constant ICO_MOVY_PRICE = 5000; // 0.5 MOVY
    uint256 public constant ICO_LIMIT = 1000000; // 100
    uint256 public mintedICO = 0; // 0
    bool private isICOActive = true;

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

    function setICO(bool _sale) external onlyOwner {
        isICOActive = _sale;
    }

    function buy(uint256 amount) external {
        require(isICOActive, "ICO is over");
        require(MIN_MINT_AMOUNT <= amount, "Minimum amount not exceeded");
        require(MAX_MINT_AMOUNT >= amount, "Maximum amount exceeded");
        require(mintedICO + amount <= ICO_LIMIT, "Maximum ICO supply exceeded");
        MovieFoley mf = MovieFoley(movy);
        mf.transferFrom(
            _msgSender(),
            owner(),
            (amount * ICO_MOVY_PRICE) / 10000
        );
        _mint(_msgSender(), amount);
        mintedICO = mintedICO + amount;
        emit Minted(_msgSender(), amount);
    }
}
