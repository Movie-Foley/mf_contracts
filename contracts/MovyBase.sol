// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12;

import "./zeppelin/ERC20.sol";
import "./zeppelin/Ownable.sol";
import "./zeppelin/Pausable.sol";

abstract contract MovyBase is ERC20, Ownable, Pausable {
    address public paymentToken;

    struct ICOOption {
        uint256 minMint;
        uint256 maxMint;
        uint256 limit;
        uint256 price;
        bool isLocked;
        bool isAmountUnlocked;
        uint256 totalMinted;
    }
    mapping(uint8 => ICOOption) internal ICO_OPTIONS;
    mapping(uint8 => uint256) internal ICO_TOTAL_HOLDERS;
    mapping(uint8 => mapping(address => uint256)) internal ICO_MINTEDS;
    mapping(uint8 => mapping(uint256 => address)) internal ICO_HOLDERS;
    bool internal isICOActive = true;
    uint8 public ICO_OPTION_COUNT;

    event Burned(address addr, uint256 amount);
    event Minted(address addr, uint256 amount, uint8 option);

    modifier isICOOptionValid(uint8 option) {
        require(
            1 <= option && option <= ICO_OPTION_COUNT,
            "ICO option is not valid."
        );
        _;
    }

    constructor(
        string memory name,
        string memory abbr,
        uint8 icoOptionCount
    ) ERC20(name, abbr) {
        ICO_OPTION_COUNT = icoOptionCount;
    }

    function decimals() public pure override returns (uint8) {
        return 4;
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

    function balanceOf(address account) public view override returns (uint256) {
        uint256 balance = super.balanceOf(account);
        for (uint8 i = 1; i <= ICO_OPTION_COUNT; i++) {
            if (ICO_OPTIONS[i].isLocked && !ICO_OPTIONS[i].isAmountUnlocked) {
                balance += ICO_MINTEDS[i][account];
            }
        }
        return balance;
    }

    function balanceOfMintedOption(address account, uint8 option)
        public
        view
        returns (uint256)
    {
        require(
            1 <= option && option <= ICO_OPTION_COUNT,
            "ICO option is not valid."
        );
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
        whenNotPaused
    {
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
            ICO_MINTEDS[option][msg.sender] + amount <=
                ICO_OPTIONS[option].maxMint,
            "Maximum ICO supply per account exceeded"
        );
        require(
            ERC20(paymentToken).transferFrom(
                msg.sender,
                owner(),
                (amount * ICO_OPTIONS[option].price) / 10000
            ),
            "Payment could not be made!"
        );
        if (!ICO_OPTIONS[option].isLocked) {
            _mint(msg.sender, amount);
        }
        ICO_OPTIONS[option].totalMinted += amount;
        if (ICO_MINTEDS[option][msg.sender] == 0) {
            ICO_HOLDERS[option][ICO_TOTAL_HOLDERS[option]] = msg.sender;
            ICO_TOTAL_HOLDERS[option]++;
        }
        ICO_MINTEDS[option][msg.sender] += amount;
        emit Minted(msg.sender, amount, option);
    }
}
