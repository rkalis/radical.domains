import './NameQuery.css'
import React, { Component, ReactNode } from 'react'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'

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
      <InputGroup className="mb-3 form">
        <FormControl
          placeholder="ENS name"
          aria-label="ENS name"
          onChange={(ev: any) => this.setState({ name: ev.target.value })}
        />
        <InputGroup.Append>
          <Button disabled={!validName(this.state.name)} variant="secondary" onClick={this.handleClick}>Search</Button>
        </InputGroup.Append>
      </InputGroup>
    )
  }
}

export default NameQuery;
