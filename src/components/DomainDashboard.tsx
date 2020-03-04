import { Component, ReactNode } from 'react'
import { Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'

type DomainDashboardState = {}

type DomainDashboardProps = {
  provider?: Web3Provider,
  address: string,
  tokenId?: BigNumber,
}

class DomainDashboard extends Component<DomainDashboardProps, DomainDashboardState> {
  state: DomainDashboardState = {
  }

  render(): ReactNode {
    // if (!this.props.provider) return ''
    if (this.props.tokenId) return this.props.tokenId.toString()
    return ''
  }
}

export default DomainDashboard;

// {/* <div style={{ width: "30%" }}>
//                     {this.state.registrar &&
//                     <ENSInfo provider={this.props.provider}
//                         signer={this.props.signer}
//                         registrar={this.state.registrar}
//                         address={this.state.address}
//                         tokenId={this.state.tokenId} />}
//                 </div>
//                 <div style={{ width: "30%" }}>
//                     {this.state.radicalFreehold &&
//                     <FreeholdInfo provider={this.props.provider}
//                         signer={this.props.signer}
//                         freehold={this.state.radicalFreehold}
//                         address={this.state.address}
//                         tokenId={this.state.tokenId} />}
//                 </div>
//                 <div style={{ width: "30%" }}>
//                     {this.state.radicalLeasehold &&
//                     <LeaseholdInfo provider={this.props.provider}
//                         signer={this.props.signer}
//                         leasehold={this.state.radicalLeasehold}
//                         address={this.state.address}
//                         tokenId={this.state.tokenId} />}
//                 </div> */}

// if (!this.props.signer) return
// if (!this.props.provider) return

// const registrar = new ethers.Contract(registrarAddress, BaseRegistrar, this.props.signer)
// const radicalManager = new ethers.Contract(managerAddress, RadicalManager, this.props.provider)
// const radicalFreehold = new ethers.Contract(freeholdAddress, RadicalFreehold, this.props.provider)
// const radicalLeasehold = new ethers.Contract(leaseholdAddress, RadicalLeasehold, this.props.signer)

// const address = await this.props.signer.getAddress()
// const tokenId = ethers.utils.bigNumberify(ethers.utils.keccak256(Buffer.from(this.state.name.split('.')[0], 'utf8')));
// console.log(tokenId.toString())

// this.setState({ registrar, radicalManager, radicalFreehold, radicalLeasehold, address, tokenId })
