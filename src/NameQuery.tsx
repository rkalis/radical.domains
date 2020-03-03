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

const validName = (name: string) => name.split('.').length === 2 && name.endsWith('.eth')

type NameQueryProps = {
  updateTokenId: (tokenId: BigNumber) => void,
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
        name: '',
        address: '',
    }

    componentDidMount() {
        this.loadData()
    }

    componentDidUpdate(prevProps: NameQueryProps) {
        // if (this.props.p === prevProps.signer) return
        // this.loadData()
      }

    async loadData() {
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
    }

    handleClick = () => {
        const tokenId = ethers.utils.bigNumberify(ethers.utils.keccak256(Buffer.from(this.state.name.split('.')[0], 'utf8')))
        this.props.updateTokenId(tokenId)
    }

    render(): ReactNode {
        return (
            <div className="container">
                <div className="center">
                    <div className="container">
                    <input style={{width: '80%'}} type="text" onChange={(ev) => this.setState({ name: ev.target.value })}/>
                    <button disabled={!validName(this.state.name)} style={{width: '20%'}} onClick={this.handleClick}>Search</button>
                    </div>
                </div>
                {/* <div style={{ width: "30%" }}>
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
                </div> */}
            </div>
        )
    }
}

export default NameQuery;
