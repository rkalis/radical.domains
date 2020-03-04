import './App.css'
import React, { Component, ReactNode } from 'react'
import { Web3Provider, Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom'
import Header from './components/Header'
import About from './components/About'
import DomainDashboard from './components/DomainDashboard'
import NameQuery from './components/NameQuery'
import Web3Connector from './components/Web3Connector'

declare let window: any
declare let web3: any

const styles = {
  main: {
    width: '90%',
    backgroundColor: '#e2e2e2b2',
    borderRadius: '10px',
    margin: '70px auto 0 auto',
    padding: '50px',
  },
}

type AppState = {
  provider?: Web3Provider,
  tokenId?: BigNumber,
  address: string,
}

type AppProps = {}

class App extends Component<AppProps, AppState> {
  state: AppState = {
    address: '',
  }

  updateTokenId(tokenId: BigNumber) {
    this.setState({ tokenId })
    console.log(tokenId)
  }

  async updateProviderAndAddress(provider: Web3Provider) {
    this.setState({ provider, address: await provider.getSigner().getAddress()})
  }

  render(): ReactNode {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <div style={styles.main}>
              <Header />
              <Web3Connector callback={(provider) => this.updateProviderAndAddress(provider)} />
              <NameQuery updateTokenId={ (tokenId: BigNumber) => this.updateTokenId(tokenId) } />
              <DomainDashboard provider={this.state.provider} address={this.state.address} tokenId={this.state.tokenId} />
            </div>
          </Route>
          <Route exact path="/about">
            <div style={styles.main}>
              <Header />
              <About />
            </div>
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default App;
