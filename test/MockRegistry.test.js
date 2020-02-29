const MockRegistry = artifacts.require('MockRegistry');
const { assert } = require("chai");

contract('MockRegistry', (accounts) => {
  describe("Backing functionality", () => {
    it('should deploy', async () => {
      const registry = await MockRegistry.new({ from: accounts[0] });
      assert.isNotNull(registry);
    });
  });
});
