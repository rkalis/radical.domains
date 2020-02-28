# Radical Domains

## Running locally
### Installation
```
git clone git@github.com:rkalis/radical.domains.git
cd radical.domains
yarn
```

Copy `.env.example` to `.env` and add a development mnemonic, Infura ID and optionally an Etherscan API key for source code verification.

### Compilation
```
yarn truffle compile
```

### Tests
```
yarn test
```

### Deployment
```
yarn truffle migrate --network rinkeby
```
