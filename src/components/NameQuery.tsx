import './NameQuery.css'
import React, { Component, ReactNode } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

const validName = (name: string) => name.split('.').length === 2 && name.endsWith('.eth')

type NameQueryProps = {
  updateTokenId: (tokenId: BigNumber) => void,
}

type NameQueryState = {
  name: string;
}

class NameQuery extends Component<NameQueryProps, NameQueryState> {
  state : NameQueryState = {
    name: '',
  }

  handleClick = () => {
    const tokenId = ethers.utils.bigNumberify(ethers.utils.keccak256(Buffer.from(this.state.name.split('.')[0], 'utf8')))
    this.props.updateTokenId(tokenId)
  }

  render(): ReactNode {
    return (
      <div className="form">
        <input className="input" type="text" onChange={(ev) => this.setState({ name: ev.target.value })} />
        <button className="button" disabled={!validName(this.state.name)} onClick={this.handleClick}>Search</button>
      </div>
    )
  }
}

export default NameQuery;
