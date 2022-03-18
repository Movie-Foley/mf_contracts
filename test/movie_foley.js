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
    await BSD.transfer(alice, `0x${decToHex(1000, 18)}`, { from: contractDeployer });
    await BSD.transfer(bob, `0x${decToHex(1000, 18)}`, { from: contractDeployer });

    console.log("DEPLOYER: " + contractDeployer);
    console.log("alice: " + alice);
    console.log("bob: " + bob);
    console.log("MF: " + MF.address);
    console.log("BUSD: " + BSD.address);
    console.log(`0x${decToHex(1000, 18)}`)

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
    assert.equal(300000000000, ownerBalance);
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
    let burnResult = await MF.burn(contractDeployer, 10000000000, { from: contractDeployer });
    //event Transfer
    assert.equal(burnResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(burnResult.logs[0].args.from, contractDeployer, "Should be the creator address.");
    assert.equal(burnResult.logs[0].args.to, 0x0, "Should log the recipient which is the zero address.");
    assert.equal(burnResult.logs[0].args.value, 10000000000, "Should log the amount which is 1,000,000.");

    //event Burned
    assert.equal(burnResult.logs[1].event, "Burned", "Should be the \"Burned\" event.");
    assert.equal(burnResult.logs[1].args.addr, contractDeployer, "Should be contract deployer address.");
    assert.equal(burnResult.logs[1].args.amount, 10000000000, "Amount should be 1,000,000.");

    let totalSupply = await MF.totalSupply();
    assert.equal(290000000000, totalSupply);

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(290000000000, balance);

    await expectThrow(MF.burn(contractDeployer, 10000, { from: alice }), "Ownable: caller is not the owner");
  });

  it("should mint for treasure", async () => {
    let mintResult = await MF.mintForTreasure(10000000000, { from: contractDeployer });

    //event Transfer
    assert.equal(mintResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(mintResult.logs[0].args.from, 0x0, "Should be the zero address.");
    assert.equal(mintResult.logs[0].args.to, contractDeployer, "Should be the contract deployer address.");
    assert.equal(mintResult.logs[0].args.value, 10000000000, "Should log the amount which is 1,000,000.");

    //event Minted
    assert.equal(mintResult.logs[1].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(mintResult.logs[1].args.addr, contractDeployer, "Should be contract deployer address.");
    assert.equal(mintResult.logs[1].args.amount, 10000000000, "Amount should be 1,000,000.");
    assert.equal(mintResult.logs[1].args.option, 0, "Option should be 0.");

    let totalSupply = await MF.totalSupply();
    assert.equal(300000000000, totalSupply);

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(300000000000, balance);
  });

  it("should transfer", async () => {
    let transferResult = await MF.transfer(alice, 10000000000, { from: contractDeployer });
    //event Transfer
    assert.equal(transferResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferResult.logs[0].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferResult.logs[0].args.to, alice, "Should be the alice address.");
    assert.equal(transferResult.logs[0].args.value, 10000000000, "Should log the amount which is 1,000,000.");

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(290000000000, balance);

    balance = await MF.balanceOf(alice);
    assert.equal(10000000000, balance);

    transferResult = await MF.transfer(alice, 12500, { from: contractDeployer });
    //event Transfer
    assert.equal(transferResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferResult.logs[0].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferResult.logs[0].args.to, alice, "Should be the alice address.");
    assert.equal(transferResult.logs[0].args.value, 12500, "Should log the amount which is 12500.");

    balance = await MF.balanceOf(contractDeployer);
    assert.equal(289999987500, balance);

    balance = await MF.balanceOf(alice);
    assert.equal(10000012500, balance);

    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.transfer(alice, 1000, { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });
  });

  it("should approve", async () => {
    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.approve(alice, 1000, { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });

    let approveResult = await MF.approve(alice, 1000, { from: contractDeployer });
    assert.equal(approveResult.logs[0].event, "Approval");
    assert.equal(approveResult.logs[0].args.owner, contractDeployer);
    assert.equal(approveResult.logs[0].args.spender, alice);
    assert.equal(approveResult.logs[0].args.value, 1000);

    let allowanceResult = await MF.allowance(contractDeployer, alice);
    assert.equal(allowanceResult, 1000);
  });

  it("should transfer from", async () => {
    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.transferFrom(contractDeployer, alice, 1000, { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });

    await MF.approve(contractDeployer, 1000, { from: contractDeployer });
    let transferFromResult = await MF.transferFrom(contractDeployer, alice, 1000, { from: contractDeployer });
    //event Approval
    assert.equal(transferFromResult.logs[0].event, "Approval", "Should be the \"Transfer\" event.");
    assert.equal(transferFromResult.logs[0].args.owner, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferFromResult.logs[0].args.spender, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(transferFromResult.logs[0].args.value, 0, "Should log the amount which is 1000.");
    //event Transfer
    assert.equal(transferFromResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferFromResult.logs[1].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferFromResult.logs[1].args.to, alice, "Should be the alice address.");
    assert.equal(transferFromResult.logs[1].args.value, 1000, "Should log the amount which is 1000.");
  });

  it("should buy option 1", async () => {
    await MF.transfer(alice, 10000000, { from: contractDeployer });
    await MF.approve(BA.address, 10000000, { from: alice });
    await MF.approve(BA.address, 10000000, { from: contractDeployer });

    await expectThrow(BA.buy(1000, 1, { from: alice }), "Minimum amount not exceeded");
    await expectThrow(BA.buy(10000000000, 1, { from: alice }), "Maximum amount exceeded");

    let buyResult = await BA.buy(300000, 1, { from: alice });
    //event Transfer
    assert.equal(buyResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[1].args.from, alice, "Should be the alice address.");
    assert.equal(buyResult.logs[1].args.to, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(buyResult.logs[1].args.value, 150000, "Should log the amount which is 30.");

    //event Transfer for mint
    assert.equal(buyResult.logs[2].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[2].args.from, 0x0, "Should be the zero address.");
    assert.equal(buyResult.logs[2].args.to, alice, "Should be the alice address.");
    assert.equal(buyResult.logs[2].args.value, 300000, "Should log the amount which is 30.");

    //event Minted
    assert.equal(buyResult.logs[3].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(buyResult.logs[3].args.addr, alice, "Should be alice address.");
    assert.equal(buyResult.logs[3].args.amount, 300000, "Amount should be 30.");
    assert.equal(buyResult.logs[3].args.option, 1, "Option should be 1.");

    let anotherBABalance = await BA.balanceOf(alice);
    assert.equal(300000, anotherBABalance);
    let totalSupply = await BA.totalSupply();
    assert.equal(10300000, totalSupply);
    let anotherMFBalance = await MF.balanceOf(alice);
    assert.equal(9850000, anotherMFBalance);

    buyResult = await BA.buy(300000, 1, { from: alice });
    anotherBABalance = await BA.balanceOf(alice);
    assert.equal(600000, anotherBABalance);
    anotherMFBalance = await MF.balanceOf(alice);
    assert.equal(9700000, anotherMFBalance);
    totalSupply = await BA.totalSupply();
    assert.equal(10600000, totalSupply);

    let totalMintedICO = await BA.totalMintedICO(1);
    assert.equal(600000, totalMintedICO);

    let totalHolders = await BA.totalICOHolder(1);
    assert.equal(1, totalHolders);

    await BA.buy(100000, 1, { from: contractDeployer });
    totalHolders = await BA.totalICOHolder(1);
    assert.equal(2, totalHolders);

    totalMintedICO = await BA.totalMintedICO(1);
    assert.equal(700000, totalMintedICO);

    totalSupply = await BA.totalSupply();
    assert.equal(10700000, totalSupply);

    await expectThrow(BA.buy(300000, 1, { from: alice }), "Maximum ICO supply per account exceeded");
    await expectThrow(BA.buy(450000, 1, { from: contractDeployer }), "Maximum ICO supply exceeded");

    await BA.setICO(false, { from: contractDeployer });
    await expectThrow(BA.buy(450000, 1, { from: alice }), "ICO is over");
    await BA.setICO(true, { from: contractDeployer });
  });
});
