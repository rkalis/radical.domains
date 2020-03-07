import React, { Component, ReactNode } from 'react'
import { Web3Provider } from 'ethers/providers'
import { BigNumber, formatEther } from 'ethers/utils'
import { formatAddress } from './util'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import ListGroup from 'react-bootstrap/ListGroup'
import ListGroupItem from 'react-bootstrap/ListGroupItem'
import { Contracts } from './DomainDashboard'

type FreeholdInfoProps = {
  provider?: Web3Provider
  tokenId?: BigNumber
  address: string
  contracts?: Contracts
  reloadDashboard: () => void
  refresh: boolean
}

type FreeholdInfoState = {
  owner: string
  price: string
  rate: string
  collectableRent?: BigNumber
}

class FreeholdInfo extends Component<FreeholdInfoProps, FreeholdInfoState> {
  state: FreeholdInfoState = {
    owner: '',
    price: '',
    rate: ''
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps: FreeholdInfoProps) {
      if (this.props === prevProps) return
      this.loadData()
    }

  async loadData() {
    if (!this.props.provider) return
    if (!this.props.contracts?.manager) return
    if (!this.props.contracts?.freehold) return
    if (!this.props.tokenId) return

    try {
      const owner = await this.props.contracts.freehold.ownerOf(this.props.tokenId.toString())
      const collectableRent = await this.props.contracts.manager.collectableRent(this.props.tokenId.toString())
      this.setState({ owner, collectableRent })
    } catch (e) {
      console.log(e)
      this.setState({ owner: '' })
    }
  }

  collectRent = async () => {
    const tx = await this.props.contracts?.manager?.collectRent(this.props.tokenId)
    await tx.wait(1)
    this.props.reloadDashboard()
  }

  render(): ReactNode {
    if (!this.state.owner) {
      return (
        <Card>
          <Card.Header as="h5">Freehold info</Card.Header>
          <Card.Body>Not Available - domain not radicalised</Card.Body>
        </Card>
      )
    }

    return (
      <Card>
        <Card.Header as="h5">Freehold info</Card.Header>
        <ListGroup className="list-group-flush">
          <ListGroupItem>Owned by {formatAddress(this.state.owner)}</ListGroupItem>
          <ListGroupItem>Collectable rent: Ξ{formatEther(this.state.collectableRent?.toString() || '')}</ListGroupItem> {/* TODO: Auto-update / interpolate by the second */}
        </ListGroup>
        <Card.Body>
          {this.state.owner === this.props.address &&
          <InputGroup>
            <Button onClick={() => this.collectRent()} variant="secondary">Collect Rent</Button>
          </InputGroup>
          }
        </Card.Body>
      </Card>
    )
  }
}

export default FreeholdInfo;
