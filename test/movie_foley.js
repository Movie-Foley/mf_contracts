const MovieFoley = artifacts.require("MovieFoley");


contract("MovieFoley", function ([contractDeployer]) {
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
    assert.equal(ownerBalance, 30000000);
  });
});
