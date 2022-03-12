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
    assert.equal(30000000, ownerMovyBalance);
    let ownerBayramBalance = await BA.balanceOf(contractDeployer);
    assert.equal(1000, ownerBayramBalance);
  });

  it("should mint BAY Token with MOVY Token", async () => {
    // TODO: test min/max amount, only movy caller
    await MF.transfer(another, 50, { from: contractDeployer });
    let anotherMFBalance = await MF.balanceOf(another);
    assert.equal(50, anotherMFBalance)
    let result = await MF.approveAndCall(BA.address, 30, { from: another });
    console.log(result.logs);

    anotherMFBalance = await MF.balanceOf(another);
    assert.equal(20, anotherMFBalance);
    let anotherBABalance = await BA.balanceOf(another);
    assert.equal(30, anotherBABalance);
    let BAMFBalance = await MF.balanceOf(BA.address);
    assert.equal(30, BAMFBalance);
  });
});
