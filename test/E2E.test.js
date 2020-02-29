const MockRegistry = artifacts.require('MockRegistry');
const RadicalFreeholdToken = artifacts.require('RadicalFreeholdToken');
const RadicalLeaseholdToken = artifacts.require('RadicalLeaseholdToken');
const RadicalManager = artifacts.require('RadicalManager');
const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

contract('End to End', (accounts) => {

  let mockRegistry;
  let radicalManager;
  let radicalFreeholdToken;
  let radicalLeaseholdToken;

  const registryDeployerAccount = accounts[0];
  const radicalDeployerAccount = accounts[1];
  const ownerOfUnderlyingToken = accounts[2];

  before(async () => {
      mockRegistry = await MockRegistry.new({from: registryDeployerAccount});
      radicalManager = await RadicalManager.new({from: radicalDeployerAccount});
  });

  describe("Register, radicalise, sell, etc", () => {
    it('does it all', async () => {
    
      //register
      const nameToUse = web3.utils.stringToHex("radical.eth");
      const tx1 = await mockRegistry.register(nameToUse, {from: accounts[1]});
      await truffleAssert.eventEmitted(tx1, "NewRegistration", {registrant: accounts[1], name: nameToUse});

      // radicalise
      const hashOfName = web3.utils.keccak256(nameToUse);
      const tx2 = await mockRegistry.safeTransferFrom(accounts[1], radicalManager.address, hashOfName, {from: accounts[1]});

    });
  });
});
