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

    struct ICOOption {
        uint256 minMint;
        uint256 maxMint;
        uint256 limit;
        uint256 price;
        bool isLocked;
        uint256 totalMinted;
    }
    mapping(uint8 => ICOOption) private ICO_OPTIONS;
    mapping(uint8 => mapping(address => uint256)) private ICO_MINTEDS;
    bool private isICOActive = true;
    uint8 public constant ICO_OPTION_COUNT = 4;

    event Burned(address addr, uint256 amount);
    event Minted(address addr, uint256 amount, uint8 option);

    modifier isICOOptionValid(uint8 option) {
        require(
            1 <= option && option <= ICO_OPTION_COUNT,
            "ICO option is not valid."
        );
        _;
    }

    constructor() ERC20(_name, _symbol) {
        // busd = _busd;
        mintForTreasure(_treasure);
        ICO_OPTIONS[1] = ICOOption({
            minMint: 300000, // 30
            maxMint: 250000000, // 25,000
            limit: 65000000000, // 6,500,000
            price: 200000000000000000, // 0.2 BUSD
            isLocked: true,
            totalMinted: 0
        });
        ICO_OPTIONS[2] = ICOOption({
            minMint: 250000, // 25
            maxMint: 200000000, // 20,000
            limit: 55000000000, // 5,500,000
            price: 400000000000000000, // 0.4 BUSD
            isLocked: true,
            totalMinted: 0
        });
        ICO_OPTIONS[3] = ICOOption({
            minMint: 200000, // 20
            maxMint: 150000000, // 15,000
            limit: 40000000000, // 4,000,000
            price: 700000000000000000, // 0.7 BUSD
            isLocked: true,
            totalMinted: 0
        });
        ICO_OPTIONS[4] = ICOOption({
            minMint: 150000, // 15
            maxMint: 100000000, // 10,000
            limit: 40000000000, // 4,000,000
            price: 900000000000000000, // 0.9 BUSD
            isLocked: false,
            totalMinted: 0
        });
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
            ICO_OPTIONS[option].totalMinted + amount <=
                ICO_OPTIONS[option].limit,
            "Maximum ICO supply exceeded"
        );
        require(
            ICO_MINTEDS[option][_sender] + amount <=
                ICO_OPTIONS[option].maxMint,
            "Maximum ICO supply per account exceeded"
        );
        // MovieFoley mf = MovieFoley(movy);
        // mf.transferFrom(
        //     _sender,
        //     owner(),
        //     (amount * ICO_MOVY_PRICE) / 10000
        // );
        // TODO: check is locked
        _mint(_sender, amount);
        ICO_OPTIONS[option].totalMinted += amount;
        ICO_MINTEDS[option][_sender] += amount;
        emit Minted(_sender, amount, option);
    }
}
