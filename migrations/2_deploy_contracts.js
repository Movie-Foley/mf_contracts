var BUSD = artifacts.require('./BUSD.sol');
var MovieFoley = artifacts.require('./MovieFoley.sol');
var Bayram = artifacts.require('./Bayram.sol');

module.exports = async (deployer, network) => {
  let busdAddress;
  if (network == "development") {
    await deployer.deploy(BUSD);
    busdAddress = BUSD.address;
  }

  await deployer.deploy(MovieFoley, busdAddress);

  if (network == "development") {
    await deployer.deploy(Bayram, MovieFoley.address);
  }
};