import './App.css'
import React, { Component, ReactNode } from 'react'
import { Provider } from 'ethers/providers'
import { ethers, Signer } from 'ethers'
import { managerAddress } from './addresses'
import { BigNumber } from 'ethers/utils'
import web3 from 'web3'

type ENSInfoProps = {
  provider?: Provider
  signer?: Signer
  tokenId?: BigNumber
  registrar?: ethers.Contract
  address: string
}

type ENSInfoState = {
    owner: string;
    price: string;
    rate: string;
}

class ENSInfo extends Component<ENSInfoProps, ENSInfoState> {
    state : ENSInfoState = {
        owner: '',
        price: '',
        rate: ''
    }

    componentDidMount() {
        this.loadData()
    }

    componentDidUpdate(prevProps: ENSInfoProps) {
        if (this.props.tokenId === prevProps.tokenId) return
        this.loadData()
      }

    async loadData() {
        if (!this.props.signer) return
        if (!this.props.provider) return
        if (!this.props.registrar) return
        if (!this.props.tokenId) return

        try {
            console.log(this.props.tokenId, this.props.tokenId.toString())
            const owner = await this.props.registrar.functions.ownerOf(this.props.tokenId.toString())
            this.setState({ owner })
        } catch (e) {
            console.log(e)
        }
    }

    _getIt(varr: number) {
        var rt = ""
        var varr_hex = web3.utils.toHex(varr);
        varr_hex = varr_hex.substring(2)
        var zeroes = 64 - varr_hex.length;
        for (var i = 0; i < zeroes; i++) {
            rt = rt + "0";
        }
        rt = rt + varr_hex;
        return rt
      }

    encode(price: string, rent: string) {
        var str = "0x"
        str = str + this._getIt(Number(price));
        str = str + this._getIt(Number(rent));
        return str
    }

    radicalise = () => {
        this.props.registrar?.functions['safeTransferFrom(address,address,uint256,bytes)'](this.props.address, managerAddress, this.props.tokenId, this.encode(this.state.price, this.state.rate))
    }

    changePrice = (event: any) => {
        this.setState({ price: event.target.value });
    }

    changeRate = (event: any) => {
        this.setState({ rate: event.target.value });
    }

    render(): ReactNode {
        return (
            <div className="container">
                <div>
                    ENS Owner: {this.state.owner}
                    {this.state.owner === this.props.address &&
                    <div>
                        <input value={this.state.price} placeholder={this.state.price} onChange={this.changePrice}/>
                        <input value={this.state.rate} placeholder={this.state.rate} onChange={this.changeRate}/>
                        <button onClick={() => this.radicalise()}>RADICALISE</button>
                    </div>}
                </div>
            </div>
        )
    }
}

export default ENSInfo;
