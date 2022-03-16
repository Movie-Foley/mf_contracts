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
    address public movy;

    struct ICOOption {
        uint256 minMint;
        uint256 maxMint;
        uint256 limit;
        uint256 price;
        bool isLocked;
        uint256 totalMinted;
    }
    bool private isICOActive = true;
    mapping(uint8 => ICOOption) private ICO_OPTIONS;
    mapping(uint8 => mapping(address => uint256)) private MINTED_ICOS;

    event Burned(address addr, uint256 amount);
    event Minted(address addr, uint256 amount, uint8 option);

    modifier onlyMovy() {
        require(movy == _msgSender(), "Caller is not the MovieFoley Contract");
        _;
    }

    constructor(address _movy) ERC20(_name, _symbol) {
        movy = _movy;
        mintForTreasure(_treasure);
        ICO_OPTIONS[1] = ICOOption({
            minMint: 300000, // 30
            maxMint: 600000, // 60
            limit: 1000000, // 100
            price: 5000, // 0.5 MOVY
            isLocked: false,
            totalMinted: 0
        });
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
        emit Minted(owner(), amount, 0);
    }

    function totalMintedICO(uint8 option) public view returns (uint256) {
        require(1 <= option && option <= 1, "ICO option is not valid.");
        return ICO_OPTIONS[option].totalMinted;
    }

    function setICO(bool _sale) external onlyOwner {
        isICOActive = _sale;
    }

    function buy(uint256 amount, uint8 option) external {
        require(isICOActive, "ICO is over");
        require(1 <= option && option <= 1, "ICO option is not valid.");
        require(
            ICO_OPTIONS[option].minMint <= amount,
            "Minimum amount not exceeded"
        );
        require(
            ICO_OPTIONS[option].maxMint >= amount,
            "Maximum amount exceeded"
        );
        require(
            ICO_OPTIONS[option].totalMinted + amount <=
                ICO_OPTIONS[option].limit,
            "Maximum ICO supply exceeded"
        );
        require(
            MINTED_ICOS[option][_msgSender()] + amount <=
                ICO_OPTIONS[option].maxMint,
            "Maximum ICO supply per account exceeded"
        );
        MovieFoley mf = MovieFoley(movy);
        mf.transferFrom(
            _msgSender(),
            owner(),
            (amount * ICO_OPTIONS[option].price) / 10000
        );
        _mint(_msgSender(), amount);
        ICO_OPTIONS[option].totalMinted += amount;
        MINTED_ICOS[option][_msgSender()] += amount;
        emit Minted(_msgSender(), amount, 1);
    }
}
