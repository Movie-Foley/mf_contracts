const BUSD = artifacts.require("BUSD");
const MovieFoley = artifacts.require("MovieFoley");

const expectThrow = require("./helpers/expectThrow");
const decToHex = require("./helpers/decToHex");

contract("MovieFoley", function ([contractDeployer, alice, bob]) {
  let BSD;
  let MF;
  before(async () => {
    BSD = await BUSD.new({ from: contractDeployer });
    MF = await MovieFoley.new(BSD.address, { from: contractDeployer });
    await BSD.transfer(alice, decToHex(1000, 18), { from: contractDeployer });
    await BSD.transfer(bob, decToHex(1000, 18), { from: contractDeployer });
    await BSD.approve(MF.address, decToHex(10000, 18), { from: contractDeployer });
    await BSD.approve(MF.address, decToHex(1000, 18), { from: alice });
    await BSD.approve(MF.address, decToHex(1000, 18), { from: bob });

    console.log("DEPLOYER: " + contractDeployer);
    console.log("alice: " + alice);
    console.log("bob: " + bob);
    console.log("MF: " + MF.address);
    console.log("BUSD: " + BSD.address);

    let aliceBalance = await BSD.balanceOf(alice);
    console.log("ALICE BALANCE: " + aliceBalance);

    let bobBalance = await BSD.balanceOf(bob);
    console.log("bob BALANCE: " + bobBalance);
  });

  it("should has been set name, decimal, symbol and owner then mint 30,000,000 token to owner", async () => {
    let owner = await MF.owner.call();
    assert.equal(contractDeployer, owner);
    let symbol = await MF.symbol.call();
    assert.equal("MOVY", symbol);
    let name = await MF.name.call();
    assert.equal("Movie Foley Token", name);
    let decimal = await MF.decimals.call();
    assert.equal(4, decimal);

    let ownerBalance = await MF.balanceOf(contractDeployer);
    assert.equal(decToHex(30000000, 4), ownerBalance.toString());
  });

  it("should pause", async () => {
    await expectThrow(MF.pause({ from: alice }), "Ownable: caller is not the owner");
    let pauseResult = await MF.pause({ from: contractDeployer });
    assert.equal(pauseResult.logs[0].event, "Paused");
    let isPaused = await MF.paused();
    assert.equal(true, isPaused);
    await expectThrow(MF.pause({ from: contractDeployer }), "Pausable: paused");

    await expectThrow(MF.unpause({ from: alice }), "Ownable: caller is not the owner");
    pauseResult = await MF.unpause({ from: contractDeployer });
    assert.equal(pauseResult.logs[0].event, "Unpaused");
    await expectThrow(MF.unpause({ from: contractDeployer }), "Pausable: not paused");
  });

  it("should burn", async () => {
    let burnResult = await MF.burn(contractDeployer, decToHex(1000000, 4), { from: contractDeployer });
    //event Transfer
    assert.equal(burnResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(burnResult.logs[0].args.from, contractDeployer, "Should be the creator address.");
    assert.equal(burnResult.logs[0].args.to, 0x0, "Should log the recipient which is the zero address.");
    assert.equal(burnResult.logs[0].args.value.toString(), decToHex(1000000, 4), "Should log the amount which is 1,000,000.");

    //event Burned
    assert.equal(burnResult.logs[1].event, "Burned", "Should be the \"Burned\" event.");
    assert.equal(burnResult.logs[1].args.addr, contractDeployer, "Should be contract deployer address.");
    assert.equal(burnResult.logs[1].args.amount.toString(), decToHex(1000000, 4), "Amount should be 1,000,000.");

    let totalSupply = await MF.totalSupply();
    assert.equal(decToHex(29000000, 4), totalSupply.toString());

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(decToHex(29000000, 4), balance.toString());

    await expectThrow(MF.burn(contractDeployer, 10000, { from: alice }), "Ownable: caller is not the owner");
  });

  it("should mint for treasure", async () => {
    let mintResult = await MF.mintForTreasure(decToHex(1000000, 4), { from: contractDeployer });

    //event Transfer
    assert.equal(mintResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(mintResult.logs[0].args.from, 0x0, "Should be the zero address.");
    assert.equal(mintResult.logs[0].args.to, contractDeployer, "Should be the contract deployer address.");
    assert.equal(mintResult.logs[0].args.value.toString(), decToHex(1000000, 4), "Should log the amount which is 1,000,000.");

    //event Minted
    assert.equal(mintResult.logs[1].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(mintResult.logs[1].args.addr, contractDeployer, "Should be contract deployer address.");
    assert.equal(mintResult.logs[1].args.amount.toString(), decToHex(1000000, 4), "Amount should be 1,000,000.");
    assert.equal(mintResult.logs[1].args.option, 0, "Option should be 0.");

    let totalSupply = await MF.totalSupply();
    assert.equal(300000000000, totalSupply.toString());

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(300000000000, balance.toString());
  });

  it("should transfer", async () => {
    let transferResult = await MF.transfer(alice, decToHex(100, 4), { from: contractDeployer });
    //event Transfer
    assert.equal(transferResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferResult.logs[0].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferResult.logs[0].args.to, alice, "Should be the alice address.");
    assert.equal(transferResult.logs[0].args.value.toString(), decToHex(100, 4), "Should log the amount which is 1,000,000.");

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(decToHex(29999900, 4), balance.toString());

    balance = await MF.balanceOf(alice);
    assert.equal(decToHex(100, 4), balance.toString());

    transferResult = await MF.transfer(alice, decToHex(100, 4), { from: contractDeployer });
    //event Transfer
    assert.equal(transferResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferResult.logs[0].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferResult.logs[0].args.to, alice, "Should be the alice address.");
    assert.equal(transferResult.logs[0].args.value.toString(), decToHex(100, 4), "Should log the amount which is 12500.");

    balance = await MF.balanceOf(contractDeployer);
    assert.equal(decToHex(29999800, 4), balance.toString());

    balance = await MF.balanceOf(alice);
    assert.equal(decToHex(200, 4), balance.toString());

    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.transfer(alice, decToHex(0.1, 4), { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });
  });

  it("should approve", async () => {
    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.approve(alice, decToHex(100, 4), { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });

    let approveResult = await MF.approve(alice, decToHex(100, 4), { from: contractDeployer });
    assert.equal(approveResult.logs[0].event, "Approval");
    assert.equal(approveResult.logs[0].args.owner, contractDeployer);
    assert.equal(approveResult.logs[0].args.spender, alice);
    assert.equal(approveResult.logs[0].args.value.toString(), decToHex(100, 4));

    let allowanceResult = await MF.allowance(contractDeployer, alice);
    assert.equal(decToHex(100, 4), allowanceResult.toString());
  });

  it("should transfer from", async () => {
    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.transferFrom(contractDeployer, alice, decToHex(100, 4), { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });

    await MF.approve(contractDeployer, decToHex(100, 4), { from: contractDeployer });
    let transferFromResult = await MF.transferFrom(contractDeployer, alice, decToHex(100, 4), { from: contractDeployer });
    //event Approval
    assert.equal(transferFromResult.logs[0].event, "Approval", "Should be the \"Transfer\" event.");
    assert.equal(transferFromResult.logs[0].args.owner, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferFromResult.logs[0].args.spender, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(transferFromResult.logs[0].args.value, 0, "Should log the amount which is 0.");
    //event Transfer
    assert.equal(transferFromResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferFromResult.logs[1].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferFromResult.logs[1].args.to, alice, "Should be the alice address.");
    assert.equal(transferFromResult.logs[1].args.value.toString(), decToHex(100, 4), "Should log the amount which is 100.");
  });

  it("should buy option 1", async () => {
    await expectThrow(MF.buy(decToHex(1, 4), 1, { from: alice }), "Minimum amount not exceeded");
    await expectThrow(MF.buy(decToHex(10000000, 4), 1, { from: alice }), "Maximum amount exceeded");

    let buyResult = await MF.buy(decToHex(50, 4), 1, { from: alice });

    //event Transfer
    assert.equal(buyResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[1].args.from, alice, "Should be the alice address.");
    assert.equal(buyResult.logs[1].args.to, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(buyResult.logs[1].args.value.toString(), decToHex(10, 18), "Should log the amount which is 10.");
    //event Minted
    assert.equal(buyResult.logs[2].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(buyResult.logs[2].args.addr, alice, "Should be alice address.");
    assert.equal(buyResult.logs[2].args.amount.toString(), decToHex(50, 4), "Amount should be 50.");
    assert.equal(buyResult.logs[2].args.option, 1, "Option should be 1.");

    let aliceBUSDBalance = await BSD.balanceOf(alice);
    assert.equal(decToHex(990, 18), aliceBUSDBalance.toString());
    let totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000000, 4), totalSupply.toString());
    let aliceMFBalance = await MF.balanceOf(alice);
    assert.equal(decToHex(350, 4), aliceMFBalance.toString());

    buyResult = await MF.buy(decToHex(60, 4), 1, { from: bob });
    bobBUSDBalance = await BSD.balanceOf(bob);
    assert.equal(decToHex(988, 18), bobBUSDBalance.toString());
    bobMFBalance = await MF.balanceOf(bob);
    assert.equal(decToHex(60, 4), bobMFBalance.toString());
    totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000000, 4), totalSupply.toString());

    let totalMintedICO = await MF.totalMintedICO(1);
    assert.equal(decToHex(110, 4), totalMintedICO.toString());

    let totalHolders = await MF.totalICOHolder(1);
    assert.equal(2, totalHolders);

    await MF.buy(decToHex(30, 4), 1, { from: alice });
    totalHolders = await MF.totalICOHolder(1);
    assert.equal(2, totalHolders);

    let aliceMFBalanceOfLocked = await MF.balanceOfLocked(alice, 1);
    assert.equal(decToHex(80, 4), aliceMFBalanceOfLocked.toString());
    let bobMFBalanceOfLocked = await MF.balanceOfLocked(bob, 1);
    assert.equal(decToHex(60, 4), bobMFBalanceOfLocked.toString());

    await expectThrow(MF.transfer(contractDeployer, decToHex(10, 4), { from: bob }), "ERC20: transfer amount exceeds balance");

    await MF.buy(decToHex(25000, 4), 1, { from: contractDeployer });
    await expectThrow(MF.buy(decToHex(30, 4), 1, { from: contractDeployer }), "Maximum ICO supply per account exceeded");

    await MF.setICO(false, { from: contractDeployer });
    await expectThrow(MF.buy(450000, 1, { from: alice }), "ICO is over");
    await MF.setICO(true, { from: contractDeployer });

    // deployer: 25000 MF option 1, 98000 BUSD
    // alice: 80 MF option 1, 984 BUSD
    // bob: 60 MF option 1, 988 BUSD
  });

  it("should buy option 2", async () => {
    await expectThrow(MF.buy(decToHex(1, 4), 2, { from: alice }), "Minimum amount not exceeded");
    await expectThrow(MF.buy(decToHex(10000000, 4), 2, { from: alice }), "Maximum amount exceeded");

    let buyResult = await MF.buy(decToHex(40, 4), 2, { from: alice });

    //event Transfer
    assert.equal(buyResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[1].args.from, alice, "Should be the alice address.");
    assert.equal(buyResult.logs[1].args.to, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(buyResult.logs[1].args.value.toString(), decToHex(16, 18), "Should log the amount which is 16.");
    //event Minted
    assert.equal(buyResult.logs[2].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(buyResult.logs[2].args.addr, alice, "Should be alice address.");
    assert.equal(buyResult.logs[2].args.amount.toString(), decToHex(40, 4), "Amount should be 40.");
    assert.equal(buyResult.logs[2].args.option, 2, "Option should be 2.");

    let aliceBUSDBalance = await BSD.balanceOf(alice);
    assert.equal(decToHex(968, 18), aliceBUSDBalance.toString());
    let totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000000, 4), totalSupply.toString());
    let aliceMFBalance = await MF.balanceOf(alice);
    assert.equal(decToHex(420, 4), aliceMFBalance.toString());

    buyResult = await MF.buy(decToHex(60, 4), 2, { from: bob });
    bobBUSDBalance = await BSD.balanceOf(bob);
    assert.equal(decToHex(964, 18), bobBUSDBalance.toString());
    bobMFBalance = await MF.balanceOf(bob);
    assert.equal(decToHex(120, 4), bobMFBalance.toString());
    totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000000, 4), totalSupply.toString());

    let aliceMFBalanceOfLocked = await MF.balanceOfLocked(alice, 2);
    assert.equal(decToHex(40, 4), aliceMFBalanceOfLocked.toString());
    let bobMFBalanceOfLocked = await MF.balanceOfLocked(bob, 2);
    assert.equal(decToHex(60, 4), bobMFBalanceOfLocked.toString());

    let totalMintedICO = await MF.totalMintedICO(2);
    assert.equal(decToHex(100, 4), totalMintedICO.toString());

    let totalHolders = await MF.totalICOHolder(2);
    assert.equal(2, totalHolders);

    await expectThrow(MF.transfer(contractDeployer, decToHex(10, 4), { from: bob }), "ERC20: transfer amount exceeds balance");

    // deployer: 25000 MF option 1, 98000 BUSD
    // alice: 80 MF option 1, 40 MF option 2, 968 BUSD
    // bob: 60 MF option 1, 60 MF option 2, 964 BUSD
  });

  it("should buy option 3", async () => {
    await expectThrow(MF.buy(decToHex(1, 4), 3, { from: alice }), "Minimum amount not exceeded");
    await expectThrow(MF.buy(decToHex(10000000, 4), 3, { from: alice }), "Maximum amount exceeded");

    let buyResult = await MF.buy(decToHex(20, 4), 3, { from: alice });

    //event Transfer
    assert.equal(buyResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[1].args.from, alice, "Should be the alice address.");
    assert.equal(buyResult.logs[1].args.to, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(buyResult.logs[1].args.value.toString(), decToHex(14, 18), "Should log the amount which is 14.");
    //event Minted
    assert.equal(buyResult.logs[2].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(buyResult.logs[2].args.addr, alice, "Should be alice address.");
    assert.equal(buyResult.logs[2].args.amount.toString(), decToHex(20, 4), "Amount should be 20.");
    assert.equal(buyResult.logs[2].args.option, 3, "Option should be 3.");

    let aliceBUSDBalance = await BSD.balanceOf(alice);
    assert.equal(decToHex(954, 18), aliceBUSDBalance.toString());
    let totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000000, 4), totalSupply.toString());
    let aliceMFBalance = await MF.balanceOf(alice);
    assert.equal(decToHex(440, 4), aliceMFBalance.toString());

    buyResult = await MF.buy(decToHex(40, 4), 3, { from: bob });
    bobBUSDBalance = await BSD.balanceOf(bob);
    assert.equal(decToHex(936, 18), bobBUSDBalance.toString());
    bobMFBalance = await MF.balanceOf(bob);
    assert.equal(decToHex(160, 4), bobMFBalance.toString());
    totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000000, 4), totalSupply.toString());

    let aliceMFBalanceOfLocked = await MF.balanceOfLocked(alice, 3);
    assert.equal(decToHex(20, 4), aliceMFBalanceOfLocked.toString());
    let bobMFBalanceOfLocked = await MF.balanceOfLocked(bob, 3);
    assert.equal(decToHex(40, 4), bobMFBalanceOfLocked.toString());

    let totalMintedICO = await MF.totalMintedICO(3);
    assert.equal(decToHex(60, 4), totalMintedICO.toString());

    let totalHolders = await MF.totalICOHolder(3);
    assert.equal(2, totalHolders);

    await expectThrow(MF.transfer(contractDeployer, decToHex(10, 4), { from: bob }), "ERC20: transfer amount exceeds balance");

    // deployer: 25000 MF option 1, 98000 BUSD
    // alice: 80 MF option 1, 40 MF option 2, 20 MF option 3, 954 BUSD
    // bob: 60 MF option 1, 60 MF option 2, 40 MF option 3, 946 BUSD
  });

  it("should buy option 4", async () => {
    await expectThrow(MF.buy(decToHex(1, 4), 4, { from: alice }), "Minimum amount not exceeded");
    await expectThrow(MF.buy(decToHex(10000000, 4), 4, { from: alice }), "Maximum amount exceeded");

    let buyResult = await MF.buy(decToHex(20, 4), 4, { from: alice });

    //event Transfer
    assert.equal(buyResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[1].args.from, alice, "Should be the alice address.");
    assert.equal(buyResult.logs[1].args.to, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(buyResult.logs[1].args.value.toString(), decToHex(18, 18), "Should log the amount which is 18.");
    //event Transfer
    assert.equal(buyResult.logs[2].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[2].args.from, 0x0, "Should be the 0x0 address.");
    assert.equal(buyResult.logs[2].args.to, alice, "Should be the alice address.");
    assert.equal(buyResult.logs[2].args.value.toString(), decToHex(20, 4), "Should log the amount which is 20.");
    //event Minted
    assert.equal(buyResult.logs[3].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(buyResult.logs[3].args.addr, alice, "Should be alice address.");
    assert.equal(buyResult.logs[3].args.amount.toString(), decToHex(20, 4), "Amount should be 20.");
    assert.equal(buyResult.logs[3].args.option, 4, "Option should be 4.");

    let aliceBUSDBalance = await BSD.balanceOf(alice);
    assert.equal(decToHex(936, 18), aliceBUSDBalance.toString());
    let totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000020, 4), totalSupply.toString());
    let aliceMFBalance = await MF.balanceOf(alice);
    assert.equal(decToHex(460, 4), aliceMFBalance.toString());

    buyResult = await MF.buy(decToHex(40, 4), 4, { from: bob });
    bobBUSDBalance = await BSD.balanceOf(bob);
    assert.equal(decToHex(900, 18), bobBUSDBalance.toString());
    bobMFBalance = await MF.balanceOf(bob);
    assert.equal(decToHex(200, 4), bobMFBalance.toString());
    totalSupply = await MF.totalSupply();
    assert.equal(decToHex(30000060, 4), totalSupply.toString());

    let aliceMFBalanceOfLocked = await MF.balanceOfLocked(alice, 4);
    assert.equal(decToHex(0, 4), aliceMFBalanceOfLocked.toString());
    let bobMFBalanceOfLocked = await MF.balanceOfLocked(bob, 4);
    assert.equal(decToHex(0, 4), bobMFBalanceOfLocked.toString());

    let totalMintedICO = await MF.totalMintedICO(4);
    assert.equal(decToHex(60, 4), totalMintedICO.toString());

    let totalHolders = await MF.totalICOHolder(4);
    assert.equal(2, totalHolders);

    await MF.transfer(alice, decToHex(10, 4), { from: bob });
    aliceMFBalance = await MF.balanceOf(alice);
    assert.equal(decToHex(470, 4), aliceMFBalance.toString());
    bobMFBalance = await MF.balanceOf(bob);
    assert.equal(decToHex(190, 4), bobMFBalance.toString());

    // deployer: 25000 MF option 1, 98000 BUSD
    // alice: 80 MF option 1, 40 MF option 2, 20 MF option 3, 30 MF option 4, 936 BUSD
    // bob: 60 MF option 1, 60 MF option 2, 40 MF option 3, 30 MF option 4, 900 BUSD
  });
});
