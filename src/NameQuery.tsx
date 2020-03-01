import './App.css'
import React, { Component, ReactNode, ChangeEvent } from 'react'
import { Provider } from 'ethers/providers'
import { ethers } from 'ethers'
import axios from 'axios'
// import { AddressInfo, TokenData } from './interfaces'
// import { isRegistered } from './util'
import { Signer } from 'ethers'

type NameQueryProps = {
  provider?: Provider
  signer?: Signer
}

type NameQueryState = {
  name: string;
  nameHash: string;
  amHolder?: boolean;
  amFreeHolder?: boolean;
  amLeaseHolder? : boolean;
}

class NameQuery extends Component<NameQueryProps, NameQueryState> {
    
    state : NameQueryState = {
        name: '',
        nameHash: ''
    }

    constructor(props : NameQueryProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
      }


    async loadData() {
        if (!this.props.signer) return

        // const hashToLookup : Uint8Array = ethers.utils.keccak256(this.state.name);


    }
    

    handleSubmit() {

    }

    handleChange(event : any) {
        this.setState({...this.state, name: event.target.value });

    }

    render(): ReactNode {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input type="text" value={this.state.name} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        )
    }
}

export default NameQuery;