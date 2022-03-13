const MovieFoley = artifacts.require("MovieFoley");
const expectThrow = require("./helpers/expectThrow");


contract("MovieFoley", function ([contractDeployer, another]) {
  let MF;
  before(async () => {
    MF = await MovieFoley.new({ from: contractDeployer });
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
    await expectThrow(MF.pause({ from: another }), "Ownable: caller is not the owner");
    let pauseResult = await MF.pause({ from: contractDeployer });
    assert.equal(pauseResult.logs[0].event, "Paused");
    let isPaused = await MF.paused();
    assert.equal(true, isPaused);
    await expectThrow(MF.pause({ from: contractDeployer }), "Pausable: paused");

    await expectThrow(MF.unpause({ from: another }), "Ownable: caller is not the owner");
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

    await expectThrow(MF.burn(contractDeployer, 10000, { from: another }), "Ownable: caller is not the owner");
  });

  it("should mint for treasure", async () => {
    let mintResult = await MF.mintForTreasure(10000000000, { from: contractDeployer });

    //event Transfer
    assert.equal(mintResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(mintResult.logs[0].args.from, 0x0, "Should be the zero address.");
    assert.equal(mintResult.logs[0].args.to, contractDeployer, "Should be the contract deployer address.");
    assert.equal(mintResult.logs[0].args.value, 10000000000, "Should log the amount which is 1,000,000.");

    //event Burned
    assert.equal(mintResult.logs[1].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(mintResult.logs[1].args.addr, contractDeployer, "Should be contract deployer address.");
    assert.equal(mintResult.logs[1].args.amount, 10000000000, "Amount should be 1,000,000.");

    let totalSupply = await MF.totalSupply();
    assert.equal(300000000000, totalSupply);

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(300000000000, balance);
  });

  it("should transfer", async () => {
    let transferResult = await MF.transfer(another, 10000000000, { from: contractDeployer });
    //event Transfer
    assert.equal(transferResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferResult.logs[0].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferResult.logs[0].args.to, another, "Should be the another address.");
    assert.equal(transferResult.logs[0].args.value, 10000000000, "Should log the amount which is 1,000,000.");

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(290000000000, balance);

    balance = await MF.balanceOf(another);
    assert.equal(10000000000, balance);

    transferResult = await MF.transfer(another, 12500, { from: contractDeployer });
    //event Transfer
    assert.equal(transferResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(transferResult.logs[0].args.from, contractDeployer, "Should be the contract deployer address.");
    assert.equal(transferResult.logs[0].args.to, another, "Should be the another address.");
    assert.equal(transferResult.logs[0].args.value, 12500, "Should log the amount which is 12500.");

    balance = await MF.balanceOf(contractDeployer);
    assert.equal(289999987500, balance);

    balance = await MF.balanceOf(another);
    assert.equal(10000012500, balance);

    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.transfer(another, 1000, { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });
  });

  it("should approve", async () => {
    await MF.pause({ from: contractDeployer });
    await expectThrow(MF.approve(another, 1000, { from: contractDeployer }), "Pausable: paused");
    await MF.unpause({ from: contractDeployer });

    let approveResult = await MF.approve(another, 1000, { from: contractDeployer });
    assert.equal(approveResult.logs[0].event, "Approval");
    assert.equal(approveResult.logs[0].args.owner, contractDeployer);
    assert.equal(approveResult.logs[0].args.spender, another);
    assert.equal(approveResult.logs[0].args.value, 1000);

    let allowanceResult = await MF.allowance(contractDeployer, another);
    assert.equal(allowanceResult, 1000);
  });
});
