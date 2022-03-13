var MovieFoley = artifacts.require('./MovieFoley.sol');
var Bayram = artifacts.require('./Bayram.sol');

module.exports = async (deployer) => {
  await deployer;
  await deployer.deploy(MovieFoley);
  await deployer.deploy(Bayram, MovieFoley.address);
};