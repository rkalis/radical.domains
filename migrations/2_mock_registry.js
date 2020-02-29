const MockRegistry = artifacts.require("MockRegistry");

module.exports = function(deployer) {
  deployer.deploy(MockRegistry);
};
