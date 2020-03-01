const RadicalManager = artifacts.require("RadicalManager");

module.exports = function(deployer) {
  deployer.deploy(RadicalManager);
};
