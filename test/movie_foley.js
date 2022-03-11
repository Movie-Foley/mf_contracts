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
    assert.equal(30000000, ownerBalance);
  });

  it("should burn", async () => {
    let burnResult = await MF.burn(1000000, { from: contractDeployer });
    //event Transfer
    assert.equal(burnResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(burnResult.logs[0].args.from, contractDeployer, "Should be the creator address.");
    assert.equal(burnResult.logs[0].args.to, 0x0, "Should log the recipient which is the zero address.");
    assert.equal(burnResult.logs[0].args.value, 1000000, "Should log the amount which is 1,000,000.");

    //event Burned
    assert.equal(burnResult.logs[1].event, "Burned", "Should be the \"Burned\" event.");
    assert.equal(burnResult.logs[1].args.addr, contractDeployer, "Should be contract deployer address.");
    assert.equal(burnResult.logs[1].args.amount, 1000000, "Amount should be 1,000,000.");

    let totalSupply = await MF.totalSupply();
    assert.equal(29000000, totalSupply);

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(29000000, balance);

    await expectThrow(MF.burn(1, { from: another }), "Ownable: caller is not the owner");
  });

  it("should mint for treasure", async () => {
    let mintResult = await MF.mintForTreasure(1000000, { from: contractDeployer });

    //event Transfer
    assert.equal(mintResult.logs[0].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(mintResult.logs[0].args.from, 0x0, "Should be the zero address.");
    assert.equal(mintResult.logs[0].args.to, contractDeployer, "Should be the contract deployer address.");
    assert.equal(mintResult.logs[0].args.value, 1000000, "Should log the amount which is 1,000,000.");

    //event Burned
    assert.equal(mintResult.logs[1].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(mintResult.logs[1].args.addr, contractDeployer, "Should be contract deployer address.");
    assert.equal(mintResult.logs[1].args.amount, 1000000, "Amount should be 1,000,000.");

    let totalSupply = await MF.totalSupply();
    assert.equal(30000000, totalSupply);

    let balance = await MF.balanceOf(contractDeployer);
    assert.equal(30000000, balance);

    await expectThrow(MF.burn(1, { from: another }), "Ownable: caller is not the owner");
  });
});
