import React, { Component, ReactNode } from 'react'
import { Web3Provider } from 'ethers/providers'
import { BigNumber, formatEther, parseEther } from 'ethers/utils'
import { formatAddress, formatTimeRemaining } from './util'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import ListGroup from 'react-bootstrap/ListGroup'
import ListGroupItem from 'react-bootstrap/ListGroupItem'
import { Contracts } from './DomainDashboard'

type LeaseholdInfoProps = {
  provider?: Web3Provider
  tokenId?: BigNumber
  address: string
  contracts?: Contracts
  reloadDashboard: () => void
  refresh: boolean
}

type LeaseholdInfoState = {
  owner: string
  newPrice: string
  deposit: string
  amount: string
  initialDeposit: string
  price?: BigNumber
  rate?: BigNumber
  rentBalance?: BigNumber
  withdrawableRent?: BigNumber
  secondsLeft?: BigNumber
}

class LeaseholdInfo extends Component<LeaseholdInfoProps, LeaseholdInfoState> {
  state: LeaseholdInfoState = {
    owner: '',
    newPrice: '',
    deposit: '',
    amount: '',
    initialDeposit: '',
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps: LeaseholdInfoProps) {
    if (this.props === prevProps) return
    this.loadData()
  }

  async loadData() {
    if (!this.props.provider) return
    if (!this.props.contracts?.manager) return
    if (!this.props.contracts?.leasehold) return
    if (!this.props.tokenId) return

    try {
      const owner: string = await this.props.contracts.leasehold.ownerOf(this.props.tokenId.toString())
      const price: BigNumber = await this.props.contracts.leasehold.priceOf(this.props.tokenId.toString())
      const rate: BigNumber = await this.props.contracts.leasehold.rateOf(this.props.tokenId.toString())
      const rentBalance: BigNumber = await this.props.contracts.manager.rentBalance(this.props.tokenId.toString())
      const withdrawableRent: BigNumber = await this.props.contracts.manager.withdrawableRent(this.props.tokenId.toString())
      const rentPerYear: BigNumber = await this.props.contracts.leasehold.rentOf(this.props.tokenId.toString())
      const secondsLeft: BigNumber = withdrawableRent.mul(31556952).div(rentPerYear)
      this.setState({ owner, price, rate, rentBalance, withdrawableRent, secondsLeft })
    } catch (e) {
      console.log(e)
      this.setState({ owner: '' })
    }
  }

  withdrawRent = async () => {
    const tx = await this.props.contracts?.manager?.withdrawRent(this.props.tokenId?.toString(), this.state.amount)
    await tx.wait(1)
    this.props.reloadDashboard()
  }

  depositRent = async () => {
    const tx = await this.props.contracts?.manager?.depositRent(this.props.tokenId?.toString(), { value: this.state.amount })
    await tx.wait(1)
    this.props.reloadDashboard()
  }

  setPrice = async () => {
    const tx = await this.props.contracts?.leasehold?.setPriceOf(this.props.tokenId?.toString(), this.state.newPrice)
    await tx.wait(1)
    this.props.reloadDashboard()
  }

  buy = async () => {
    const tx = await this.props.contracts?.leasehold?.buy(this.props.tokenId?.toString(), { value: this.state.price?.add(this.state.initialDeposit) })
    await tx.wait(1)
    this.props.reloadDashboard()
  }

  changeAmount = (event: any) => this.setState({ amount: parseEther(event.target.value).toString() })
  changeNewPrice = (event: any) => this.setState({ newPrice: parseEther(event.target.value).toString() })
  changeInitialDeposit = (event: any) => this.setState({ initialDeposit: parseEther(event.target.value).toString() })

  render(): ReactNode {
    if (!this.state.owner) {
      return (
        <Card>
          <Card.Header as="h5">Leasehold info</Card.Header>
          <Card.Body>Not Available - domain not radicalised</Card.Body>
        </Card>
      )
    }
    let cardBody = (<Card.Body></Card.Body>)
    if (this.state.owner === this.props.address) {
      cardBody = (
        <Card.Body>
          <InputGroup>
            <FormControl placeholder="Amount (in Ξ)" aria-label="Amount (in Ξ)" onChange={this.changeAmount} />
            <InputGroup.Append>
              <Button onClick={() => this.depositRent()} variant="secondary">Deposit Rent</Button>
              <Button onClick={() => this.withdrawRent()} variant="secondary">Withdraw Rent</Button>
            </InputGroup.Append>
          </InputGroup>
          <InputGroup>
            <FormControl placeholder="Price (in Ξ)" aria-label="Price (in Ξ)" onChange={this.changeNewPrice} />
            <InputGroup.Append>
              <Button onClick={() => this.setPrice()} variant="secondary">Set Price</Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      )
    } else {
      cardBody = (
        <Card.Body>
          <InputGroup>
            <FormControl placeholder="Initial rent deposit (in Ξ)" aria-label="Initial rent deposit (in Ξ)" onChange={this.changeInitialDeposit} />
            <InputGroup.Append>
              <Button onClick={() => this.buy()} variant="secondary">Buy</Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      )
    }
    return (
      <Card>
        <Card.Header as="h5">Leasehold info</Card.Header>
        <ListGroup className="list-group-flush">
          <ListGroupItem>Owned by {formatAddress(this.state.owner)}</ListGroupItem>
          <ListGroupItem>Price: Ξ{formatEther(this.state.price?.toString() || '')}</ListGroupItem>
          <ListGroupItem>Yearly rate: {(Number(this.state.rate?.toString()) / 10).toString()}%</ListGroupItem>
          <ListGroupItem>Rent remaining: Ξ{formatEther(this.state.withdrawableRent?.toString() || '')} ({formatTimeRemaining(this.state.secondsLeft)})</ListGroupItem> {/* TODO: Auto-update / interpolate by the second */}
        </ListGroup>
        {cardBody}
      </Card>
    )
  }
}

export default LeaseholdInfo
