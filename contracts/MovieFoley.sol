// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MovieFoley is Context, ERC20, Ownable, Pausable {
    string private _name = "Movie Foley Token";
    string private _symbol = "MOVY";
    uint8 private _decimal = 4;
    uint256 private _treasure = 300000000000;

    address public busd;
    bool private isICOActive = true;

    uint256 public constant ICO_BUSD_PRICE_O1 = 200000000000000000; // 0.2 BUSD
    uint256 public constant ICO_LIMIT_O1 = 65000000000; // 6,500,000
    uint256 public constant ICO_MIN_MINT_O1 = 300000; // 30
    uint256 public constant ICO_MAX_MINT_O1 = 250000000; // 25,000
    uint256 public mintedICO_O1 = 0;
    uint256 public constant ICO_BUSD_PRICE_O2 = 400000000000000000; // 0.4 BUSD
    uint256 public constant ICO_LIMIT_O2 = 55000000000; // 5,500,000
    uint256 public constant ICO_MIN_MINT_O2 = 250000; // 25
    uint256 public constant ICO_MAX_MINT_O2 = 200000000; // 20,000
    uint256 public mintedICO_O2 = 0;
    uint256 public constant ICO_BUSD_PRICE_O3 = 700000000000000000; // 0.7 BUSD
    uint256 public constant ICO_LIMIT_O3 = 40000000000; // 4,000,000
    uint256 public constant ICO_MIN_MINT_O3 = 200000; // 20
    uint256 public constant ICO_MAX_MINT_O3 = 150000000; // 15,000
    uint256 public mintedICO_O3 = 0;
    uint256 public constant ICO_BUSD_PRICE_O4 = 900000000000000000; // 0.9 BUSD
    uint256 public constant ICO_LIMIT_O4 = 40000000000; // 4,000,000
    uint256 public constant ICO_MIN_MINT_O4 = 150000; // 15
    uint256 public constant ICO_MAX_MINT_O4 = 100000000; // 10,000
    uint256 public mintedICO_O4 = 0;

    event Burned(address addr, uint256 amount);
    event Minted(address addr, uint256 amount, uint8 option);

    constructor() ERC20(_name, _symbol) {
        // busd = _busd;
        mintForTreasure(_treasure);
    }

    function decimals() public view override returns (uint8) {
        return _decimal;
    }

    function pause() public whenNotPaused onlyOwner {
        _pause();
    }

    function unpause() public whenPaused onlyOwner {
        _unpause();
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
        emit Burned(from, amount);
    }

    function mintForTreasure(uint256 amount) public onlyOwner {
        _mint(owner(), amount);
        emit Minted(owner(), amount, 0);
    }

    function transfer(address to, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.transfer(to, amount);
    }

    function approve(address spender, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.approve(spender, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function setICO(bool _sale) external onlyOwner {
        isICOActive = _sale;
    }

    function buy(uint256 amount, uint8 option) external {
        require(isICOActive, "ICO is over");
        require(1 <= option && option <= 4, "ICO option is not valid.");
        // require(MIN_MINT_AMOUNT <= amount, "Minimum amount not exceeded");
        // require(MAX_MINT_AMOUNT >= amount, "Maximum amount exceeded");
        // require(mintedICO + amount <= ICO_LIMIT, "Maximum ICO supply exceeded");
        // MovieFoley mf = MovieFoley(movy);
        // mf.transferFrom(
        //     _msgSender(),
        //     owner(),
        //     (amount * ICO_MOVY_PRICE) / 10000
        // );
        // _mint(_msgSender(), amount);
        // mintedICO = mintedICO + amount;
        // emit Minted(_msgSender(), amount);
    }
}
