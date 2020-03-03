
# Radical Domains

*Radical Domains* is a Harberger-inspired ownership and leasing system for [Ethereum Name Service](http://ens.domains/) (ENS) domains.

Domain squatting is a chronic problem that affects ENS and DNS alike.  One solution to such a problem is the Harberger tax system as outlined by [Weyl and Posner (2017)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2818494). Under such a system assets are always for sale on the market. The current owner self-assesses the value of their asset, pays a predefined rental (or tax if collected by government) in proportion to that price and must sell to any buyer who offers to meet the that price.

**Radical Domains** allows the migration of individual ENS names to an ownership model inspired by Harberger taxes. It was built at [ETHLondon](https://ethlondon.com/) and so borrows the UK property market's terminology of freehold and leasehold title (for which lessor and lessee may be interchanged respectively).

It is live on Rinkeby and can be tried out at [radical.domains](https://radical.domains/).

 ## How it Works
The owner of an ENS domain can create and sell a tradable lease on their domain name with all rental yield accruing to them. When they transfer ownership of their ERC721 ENS token to the Radical Domain smart contract, they received two ERC721 tokens in return:

+ A **freehold** token which has no control over the domain name but receives all future rent from it.
+ A **leasehold** token which controls the underlying domain name (e.g. `setResolver`) but must declare its own selling price and pay rent at a set fraction of that price.

Neither holder alone can transfer ownership of the underlying ENS domain name, but any account or contract in possession of both the freehold and the leasehold token can withdraw it.

The leasehold token is "always for sale" (hat tip [@simondlr](https://twitter.com/simondlr)) and can be purchased at any time through the Radical Domains site or automatically listed on markets such as [OpenSea](https://opensea.io/). The freehold token can optionally be traded or listed by its owner.

## Smart Contracts
The system relies heavily on the ERC721 non-fungible token (NFT) standard which invokes `onERC721Received` on the recipient when a transfer takes place, and the ENS registrar functionality which allows the owner to nominate a controlling address which can make changes but not transfer ownership.

The owner of an ENS name can "radicalise" their domain by transferring ownership of their ERC721 token to the `RadicalManager` contract. This is done by calling `safeTransferFrom` on the ENS smart contract which invokes `onERC721Received` on the `RadicalManager` contract, which then goes about minting the leasehold and freehold tokens from the `RadicalLeasehold` the `RadicalFreehold` contracts respectively.

Smart contracts were authored with help from Truffle, OpenZepellin and ENS (hat tip [@makoto_inoue](https://twitter.com/makoto_inoue) for assistance on site).

When radicalising a domain the initial owner sets the rental yield (e.g. at 10%) and initial sale price (e.g. 1 ETH) for the leasehold. Subsequent holders can set a new selling price (e.g. 10 ETH) for the domain after taking possession but must pay rent at the initial rate on the new price (10% x 10 ETH = 1 ETH/year). The holder of the freehold token receives the rent and can withdraw as much of it as has accrued at any time.

The leaseholder has exclusive control of the actual domain name as long as they hold the leasehold token.

## Building and Running

### Installation

```
git clone git@github.com:rkalis/radical.domains.git
cd radical.domains
yarn
```

Copy `.env.example` to `.env` and add a development mnemonic, Infura ID and optionally an Etherscan API key and an ENS test label (see tests).

### Compilation
```
yarn truffle compile
```

### Tests
The tests run against a fork of Ropsten so that it can be tested against the real ENS with a pre-registered ENS name. To perform these tests, a few prerequisites are required.

1. Use the mnemonic inside your `.env` file to register any `.eth` domain on Ropsten (https://app.ens.domains/)
2. Add the domain name as `ENS_TEST_LABEL` to your `.env` file (without the `.eth` extension)
3. Make sure your `MNEMONIC` and `INFURA_ID` are filled out in your `.env` file as well as the `ENS_TEST_LABEL`
4. Make sure `ganache-cli` is installed globally (`npm i -g ganache-cli`)

```
yarn test
```


**Error: `source: not found`**

Experienced on Ubuntu 18.04 LTS

Fix:
1. Put `export ` before all variables in your `.env` file 
1. Use `source .env` manually

### Deployment

```
yarn truffle migrate --network rinkeby
```

### Frontend

The front end is based on CRA and can be launched for development with:
```
yarn start
```
