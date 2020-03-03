import './App.css'
import logo from './logo.svg';
import React, { Component, ReactNode } from 'react'
import { Web3Provider, Provider } from 'ethers/providers'
import { Signer, getDefaultProvider } from 'ethers'
import NameQuery from './NameQuery'
import { BigNumber } from 'ethers/utils';

declare let window: any
declare let web3: any

type AppState = {
  provider?: Provider,
  tokenId?: BigNumber,
  address: string,
}

type AppProps = {}

class App extends Component<{}, AppState> {
  state: AppState = {
    address: '',
  }

  async componentDidMount() {

    // Connect with Web3 provider for WRITE opertions if access is already granted
    if (window.ethereum || window.web3) {
      try {
        const provider = new Web3Provider(web3.currentProvider)
        // Check if access is granted
        const address = await provider.getSigner().getAddress()
        this.setState({ provider, address })
      } catch (e) {} // ignored
    }
  }

  async connectWeb3() {
    if (window.ethereum) {
      try {
        // Request account access if needed
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        return
      }
    }

    const provider = new Web3Provider(web3.currentProvider)
    const address = await provider.getSigner().getAddress()

    this.setState({ provider, address })
  }

  updateTokenId(tokenId: BigNumber) {
    this.setState({ tokenId })
    console.log(tokenId)
  }

  render(): ReactNode {
    return (
      <div className="main">
        <div className="title">
          <img src={logo} alt="logo" className="logo"/>
          <p id="description">The best way to monetize your domain!</p>
        </div>
        {this.state.provider
          ? <NameQuery updateTokenId={ (tokenId: BigNumber) => this.updateTokenId(tokenId) } />
          : <div className="text-center">
              <p>Please use an Ethereum-enabled browser (like Metamask or Trust Wallet) to use Radical Domains</p>
              <button onClick={() => this.connectWeb3()}>Connect web3</button>
            </div>
        }
        {!!this.state.tokenId &&
          <p>{this.state.tokenId.toString()}</p> // TODO add app here
        }
      </div>
    );
  }
}

export default App;
