const Migrations = artifacts.require("MockRegistry");

module.exports = function(deployer) {
  deployer.deploy(MockRegistry);
};
