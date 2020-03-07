import React, { Component, ReactNode } from 'react'
import { Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import ENSInfo from './ENSInfo'
import { Contract } from 'ethers'
import { registrarAddress, managerAddress, freeholdAddress, leaseholdAddress } from '../addresses'
import { BaseRegistrar, RadicalManager, RadicalFreehold, RadicalLeasehold } from '../abis'
import CardDeck from 'react-bootstrap/CardDeck'
import FreeholdInfo from './FreeholdInfo'
import LeaseholdInfo from './LeaseholdInfo'

const styles = {
  dashboard: {
    margin: '2%',
  },
}

export type Contracts = {
  registrar?: Contract,
  manager?: Contract,
  freehold?: Contract,
  leasehold?: Contract,
}

type DomainDashboardState = {
  contracts?: Contracts
  refresh: boolean
}

type DomainDashboardProps = {
  provider?: Web3Provider,
  address: string,
  tokenId?: BigNumber,
}

class DomainDashboard extends Component<DomainDashboardProps, DomainDashboardState> {
  state: DomainDashboardState = {
    refresh: true
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps: DomainDashboardProps) {
    if (this.props === prevProps) return
    this.loadData()
  }

  loadData() {
    if (!this.props.provider) return
    if (!this.props.tokenId) return

    const contracts = {
      registrar: new Contract(registrarAddress, BaseRegistrar, this.props.provider.getSigner()),
      manager: new Contract(managerAddress, RadicalManager, this.props.provider.getSigner()),
      freehold: new Contract(freeholdAddress, RadicalFreehold, this.props.provider.getSigner()),
      leasehold: new Contract(leaseholdAddress, RadicalLeasehold, this.props.provider.getSigner()),
    }

    this.setState({ contracts })
  }

  reloadDashboard = () => this.setState({ refresh: !this.state.refresh })

  render(): ReactNode {
    if (this.props.tokenId) return (
      <CardDeck style={styles.dashboard}>
        <ENSInfo
          provider={this.props.provider}
          address={this.props.address}
          tokenId={this.props.tokenId}
          contracts={this.state.contracts}
          reloadDashboard={this.reloadDashboard}
          refresh={this.state.refresh}
        />
        <FreeholdInfo
          provider={this.props.provider}
          address={this.props.address}
          tokenId={this.props.tokenId}
          contracts={this.state.contracts}
          reloadDashboard={this.reloadDashboard}
          refresh={this.state.refresh}
        />
        <LeaseholdInfo
          provider={this.props.provider}
          address={this.props.address}
          tokenId={this.props.tokenId}
          contracts={this.state.contracts}
          reloadDashboard={this.reloadDashboard}
          refresh={this.state.refresh}
        />
      </CardDeck>
    )
    return ''
  }
}

export default DomainDashboard;
