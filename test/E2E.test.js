/* global web3, artifacts, contract, before */
const RadicalFreeholdToken = artifacts.require('RadicalFreeholdToken')
const RadicalLeaseholdToken = artifacts.require('RadicalLeaseholdToken')
const RadicalManager = artifacts.require('RadicalManager')
const BaseRegistrar = artifacts.require('BaseRegistrar')
const BaseRegistrarController = artifacts.require('BaseRegistrarController');
const ENS = artifacts.require('ENS')
const { assert } = require("chai")
const truffleAssert = require('truffle-assertions')
const { encode } = require('./misc')
const { time } = require('@openzeppelin/test-helpers')
const { ethers } = require('ethers')
require('dotenv').config()

contract('End to End', (accounts) => {
  let radicalManager
  let radicalFreeholdToken
  let radicalLeaseholdToken
  let registrar
  let registrarCtrl
  let ens

  const ensOwner = accounts[0];
  const initialBuyer = accounts[2]
  const secondBuyer = accounts[3]
  const tokenId = web3.utils.toBN(web3.utils.soliditySha3(process.env.ENS_TEST_LABEL))
  const namehash = ethers.utils.namehash(`${process.env.ENS_TEST_LABEL}.eth`)

  before(async () => {
    radicalManager = await RadicalManager.deployed()
    radicalFreeholdToken = await RadicalFreeholdToken.at(await radicalManager.freehold())
    radicalLeaseholdToken = await RadicalLeaseholdToken.at(await radicalManager.leasehold())
    registrar = await BaseRegistrar.at('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85')
    registrarCtrl = await BaseRegistrarController.at('0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5');
    ens = await ENS.at('0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e')
    assert.equal(await registrar.ownerOf(tokenId), ensOwner, 'Prerequisite not met: incorrect ENS name owner (try running pkill -f ganache-cli)')
  });

  // TODO: Test more side conditions
  // TODO: Test negative cases
  describe('Happy path', () => {
    it('domain can be radicalised', async () => {
      // given
      const price = web3.utils.toBN(1e12) // wei
      const rate = web3.utils.toBN(10000) // 1000% (10 = 1%)

      // when
      const tx = await registrar.methods['safeTransferFrom(address,address,uint256,bytes)'](ensOwner, radicalManager.address, tokenId, encode(price, rate), { from: ensOwner })
      const radicalTx = await truffleAssert.createTransactionResult(radicalManager, tx.tx)

      // then
      assert.equal(await registrar.ownerOf(tokenId), radicalManager.address, 'Domain should be transferred to smart contract')
      assert.equal(await ens.owner(namehash), ensOwner, 'Owner should stay in control of domain')
      truffleAssert.eventEmitted(radicalTx, 'Radicalised', { owner: ensOwner, tokenId }, 'Domain should be radicalised')
    })

     it('deposit rent + renew domain', async() => {
       // Current expire data
      let expires = await registrar.nameExpires(tokenId);
      // get one year of duration
      let duration =  365 * 24 * 60 * 60; // add ~ 1 year
      // get price of setting new duration
       let price = await registrarCtrl.rentPrice(process.env.ENS_TEST_LABEL, duration);

      const value = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

      let tx = await radicalManager.depositRentAndRenew(tokenId, process.env.ENS_TEST_LABEL, web3.utils.toBN(duration), { from: ensOwner, value })

       // validate if expire date is updated
      let new_expires = await registrar.nameExpires(tokenId)
      assert.equal(parseInt(new_expires), parseInt(expires) + duration, 'domain name is not renewed');

      // validate renewal through event
      let registrarCtrlTx = await truffleAssert.createTransactionResult(registrarCtrl, tx.tx);
      truffleAssert.eventEmitted(registrarCtrlTx, 'NameRenewed', { name: process.env.ENS_TEST_LABEL, cost: price, expires: new_expires}, 'Domain should be renewed')

       // validate the rest of the value is deposited as rent
      let radicalTx = await truffleAssert.createTransactionResult(radicalManager, tx.tx);
      let rent = value - price;
      truffleAssert.eventEmitted(radicalTx, 'RentDeposited', { depositor: ensOwner, tokenId: tokenId, amount: web3.utils.toBN(rent)}, 'Rent should be deposited')
    })

    it('leasehold can be bought from initial owner', async () => {
      // given
      const value = web3.utils.toBN(2e12) // wei

      // when
      const tx = await radicalLeaseholdToken.buy(tokenId, { from: initialBuyer, value })
      const managerTx = await truffleAssert.createTransactionResult(radicalManager, tx.tx)

      // then
      assert.equal(await ens.owner(namehash), initialBuyer, 'Buyer should get control of domain')
      truffleAssert.eventEmitted(tx, 'Sold', { from: ensOwner, to: initialBuyer, tokenId, price: web3.utils.toBN(1e12) }, 'Domain should be sold')
      truffleAssert.eventEmitted(managerTx, 'RentDeposited', { depositor: initialBuyer, tokenId, amount: web3.utils.toBN(1e12) }, 'Rent should be deposited')
    })

    it('leasehold\'s price can be changed', async () => {
      // given
      const newPrice = web3.utils.toBN(2e12) // wei

      // when
      const tx = await radicalLeaseholdToken.setPriceOf(tokenId, newPrice, { from: initialBuyer })
      const managerTx = await truffleAssert.createTransactionResult(radicalManager, tx.tx)

      // then
      assert.deepEqual(newPrice, await radicalLeaseholdToken.priceOf(tokenId), 'Price should be changed')
      assert.equal(await ens.owner(namehash), initialBuyer, 'Owner should stay in control of domain')
      truffleAssert.eventEmitted(tx, 'PriceChanged', { owner: initialBuyer, tokenId, oldPrice: web3.utils.toBN(1e12), newPrice: web3.utils.toBN(2e12) }, 'Price should be changed')
      truffleAssert.eventEmitted(managerTx, 'RentCollected', null, 'Rent should be collected')
    })

    it('leasehold can be bought after price change', async () => {
      // given
      const value = web3.utils.toBN(3e12) // wei

      // when
      const tx = await radicalLeaseholdToken.buy(tokenId, { from: secondBuyer, value })
      const managerTx = await truffleAssert.createTransactionResult(radicalManager, tx.tx)

      // then
      assert.equal(await ens.owner(namehash), secondBuyer, 'Buyer should get control of domain')
      truffleAssert.eventEmitted(tx, 'Sold', { from: initialBuyer, to: secondBuyer, tokenId, price: web3.utils.toBN(2e12) }, 'Domain should be sold')
      truffleAssert.eventEmitted(managerTx, 'RentWithdrawn', (ev) => (
        ev.withdrawer === initialBuyer && ev.tokenId.eq(tokenId) && ev.amount.gt(web3.utils.toBN(0.99e12)) && ev.amount.lt(web3.utils.toBN(1e12))
      ), 'Old rent should be withdrawn')
      truffleAssert.eventEmitted(managerTx, 'RentDeposited', { depositor: secondBuyer, tokenId, amount: web3.utils.toBN(1e12) }, 'New rent should be deposited')
    })

    it('rent can be collected', async () => {
      // given
      await time.increase(1e6)

      // when
      const tx = await radicalManager.collectRent(tokenId, { from: ensOwner })

      // then
      assert.equal(await ens.owner(namehash), secondBuyer, 'Owner should stay in control of domain')
      truffleAssert.eventEmitted(tx, 'RentCollected', (ev) => (
        ev.collector === ensOwner && ev.tokenId.eq(tokenId) && ev.amount.gt(web3.utils.toBN(0.63e12)) && ev.amount.lt(web3.utils.toBN(0.64e12))
      ), 'Rent should be collected')
    })

    it('rent can be withdrawn', async () => {
      // when
      const tx = await radicalManager.withdrawRent(tokenId, web3.utils.toBN(1e12), { from: secondBuyer })

      // then
      assert.equal(await ens.owner(namehash), secondBuyer, 'Owner should stay in control of domain')
      truffleAssert.eventEmitted(tx, 'RentWithdrawn', (ev) => (
        ev.withdrawer === secondBuyer && ev.tokenId.eq(tokenId) && ev.amount.gt(web3.utils.toBN(0.36e12)) && ev.amount.lt(web3.utils.toBN(0.37e12))
      ), 'Rent should be withdrawn')
    })

    it('leasehold can be repossessed', async () => {
      // given
      await time.increase(1e6)

      // when
      const tx = await radicalManager.collectRent(tokenId, { from: ensOwner })
      const leaseholdTx = await truffleAssert.createTransactionResult(radicalLeaseholdToken, tx.tx)

      // then
      assert.equal(await ens.owner(namehash), ensOwner, 'Freeholder should get control of domain')
      truffleAssert.eventEmitted(tx, 'RentCollected', { collector: ensOwner, tokenId, amount: web3.utils.toBN(0) }, 'Rent should be collected')
      truffleAssert.eventEmitted(leaseholdTx, 'Repossessed', { from: secondBuyer, to: ensOwner, tokenId }, 'Leasehold token should be repossessed')
    })


    it('leasehold and freehold can be deradicalised', async () => {
      // when
      const tx = await radicalManager.deradicalise(tokenId, { from: ensOwner })

      // then
      assert.equal(await ens.owner(namehash), ensOwner, 'Buyer should get control of domain')
      assert.equal(await registrar.ownerOf(tokenId), ensOwner, 'Domain should be transferred to deradicaliser')
      truffleAssert.eventEmitted(tx, 'Deradicalised', { owner: ensOwner, tokenId }, 'Domain should be deradicalised')
    })
  })
})
