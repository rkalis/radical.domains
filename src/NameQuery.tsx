import './App.css'
import React, { Component, ReactNode } from 'react'
import { Provider } from 'ethers/providers'
import { ethers, Signer } from 'ethers'
import { BaseRegistrar, RadicalManager, RadicalFreehold, RadicalLeasehold } from './abis'
import { registrarAddress, managerAddress, freeholdAddress, leaseholdAddress } from './addresses'
import ENSInfo from './ENSInfo'
import FreeholdInfo from './FreeholdInfo'
import LeaseholdInfo from './LeaseholdInfo'
import { BigNumber } from 'ethers/utils'

type NameQueryProps = {
  provider?: Provider
  signer?: Signer
}

type NameQueryState = {
  name: string;
  address: string;
  registrar?: ethers.Contract;
  radicalManager?: ethers.Contract;
  radicalFreehold?: ethers.Contract;
  radicalLeasehold?: ethers.Contract;
  tokenId?: BigNumber
}

class NameQuery extends Component<NameQueryProps, NameQueryState> {
    state : NameQueryState = {
        name: 'radical5.eth',
        address: ''
    }

    componentDidMount() {
        this.loadData()
    }

    componentDidUpdate(prevProps: NameQueryProps) {
        if (this.props.signer === prevProps.signer) return
        this.loadData()
      }

    async loadData() {
        if (!this.props.signer) return
        if (!this.props.provider) return

        const registrar = new ethers.Contract(registrarAddress, BaseRegistrar, this.props.signer)
        const radicalManager = new ethers.Contract(managerAddress, RadicalManager, this.props.provider)
        const radicalFreehold = new ethers.Contract(freeholdAddress, RadicalFreehold, this.props.provider)
        const radicalLeasehold = new ethers.Contract(leaseholdAddress, RadicalLeasehold, this.props.signer)

        const address = await this.props.signer.getAddress()
        const tokenId = ethers.utils.bigNumberify(ethers.utils.keccak256(Buffer.from(this.state.name.split('.')[0], 'utf8')));
        console.log(tokenId.toString())

        this.setState({ registrar, radicalManager, radicalFreehold, radicalLeasehold, address, tokenId })
    }

    handleChange = (event: any) => {
        const tokenId = ethers.utils.bigNumberify(ethers.utils.keccak256(Buffer.from(event.target.value.split('.')[0], 'utf8')));
        this.setState({ name: event.target.value, tokenId });
    }

    render(): ReactNode {
        return (
            <div className="container">
                <div>
                    {this.state.address}
                </div>
                <div>
                    <input type="text" placeholder={this.state.name} value={this.state.name} onChange={this.handleChange} />
                </div>
                <div style={{ width: "30%" }}>
                    {this.state.registrar &&
                    <ENSInfo provider={this.props.provider}
                        signer={this.props.signer}
                        registrar={this.state.registrar}
                        address={this.state.address}
                        tokenId={this.state.tokenId} />}
                </div>
                <div style={{ width: "30%" }}>
                    {this.state.radicalFreehold &&
                    <FreeholdInfo provider={this.props.provider}
                        signer={this.props.signer}
                        freehold={this.state.radicalFreehold}
                        address={this.state.address}
                        tokenId={this.state.tokenId} />}
                </div>
                <div style={{ width: "30%" }}>
                    {this.state.radicalLeasehold &&
                    <LeaseholdInfo provider={this.props.provider}
                        signer={this.props.signer}
                        leasehold={this.state.radicalLeasehold}
                        address={this.state.address}
                        tokenId={this.state.tokenId} />}
                </div>
            </div>
        )
    }
}

export default NameQuery;
