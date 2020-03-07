import React, { Component, ReactNode } from 'react'
import { Web3Provider } from 'ethers/providers'
import { managerAddress } from '../addresses'
import { BigNumber, parseEther, bigNumberify } from 'ethers/utils'
import { encode, formatAddress } from './util'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import ListGroup from 'react-bootstrap/ListGroup'
import ListGroupItem from 'react-bootstrap/ListGroupItem'
import { Contracts } from './DomainDashboard'

type ENSInfoProps = {
  provider?: Web3Provider
  tokenId?: BigNumber
  address: string
  contracts?: Contracts
  reloadDashboard: () => void
  refresh: boolean
}

type ENSInfoState = {
  owner: string
  freeholdOwner: string
  leaseholdOwner: string
  price: string
  rate: string
}

class ENSInfo extends Component<ENSInfoProps, ENSInfoState> {
  state: ENSInfoState = {
    owner: '',
    freeholdOwner: '',
    leaseholdOwner: '',
    price: '',
    rate: '',
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps: ENSInfoProps) {
      if (this.props === prevProps) return
      this.loadData()
    }

  async loadData() {
    if (!this.props.provider) return
    if (!this.props.contracts?.registrar) return
    if (!this.props.tokenId) return

    try {
      console.log(this.props.tokenId, this.props.tokenId.toString())
      const owner = await this.props.contracts.registrar.functions.ownerOf(this.props.tokenId)
      this.setState({ owner })
    } catch (e) {
      console.log(e)
      this.setState({ owner: '' })
    }

    try {
      const freeholdOwner = await this.props.contracts?.freehold?.functions.ownerOf(this.props.tokenId)
      const leaseholdOwner = await this.props.contracts?.leasehold?.functions.ownerOf(this.props.tokenId)
      this.setState({ freeholdOwner, leaseholdOwner })
    } catch (e) {
      console.log(e)
      this.setState({ freeholdOwner: '', leaseholdOwner: '' })
    }
  }

  radicalise = async () => {
    const tx = await this.props.contracts?.registrar?.functions['safeTransferFrom(address,address,uint256,bytes)'](this.props.address, managerAddress, this.props.tokenId, encode(this.state.price, this.state.rate))
    await tx.wait(1)
    this.props.reloadDashboard()
  }

  deradicalise = async () => {
    const tx = await this.props.contracts?.manager?.deradicalise(this.props.tokenId)
    await tx.wait(1)
    this.props.reloadDashboard()
  }

  canDeradicalise = () => this.state.freeholdOwner === this.props.address && this.state.leaseholdOwner === this.props.address
  changePrice = (event: any) => this.setState({ price: parseEther(event.target.value).toString() })
  changeRate = (event: any) => this.setState({ rate: bigNumberify(Math.ceil(Number(event.target.value) * 10)).toString() })

  render(): ReactNode {
    let cardBody = (<Card.Body></Card.Body>)
    if (this.state.owner === this.props.address) {
      cardBody = (
        <Card.Body>
          <InputGroup>
            <FormControl placeholder="Price (in Ξ)" aria-label="Price (in Ξ)" onChange={this.changePrice} />
            <FormControl placeholder="Rate (in %)" aria-label="Rate (in %)" onChange={this.changeRate} />
            <InputGroup.Append>
              <Button onClick={() => this.radicalise()} variant="secondary">Radicalise</Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      )
    } else if (this.state.owner === managerAddress && this.canDeradicalise()) {
      cardBody = (
        <Card.Body>
          <InputGroup>
            <Button onClick={() => this.deradicalise()} variant="secondary">Deradicalise</Button>
          </InputGroup>
        </Card.Body>
      )
    }
    return (
      <Card>
        <Card.Header as="h5">ENS info</Card.Header>
        <ListGroup className="list-group-flush">
          <ListGroupItem>Owned by {formatAddress(this.state.owner)}</ListGroupItem>
          {/* <ListGroupItem>Expires at 20xx-xx-xx</ListGroupItem> Get actual renewal data from ENS */}
          <ListGroupItem>{this.state.owner === managerAddress ? 'Radicalised' : 'Not radicalised'}</ListGroupItem>
        </ListGroup>
        {cardBody}
      </Card>
    )
  }
}

export default ENSInfo;
