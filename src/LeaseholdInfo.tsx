import './App.css'
import React, { Component, ReactNode } from 'react'
import { Provider } from 'ethers/providers'
import { ethers, Signer } from 'ethers'
import { BigNumber } from 'ethers/utils'

type LeaseholdInfoProps = {
  provider?: Provider
  signer?: Signer
  tokenId?: BigNumber
  leasehold?: ethers.Contract
  address: string
}

type LeaseholdInfoState = {
    owner: string;
    price: string;
    deposit: string;
}

class LeaseholdInfo extends Component<LeaseholdInfoProps, LeaseholdInfoState> {
    state: LeaseholdInfoState = {
        owner: '',
        price: '',
        deposit: ''
    }

    componentDidMount() {
        this.loadData()
    }

    componentDidUpdate(prevProps: LeaseholdInfoProps) {
        if (this.props.tokenId === prevProps.tokenId) return
        this.loadData()
      }

    async loadData() {
        if (!this.props.signer) return
        if (!this.props.provider) return
        if (!this.props.leasehold) return
        if (!this.props.tokenId) return

        try {
            console.log(this.props.tokenId, this.props.tokenId.toString())
            const price = await this.props.leasehold.functions.priceOf(this.props.tokenId.toString())
            const owner = await this.props.leasehold.functions.ownerOf(this.props.tokenId.toString())
            this.setState({ price, owner })
        } catch (e) {
            console.log(e)
        }

    }

    changeDeposit = (event: any) => {
        this.setState({ deposit: event.target.value });
    }

    buy = () => {
        this.props.leasehold?.functions.buy(this.props.tokenId, { value: ethers.utils.bigNumberify(Number(this.state.deposit) + Number(this.state.price)) })
    }

    render(): ReactNode {
        return (
            <div className="container">
                <div>
                    Leasehold owner: {this.state.owner}
                    {this.state.owner !== this.props.address &&
                    <div>
                        <input value={this.state.deposit} placeholder={this.state.deposit} onChange={this.changeDeposit}/>
                        <button onClick={() => this.buy()}>BUY</button>
                </div>}
                </div>
            </div>
        )
    }
}

export default LeaseholdInfo;
