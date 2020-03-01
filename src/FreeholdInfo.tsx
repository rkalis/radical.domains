import './App.css'
import React, { Component, ReactNode } from 'react'
import { Provider } from 'ethers/providers'
import { ethers, Signer } from 'ethers'
import { BigNumber } from 'ethers/utils'

type FreeholdInfoProps = {
  provider?: Provider
  signer?: Signer
  tokenId?: BigNumber
  freehold?: ethers.Contract
  address: string
}

type FreeholdInfoState = {
    owner: string;
}

class FreeholdInfo extends Component<FreeholdInfoProps, FreeholdInfoState> {
    state : FreeholdInfoState = {
        owner: '',
    }

    componentDidMount() {
        this.loadData()
    }

    componentDidUpdate(prevProps: FreeholdInfoProps) {
        if (this.props.tokenId === prevProps.tokenId) return
        this.loadData()
      }

    async loadData() {
        if (!this.props.signer) return
        if (!this.props.provider) return
        if (!this.props.freehold) return
        if (!this.props.tokenId) return

        try {
            console.log(this.props.tokenId, this.props.tokenId.toString())
            const owner = await this.props.freehold.functions.ownerOf(this.props.tokenId.toString())
            this.setState({ owner })
        } catch (e) {
            console.log(e)
        }
    }

    render(): ReactNode {
        return (
            <div className="container">
                <div>
                    Freehold owner: {this.state.owner}
                </div>
            </div>
        )
    }
}

export default FreeholdInfo;
