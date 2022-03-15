const Bayram = artifacts.require("Bayram");
const MovieFoley = artifacts.require("MovieFoley");
const expectThrow = require("./helpers/expectThrow");


contract("Bayram", function ([contractDeployer, another]) {
  let MF;
  let BA;
  before(async () => {
    MF = await MovieFoley.new({ from: contractDeployer });
    BA = await Bayram.new(MF.address, { from: contractDeployer });
  });

  it("should has been set movy address, name, decimal, symbol and owner then mint 1000 token to owner", async () => {
    let owner = await BA.owner.call();
    assert.equal(contractDeployer, owner);
    let symbol = await BA.symbol.call();
    assert.equal("BAY", symbol);
    let name = await BA.name.call();
    assert.equal("Bayram Token", name);
    let decimal = await BA.decimals.call();
    assert.equal(4, decimal);

    let movyAdress = await BA.movy();
    assert.equal(MF.address, movyAdress);


    let ownerMovyBalance = await MF.balanceOf(contractDeployer);
    assert.equal(300000000000, ownerMovyBalance);
    let ownerBayramBalance = await BA.balanceOf(contractDeployer);
    assert.equal(10000000, ownerBayramBalance);
  });

  it("should buy", async () => {
    // console.log("DEPLOYER: " + contractDeployer);
    // console.log("another: " + another);
    // console.log("MF: " + MF.address);
    // console.log("BA: " + BA.address);
    await MF.transfer(another, 10000000, { from: contractDeployer });
    await MF.approve(BA.address, 450000, { from: another });

    // TODO: test max supply

    await expectThrow(BA.buy(1000, { from: another }), "Minimum amount not exceeded");
    await expectThrow(BA.buy(10000000000, { from: another }), "Maximum amount exceeded");

    let buyResult = await BA.buy(300000, { from: another });
    //event Transfer
    assert.equal(buyResult.logs[1].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[1].args.from, another, "Should be the another address.");
    assert.equal(buyResult.logs[1].args.to, contractDeployer, "Should be the contractDeployer address.");
    assert.equal(buyResult.logs[1].args.value, 150000, "Should log the amount which is 30.");

    //event Transfer for mint
    assert.equal(buyResult.logs[2].event, "Transfer", "Should be the \"Transfer\" event.");
    assert.equal(buyResult.logs[2].args.from, 0x0, "Should be the zero address.");
    assert.equal(buyResult.logs[2].args.to, another, "Should be the another address.");
    assert.equal(buyResult.logs[2].args.value, 300000, "Should log the amount which is 30.");

    //event Burned
    assert.equal(buyResult.logs[3].event, "Minted", "Should be the \"Minted\" event.");
    assert.equal(buyResult.logs[3].args.addr, another, "Should be another address.");
    assert.equal(buyResult.logs[3].args.amount, 300000, "Amount should be 30.");

    let anotherBABalance = await BA.balanceOf(another);
    assert.equal(300000, anotherBABalance);
    let totalSupply = await BA.totalSupply();
    assert.equal(10300000, totalSupply);

    buyResult = await BA.buy(600000, { from: another });
    anotherBABalance = await BA.balanceOf(another);
    assert.equal(900000, anotherBABalance);
    totalSupply = await BA.totalSupply();
    assert.equal(10900000, totalSupply);

    await expectThrow(BA.buy(450000, { from: another }), "Maximum supply exceeded");

    await BA.setPreSale(false, { from: contractDeployer });
    await expectThrow(BA.buy(450000, { from: another }), "Presale is over");
  });
});
