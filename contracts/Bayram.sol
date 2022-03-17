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
        bool isAmountUnlocked;
        uint256 totalMinted;
    }
    mapping(uint8 => ICOOption) private ICO_OPTIONS;
    mapping(uint8 => uint256) private ICO_TOTAL_HOLDERS;
    mapping(uint8 => mapping(address => uint256)) private ICO_MINTEDS;
    mapping(uint8 => mapping(uint256 => address)) private ICO_HOLDERS;
    bool private isICOActive = true;
    uint8 public constant ICO_OPTION_COUNT = 2;

    event Burned(address addr, uint256 amount);
    event Minted(address addr, uint256 amount, uint8 option);

    modifier isICOOptionValid(uint8 option) {
        require(
            1 <= option && option <= ICO_OPTION_COUNT,
            "ICO option is not valid."
        );
        _;
    }

    constructor(address _movy) ERC20(_name, _symbol) {
        movy = _movy;
        mintForTreasure(_treasure);
        ICO_OPTIONS[1] = ICOOption({
            minMint: 100000, // 30
            maxMint: 600000, // 60
            limit: 1000000, // 100
            price: 5000, // 0.5 MOVY
            isLocked: false,
            isAmountUnlocked: true,
            totalMinted: 0
        });
        ICO_OPTIONS[2] = ICOOption({
            minMint: 100000, // 10
            maxMint: 200000, // 20
            limit: 500000, // 50
            price: 2500, // 0.25 MOVY
            isLocked: true,
            isAmountUnlocked: false,
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

    function balanceOf(address account) public view override returns (uint256) {
        uint256 balance = super.balanceOf(account);
        for (uint8 i = 1; i <= ICO_OPTION_COUNT; i++) {
            if (ICO_OPTIONS[i].isLocked && !ICO_OPTIONS[i].isAmountUnlocked) {
                balance += ICO_MINTEDS[i][account];
            }
        }
        return balance;
    }

    function balanceOfLocked(address account, uint8 option)
        public
        view
        returns (uint256)
    {
        require(
            1 <= option && option <= ICO_OPTION_COUNT,
            "ICO option is not valid."
        );
        if (ICO_OPTIONS[option].isAmountUnlocked) {
            return 0;
        }
        return ICO_MINTEDS[option][account];
    }

    function unlockICOBalances(uint8 option)
        public
        onlyOwner
        isICOOptionValid(option)
    {
        require(ICO_OPTIONS[option].isLocked, "ICO option is not valid.");
        require(
            !ICO_OPTIONS[option].isAmountUnlocked,
            "ICO amounts have been already unlocked!"
        );
        for (uint256 i = 0; i < ICO_TOTAL_HOLDERS[option]; i++) {
            _mint(
                ICO_HOLDERS[option][i],
                ICO_MINTEDS[option][ICO_HOLDERS[option][i]]
            );
        }
        ICO_OPTIONS[option].isAmountUnlocked = true;
    }

    function totalICOHolder(uint8 option)
        public
        view
        isICOOptionValid(option)
        returns (uint256)
    {
        return ICO_TOTAL_HOLDERS[option];
    }

    function totalMintedICO(uint8 option)
        public
        view
        isICOOptionValid(option)
        returns (uint256)
    {
        return ICO_OPTIONS[option].totalMinted;
    }

    function setICO(bool _sale) external onlyOwner {
        isICOActive = _sale;
    }

    function buy(uint256 amount, uint8 option)
        external
        isICOOptionValid(option)
    {
        address _sender = _msgSender();
        require(isICOActive, "ICO is over");
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
            ICO_MINTEDS[option][_sender] + amount <=
                ICO_OPTIONS[option].maxMint,
            "Maximum ICO supply per account exceeded"
        );
        MovieFoley mf = MovieFoley(movy);
        mf.transferFrom(
            _sender,
            owner(),
            (amount * ICO_OPTIONS[option].price) / 10000
        );
        if (!ICO_OPTIONS[option].isLocked) {
            _mint(_sender, amount);
        }
        ICO_OPTIONS[option].totalMinted += amount;
        if (ICO_MINTEDS[option][_sender] == 0) {
            ICO_HOLDERS[option][ICO_TOTAL_HOLDERS[option]] = _sender;
            ICO_TOTAL_HOLDERS[option]++;
        }
        ICO_MINTEDS[option][_sender] += amount;
        emit Minted(_sender, amount, option);
    }
}
