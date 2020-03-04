import React, { Component, ReactNode, CSSProperties } from 'react'
import { Web3Provider } from 'ethers/providers'

declare let window: any
declare let web3: any

const styles = {
  main: {
    textAlign: 'center'
  } as CSSProperties,
}

type Web3ConnectorState = {
  connected: boolean
}

type Web3ConnectorProps = {
  callback: (provider: Web3Provider) => void
}

class Web3Connector extends Component<Web3ConnectorProps, Web3ConnectorState> {
  state: Web3ConnectorState = {
    connected: false
  }

  async componentDidMount() {
    // Connect with Web3 provider if access is already granted
    if (window.ethereum || window.web3) {
      try {
        const provider = new Web3Provider(web3.currentProvider)
        // Check if access is granted
        await provider.getSigner().getAddress()
        this.props.callback(provider)
        this.setState({ connected: true })
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
    this.props.callback(provider)
    this.setState({ connected: true })
  }

  render(): ReactNode {
    return this.state.connected
      ? ''
      : (
        <div style={styles.main}>
          <p>Please use an Ethereum-enabled browser (like Metamask or Trust Wallet) to use Radical Domains</p>
          <button onClick={() => this.connectWeb3()}>Connect web3</button>
        </div>
      )
  }
}

export default Web3Connector;
