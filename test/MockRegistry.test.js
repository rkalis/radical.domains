const MockRegistry = artifacts.require('MockRegistry');
const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

contract('MockRegistry', (accounts) => {

  describe("Deploying", () => {
    it('should deploy', async () => {
      const registry = await MockRegistry.new({ from: accounts[0] });
      assert.isNotNull(registry);
    });
  });

  describe("Registering names", () => {

    it('should allow a name to be registered', async () => {
      const mockRegistry = await MockRegistry.deployed();
      const nameToRegister = web3.utils.stringToHex("richard.eth");
      const tx = await mockRegistry.register(nameToRegister, {from: accounts[1]});
      truffleAssert.eventEmitted(tx, "NewRegistration", {registrant: accounts[1], name: nameToRegister});
    });

    it('should not allow a name to be registered a second time', async () => {
      const mockRegistry = await MockRegistry.deployed();
      const nameToRegister = web3.utils.stringToHex("richard.eth");
      truffleAssert.reverts(mockRegistry.register(nameToRegister, {from: accounts[1]})); 
    });

    // it supports transferring to another address

  });
});
