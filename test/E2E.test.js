/* global web3, artifacts, contract, before */
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

  describe("Register, radicalise, sell, collect rent", () => {
    it('follows the happy path correctly', async () => {

      //register
      const nameToUse = web3.utils.stringToHex("radical.eth");
      const tx1 = await mockRegistry.register(nameToUse, {from: ownerOfUnderlyingToken});
      truffleAssert.eventEmitted(tx1, "NewRegistration", {registrant: ownerOfUnderlyingToken, name: nameToUse});

      // radicalise
      const tokenId = web3.utils.keccak256(nameToUse);
      const tx2 = await mockRegistry.methods['safeTransferFrom(address,address,uint256,bytes)'](
        ownerOfUnderlyingToken,
        radicalManager.address,
        tokenId,
        '0x0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000001000',
        { from : ownerOfUnderlyingToken }
      );

    });
  });
});
